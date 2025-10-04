import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

// Tipos de roles disponibles en el sistema
export type RolUsuario = 'ADMIN' | 'COORDINADOR_ARCHIVO' | 'RESPONSABLE_AREA' | 'OPERADOR' | 'CONSULTA';

// Middleware para verificar roles específicos
export const roleMiddleware = (allowedRoles: RolUsuario[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AppError('No autenticado', 401);
      }

      const userRole = req.user.rol as RolUsuario;
      
      if (!allowedRoles.includes(userRole)) {
        throw new AppError(
          `No tiene permisos para realizar esta acción. Rol requerido: ${allowedRoles.join(' o ')}`,
          403
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};