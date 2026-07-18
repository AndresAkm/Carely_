import express from 'express';
import { getLanding, getCatalog } from '../controllers/landingController.js';

const router = express.Router();

router.get('/', getLanding);
router.get('/catalogo', getCatalog);

export default router;
