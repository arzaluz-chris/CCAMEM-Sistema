import { Request, Response } from 'express';
import { PrismaClient, AccionBitacora } from '@prisma/client';
import { AuthRequest } from '../types';

const prisma = new PrismaClient();

/**
 * Registrar entrada en bitácora
 */
export const registrarBitacora = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      accion,
      entidad,
      entidadId,
      descripcion,
      datosPrevios,
      datosNuevos,
      expedienteId
    } = req.body;

    const usuarioId = req.user?.id;

    if (!usuarioId) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
      return;
    }

    // Validar campos requeridos
    if (!accion || !entidad || !entidadId || !descripcion) {
      res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: accion, entidad, entidadId, descripcion',
      });
      return;
    }

    // Validar que la acción sea válida
    const accionesValidas = Object.values(AccionBitacora);
    if (!accionesValidas.includes(accion)) {
      res.status(400).json({
        success: false,
        message: `Acción inválida. Valores permitidos: ${accionesValidas.join(', ')}`,
      });
      return;
    }

    // Obtener IP y User Agent
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';

    // Crear registro en bitácora
    const bitacora = await prisma.bitacora.create({
      data: {
        usuarioId,
        accion,
        entidad,
        entidadId,
        descripcion,
        datosPrevios: datosPrevios || null,
        datosNuevos: datosNuevos || null,
        expedienteId: expedienteId || null,
        ipAddress,
        userAgent,
      },
      include: {
        usuario: {
          select: {
            id: true,
            username: true,
            nombre: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
          },
        },
        expediente: {
          select: {
            id: true,
            numeroExpediente: true,
            nombreExpediente: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Registro de bitácora creado exitosamente',
      data: bitacora,
    });
  } catch (error) {
    console.error('Error al registrar en bitácora:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar en bitácora',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};

/**
 * Listar registros de bitácora con filtros
 */
export const listarBitacoras = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '50',
      accion,
      entidad,
      usuarioId,
      expedienteId,
      fechaDesde,
      fechaHasta,
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Construir filtros
    const where: any = {};

    if (accion) {
      where.accion = accion;
    }

    if (entidad) {
      where.entidad = entidad;
    }

    if (usuarioId) {
      where.usuarioId = usuarioId;
    }

    if (expedienteId) {
      where.expedienteId = expedienteId;
    }

    if (fechaDesde || fechaHasta) {
      where.createdAt = {};
      if (fechaDesde) {
        where.createdAt.gte = new Date(fechaDesde as string);
      }
      if (fechaHasta) {
        where.createdAt.lte = new Date(fechaHasta as string);
      }
    }

    // Contar total
    const total = await prisma.bitacora.count({ where });

    // Obtener registros
    const bitacoras = await prisma.bitacora.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        usuario: {
          select: {
            id: true,
            username: true,
            nombre: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
            rol: true,
          },
        },
        expediente: {
          select: {
            id: true,
            numeroExpediente: true,
            nombreExpediente: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: bitacoras,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error al listar bitácoras:', error);
    res.status(500).json({
      success: false,
      message: 'Error al listar bitácoras',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};

/**
 * Obtener bitácora por ID
 */
export const obtenerBitacora = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const bitacora = await prisma.bitacora.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            username: true,
            nombre: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
            email: true,
            rol: true,
          },
        },
        expediente: {
          select: {
            id: true,
            numeroExpediente: true,
            nombreExpediente: true,
            formulaClasificadora: true,
          },
        },
      },
    });

    if (!bitacora) {
      res.status(404).json({
        success: false,
        message: 'Registro de bitácora no encontrado',
      });
      return;
    }

    res.json({
      success: true,
      data: bitacora,
    });
  } catch (error) {
    console.error('Error al obtener bitácora:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener bitácora',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};

/**
 * Obtener bitácora de un expediente específico
 */
export const obtenerBitacoraExpediente = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { expedienteId } = req.params;
    const { page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Verificar que el expediente existe
    const expediente = await prisma.expediente.findUnique({
      where: { id: expedienteId },
      select: { id: true, numeroExpediente: true, nombreExpediente: true },
    });

    if (!expediente) {
      res.status(404).json({
        success: false,
        message: 'Expediente no encontrado',
      });
      return;
    }

    // Contar total
    const total = await prisma.bitacora.count({
      where: { expedienteId },
    });

    // Obtener registros
    const bitacoras = await prisma.bitacora.findMany({
      where: { expedienteId },
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        usuario: {
          select: {
            id: true,
            username: true,
            nombre: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
            rol: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: {
        expediente,
        bitacoras,
      },
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error al obtener bitácora del expediente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener bitácora del expediente',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};

/**
 * Obtener estadísticas de bitácora
 */
export const obtenerEstadisticas = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fechaDesde, fechaHasta } = req.query;

    // Construir filtro de fechas
    const where: any = {};
    if (fechaDesde || fechaHasta) {
      where.createdAt = {};
      if (fechaDesde) {
        where.createdAt.gte = new Date(fechaDesde as string);
      }
      if (fechaHasta) {
        where.createdAt.lte = new Date(fechaHasta as string);
      }
    }

    // Total de registros
    const total = await prisma.bitacora.count({ where });

    // Conteo por acción
    const porAccion = await prisma.bitacora.groupBy({
      by: ['accion'],
      where,
      _count: {
        id: true,
      },
    });

    // Conteo por entidad
    const porEntidad = await prisma.bitacora.groupBy({
      by: ['entidad'],
      where,
      _count: {
        id: true,
      },
    });

    // Usuarios más activos
    const usuariosMasActivos = await prisma.bitacora.groupBy({
      by: ['usuarioId'],
      where,
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    // Obtener datos de usuarios
    const usuariosIds = usuariosMasActivos.map((u) => u.usuarioId);
    const usuarios = await prisma.usuario.findMany({
      where: { id: { in: usuariosIds } },
      select: {
        id: true,
        username: true,
        nombre: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
      },
    });

    const usuariosMasActivosConNombre = usuariosMasActivos.map((u) => {
      const usuario = usuarios.find((us) => us.id === u.usuarioId);
      return {
        ...u,
        usuario,
      };
    });

    res.json({
      success: true,
      data: {
        total,
        porAccion: porAccion.map((item) => ({
          accion: item.accion,
          count: item._count.id,
        })),
        porEntidad: porEntidad.map((item) => ({
          entidad: item.entidad,
          count: item._count.id,
        })),
        usuariosMasActivos: usuariosMasActivosConNombre.map((item) => ({
          usuarioId: item.usuarioId,
          usuario: item.usuario,
          count: item._count.id,
        })),
      },
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de bitácora:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de bitácora',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};

/**
 * Eliminar registros antiguos de bitácora (mantenimiento)
 * Solo para administradores
 */
export const limpiarBitacora = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { diasAntiguedad = 365 } = req.body;

    // Calcular fecha límite
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - Number(diasAntiguedad));

    // Eliminar registros antiguos
    const resultado = await prisma.bitacora.deleteMany({
      where: {
        createdAt: {
          lt: fechaLimite,
        },
      },
    });

    res.json({
      success: true,
      message: `Se eliminaron ${resultado.count} registros de bitácora`,
      data: {
        registrosEliminados: resultado.count,
        fechaLimite,
        diasAntiguedad,
      },
    });
  } catch (error) {
    console.error('Error al limpiar bitácora:', error);
    res.status(500).json({
      success: false,
      message: 'Error al limpiar bitácora',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};
