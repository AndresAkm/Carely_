import 'dotenv/config';

const env = {
  port: parseInt(process.env.PORT, 10) || 9000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/carely',
  sessionSecret: process.env.SESSION_SECRET || 'carely-dev-secret-change-me',
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: (process.env.NODE_ENV || 'development') === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  log: {
    level: process.env.LOG_LEVEL || ((process.env.NODE_ENV || 'development') === 'production' ? 'info' : 'debug'),
    dir: process.env.LOG_DIR || 'logs',
  },
  audit: {
    retentionDays: parseInt(process.env.AUDIT_RETENTION_DAYS, 10) || 180,
  },
  supabase: {
    url: (process.env.SUPABASE_URL || '').replace(/\/+$/, ''),
    s3AccessKeyId: process.env.SUPABASE_S3_ACCESS_KEY_ID || '',
    s3SecretAccessKey: process.env.SUPABASE_S3_SECRET_ACCESS_KEY || '',
    storageBucket: process.env.SUPABASE_STORAGE_BUCKET || '',
  },
};

export default env;
