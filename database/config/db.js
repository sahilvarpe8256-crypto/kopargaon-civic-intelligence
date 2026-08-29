const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Connect to MongoDB database
 * Reads MONGODB_URI from environment variables.
 * @returns {Promise<typeof mongoose>}
 */
const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.error('FATAL: MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`[Database] MongoDB connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database] MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB database (useful for graceful shutdown and scripts)
 * @returns {Promise<void>}
 */
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('[Database] MongoDB disconnected cleanly.');
  } catch (error) {
    console.error(`[Database] Error during MongoDB disconnection: ${error.message}`);
  }
};

module.exports = {
  connectDB,
  disconnectDB
};
