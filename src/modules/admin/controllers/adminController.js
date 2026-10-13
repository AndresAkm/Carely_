import asyncHandler from '../../../common/helpers/asyncHandler.js';
import adminService from '../services/adminService.js';
import catalogService from '../services/catalogService.js';

const adminController = {
  dashboard: asyncHandler(async (req, res) => {
    const data = await adminService.getDashboardStats();
    res.render('admin/dashboard', {
      title: 'Dashboard - Carely',
      currentPath: '/dashboard',
      data,
    });
  }),

  // ---------- USUARIOS ----------
  userList: asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const data = await adminService.listUsers({
      q: req.query.q,
      role: req.query.role,
      status: req.query.status,
      page,
    });
    res.render('admin/users/list', {
      title: 'Usuarios - Carely',
      currentPath: '/dashboard/usuarios',
      users: data.users,
      total: data.total,
      pages: data.pages,
      page,
      query: req.query,
    });
  }),

  userForm: asyncHandler(async (req, res) => {
    const { id } = req.params;
    let user = null;
    if (id) {
      user = await adminService.getUserById(id);
    }
    res.render('admin/users/form', {
      title: id ? 'Editar usuario - Carely' : 'Nuevo usuario - Carely',
      currentPath: '/dashboard/usuarios',
      user: user ? user.toObject() : null,
      error: null,
      formData: user ? user.toObject() : {},
    });
  }),

  userCreate: asyncHandler(async (req, res) => {
    try {
      await adminService.createUser(req.body);
      req.session.flash = { type: 'success', message: 'Usuario creado correctamente.' };
      return res.redirect('/dashboard/usuarios');
    } catch (error) {
      res.status(error.statusCode || 400).render('admin/users/form', {
        title: 'Nuevo usuario - Carely',
        currentPath: '/dashboard/usuarios',
        user: null,
        error: error.message,
        formData: req.body,
      });
    }
  }),

  userUpdate: asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      await adminService.updateUser(id, req.body);
      req.session.flash = { type: 'success', message: 'Usuario actualizado correctamente.' };
      return res.redirect('/dashboard/usuarios');
    } catch (error) {
      res.status(error.statusCode || 400).render('admin/users/form', {
        title: 'Editar usuario - Carely',
        currentPath: '/dashboard/usuarios',
        user: { ...(await adminService.getUserById(id)).toObject(), _id: id },
        error: error.message,
        formData: req.body,
      });
    }
  }),

  userToggleActive: asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      await adminService.toggleUserActive(id, req.session.user.id);
      req.session.flash = { type: 'success', message: 'Estado del usuario actualizado.' };
    } catch (error) {
      req.session.flash = { type: 'error', message: error.message };
    }
    return res.redirect('/dashboard/usuarios');
  }),

  userPassword: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await adminService.getUserById(id);
    res.render('admin/users/password', {
      title: 'Cambiar contraseña - Carely',
      currentPath: '/dashboard/usuarios',
      user: user.toObject(),
      error: null,
    });
  }),

  userPasswordSubmit: asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      await adminService.changeUserPassword(id, req.body.password);
      req.session.flash = { type: 'success', message: 'Contraseña actualizada correctamente.' };
      return res.redirect('/dashboard/usuarios');
    } catch (error) {
      res.status(error.statusCode || 400).render('admin/users/password', {
        title: 'Cambiar contraseña - Carely',
        currentPath: '/dashboard/usuarios',
        user: (await adminService.getUserById(id)).toObject(),
        error: error.message,
      });
    }
  }),

  userDelete: asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      await adminService.deleteUser(id, req.session.user.id);
      req.session.flash = { type: 'success', message: 'Usuario eliminado correctamente.' };
    } catch (error) {
      req.session.flash = { type: 'error', message: error.message };
    }
    return res.redirect('/dashboard/usuarios');
  }),

  userConfirmDelete: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await adminService.getUserById(id);
    res.render('admin/users/confirm_delete', {
      title: 'Eliminar usuario - Carely',
      currentPath: '/dashboard/usuarios',
      user: user.toObject(),
    });
  }),

  // ---------- PRODUCTOS ----------
  productList: asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const data = await catalogService.listProducts({
      q: req.query.q,
      category: req.query.category,
      isActive: req.query.isActive,
      page,
    });
    const categories = await catalogService.getAllCategories();
    res.render('admin/products/list', {
      title: 'Productos - Carely',
      currentPath: '/dashboard/productos',
      products: data.products,
      total: data.total,
      pages: data.pages,
      page,
      query: req.query,
      categories,
    });
  }),

  productForm: asyncHandler(async (req, res) => {
    const { id } = req.params;
    let product = null;
    if (id) {
      product = await catalogService.getProductById(id);
    }
    const categories = await catalogService.getAllCategories();
    res.render('admin/products/form', {
      title: id ? 'Editar producto - Carely' : 'Nuevo producto - Carely',
      currentPath: '/dashboard/productos',
      product: product ? product.toObject() : null,
      categories,
      error: null,
      formData: product ? product.toObject() : {},
    });
  }),

  productCreate: asyncHandler(async (req, res) => {
    try {
      if (req.uploadError) throw req.uploadError;
      await catalogService.createProduct(req.body, req.file);
      req.session.flash = { type: 'success', message: 'Producto creado correctamente.' };
      return res.redirect('/dashboard/productos');
    } catch (error) {
      const categories = await catalogService.getAllCategories();
      res.status(error.statusCode || 400).render('admin/products/form', {
        title: 'Nuevo producto - Carely',
        currentPath: '/dashboard/productos',
        product: null,
        categories,
        error: error.message,
        formData: { ...req.body, image: null },
      });
    }
  }),

  productUpdate: asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      if (req.uploadError) throw req.uploadError;
      await catalogService.updateProduct(id, req.body, req.file);
      req.session.flash = { type: 'success', message: 'Producto actualizado correctamente.' };
      return res.redirect('/dashboard/productos');
    } catch (error) {
      const categories = await catalogService.getAllCategories();
      res.status(error.statusCode || 400).render('admin/products/form', {
        title: 'Editar producto - Carely',
        currentPath: '/dashboard/productos',
        product: { ...(await catalogService.getProductById(id)).toObject(), _id: id },
        categories,
        error: error.message,
        formData: req.body,
      });
    }
  }),

  productConfirmDelete: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const product = await catalogService.getProductById(id);
    res.render('admin/products/confirm_delete', {
      title: 'Eliminar producto - Carely',
      currentPath: '/dashboard/productos',
      product: product.toObject(),
    });
  }),

  productDelete: asyncHandler(async (req, res) => {
    const { id } = req.params;
    await catalogService.deleteProduct(id);
    req.session.flash = { type: 'success', message: 'Producto eliminado correctamente.' };
    return res.redirect('/dashboard/productos');
  }),

  // ---------- CATEGORÍAS ----------
  categoryList: asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const data = await catalogService.listCategories({ page });
    res.render('admin/categories/list', {
      title: 'Categorías - Carely',
      currentPath: '/dashboard/categorias',
      categories: data.categories,
      total: data.total,
      pages: data.pages,
      page,
    });
  }),

  categoryForm: asyncHandler(async (req, res) => {
    const { id } = req.params;
    let category = null;
    if (id) {
      category = await catalogService.getCategoryById(id);
    }
    res.render('admin/categories/form', {
      title: id ? 'Editar categoría - Carely' : 'Nueva categoría - Carely',
      currentPath: '/dashboard/categorias',
      category: category ? category.toObject() : null,
      error: null,
      formData: category ? category.toObject() : {},
    });
  }),

  categoryCreate: asyncHandler(async (req, res) => {
    try {
      await catalogService.createCategory(req.body);
      req.session.flash = { type: 'success', message: 'Categoría creada correctamente.' };
      return res.redirect('/dashboard/categorias');
    } catch (error) {
      res.status(error.statusCode || 400).render('admin/categories/form', {
        title: 'Nueva categoría - Carely',
        currentPath: '/dashboard/categorias',
        category: null,
        error: error.message,
        formData: req.body,
      });
    }
  }),

  categoryUpdate: asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      await catalogService.updateCategory(id, req.body);
      req.session.flash = { type: 'success', message: 'Categoría actualizada correctamente.' };
      return res.redirect('/dashboard/categorias');
    } catch (error) {
      res.status(error.statusCode || 400).render('admin/categories/form', {
        title: 'Editar categoría - Carely',
        currentPath: '/dashboard/categorias',
        category: { ...(await catalogService.getCategoryById(id)).toObject(), _id: id },
        error: error.message,
        formData: req.body,
      });
    }
  }),

  categoryConfirmDelete: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const category = await catalogService.getCategoryById(id);
    res.render('admin/categories/confirm_delete', {
      title: 'Eliminar categoría - Carely',
      currentPath: '/dashboard/categorias',
      category: category.toObject(),
    });
  }),

  categoryDelete: asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      await catalogService.deleteCategory(id);
      req.session.flash = { type: 'success', message: 'Categoría eliminada correctamente.' };
    } catch (error) {
      req.session.flash = { type: 'error', message: error.message };
    }
    return res.redirect('/dashboard/categorias');
  }),
};

export default adminController;
