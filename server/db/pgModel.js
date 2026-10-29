const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { getPool, TABLE_NAMES } = require('./postgresEngine');

const modelRegistry = {};

const generateId = () => crypto.randomBytes(12).toString('hex');

const POPULATE_TARGETS = {
  seller: 'User',
  agent: 'User',
  buyer: 'User',
  actor: 'User',
  createdBy: 'User',
  approvedBy: 'User',
  receivedBy: 'User',
  flashedBy: 'User',
  qaApprovedBy: 'User',
  device: 'Device',
  sellRequest: 'SellRequest',
};

// Apply Mongo-style update operators ($set, $push, $pull, plain fields)
function applyUpdate(current, update) {
  const result = { ...current };

  if (update.$set) {
    for (const [key, val] of Object.entries(update.$set)) {
      result[key] = val;
    }
  }

  if (update.$push) {
    for (const [key, val] of Object.entries(update.$push)) {
      const arr = Array.isArray(result[key]) ? [...result[key]] : [];
      arr.push(val);
      result[key] = arr;
    }
  }

  if (update.$pull) {
    for (const [key, val] of Object.entries(update.$pull)) {
      if (Array.isArray(result[key])) {
        result[key] = result[key].filter((item) => item !== val);
      }
    }
  }

  // Any plain top-level fields
  for (const [key, val] of Object.entries(update)) {
    if (!key.startsWith('$')) {
      result[key] = val;
    }
  }

  return result;
}

// Convert row from postgres to Mongoose-like document object
function wrapDocument(row, modelName) {
  if (!row) return null;
  const data = typeof row.data === 'string' ? JSON.parse(row.data) : { ...row.data };

  data.id = row.id;
  data._id = row.id;
  data.createdAt = row.created_at || data.createdAt;
  data.updatedAt = row.updated_at || data.updatedAt;

  // Add document methods
  Object.defineProperty(data, 'save', {
    enumerable: false,
    writable: true,
    value: async function () {
      const pool = getPool();
      const tableName = TABLE_NAMES[modelName];
      const payload = { ...this };
      delete payload.id;
      delete payload._id;
      delete payload.createdAt;
      delete payload.updatedAt;

      // User passwordHash check
      if (modelName === 'User' && payload.passwordHash && !payload.passwordHash.startsWith('$2')) {
        payload.passwordHash = await bcrypt.hash(payload.passwordHash, 12);
      }

      const res = await pool.query(
        `UPDATE ${tableName} SET data = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [JSON.stringify(payload), this.id || this._id]
      );
      if (res.rows[0]) {
        this.updatedAt = res.rows[0].updated_at;
      }
      return this;
    },
  });

  if (modelName === 'User') {
    Object.defineProperty(data, 'comparePassword', {
      enumerable: false,
      value: async function (candidatePassword) {
        if (!this.passwordHash) return false;
        return bcrypt.compare(candidatePassword, this.passwordHash);
      },
    });

    Object.defineProperty(data, 'toJSON', {
      enumerable: false,
      value: function () {
        const copy = { ...this };
        delete copy.passwordHash;
        delete copy.refreshTokens;
        return copy;
      },
    });
  }

  Object.defineProperty(data, 'toObject', {
    enumerable: false,
    value: function () {
      return { ...this };
    },
  });

  return data;
}

// Build SQL WHERE clause from filter object
function buildWhereClause(filter = {}) {
  const conditions = [];
  const values = [];

  let paramIndex = 1;

  for (const [key, value] of Object.entries(filter)) {
    if (key === '_id' || key === 'id') {
      if (value && typeof value === 'object' && value.$in) {
        conditions.push(`id = ANY($${paramIndex})`);
        values.push(value.$in.map(String));
      } else {
        conditions.push(`id = $${paramIndex}`);
        values.push(String(value));
      }
      paramIndex++;
    } else if (value === null || value === undefined) {
      conditions.push(`data->>'${key}' IS NULL`);
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      if (value.$in) {
        conditions.push(`data->>'${key}' = ANY($${paramIndex})`);
        values.push(value.$in.map(String));
        paramIndex++;
      } else if (value.$nin) {
        conditions.push(`NOT (data->>'${key}' = ANY($${paramIndex}))`);
        values.push(value.$nin.map(String));
        paramIndex++;
      } else if (value.$gt !== undefined) {
        conditions.push(`(data->>'${key}')::numeric > $${paramIndex}`);
        values.push(value.$gt);
        paramIndex++;
      } else if (value.$gte !== undefined) {
        conditions.push(`(data->>'${key}')::numeric >= $${paramIndex}`);
        values.push(value.$gte);
        paramIndex++;
      } else if (value.$lt !== undefined) {
        conditions.push(`(data->>'${key}')::numeric < $${paramIndex}`);
        values.push(value.$lt);
        paramIndex++;
      } else if (value.$lte !== undefined) {
        conditions.push(`(data->>'${key}')::numeric <= $${paramIndex}`);
        values.push(value.$lte);
        paramIndex++;
      }
    } else if (typeof value === 'boolean') {
      conditions.push(`(data->>'${key}')::boolean = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    } else if (typeof value === 'number') {
      conditions.push(`(data->>'${key}')::numeric = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    } else {
      conditions.push(`data->>'${key}' = $${paramIndex}`);
      values.push(String(value));
      paramIndex++;
    }
  }

  const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return { whereSql, values };
}

// Chainable Query Builder for Mongoose-like syntax
class PgQuery {
  constructor(modelName, filter = {}, single = false) {
    this.modelName = modelName;
    this.tableName = TABLE_NAMES[modelName];
    this.filter = filter;
    this.single = single;
    this._selectFields = null;
    this._sortFields = null;
    this._limitNum = null;
    this._skipNum = null;
    this._populates = [];
  }

  select(fields) {
    this._selectFields = fields;
    return this;
  }

  sort(sortObj) {
    this._sortFields = sortObj;
    return this;
  }

  limit(n) {
    this._limitNum = Number(n);
    return this;
  }

  skip(n) {
    this._skipNum = Number(n);
    return this;
  }

  populate(pathOrObj, selectFields) {
    if (typeof pathOrObj === 'object') {
      this._populates.push(pathOrObj);
    } else {
      this._populates.push({ path: pathOrObj, select: selectFields });
    }
    return this;
  }

  async exec() {
    const pool = getPool();
    const { whereSql, values } = buildWhereClause(this.filter);

    let orderSql = 'ORDER BY created_at DESC';
    if (this._sortFields) {
      const sortParts = [];
      for (const [k, dir] of Object.entries(this._sortFields)) {
        const direction = dir === 1 || dir === 'asc' ? 'ASC' : 'DESC';
        if (k === 'createdAt' || k === 'created_at') {
          sortParts.push(`created_at ${direction}`);
        } else if (k === 'updatedAt' || k === 'updated_at') {
          sortParts.push(`updated_at ${direction}`);
        } else if (k === 'minScore' || k === 'price' || k === 'sellingPrice') {
          sortParts.push(`(data->>'${k}')::numeric ${direction}`);
        } else {
          sortParts.push(`data->>'${k}' ${direction}`);
        }
      }
      if (sortParts.length > 0) orderSql = `ORDER BY ${sortParts.join(', ')}`;
    }

    let limitSql = '';
    if (this.single) {
      limitSql = 'LIMIT 1';
    } else if (this._limitNum) {
      limitSql = `LIMIT ${this._limitNum}`;
    }

    let offsetSql = '';
    if (this._skipNum) {
      offsetSql = `OFFSET ${this._skipNum}`;
    }

    const querySql = `SELECT * FROM ${this.tableName} ${whereSql} ${orderSql} ${limitSql} ${offsetSql}`;
    const result = await pool.query(querySql, values);

    if (this.single) {
      const doc = wrapDocument(result.rows[0], this.modelName);
      if (!doc) return null;
      await this.applyPopulates([doc]);
      this.applySelect(doc);
      return doc;
    }

    const docs = result.rows.map((r) => wrapDocument(r, this.modelName));
    await this.applyPopulates(docs);
    docs.forEach((d) => this.applySelect(d));
    return docs;
  }

  async applyPopulates(docs) {
    if (docs.length === 0 || this._populates.length === 0) return;

    for (const pop of this._populates) {
      const path = pop.path;
      const targetModelName = POPULATE_TARGETS[path];
      if (!targetModelName) continue;

      const targetTableName = TABLE_NAMES[targetModelName];
      const targetModel = modelRegistry[targetModelName];
      if (!targetTableName || !targetModel) continue;

      // Extract IDs to populate
      const ids = docs
        .map((d) => d[path])
        .filter((id) => id && typeof id === 'string');

      if (ids.length === 0) continue;

      const pool = getPool();
      const res = await pool.query(
        `SELECT * FROM ${targetTableName} WHERE id = ANY($1)`,
        [ids]
      );
      const targetDocsMap = {};
      res.rows.forEach((r) => {
        const item = wrapDocument(r, targetModelName);
        if (pop.select) {
          const fields = pop.select.split(' ').filter(Boolean);
          const filtered = { _id: item._id, id: item.id };
          fields.forEach((f) => { filtered[f] = item[f]; });
          targetDocsMap[item.id] = filtered;
        } else {
          targetDocsMap[item.id] = item;
        }
      });

      docs.forEach((d) => {
        if (typeof d[path] === 'string' && targetDocsMap[d[path]]) {
          d[path] = targetDocsMap[d[path]];
        }
      });
    }
  }

  applySelect(doc) {
    if (!doc || !this._selectFields) return;
    const parts = this._selectFields.split(' ').filter(Boolean);
    for (const p of parts) {
      if (p.startsWith('-')) {
        delete doc[p.substring(1)];
      }
    }
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }

  catch(reject) {
    return this.exec().catch(reject);
  }
}

// Model Factory
function createPgModel(modelName) {
  const tableName = TABLE_NAMES[modelName];

  const Model = {
    modelName,

    find(filter = {}) {
      return new PgQuery(modelName, filter, false);
    },

    findOne(filter = {}) {
      return new PgQuery(modelName, filter, true);
    },

    findById(id) {
      return new PgQuery(modelName, { _id: id }, true);
    },

    async create(data) {
      const pool = getPool();
      if (Array.isArray(data)) {
        const results = [];
        for (const item of data) {
          results.push(await Model.create(item));
        }
        return results;
      }

      const id = data._id || data.id || generateId();
      const payload = { ...data };
      delete payload.id;
      delete payload._id;

      if (modelName === 'User' && payload.passwordHash && !payload.passwordHash.startsWith('$2')) {
        payload.passwordHash = await bcrypt.hash(payload.passwordHash, 12);
      }

      const res = await pool.query(
        `INSERT INTO ${tableName} (id, data, created_at, updated_at) VALUES ($1, $2, NOW(), NOW()) RETURNING *`,
        [id, JSON.stringify(payload)]
      );

      return wrapDocument(res.rows[0], modelName);
    },

    async findByIdAndUpdate(id, update, options = {}) {
      return Model.findOneAndUpdate({ _id: id }, update, options);
    },

    async findOneAndUpdate(filter, update, options = {}) {
      const pool = getPool();
      const existing = await Model.findOne(filter);

      if (!existing) {
        if (options.upsert) {
          const insertData = { ...filter, ...update };
          if (insertData.$set) Object.assign(insertData, insertData.$set);
          delete insertData.$set;
          delete insertData.$push;
          delete insertData.$pull;
          return Model.create(insertData);
        }
        return null;
      }

      const updatedPayload = applyUpdate(existing, update);
      delete updatedPayload.id;
      delete updatedPayload._id;
      delete updatedPayload.createdAt;
      delete updatedPayload.updatedAt;

      const res = await pool.query(
        `UPDATE ${tableName} SET data = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [JSON.stringify(updatedPayload), existing.id || existing._id]
      );

      return wrapDocument(res.rows[0], modelName);
    },

    async countDocuments(filter = {}) {
      const pool = getPool();
      const { whereSql, values } = buildWhereClause(filter);
      const res = await pool.query(`SELECT COUNT(*) FROM ${tableName} ${whereSql}`, values);
      return parseInt(res.rows[0]?.count || 0, 10);
    },

    async deleteMany(filter = {}) {
      const pool = getPool();
      const { whereSql, values } = buildWhereClause(filter);
      const res = await pool.query(`DELETE FROM ${tableName} ${whereSql}`, values);
      return { deletedCount: res.rowCount };
    },

    async aggregate(pipeline = []) {
      const pool = getPool();
      // Handle the revenue calculation: [ { $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$price' } } } ]
      let where = '';
      if (pipeline[0]?.$match) {
        const { whereSql } = buildWhereClause(pipeline[0].$match);
        where = whereSql;
      }
      const res = await pool.query(
        `SELECT SUM((data->>'price')::numeric) as total FROM ${tableName} ${where}`
      );
      const total = Number(res.rows[0]?.total || 0);
      return [{ _id: null, total }];
    },
  };

  modelRegistry[modelName] = Model;
  return Model;
}

module.exports = {
  createPgModel,
  modelRegistry,
};
