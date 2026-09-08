import express from 'express';
import { homeRoutes } from '../modules/home/index.js';
import { catalogRoutes } from '../modules/catalog/index.js';
import { authRoutes } from '../modules/auth/index.js';
import { adminRoutes } from '../modules/admin/index.js';

const router = express.Router();

router.use('/', homeRoutes);
router.use('/catalogo', catalogRoutes);
router.use('/auth', authRoutes);
router.use('/dashboard', adminRoutes);

export default router;
