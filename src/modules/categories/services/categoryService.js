import categoryRepository from '../repositories/categoryRepository.js';
import { mapToCategoryDTOs, mapToCategoryDTO } from '../mappers/categoryMapper.js';

const categoryService = {
  async getAllActive() {
    const categories = await categoryRepository.findAllActive();
    return mapToCategoryDTOs(categories);
  },

  async getByName(name) {
    const category = await categoryRepository.findByName(name);
    return mapToCategoryDTO(category);
  },

  async getById(id) {
    const category = await categoryRepository.findById(id);
    return mapToCategoryDTO(category);
  },
};

export default categoryService;
