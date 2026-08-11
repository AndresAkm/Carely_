import express from 'express';
import { homeRoutes } from '../modules/home/index.js';
import { catalogRoutes } from '../modules/catalog/index.js';
import { authRoutes } from '../modules/auth/index.js';

const router = express.Router();

router.use('/', homeRoutes);
router.use('/catalogo', catalogRoutes);
router.use('/auth', authRoutes);

export default router;
