import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { AppError } from '../middleware/errorHandler';
import {
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
} from '../utils/validation';

export class AuthController {
  // Login
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validar datos de entrada
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        throw new AppError(error.details[0].message, 400);
      }

      const result = await authService.login(value);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Refresh token
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { error, value } = refreshTokenSchema.validate(req.body);
      if (error) {
        throw new AppError(error.details[0].message, 400);
      }

      const tokens = await authService.refreshToken(value.refreshToken);
      res.json({
        success: true,
        data: tokens,
      });
    } catch (error) {
      next(error);
    }
  }

  // Verificar token
  async verifyToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('No autenticado', 401);
      }

      const result = await authService.verifyToken(req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Logout
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('No autenticado', 401);
      }

      // Registrar logout en bitácora
      // El token simplemente dejará de ser usado por el cliente
      // En una implementación más compleja se podría usar una lista negra de tokens

      res.json({
        success: true,
        message: 'Sesión cerrada exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  // Cambiar contraseña
  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('No autenticado', 401);
      }

      const { error, value } = changePasswordSchema.validate(req.body);
      if (error) {
        throw new AppError(error.details[0].message, 400);
      }

      const result = await authService.changePassword(
        req.user.id,
        value.currentPassword,
        value.newPassword
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Obtener perfil del usuario actual
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('No autenticado', 401);
      }

      const result = await authService.verifyToken(req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
