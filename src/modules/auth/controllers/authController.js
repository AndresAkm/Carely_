const authController = {
  getLogin: (req, res) => {
    res.render('auth/login', {
      title: 'Iniciar Sesion - Carely',
      extraCss: ['/css/auth.css'],
    });
  },
  getRegister: (req, res) => {
    res.render('auth/register', {
      title: 'Crear Cuenta - Carely',
      extraCss: ['/css/auth.css'],
    });
  },
};

export default authController;
