import bcrypt from 'bcrypt';
import User from '../../users/models/User.js';
import AppError from '../../../common/errors/AppError.js';
import { auditService } from '../../audit/index.js';

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

    auditService.record({
      action: 'REGISTER',
      entity: 'User',
      entityId: user._id,
      actor: user._id,
      actorEmail: user.email,
      metadata: { role: user.role },
    });

    return user;
  },

  async login({ email, password }) {
    const normalizedEmail = (email || '').trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      auditService.record({
        action: 'LOGIN_FAILED',
        entity: 'User',
        actorEmail: normalizedEmail,
        metadata: { reason: 'not_found' },
      });
      throw new AuthError('Correo o contraseña incorrectos.', 401);
    }

    const valid = await bcrypt.compare(password || '', user.password);
    if (!valid) {
      auditService.record({
        action: 'LOGIN_FAILED',
        entity: 'User',
        entityId: user._id,
        actorEmail: user.email,
        metadata: { reason: 'invalid_password' },
      });
      throw new AuthError('Correo o contraseña incorrectos.', 401);
    }

    if (!user.isActive) {
      auditService.record({
        action: 'LOGIN_FAILED',
        entity: 'User',
        entityId: user._id,
        actorEmail: user.email,
        metadata: { reason: 'inactive' },
      });
      throw new AuthError('Tu cuenta está inactiva. Contacta al administrador.', 403);
    }

    auditService.record({
      action: 'LOGIN_SUCCESS',
      entity: 'User',
      entityId: user._id,
      actor: user._id,
      actorEmail: user.email,
      metadata: { role: user.role },
    });

    return user;
  },
};

export default authService;
