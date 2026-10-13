import bcrypt from 'bcrypt';
import User from '../../users/models/User.js';
import Product from '../../products/models/Product.js';
import Category from '../../categories/models/Category.js';
import AppError from '../../../common/errors/AppError.js';
import { auditService } from '../../audit/index.js';

class AdminError extends AppError {
  constructor(message, statusCode = 400) {
    super(message, statusCode);
  }
}

const SALT_ROUNDS = 10;

const adminService = {
  async getDashboardStats() {
    const [totalUsers, totalProducts, totalCategories, recentUsers] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Category.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);
    return {
      totalUsers,
      totalProducts,
      totalCategories,
      recentUsers,
    };
  },

  async listUsers({ q, role, status, page = 1, perPage = 8 } = {}) {
    const filter = {};
    if (q) {
      const regex = new RegExp(escapeRegExp(q), 'i');
      filter.$or = [{ firstName: regex }, { lastName: regex }, { email: regex }];
    }
    if (role === 'client' || role === 'admin') {
      filter.role = role;
    }
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;

    const skip = (page - 1) * perPage;
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(perPage).lean(),
      User.countDocuments(filter),
    ]);
    return { users, total, pages: Math.ceil(total / perPage) };
  },

  async getUserById(id) {
    const user = await User.findById(id);
    if (!user) throw new AdminError('El usuario no existe.', 404);
    return user;
  },

  async createUser({ firstName, lastName, email, phone, password, role, isActive }) {
    const normalizedEmail = (email || '').trim().toLowerCase();
    if (!firstName || !normalizedEmail || !password) {
      throw new AdminError('Nombre, correo y contraseña son obligatorios.');
    }
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      throw new AdminError('Ya existe un usuario con este correo electrónico.');
    }
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName ? lastName.trim() : '',
      email: normalizedEmail,
      phone: phone ? phone.trim() : '',
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'client',
      isActive: isActive === 'on' || isActive === true,
    });

    auditService.record({
      action: 'USER_CREATED',
      entity: 'User',
      entityId: user._id,
      actorEmail: user.email,
      metadata: { email: user.email, role: user.role },
    });

    return user;
  },

  async updateUser(id, { firstName, lastName, email, phone, role, isActive }) {
    const user = await this.getUserById(id);
    const isActiveBool = isActive === 'on' || isActive === true;
    if (!isActiveBool && user.role === 'admin' && role !== 'client') {
      const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (adminCount <= 1) {
        throw new AdminError('No puedes desactivar el último administrador activo.');
      }
    }
    if (email && email.trim().toLowerCase() !== user.email) {
      const existing = await User.findOne({ email: email.trim().toLowerCase() });
      if (existing) throw new AdminError('Ya existe un usuario con este correo electrónico.');
    }
    user.firstName = (firstName || '').trim();
    user.lastName = (lastName || '').trim();
    user.email = (email || '').trim().toLowerCase();
    user.phone = (phone || '').trim();
    user.role = role === 'admin' ? 'admin' : 'client';
    user.isActive = isActiveBool;
    await user.save();

    auditService.record({
      action: 'USER_UPDATED',
      entity: 'User',
      entityId: user._id,
      actorEmail: user.email,
      metadata: {
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });

    return user;
  },

  async toggleUserActive(id, currentUserId) {
    const user = await this.getUserById(id);
    if (user.id === currentUserId) {
      throw new AdminError('No puedes desactivar tu propia cuenta.');
    }
    if (user.isActive && user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (adminCount <= 1) {
        throw new AdminError('No puedes desactivar el último administrador activo.');
      }
    }
    user.isActive = !user.isActive;
    await user.save();

    auditService.record({
      action: 'USER_STATUS_CHANGED',
      entity: 'User',
      entityId: user._id,
      actorEmail: user.email,
      metadata: { isActive: user.isActive, role: user.role },
    });

    return user;
  },

  async changeUserPassword(id, password) {
    const user = await this.getUserById(id);
    if (!password || password.length < 8) {
      throw new AdminError('La contraseña debe tener al menos 8 caracteres.');
    }
    user.password = await bcrypt.hash(password, SALT_ROUNDS);
    await user.save();

    auditService.record({
      action: 'PASSWORD_CHANGED',
      entity: 'User',
      entityId: user._id,
      actorEmail: user.email,
      metadata: { email: user.email },
    });

    return user;
  },

  async deleteUser(id, currentUserId) {
    const user = await this.getUserById(id);
    if (user.id === currentUserId) {
      throw new AdminError('No puedes eliminar tu propia cuenta.');
    }
    if (user.role === 'admin' && user.isActive) {
      const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (adminCount <= 1) {
        throw new AdminError('No puedes eliminar el último administrador activo.');
      }
    }
    await user.deleteOne();

    auditService.record({
      action: 'USER_DELETED',
      entity: 'User',
      entityId: user._id,
      actorEmail: user.email,
      metadata: { email: user.email, role: user.role },
    });
  },
};

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default adminService;
