import bcrypt from 'bcrypt';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  TokenPayload,
} from '../utils/jwt';

const SALT_ROUNDS = 10;

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: true;
  data: {
    user: {
      id: string;
      username: string;
      email: string;
      nombre: string;
      apellidoPaterno: string;
      apellidoMaterno: string | null;
      rol: string;
      unidadAdministrativaId: string | null;
    };
    accessToken: string;
    refreshToken: string;
  };
}

export class AuthService {
  // Login de usuario
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { username, password } = credentials;

    // Buscar usuario
    const usuario = await prisma.usuario.findUnique({
      where: { username },
      include: {
        unidadAdministrativa: true,
      },
    });

    if (!usuario) {
      throw new AppError('Credenciales inválidas', 401);
    }

    if (!usuario.activo) {
      throw new AppError('Usuario inactivo. Contacte al administrador', 403);
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, usuario.password);

    if (!isPasswordValid) {
      throw new AppError('Credenciales inválidas', 401);
    }

    // Actualizar último acceso
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { ultimoAcceso: new Date() },
    });

    // Registrar en bitácora
    await prisma.bitacora.create({
      data: {
        usuarioId: usuario.id,
        accion: 'LOGIN',
        entidad: 'Usuario',
        entidadId: usuario.id,
        descripcion: `Usuario ${usuario.username} inició sesión`,
      },
    });

    // Generar tokens
    const tokenPayload: TokenPayload = {
      id: usuario.id,
      username: usuario.username,
      email: usuario.email,
      rol: usuario.rol,
      unidadAdministrativaId: usuario.unidadAdministrativaId,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken({
      id: usuario.id,
      username: usuario.username,
    });

    return {
      success: true,
      data: {
        user: {
          id: usuario.id,
          username: usuario.username,
          email: usuario.email,
          nombre: usuario.nombre,
          apellidoPaterno: usuario.apellidoPaterno,
          apellidoMaterno: usuario.apellidoMaterno,
          rol: usuario.rol,
          unidadAdministrativaId: usuario.unidadAdministrativaId,
        },
        accessToken,
        refreshToken,
      },
    };
  }

  // Refresh token
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = verifyRefreshToken(refreshToken);

      const usuario = await prisma.usuario.findUnique({
        where: { id: payload.id },
      });

      if (!usuario || !usuario.activo) {
        throw new AppError('Usuario no encontrado o inactivo', 401);
      }

      const tokenPayload: TokenPayload = {
        id: usuario.id,
        username: usuario.username,
        email: usuario.email,
        rol: usuario.rol,
        unidadAdministrativaId: usuario.unidadAdministrativaId,
      };

      const newAccessToken = generateAccessToken(tokenPayload);
      const newRefreshToken = generateRefreshToken({
        id: usuario.id,
        username: usuario.username,
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new AppError('Refresh token inválido o expirado', 401);
    }
  }

  // Verificar token
  async verifyToken(userId: string) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        nombre: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
        rol: true,
        unidadAdministrativaId: true,
        activo: true,
      },
    });

    if (!usuario || !usuario.activo) {
      throw new AppError('Usuario no encontrado o inactivo', 401);
    }

    return {
      success: true,
      data: { user: usuario },
    };
  }

  // Cambiar contraseña
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Verificar contraseña actual
    const isPasswordValid = await bcrypt.compare(currentPassword, usuario.password);

    if (!isPasswordValid) {
      throw new AppError('Contraseña actual incorrecta', 401);
    }

    // Hash de nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Actualizar contraseña
    await prisma.usuario.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Registrar en bitácora
    await prisma.bitacora.create({
      data: {
        usuarioId: userId,
        accion: 'ACTUALIZAR',
        entidad: 'Usuario',
        entidadId: userId,
        descripcion: 'Usuario cambió su contraseña',
      },
    });

    return {
      success: true,
      message: 'Contraseña actualizada exitosamente',
    };
  }

  // Hash de contraseña (helper para crear usuarios)
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }
}

export default new AuthService();
