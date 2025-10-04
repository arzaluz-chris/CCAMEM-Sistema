import { Request, Response, NextFunction } from 'express';
import { RolUsuario } from '@prisma/client';
import { AppError } from './errorHandler';
import { verifyAccessToken } from '../utils/jwt';

// Middleware para verificar autenticación
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token no proporcionado', 401);
    }

    const token = authHeader.substring(7); // Remover 'Bearer '

    try {
      const payload = verifyAccessToken(token);
      req.user = payload;
      next();
    } catch (error) {
      throw new AppError('Token inválido o expirado', 401);
    }
  } catch (error) {
    next(error);
  }
};

// Middleware para verificar roles
export const authorize = (...roles: RolUsuario[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('No autenticado', 401);
    }

    if (!roles.includes(req.user.rol)) {
      throw new AppError('No tiene permisos para realizar esta acción', 403);
    }

    next();
  };
};

// Middleware para verificar que el usuario pertenece a la unidad administrativa
export const checkUnidadAdministrativa = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    throw new AppError('No autenticado', 401);
  }

  // Los admins y coordinadores de archivo pueden ver todo
  if (req.user.rol === 'ADMIN' || req.user.rol === 'COORDINADOR_ARCHIVO') {
    next();
    return;
  }

  // Los demás usuarios solo pueden ver/editar expedientes de su unidad
  const { unidadAdministrativaId } = req.body;

  if (
    unidadAdministrativaId &&
    unidadAdministrativaId !== req.user.unidadAdministrativaId
  ) {
    throw new AppError(
      'No tiene permisos para acceder a expedientes de otra unidad administrativa',
      403
    );
  }

  next();
};

// Alias para compatibilidad con rutas existentes
export const authMiddleware = authenticate;
export const requireRoles = authorize;
