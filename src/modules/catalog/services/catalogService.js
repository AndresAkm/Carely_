import { categoryService } from '../../categories/index.js';
import { productService } from '../../products/index.js';

const catalogService = {
  async getCatalogData(categoryName) {
    const [categories, products] = await Promise.all([
      categoryService.getAllActive(),
      productService.getActiveByCategoryName(categoryName),
    ]);

    return {
      categories,
      products,
      currentCategory: categoryName || '',
    };
  },
};

export default catalogService;
