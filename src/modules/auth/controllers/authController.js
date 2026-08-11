const authController = {
  getLogin: (req, res) => {
    res.status(501).json({ message: 'Autenticación no implementada' });
  },
  getRegister: (req, res) => {
    res.status(501).json({ message: 'Registro no implementado' });
  },
};

export default authController;
