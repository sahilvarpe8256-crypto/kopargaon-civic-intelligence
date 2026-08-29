require('dotenv').config();
const app = require('./src/app');
const logger = require('./src/utils/logger');
const { connectDB } = require('./src/config/db');
const { SERVICE_NAME, DEFAULT_PORT } = require('./src/config/constants');

const PORT = process.env.PORT || DEFAULT_PORT;

/**
 * Starts the application by connecting to the database first,
 * then listening on the configured HTTP port.
 */
const startServer = async () => {
  try {
    // Establish database connection
    await connectDB();

    // Start Express HTTP server
    const server = app.listen(PORT, () => {
      logger.info(`${SERVICE_NAME} running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    });

    return server;
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// Start server if executed directly
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

// Global process error handlers
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

module.exports = {
  startServer
};