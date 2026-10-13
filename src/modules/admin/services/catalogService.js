import Product from '../../products/models/Product.js';
import Category from '../../categories/models/Category.js';
import AppError from '../../../common/errors/AppError.js';
import { supabaseStorage } from '../../../config/storage/index.js';

class CatalogAdminError extends AppError {
  constructor(message, statusCode = 400) {
    super(message, statusCode);
  }
}

const catalogService = {
  // ---------- PRODUCTOS ----------
  async listProducts({ q, category, isActive, page = 1, perPage = 8 } = {}) {
    const filter = {};
    if (q) {
      const regex = new RegExp(escapeRegExp(q), 'i');
      filter.$or = [{ name: regex }, { description: regex }];
    }
    if (category) {
      filter.category = category;
    }
    if (isActive === 'true') filter.isActive = true;
    if (isActive === 'false') filter.isActive = false;

    const skip = (page - 1) * perPage;
    const [products, total] = await Promise.all([
      Product.find(filter).populate('category').sort({ createdAt: -1 }).skip(skip).limit(perPage).lean(),
      Product.countDocuments(filter),
    ]);
    return { products, total, pages: Math.ceil(total / perPage) };
  },

  async getProductById(id) {
    const product = await Product.findById(id).populate('category');
    if (!product) throw new CatalogAdminError('El producto no existe.', 404);
    return product;
  },

  async createProduct({ category, name, description, price, image, stock, isActive, featured }, imageFile) {
    if (!category || !name || price === undefined || price === '') {
      throw new CatalogAdminError('Categoría, nombre y precio son obligatorios.');
    }
    if (Number(price) < 0) {
      throw new CatalogAdminError('El precio no puede ser negativo.');
    }

    let imageUrl = image || null;
    if (imageFile) {
      imageUrl = await supabaseStorage.uploadFile({
        buffer: imageFile.buffer,
        mimetype: imageFile.mimetype,
        originalname: imageFile.originalname,
        folder: 'products',
      });
    }

    try {
      return await Product.create({
        category,
        name: name.trim(),
        description: description || '',
        price: Number(price),
        image: imageUrl,
        stock: Number(stock) || 0,
        isActive: isActive === 'on' || isActive === true,
        featured: featured === 'on' || featured === true,
      });
    } catch (error) {
      if (imageFile) {
        await supabaseStorage.deleteFile(imageUrl).catch(() => {});
      }
      throw error;
    }
  },

  async updateProduct(id, { category, name, description, price, image, stock, isActive, featured }, imageFile) {
    const product = await this.getProductById(id);
    if (!category || !name || price === undefined || price === '') {
      throw new CatalogAdminError('Categoría, nombre y precio son obligatorios.');
    }
    if (Number(price) < 0) {
      throw new CatalogAdminError('El precio no puede ser negativo.');
    }

    const previousImage = product.image || null;
    let imageUrl = product.image;
    if (imageFile) {
      imageUrl = await supabaseStorage.uploadFile({
        buffer: imageFile.buffer,
        mimetype: imageFile.mimetype,
        originalname: imageFile.originalname,
        folder: 'products',
      });
    } else if (typeof image === 'string' && image) {
      imageUrl = image;
    }

    try {
      product.category = category;
      product.name = name.trim();
      product.description = description || '';
      product.price = Number(price);
      product.image = imageUrl;
      product.stock = Number(stock) || 0;
      product.isActive = isActive === 'on' || isActive === true;
      product.featured = featured === 'on' || featured === true;
      await product.save();
    } catch (error) {
      if (imageFile) {
        await supabaseStorage.deleteFile(imageUrl).catch(() => {});
      }
      throw error;
    }

    if (imageFile && previousImage && previousImage !== imageUrl) {
      await supabaseStorage.deleteFile(previousImage).catch(() => {});
    }

    return product;
  },

  async deleteProduct(id) {
    const product = await this.getProductById(id);
    await Product.deleteOne({ _id: id });
    if (product.image) {
      await supabaseStorage.deleteFile(product.image).catch(() => {});
    }
  },

  async getAllCategories() {
    return Category.find().sort({ order: 1 }).lean();
  },

  // ---------- CATEGORÍAS ----------
  async listCategories({ page = 1, perPage = 8 } = {}) {
    const skip = (page - 1) * perPage;
    const [categories, total] = await Promise.all([
      Category.find().sort({ order: 1 }).skip(skip).limit(perPage).lean(),
      Category.countDocuments(),
    ]);
    return { categories, total, pages: Math.ceil(total / perPage) };
  },

  async getCategoryById(id) {
    const category = await Category.findById(id);
    if (!category) throw new CatalogAdminError('La categoría no existe.', 404);
    return category;
  },

  async createCategory({ name, description, icon, image, order, isActive }) {
    if (!name || !icon) {
      throw new CatalogAdminError('Nombre e icono son obligatorios.');
    }
    const existing = await Category.findOne({ name: { $regex: `^${escapeRegExp(name.trim())}$`, $options: 'i' } });
    if (existing) throw new CatalogAdminError('Ya existe una categoría con este nombre.');
    return Category.create({
      name: name.trim(),
      description: description || '',
      icon,
      image: image || null,
      order: Number(order) || 0,
      isActive: isActive === 'on' || isActive === true,
    });
  },

  async updateCategory(id, { name, description, icon, image, order, isActive }) {
    const category = await this.getCategoryById(id);
    if (!name || !icon) {
      throw new CatalogAdminError('Nombre e icono son obligatorios.');
    }
    category.name = name.trim();
    category.description = description || '';
    category.icon = icon;
    if (typeof image === 'string' && image) category.image = image;
    category.order = Number(order) || 0;
    category.isActive = isActive === 'on' || isActive === true;
    await category.save();
    return category;
  },

  async deleteCategory(id) {
    await this.getCategoryById(id);
    const count = await Product.countDocuments({ category: id });
    if (count > 0) {
      throw new CatalogAdminError('No puedes eliminar una categoría con productos asociados.', 409);
    }
    await Category.deleteOne({ _id: id });
  },
};

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default catalogService;
