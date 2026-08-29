require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');
const logger = require('./utils/logger');
const { DEFAULT_PORT } = require('./config/constants');

const PORT = parseInt(process.env.PORT, 10) || DEFAULT_PORT || 5000;

// Production environment validation
if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'kopargaon_civic_intelligence_jwt_secret_dev_key') {
    logger.error('CRITICAL: JWT_SECRET must be securely set to a strong unique key in production mode.');
    process.exit(1);
  }
}

let server;

async function startServer() {
  try {
    if (process.env.MONGODB_URI) {
      await connectDB();
      logger.info('Connected to MongoDB.');
    } else {
      logger.warn('MONGODB_URI not specified. Running with in-memory storage fallback.');
    }
  } catch (err) {
    logger.warn(`Database connection could not be established: ${err.message}. Operating in fallback mode.`);
  }

  server = app.listen(PORT, () => {
    logger.info(`Kopargaon Civic Intelligence Server listening on port ${PORT} [Environment: ${process.env.NODE_ENV || 'development'}]`);
  });

  const shutdown = (signal) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    if (server) {
      server.close(() => {
        logger.info('HTTP server closed. Exiting process.');
        process.exit(0);
      });
      setTimeout(() => {
        logger.error('Forced shutdown after timeout.');
        process.exit(1);
      }, 10000);
    } else {
      process.exit(0);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Promise Rejection:', reason);
  });

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    shutdown('uncaughtException');
  });
}

startServer();