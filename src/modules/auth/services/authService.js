import bcrypt from 'bcrypt';
import User from '../../users/models/User.js';
import AppError from '../../../common/errors/AppError.js';

const SALT_ROUNDS = 10;

class AuthError extends AppError {
  constructor(message, statusCode = 400) {
    super(message, statusCode);
  }
}

const authService = {
  async register({ name, firstName, lastName, email, phone, password }) {
    const fullName = (firstName || name || '').trim();
    const normalizedEmail = (email || '').trim().toLowerCase();

    if (!fullName || !email || !password) {
      throw new AuthError('Todos los campos son obligatorios.');
    }
    if (password.length < 8) {
      throw new AuthError('La contraseña debe tener al menos 8 caracteres.');
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      throw new AuthError('Ya existe un usuario con este correo electrónico.');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      firstName: fullName,
      lastName: lastName ? lastName.trim() : '',
      email: normalizedEmail,
      phone: phone ? phone.trim() : '',
      password: hashedPassword,
      role: 'client',
      isActive: true,
    });

    return user;
  },

  async login({ email, password }) {
    const normalizedEmail = (email || '').trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      throw new AuthError('Correo o contraseña incorrectos.', 401);
    }

    const valid = await bcrypt.compare(password || '', user.password);
    if (!valid) {
      throw new AuthError('Correo o contraseña incorrectos.', 401);
    }

    if (!user.isActive) {
      throw new AuthError('Tu cuenta está inactiva. Contacta al administrador.', 403);
    }

    return user;
  },
};

export default authService;
