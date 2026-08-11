export const toProductDTO = (product) => ({
  id: product._id?.toString(),
  name: product.name,
  description: product.description || '',
  price: product.price,
  image: product.image,
  stock: product.stock ?? 0,
  isActive: product.isActive,
  featured: product.featured ?? false,
  category: product.category
    ? {
        id: product.category._id?.toString(),
        name: product.category.name,
        icon: product.category.icon,
      }
    : null,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
});
