import express from 'express';
import catalogController from '../controllers/catalogController.js';

const router = express.Router();

router.get('/', catalogController.getCatalog);

export default router;
