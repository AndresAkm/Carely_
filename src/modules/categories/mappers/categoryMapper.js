import { toCategoryDTO } from '../dto/categoryDTO.js';

export const mapToCategoryDTOs = (categories) => categories.map(toCategoryDTO);

export const mapToCategoryDTO = (category) => (category ? toCategoryDTO(category) : null);
