import { RolUsuario } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email: string;
        rol: RolUsuario;
        unidadAdministrativaId: string | null;
      };
    }
  }
}

export {};
