import logger from '../../config/logger/logger.js';
import env from '../../config/environment/env.js';

export const errorHandler = (err, req, res, next) => {
  if (!err.isOperational) {
    logger.error('ERROR NO CONTROLADO:', err);
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
