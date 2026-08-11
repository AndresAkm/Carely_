import { toProductDTO } from '../dto/productDTO.js';

export const mapToProductDTOs = (products) => products.map(toProductDTO);

export const mapToProductDTO = (product) => (product ? toProductDTO(product) : null);
