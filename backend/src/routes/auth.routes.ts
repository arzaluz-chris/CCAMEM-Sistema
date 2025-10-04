import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Rutas públicas
router.post('/login', authController.login.bind(authController));
router.post('/refresh', authController.refreshToken.bind(authController));

// Rutas protegidas (requieren autenticación)
router.post('/logout', authenticate, authController.logout.bind(authController));
router.get('/verify', authenticate, authController.verifyToken.bind(authController));
router.get('/profile', authenticate, authController.getProfile.bind(authController));
router.post('/change-password', authenticate, authController.changePassword.bind(authController));

export default router;
