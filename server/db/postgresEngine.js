const { Pool } = require('pg');
const crypto = require('crypto');

let pool = null;
let isInitialized = false;

const TABLE_NAMES = {
  User: 'users',
  SellerProfile: 'seller_profiles',
  SellRequest: 'sell_requests',
  Inspection: 'inspections',
  Device: 'devices',
  CounterOffer: 'counter_offers',
  Order: 'orders',
  Payout: 'payouts',
  AuditLog: 'audit_logs',
  BasePrice: 'base_prices',
  Deduction: 'deductions',
  GradeRule: 'grade_rules',
};

const getPool = () => {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set for PostgreSQL connection.');
    }
    const isSsl = connectionString.includes('render.com') ||
                  connectionString.includes('neon.tech') ||
                  connectionString.includes('supabase.co') ||
                  connectionString.includes('sslmode=require') ||
                  process.env.NODE_ENV === 'production';

    pool = new Pool({
      connectionString,
      ssl: isSsl ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client', err);
    });
  }
  return pool;
};

const initPostgres = async (connectionString) => {
  if (isInitialized) return;
  const dbPool = getPool();

  const client = await dbPool.connect();
  try {
    console.log('🐘 Initializing PostgreSQL schema & tables...');

    // Create tables for all entities using JSONB for rich document & query support
    for (const [modelName, tableName] of Object.entries(TABLE_NAMES)) {
      await client.query(`
        CREATE TABLE IF NOT EXISTS ${tableName} (
          id VARCHAR(64) PRIMARY KEY,
          data JSONB NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // Create GIN index on data for fast JSON queries
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_${tableName}_data ON ${tableName} USING GIN (data);
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_${tableName}_created_at ON ${tableName} (created_at DESC);
      `);
    }

    isInitialized = true;
    console.log('✅ PostgreSQL tables & indexes verified successfully');
  } finally {
    client.release();
  }
};

module.exports = {
  getPool,
  initPostgres,
  TABLE_NAMES,
};
