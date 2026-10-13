import { randomUUID } from 'crypto';
import { runWithContext } from '../context/requestContext.js';

export const requestContext = (req, res, next) => {
  const context = {
    requestId: req.headers['x-request-id'] || randomUUID(),
    userId: req.session?.user?.id || null,
    role: req.session?.user?.role || null,
    ip: req.ip || req.connection?.remoteAddress || null,
    method: req.method,
    path: req.originalUrl || req.path,
    userAgent: req.headers['user-agent'] || null,
  };

  res.setHeader('X-Request-Id', context.requestId);
  runWithContext(context, () => next());
};

export default requestContext;
