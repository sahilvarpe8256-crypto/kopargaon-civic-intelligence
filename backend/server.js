require('dotenv').config();
const app = require('./src/app');
const logger = require('./src/utils/logger');
const { SERVICE_NAME, DEFAULT_PORT } = require('./src/config/constants');

const PORT = process.env.PORT || DEFAULT_PORT;

const server = app.listen(PORT, () => {
  logger.info(`${SERVICE_NAME} running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

module.exports = server;