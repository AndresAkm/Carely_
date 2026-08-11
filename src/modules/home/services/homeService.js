import { benefits, whyUs } from '../../../common/constants/landing.js';
import { categoryService } from '../../categories/index.js';
import { productService } from '../../products/index.js';

const homeService = {
  async getLandingData() {
    const [categories, featuredProducts] = await Promise.all([
      categoryService.getAllActive(),
      productService.getFeatured(),
    ]);

    return {
      categories,
      featuredProducts,
      benefits,
      whyUs,
    };
  },
};

export default homeService;
