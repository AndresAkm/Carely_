import express from 'express';
import authController from '../controllers/authController.js';

const router = express.Router();

router.get('/login', authController.getLogin);
router.get('/registro', authController.getRegister);

export default router;
