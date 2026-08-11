import mongoose from 'mongoose';
import logger from '../logger/logger.js';
import env from '../environment/env.js';

const connectDB = async () => {
  try {
    const connect = await mongoose.connect(env.mongodbUri);
    logger.info(`MongoDB conectado: ${connect.connection.host}`);
  } catch (error) {
    logger.error(`Error de conexión a MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
