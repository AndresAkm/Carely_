import Product from '../models/Product.js';

const productRepository = {
  findActiveByFilter(filter = {}, sort = {}) {
    const baseFilter = { isActive: true, ...filter };
    return Product.find(baseFilter).sort(sort).populate('category').lean();
  },

  findFeatured(limit = 6) {
    return Product.find({ isActive: true, featured: true })
      .populate('category')
      .limit(limit)
      .lean();
  },

  findById(id) {
    return Product.findById(id).populate('category').lean();
  },
};

export default productRepository;
