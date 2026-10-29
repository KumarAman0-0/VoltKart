const mongoose = require('mongoose');

const connectDB = async () => {
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
