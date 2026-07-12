/**
 * AssetFlow ERP
 *
 * Layer:
 * Composition Root
 *
 * Responsibility:
 * Orchestrates the exact, deterministic Application Startup Lifecycle.
 * Combines Config -> Database -> App -> Server Listen.
 */
import { Config } from './config/index.js';
import { logger } from './core/logger.js';
import { Database } from './infrastructure/database/index.js';
import { app } from './presentation/app.js';

async function bootstrap() {
  try {
    logger.info('🚀 Bootstrapping AssetFlow Backend...');

    // 1. Connect to Database
    await Database.connect();

    // 2. Start HTTP Server
    const server = app.listen(Config.PORT, () => {
      logger.info(`✅ Server listening on port ${Config.PORT} in ${Config.NODE_ENV} mode`);
    });

    // 3. Graceful Shutdown Traps
    const shutdown = async (signal: string) => {
      logger.info(`⚠️ Received ${signal}. Starting graceful shutdown...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        await Database.disconnect();
        logger.info('Graceful shutdown complete.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.fatal({ error }, '💥 Fatal error during startup. Exiting process.');
    process.exit(1);
  }
}

bootstrap();
