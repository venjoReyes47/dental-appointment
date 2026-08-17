import app from './App';
import { env } from './config/env';
import { sequelize } from './models';

const start = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    const server = app.listen(env.PORT, '0.0.0.0', () => {
      console.log(`Dental Clinic API listening on port ${env.PORT}`);
    });

    let shuttingDown = false;
    const shutdown = async (signal: string): Promise<void> => {
      if (shuttingDown) return;
      shuttingDown = true;
      console.log(`${signal} received. Shutting down gracefully.`);

      const forceExit = setTimeout(() => {
        console.error('Graceful shutdown timed out.');
        process.exit(1);
      }, 10_000);
      forceExit.unref();

      server.close(async () => {
        try {
          await sequelize.close();
          clearTimeout(forceExit);
          process.exit(0);
        } catch (error) {
          console.error('Error while closing database connection:', error);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => void shutdown('SIGTERM'));
    process.on('SIGINT', () => void shutdown('SIGINT'));
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

void start();
