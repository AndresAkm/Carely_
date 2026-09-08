import express from 'express';
import { requireAdmin } from '../../../common/middleware/auth.js';
import adminController from '../controllers/adminController.js';
import asyncHandler from '../../../common/helpers/asyncHandler.js';

const router = express.Router();

router.use(requireAdmin);

router.get('/', adminController.dashboard);

// Usuarios
router.get('/usuarios', adminController.userList);
router.get('/usuarios/nuevo', adminController.userForm);
router.get('/usuarios/:id/editar', adminController.userForm);
router.get('/usuarios/:id/password', adminController.userPassword);
router.get('/usuarios/:id/eliminar', adminController.userConfirmDelete);
router.post('/usuarios/nuevo', asyncHandler(adminController.userCreate));
router.post('/usuarios/:id/editar', asyncHandler(adminController.userUpdate));
router.post('/usuarios/:id/estado', asyncHandler(adminController.userToggleActive));
router.post('/usuarios/:id/password', asyncHandler(adminController.userPasswordSubmit));
router.post('/usuarios/:id/eliminar', asyncHandler(adminController.userDelete));

// Productos
router.get('/productos', adminController.productList);
router.get('/productos/nuevo', adminController.productForm);
router.get('/productos/:id/editar', adminController.productForm);
router.get('/productos/:id/eliminar', adminController.productConfirmDelete);
router.post('/productos/nuevo', asyncHandler(adminController.productCreate));
router.post('/productos/:id/editar', asyncHandler(adminController.productUpdate));
router.post('/productos/:id/eliminar', asyncHandler(adminController.productDelete));

// Categorías
router.get('/categorias', adminController.categoryList);
router.get('/categorias/nueva', adminController.categoryForm);
router.get('/categorias/:id/editar', adminController.categoryForm);
router.get('/categorias/:id/eliminar', adminController.categoryConfirmDelete);
router.post('/categorias/nueva', asyncHandler(adminController.categoryCreate));
router.post('/categorias/:id/editar', asyncHandler(adminController.categoryUpdate));
router.post('/categorias/:id/eliminar', asyncHandler(adminController.categoryDelete));

export default router;
