import Category from '../models/Category.js';

const categoryRepository = {
  findAllActive() {
    return Category.find({ isActive: true }).sort('order').lean();
  },

  findByName(name) {
    return Category.findOne({ name }).lean();
  },

  findById(id) {
    return Category.findById(id).lean();
  },
};

export default categoryRepository;
