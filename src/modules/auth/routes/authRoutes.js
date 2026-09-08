import express from 'express';
import asyncHandler from '../../../common/helpers/asyncHandler.js';
import authController from '../controllers/authController.js';

const router = express.Router();

router.get('/login', authController.getLogin);
router.get('/registro', authController.getRegister);
router.post('/login', asyncHandler(authController.postLogin));
router.post('/registro', asyncHandler(authController.postRegister));
router.post('/logout', authController.postLogout);

export default router;
