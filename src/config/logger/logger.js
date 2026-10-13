import fs from 'fs';
import path from 'path';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import env from '../environment/env.js';

const SENSITIVE_KEYS = [
  'password',
  'passwordhash',
  'password_hash',
  'token',
  'accesstoken',
  'access_token',
  'refreshtoken',
  'refresh_token',
  'secret',
  'sessionsecret',
  's3secretaccesskey',
  's3accesskeyid',
  'authorization',
  'cookie',
];

const isPlainObject = (value) => {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
};

const redact = (value, seen = new WeakSet()) => {
  if (value === null || typeof value !== 'object') return value;
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }
  if (typeof value.toHexString === 'function' && value._bsontype === 'ObjectId') {
    return value.toHexString();
  }
  if (Buffer.isBuffer(value)) return `[Buffer ${value.length} bytes]`;
  if (seen.has(value)) return '[Circular]';
  seen.add(value);

  if (Array.isArray(value)) return value.map((item) => redact(item, seen));

  if (typeof value.toObject === 'function') {
    return redact(value.toObject(), seen);
  }

  if (!isPlainObject(value)) return value;

  return Object.entries(value).reduce((acc, [key, val]) => {
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
      acc[key] = '[REDACTED]';
    } else {
      acc[key] = redact(val, seen);
    }
    return acc;
  }, {});
};

const normalizeArgs = (args) => {
  const [first, ...rest] = args;
  if (typeof first === 'string') {
    return { message: first, meta: rest.length ? (rest.length === 1 ? rest[0] : rest) : undefined };
  }
  if (first === undefined) return { message: '', meta: undefined };
  return { message: '', meta: rest.length ? [first, ...rest] : first };
};

const logDir = path.resolve(process.cwd(), env.log.dir);
fs.mkdirSync(logDir, { recursive: true });

const ORDERED_KEYS = ['timestamp', 'level', 'service', 'channel', 'message'];

const toSpacedJson = (obj) => JSON.stringify(obj, null, 1).replace(/\n\s*/g, ' ');

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.printf((info) => {
    const ordered = {};
    ORDERED_KEYS.forEach((key) => {
      if (info[key] !== undefined) ordered[key] = info[key];
    });
    Object.keys(info).forEach((key) => {
      if (!ORDERED_KEYS.includes(key)) ordered[key] = info[key];
    });
    return toSpacedJson(ordered);
  })
);

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, meta }) => {
    const metaStr = meta && Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}] ${message}${metaStr}`;
  })
);

const consoleTransport = new winston.transports.Console({ format: consoleFormat });

const appLogger = winston.createLogger({
  level: env.log.level,
  defaultMeta: { service: 'carely' },
  transports: [
    consoleTransport,
    new DailyRotateFile({
      dirname: logDir,
      filename: 'app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true,
      format: fileFormat,
    }),
    new DailyRotateFile({
      dirname: logDir,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '30d',
      zippedArchive: true,
      format: fileFormat,
    }),
  ],
});

const auditLogger = winston.createLogger({
  level: 'info',
  defaultMeta: { service: 'carely', channel: 'audit' },
  transports: [
    new DailyRotateFile({
      dirname: logDir,
      filename: 'audit-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '90d',
      zippedArchive: true,
      format: fileFormat,
    }),
    ...(env.isDevelopment ? [consoleTransport] : []),
  ],
});

const write = (target, level, args) => {
  const { message, meta } = normalizeArgs(args);
  const entry = { level, message };
  if (meta !== undefined) entry.meta = redact(meta);
  target.log(entry);
};

const logger = {
  info: (...args) => write(appLogger, 'info', args),
  warn: (...args) => write(appLogger, 'warn', args),
  error: (...args) => write(appLogger, 'error', args),
  debug: (...args) => write(appLogger, 'debug', args),
  http: (...args) => write(appLogger, 'http', args),
  audit: (...args) => write(auditLogger, 'info', args),
  redact,
  toSpacedJson,
  logDir,
};

export default logger;
