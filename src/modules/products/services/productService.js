import productRepository from '../repositories/productRepository.js';
import { mapToProductDTOs, mapToProductDTO } from '../mappers/productMapper.js';
import { categoryService } from '../../categories/index.js';

const productService = {
  async getFeatured(limit = 6) {
    const products = await productRepository.findFeatured(limit);
    return mapToProductDTOs(products);
  },

  async getActiveByCategoryName(categoryName) {
    if (!categoryName) {
      const products = await productRepository.findActiveByFilter({}, { createdAt: -1 });
      return mapToProductDTOs(products);
    }

    const category = await categoryService.getByName(categoryName);
    if (!category) {
      return [];
    }

    const products = await productRepository.findActiveByFilter(
      { category: category.id },
      { createdAt: -1 }
    );
    return mapToProductDTOs(products);
  },

  async getById(id) {
    const product = await productRepository.findById(id);
    return mapToProductDTO(product);
  },
};

export default productService;
