import connectDB from './config/database/connection.js';
import env from './config/environment/env.js';
import logger from './config/logger/logger.js';
import createApp from './app.js';

const startServer = async () => {
  await connectDB();

  const app = createApp();

  app.listen(env.port, () => {
    logger.info(`Servidor Carely corriendo en http://localhost:${env.port}`);
    logger.info(`Entorno: ${env.nodeEnv}`);
  });
};

startServer();
