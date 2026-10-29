const { createPgModel, modelRegistry } = require('./pgModel');

const isPostgresMode = () => {
  const url = process.env.DATABASE_URL;
  return Boolean(
    url && (url.startsWith('postgres://') || url.startsWith('postgresql://'))
  ) || process.env.USE_POSTGRES === 'true';
};

const resolveModel = (modelName, mongooseModelFactory) => {
  if (isPostgresMode()) {
    if (!modelRegistry[modelName]) {
      return createPgModel(modelName);
    }
    return modelRegistry[modelName];
  }
  return mongooseModelFactory();
};

module.exports = {
  isPostgresMode,
  resolveModel,
};
