/**
 * AssetFlow ERP
 *
 * Layer:
 * Infrastructure
 *
 * Responsibility:
 * MongoDB connection lifecycle and readiness tracking.
 *
 * Architectural Rules:
 * - Must never expose Mongoose models directly to Controllers.
 * - Only implements connection logic, not schemas.
 */
import mongoose from 'mongoose';

import { Config } from '../../config/index.js';
import { logger } from '../../core/logger.js';

export const Database = {
  connect: async (): Promise<void> => {
    try {
      mongoose.connection.on('connected', () => logger.info('✅ MongoDB connected successfully'));
      mongoose.connection.on('error', (err) => logger.error({ err }, '❌ MongoDB connection error'));
      mongoose.connection.on('disconnected', () => logger.warn('⚠️ MongoDB disconnected'));

      await mongoose.connect(Config.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
      });
    } catch (error) {
      logger.fatal({ error }, '💥 Failed to connect to MongoDB at startup');
      throw error;
    }
  },

  disconnect: async (): Promise<void> => {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected via graceful shutdown');
  },

  isReady: (): boolean => {
    return mongoose.connection.readyState === 1;
  }
};
