import 'dotenv/config';

const env = {
  port: parseInt(process.env.PORT, 10) || 9000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/carely',
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: (process.env.NODE_ENV || 'development') === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};

export default env;
