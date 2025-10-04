import { Request } from 'express';
import { RolUsuario } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    rol: RolUsuario;
    unidadAdministrativaId: string | null;
  };
}
