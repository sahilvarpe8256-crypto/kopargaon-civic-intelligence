const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Connects to MongoDB using Mongoose.
 * Reads connection URI from process.env.MONGODB_URI.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    const errorMsg = 'MongoDB connection failed: MONGODB_URI is not defined in environment variables';
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  try {
    const conn = await mongoose.connect(uri);
    logger.info(`MongoDB connected successfully: ${conn.connection.host || 'connected'} [Database: ${conn.connection.name || 'default'}]`);
    return conn;
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }
};

module.exports = {
  connectDB
};