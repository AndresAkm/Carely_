export const toCategoryDTO = (category) => ({
  id: category._id?.toString(),
  name: category.name,
  description: category.description || '',
  icon: category.icon,
  image: category.image,
  order: category.order ?? 0,
  isActive: category.isActive,
  createdAt: category.createdAt,
  updatedAt: category.updatedAt,
});
