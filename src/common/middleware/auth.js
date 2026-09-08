export const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    req.session.flash = { type: 'warning', message: 'Inicia sesión para continuar.' };
    return res.redirect('/auth/login');
  }
  next();
};

export const requireAdmin = (req, res, next) => {
  if (!req.session.user) {
    req.session.flash = { type: 'warning', message: 'Inicia sesión para continuar.' };
    return res.redirect('/auth/login');
  }
  if (req.session.user.role !== 'admin' || !req.session.user.isActive) {
    return res.status(403).render('errors/403', {
      title: 'Acceso denegado - Carely',
      currentPath: req.path,
      message: 'No tienes permisos para acceder a esta sección.',
    });
  }
  next();
};
