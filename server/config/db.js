const mongoose = require('mongoose');
const { isPostgresMode } = require('../db/getModel');
const { initPostgres } = require('../db/postgresEngine');

const connectDB = async () => {
  // If PostgreSQL is detected (Render or DATABASE_URL provided)
  if (isPostgresMode()) {
    console.log('🐘 PostgreSQL connection detected from DATABASE_URL...');
    try {
      await initPostgres(process.env.DATABASE_URL);
      console.log('✅ PostgreSQL Connected & Tables Verified');

      // Auto-seed default accounts, price tables, devices if empty
      const { autoSeed } = require('../scripts/autoSeed');
      await autoSeed();
      return;
    } catch (pgErr) {
      console.error(`❌ Failed to connect to PostgreSQL: ${pgErr.message}`);
      process.exit(1);
    }
  }

  // Fallback to MongoDB (local or in-memory) when DATABASE_URL is not set
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/voltkart';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Auto-seed if needed
    const { autoSeed } = require('../scripts/autoSeed');
    await autoSeed();
  } catch (error) {
    console.warn(`⚠️ External MongoDB connection failed (${error.message}). Falling back to In-Memory MongoDB...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`✅ In-Memory MongoDB Connected at: ${memUri}`);

      // Auto-seed
      const { autoSeed } = require('../scripts/autoSeed');
      await autoSeed();
    } catch (memErr) {
      console.error(`❌ Failed to connect to MongoDB: ${memErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
