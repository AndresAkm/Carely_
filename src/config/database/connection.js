import mongoose from 'mongoose';
import logger from '../logger/logger.js';
import env from '../environment/env.js';
import auditPlugin from './auditPlugin.js';

mongoose.plugin(auditPlugin);

const connectDB = async () => {
  try {
    const connect = await mongoose.connect(env.mongodbUri);
    logger.info(`MongoDB conectado: ${connect.connection.host}`);
  } catch (error) {
    logger.error(`Error de conexión a MongoDB: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => logger.warn('MongoDB desconectado.'));
mongoose.connection.on('reconnected', () => logger.info('MongoDB reconectado.'));
mongoose.connection.on('error', (error) => logger.error('Error de conexión de MongoDB.', error));

export default connectDB;
