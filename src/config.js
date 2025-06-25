import dotenv from 'dotenv';

dotenv.config();

export const config = {
  AGGREGATION_INTERVAL_MS: 5000,
  ORIGIN_SERVICE_URL: process.env.ORIGIN_SERVICE_URL || 'ws://localhost:9000',
  DEBUG_LOGGING: process.env.DEBUG_LOGGING === 'true',
  WEBSOCKET_PORT: Number(process.env.WEBSOCKET_PORT) || 8080,
};
