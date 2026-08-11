import env from '../environment/env.js';

const formatTimestamp = () => new Date().toISOString();

const logger = {
  info(...args) {
    console.log(`[INFO ${formatTimestamp()}]`, ...args);
  },
  warn(...args) {
    console.warn(`[WARN ${formatTimestamp()}]`, ...args);
  },
  error(...args) {
    console.error(`[ERROR ${formatTimestamp()}]`, ...args);
  },
  debug(...args) {
    if (env.isDevelopment) {
      console.debug(`[DEBUG ${formatTimestamp()}]`, ...args);
    }
  },
};

export default logger;
