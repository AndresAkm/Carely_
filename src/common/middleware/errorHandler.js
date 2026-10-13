import logger from '../../config/logger/logger.js';
import env from '../../config/environment/env.js';
import { getContext } from '../context/requestContext.js';

export const errorHandler = (err, req, res, next) => {
  const context = getContext();

  const meta = {
    requestId: context.requestId || null,
    method: context.method || req.method,
    path: context.path || req.originalUrl || req.path,
    userId: context.userId || null,
    statusCode: err.statusCode || 500,
    error: err,
  };

  if (err.isOperational) {
    logger.warn(err.message, meta);
  } else {
    logger.error('ERROR NO CONTROLADO', meta);
  }

  const statusCode = err.statusCode || 500;

  if (statusCode === 404) {
    return res.status(404).render('errors/404', {
      title: 'Página no encontrada - Carely',
      currentPath: req.path,
    });
  }

  const message = env.isDevelopment
    ? err.message
    : 'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo más tarde.';

  res.status(statusCode).render('errors/500', {
    title: 'Error del servidor - Carely',
    message,
    stack: env.isDevelopment ? err.stack : null,
  });
};
