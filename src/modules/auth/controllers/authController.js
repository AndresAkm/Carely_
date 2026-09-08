import asyncHandler from '../../../common/helpers/asyncHandler.js';
import authService from '../services/authService.js';

const authController = {
  getLogin: (req, res) => {
    if (req.session.user) {
      return res.redirect('/dashboard');
    }
    res.render('auth/login', {
      title: 'Iniciar Sesión - Carely',
      extraCss: ['/css/auth.css'],
      formData: {},
    });
  },

  getRegister: (req, res) => {
    if (req.session.user) {
      return res.redirect('/dashboard');
    }
    res.render('auth/register', {
      title: 'Crear Cuenta - Carely',
      extraCss: ['/css/auth.css'],
      formData: {},
    });
  },

  postRegister: asyncHandler(async (req, res, next) => {
    try {
      const user = await authService.register(req.body);
      req.session.user = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      };
      req.session.flash = { type: 'success', message: '¡Cuenta creada exitosamente! Bienvenido a Carely.' };
      return res.redirect('/');
    } catch (error) {
      res.status(error.statusCode || 400).render('auth/register', {
        title: 'Crear Cuenta - Carely',
        extraCss: ['/css/auth.css'],
        formData: req.body,
        error: error.message,
      });
    }
  }),

  postLogin: asyncHandler(async (req, res, next) => {
    try {
      const user = await authService.login(req.body);
      req.session.user = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      };
      req.session.flash = { type: 'success', message: `¡Hola de nuevo, ${user.firstName}!` };
      return res.redirect('/');
    } catch (error) {
      res.status(error.statusCode || 400).render('auth/login', {
        title: 'Iniciar Sesión - Carely',
        extraCss: ['/css/auth.css'],
        formData: req.body,
        error: error.message,
      });
    }
  }),

  postLogout: (req, res) => {
    req.session.destroy(() => {
      res.redirect('/');
    });
  },
};

export default authController;
