import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export class UsuariosController {
  // Listar usuarios con filtros y paginación
  async listar(req: Request, res: Response) {
    try {
      const {
        page = '1',
        limit = '10',
        rol,
        unidadAdministrativaId,
        activo,
        search,
      } = req.query;

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      const take = parseInt(limit as string);

      const where: any = {};

      if (rol) where.rol = rol;
      if (unidadAdministrativaId) where.unidadAdministrativaId = unidadAdministrativaId;
      if (activo !== undefined) where.activo = activo === 'true';

      if (search) {
        where.OR = [
          { username: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
          { nombre: { contains: search as string, mode: 'insensitive' } },
          { apellidoPaterno: { contains: search as string, mode: 'insensitive' } },
          { apellidoMaterno: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const [usuarios, total] = await Promise.all([
        prisma.usuario.findMany({
          where,
          skip,
          take,
          select: {
            id: true,
            username: true,
            email: true,
            nombre: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
            rol: true,
            activo: true,
            ultimoAcceso: true,
            createdAt: true,
            updatedAt: true,
            unidadAdministrativa: {
              select: {
                id: true,
                clave: true,
                nombre: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.usuario.count({ where }),
      ]);

      res.json({
        success: true,
        data: usuarios,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string)),
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al listar usuarios',
        error: error.message,
      });
    }
  }

  // Obtener usuario por ID
  async obtenerPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const usuario = await prisma.usuario.findUnique({
        where: { id },
        select: {
          id: true,
          username: true,
          email: true,
          nombre: true,
          apellidoPaterno: true,
          apellidoMaterno: true,
          rol: true,
          activo: true,
          ultimoAcceso: true,
          createdAt: true,
          updatedAt: true,
          unidadAdministrativa: {
            select: {
              id: true,
              clave: true,
              nombre: true,
            },
          },
        },
      });

      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
        });
      }

      return res.json({
        success: true,
        data: usuario,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener usuario',
        error: error.message,
      });
    }
  }

  // Crear usuario
  async crear(req: Request, res: Response) {
    try {
      const {
        username,
        email,
        password,
        nombre,
        apellidoPaterno,
        apellidoMaterno,
        rol,
        unidadAdministrativaId,
      } = req.body;

      // Validar que no exista el username o email
      const existente = await prisma.usuario.findFirst({
        where: {
          OR: [{ username }, { email }],
        },
      });

      if (existente) {
        return res.status(400).json({
          success: false,
          message:
            existente.username === username
              ? 'El nombre de usuario ya está en uso'
              : 'El email ya está en uso',
        });
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear usuario
      const nuevoUsuario = await prisma.usuario.create({
        data: {
          username,
          email,
          password: hashedPassword,
          nombre,
          apellidoPaterno,
          apellidoMaterno,
          rol,
          unidadAdministrativaId: unidadAdministrativaId || null,
          activo: true,
        },
        select: {
          id: true,
          username: true,
          email: true,
          nombre: true,
          apellidoPaterno: true,
          apellidoMaterno: true,
          rol: true,
          activo: true,
          createdAt: true,
          unidadAdministrativa: {
            select: {
              id: true,
              clave: true,
              nombre: true,
            },
          },
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: nuevoUsuario,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error al crear usuario',
        error: error.message,
      });
    }
  }

  // Actualizar usuario
  async actualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        username,
        email,
        nombre,
        apellidoPaterno,
        apellidoMaterno,
        rol,
        unidadAdministrativaId,
        activo,
      } = req.body;

      // Verificar que el usuario existe
      const usuarioExistente = await prisma.usuario.findUnique({
        where: { id },
      });

      if (!usuarioExistente) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
        });
      }

      // Validar username y email únicos (excepto el usuario actual)
      if (username || email) {
        const conflicto = await prisma.usuario.findFirst({
          where: {
            AND: [
              { id: { not: id } },
              {
                OR: [
                  ...(username ? [{ username }] : []),
                  ...(email ? [{ email }] : []),
                ],
              },
            ],
          },
        });

        if (conflicto) {
          return res.status(400).json({
            success: false,
            message:
              conflicto.username === username
                ? 'El nombre de usuario ya está en uso'
                : 'El email ya está en uso',
          });
        }
      }

      // Actualizar usuario
      const usuarioActualizado = await prisma.usuario.update({
        where: { id },
        data: {
          ...(username && { username }),
          ...(email && { email }),
          ...(nombre && { nombre }),
          ...(apellidoPaterno && { apellidoPaterno }),
          ...(apellidoMaterno !== undefined && { apellidoMaterno }),
          ...(rol && { rol }),
          ...(unidadAdministrativaId !== undefined && { unidadAdministrativaId }),
          ...(activo !== undefined && { activo }),
        },
        select: {
          id: true,
          username: true,
          email: true,
          nombre: true,
          apellidoPaterno: true,
          apellidoMaterno: true,
          rol: true,
          activo: true,
          updatedAt: true,
          unidadAdministrativa: {
            select: {
              id: true,
              clave: true,
              nombre: true,
            },
          },
        },
      });

      return res.json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: usuarioActualizado,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar usuario',
        error: error.message,
      });
    }
  }

  // Cambiar contraseña
  async cambiarPassword(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { passwordActual, passwordNuevo } = req.body;
      const userId = (req as any).user.id;

      // Solo el mismo usuario o admin puede cambiar la contraseña
      if (userId !== id && (req as any).user.rol !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para cambiar la contraseña de este usuario',
        });
      }

      const usuario = await prisma.usuario.findUnique({
        where: { id },
      });

      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
        });
      }

      // Si no es admin, verificar contraseña actual
      if ((req as any).user.rol !== 'ADMIN') {
        const passwordValido = await bcrypt.compare(passwordActual, usuario.password);
        if (!passwordValido) {
          return res.status(400).json({
            success: false,
            message: 'Contraseña actual incorrecta',
          });
        }
      }

      // Hash de la nueva contraseña
      const hashedPassword = await bcrypt.hash(passwordNuevo, 10);

      // Actualizar contraseña
      await prisma.usuario.update({
        where: { id },
        data: { password: hashedPassword },
      });

      return res.json({
        success: true,
        message: 'Contraseña actualizada exitosamente',
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error al cambiar contraseña',
        error: error.message,
      });
    }
  }

  // Activar/Desactivar usuario
  async toggleActivo(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const usuario = await prisma.usuario.findUnique({
        where: { id },
      });

      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
        });
      }

      const usuarioActualizado = await prisma.usuario.update({
        where: { id },
        data: { activo: !usuario.activo },
        select: {
          id: true,
          username: true,
          email: true,
          nombre: true,
          apellidoPaterno: true,
          apellidoMaterno: true,
          rol: true,
          activo: true,
        },
      });

      return res.json({
        success: true,
        message: `Usuario ${usuarioActualizado.activo ? 'activado' : 'desactivado'} exitosamente`,
        data: usuarioActualizado,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error al cambiar estado del usuario',
        error: error.message,
      });
    }
  }

  // Eliminar usuario (soft delete)
  async eliminar(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const usuario = await prisma.usuario.findUnique({
        where: { id },
      });

      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
        });
      }

      // Soft delete: marcar como inactivo en lugar de eliminar
      await prisma.usuario.update({
        where: { id },
        data: { activo: false },
      });

      return res.json({
        success: true,
        message: 'Usuario eliminado exitosamente',
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error al eliminar usuario',
        error: error.message,
      });
    }
  }

  // Obtener estadísticas de usuarios
  async estadisticas(req: Request, res: Response) {
    try {
      const [total, activos, porRol, porUnidad] = await Promise.all([
        prisma.usuario.count(),
        prisma.usuario.count({ where: { activo: true } }),
        prisma.usuario.groupBy({
          by: ['rol'],
          _count: { rol: true },
        }),
        prisma.usuario.groupBy({
          by: ['unidadAdministrativaId'],
          _count: { unidadAdministrativaId: true },
          where: { unidadAdministrativaId: { not: null } },
        }),
      ]);

      // Obtener nombres de unidades
      const unidadesIds = porUnidad.map((u) => u.unidadAdministrativaId!);
      const unidades = await prisma.unidadAdministrativa.findMany({
        where: { id: { in: unidadesIds } },
        select: { id: true, clave: true, nombre: true },
      });

      const porUnidadConNombres = porUnidad.map((u) => {
        const unidad = unidades.find((un) => un.id === u.unidadAdministrativaId);
        return {
          unidad: unidad?.nombre || 'Sin unidad',
          clave: unidad?.clave || 'N/A',
          total: u._count.unidadAdministrativaId,
        };
      });

      res.json({
        success: true,
        data: {
          total,
          activos,
          inactivos: total - activos,
          porRol: porRol.map((r) => ({
            rol: r.rol,
            total: r._count.rol,
          })),
          porUnidad: porUnidadConNombres,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas',
        error: error.message,
      });
    }
  }
}

export default new UsuariosController();
