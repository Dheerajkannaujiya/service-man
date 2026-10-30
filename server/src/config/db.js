const mongoose = require('mongoose');
const config = require('./env');

let memServer = null;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
      autoIndex: true
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    const { ensureDemoData } = require('../utils/ensureDemoData');
    ensureDemoData().catch(e => console.warn('[Database] Auto-ensure demo data warning:', e.message));
    return conn;
  } catch (error) {
    console.warn(`[Database] Standard MongoDB connection to ${config.MONGODB_URI} failed: ${error.message}`);
    
    // In local development or testing, spin up embedded In-Memory MongoDB automatically!
    try {
      console.log('[Database] Starting built-in In-Memory MongoDB engine for seamless zero-setup testing...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memServer = await MongoMemoryServer.create();
      const memUri = memServer.getUri();
      
      const conn = await mongoose.connect(memUri, {
        serverSelectionTimeoutMS: 5000,
        autoIndex: true
      });
      console.log(`[Database] In-Memory MongoDB active at ${memUri}`);
      
      // Auto-seed in-memory database with services and test accounts
      const { seedDatabase } = require('../utils/seed');
      console.log('[Database] Seeding in-memory database with demo users, services, and live bookings...');
      await seedDatabase({ keepAlive: true });
      console.log('[Database] Complete! Full system is ready for testing.');
      return conn;
    } catch (memErr) {
      console.error('[Database Error] In-Memory fallback failed:', memErr.message);
      console.log('[Database] Retrying connection in 5 seconds...');
      setTimeout(connectDB, 5000);
    }
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[Database] MongoDB connection lost. Attempting to reconnect...');
});

module.exports = connectDB;

