import { Request, Response } from 'express';
import { PrismaClient, EstadoPrestamo } from '@prisma/client';

const prisma = new PrismaClient();

export class PrestamosController {
  // Listar préstamos con filtros
  async listar(req: Request, res: Response) {
    try {
      const {
        page = '1',
        limit = '10',
        estado,
        expedienteId,
        usuarioId,
        fechaDesde,
        fechaHasta,
      } = req.query;

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      const take = parseInt(limit as string);

      const where: any = {};

      if (estado) where.estado = estado;
      if (expedienteId) where.expedienteId = expedienteId;
      if (usuarioId) where.usuarioId = usuarioId;

      if (fechaDesde || fechaHasta) {
        where.fechaPrestamo = {};
        if (fechaDesde) where.fechaPrestamo.gte = new Date(fechaDesde as string);
        if (fechaHasta) where.fechaPrestamo.lte = new Date(fechaHasta as string);
      }

      const [prestamos, total] = await Promise.all([
        prisma.prestamo.findMany({
          where,
          skip,
          take,
          include: {
            expediente: {
              include: {
                unidadAdministrativa: true,
                seccion: true,
                serie: true,
              },
            },
            usuario: {
              select: {
                id: true,
                username: true,
                nombre: true,
                apellidoPaterno: true,
                apellidoMaterno: true,
                email: true,
              },
            },
            autorizadoPor: {
              select: {
                id: true,
                username: true,
                nombre: true,
                apellidoPaterno: true,
                apellidoMaterno: true,
              },
            },
          },
          orderBy: { fechaPrestamo: 'desc' },
        }),
        prisma.prestamo.count({ where }),
      ]);

      res.json({
        success: true,
        data: prestamos,
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
        message: 'Error al listar préstamos',
        error: error.message,
      });
    }
  }

  // Obtener préstamo por ID
  async obtenerPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const prestamo = await prisma.prestamo.findUnique({
        where: { id },
        include: {
          expediente: {
            include: {
              unidadAdministrativa: true,
              seccion: true,
              serie: true,
              subserie: true,
            },
          },
          usuario: {
            select: {
              id: true,
              username: true,
              nombre: true,
              apellidoPaterno: true,
              apellidoMaterno: true,
              email: true,
              unidadAdministrativa: true,
            },
          },
          autorizadoPor: {
            select: {
              id: true,
              username: true,
              nombre: true,
              apellidoPaterno: true,
              apellidoMaterno: true,
            },
          },
        },
      });

      if (!prestamo) {
        return res.status(404).json({
          success: false,
          message: 'Préstamo no encontrado',
        });
      }

      return res.json({
        success: true,
        data: prestamo,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener préstamo',
        error: error.message,
      });
    }
  }

  // Solicitar préstamo
  async solicitar(req: Request, res: Response) {
    try {
      const { expedienteId, fechaDevolucionEsperada, motivoPrestamo, observaciones } = req.body;
      const userId = (req as any).user.id;

      // Verificar que el expediente existe y está disponible
      const expediente = await prisma.expediente.findUnique({
        where: { id: expedienteId },
      });

      if (!expediente) {
        return res.status(404).json({
          success: false,
          message: 'Expediente no encontrado',
        });
      }

      if (expediente.estado === 'PRESTADO') {
        return res.status(400).json({
          success: false,
          message: 'El expediente ya está prestado',
        });
      }

      // Crear préstamo
      const prestamo = await prisma.prestamo.create({
        data: {
          expedienteId,
          usuarioId: userId,
          fechaDevolucionEsperada: new Date(fechaDevolucionEsperada),
          motivoPrestamo,
          observaciones,
          estado: 'PENDIENTE',
        },
        include: {
          expediente: true,
          usuario: {
            select: {
              id: true,
              username: true,
              nombre: true,
              apellidoPaterno: true,
              apellidoMaterno: true,
            },
          },
        },
      });

      // Registrar en bitácora
      await prisma.bitacora.create({
        data: {
          expedienteId,
          usuarioId: userId,
          accion: 'PRESTAR',
          entidad: 'Prestamo',
          entidadId: prestamo.id,
          descripcion: `Solicitud de préstamo del expediente ${expediente.numeroExpediente}`,
          datosNuevos: prestamo,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Solicitud de préstamo creada exitosamente',
        data: prestamo,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error al solicitar préstamo',
        error: error.message,
      });
    }
  }

  // Autorizar préstamo
  async autorizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      const { observaciones } = req.body;

      const prestamo = await prisma.prestamo.findUnique({
        where: { id },
        include: { expediente: true },
      });

      if (!prestamo) {
        return res.status(404).json({
          success: false,
          message: 'Préstamo no encontrado',
        });
      }

      if (prestamo.estado !== 'PENDIENTE') {
        return res.status(400).json({
          success: false,
          message: 'El préstamo no está pendiente de autorización',
        });
      }

      // Actualizar préstamo y expediente
      const [prestamoActualizado] = await prisma.$transaction([
        prisma.prestamo.update({
          where: { id },
          data: {
            estado: 'AUTORIZADO',
            autorizadoPorId: userId,
            observaciones: observaciones || prestamo.observaciones,
          },
          include: {
            expediente: true,
            usuario: {
              select: {
                id: true,
                username: true,
                nombre: true,
                apellidoPaterno: true,
              },
            },
            autorizadoPor: {
              select: {
                id: true,
                username: true,
                nombre: true,
                apellidoPaterno: true,
              },
            },
          },
        }),
        prisma.expediente.update({
          where: { id: prestamo.expedienteId },
          data: { estado: 'PRESTADO' },
        }),
        prisma.bitacora.create({
          data: {
            expedienteId: prestamo.expedienteId,
            usuarioId: userId,
            accion: 'PRESTAR',
            entidad: 'Prestamo',
            entidadId: id,
            descripcion: `Préstamo autorizado del expediente ${prestamo.expediente.numeroExpediente}`,
          },
        }),
      ]);

      return res.json({
        success: true,
        message: 'Préstamo autorizado exitosamente',
        data: prestamoActualizado,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error al autorizar préstamo',
        error: error.message,
      });
    }
  }

  // Rechazar préstamo
  async rechazar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      const { motivoRechazo } = req.body;

      const prestamo = await prisma.prestamo.findUnique({
        where: { id },
        include: { expediente: true },
      });

      if (!prestamo) {
        return res.status(404).json({
          success: false,
          message: 'Préstamo no encontrado',
        });
      }

      if (prestamo.estado !== 'PENDIENTE') {
        return res.status(400).json({
          success: false,
          message: 'El préstamo no está pendiente',
        });
      }

      const prestamoActualizado = await prisma.prestamo.update({
        where: { id },
        data: {
          estado: 'RECHAZADO',
          autorizadoPorId: userId,
          observaciones: motivoRechazo,
        },
        include: {
          expediente: true,
          usuario: {
            select: {
              id: true,
              username: true,
              nombre: true,
              apellidoPaterno: true,
            },
          },
          autorizadoPor: {
            select: {
              id: true,
              username: true,
              nombre: true,
              apellidoPaterno: true,
            },
          },
        },
      });

      await prisma.bitacora.create({
        data: {
          expedienteId: prestamo.expedienteId,
          usuarioId: userId,
          accion: 'PRESTAR',
          entidad: 'Prestamo',
          entidadId: id,
          descripcion: `Préstamo rechazado del expediente ${prestamo.expediente.numeroExpediente}`,
        },
      });

      return res.json({
        success: true,
        message: 'Préstamo rechazado',
        data: prestamoActualizado,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error al rechazar préstamo',
        error: error.message,
      });
    }
  }

  // Devolver préstamo
  async devolver(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { observaciones } = req.body;

      const prestamo = await prisma.prestamo.findUnique({
        where: { id },
        include: { expediente: true },
      });

      if (!prestamo) {
        return res.status(404).json({
          success: false,
          message: 'Préstamo no encontrado',
        });
      }

      if (prestamo.estado !== 'AUTORIZADO' && prestamo.estado !== 'PRESTADO') {
        return res.status(400).json({
          success: false,
          message: 'El préstamo no puede ser devuelto',
        });
      }

      // Verificar si está vencido
      const fechaActual = new Date();
      const estaVencido = fechaActual > prestamo.fechaDevolucionEsperada;

      const [prestamoActualizado] = await prisma.$transaction([
        prisma.prestamo.update({
          where: { id },
          data: {
            estado: 'DEVUELTO',
            fechaDevolucionReal: fechaActual,
            observaciones: observaciones || prestamo.observaciones,
          },
          include: {
            expediente: true,
            usuario: {
              select: {
                id: true,
                username: true,
                nombre: true,
                apellidoPaterno: true,
              },
            },
          },
        }),
        prisma.expediente.update({
          where: { id: prestamo.expedienteId },
          data: { estado: 'ACTIVO' },
        }),
        prisma.bitacora.create({
          data: {
            expedienteId: prestamo.expedienteId,
            usuarioId: prestamo.usuarioId,
            accion: 'DEVOLVER',
            entidad: 'Prestamo',
            entidadId: id,
            descripcion: `Devolución de expediente ${prestamo.expediente.numeroExpediente}${estaVencido ? ' (VENCIDO)' : ''}`,
          },
        }),
      ]);

      return res.json({
        success: true,
        message: estaVencido
          ? 'Préstamo devuelto (con retraso)'
          : 'Préstamo devuelto exitosamente',
        data: prestamoActualizado,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error al devolver préstamo',
        error: error.message,
      });
    }
  }

  // Obtener préstamos por expediente
  async obtenerPorExpediente(req: Request, res: Response) {
    try {
      const { expedienteId } = req.params;

      const prestamos = await prisma.prestamo.findMany({
        where: { expedienteId },
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
          autorizadoPor: {
            select: {
              id: true,
              username: true,
              nombre: true,
              apellidoPaterno: true,
            },
          },
        },
        orderBy: { fechaPrestamo: 'desc' },
      });

      res.json({
        success: true,
        data: prestamos,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener préstamos del expediente',
        error: error.message,
      });
    }
  }

  // Obtener estadísticas de préstamos
  async estadisticas(req: Request, res: Response) {
    try {
      const [
        totalPrestamos,
        pendientes,
        autorizados,
        prestados,
        devueltos,
        vencidos,
        rechazados,
      ] = await Promise.all([
        prisma.prestamo.count(),
        prisma.prestamo.count({ where: { estado: 'PENDIENTE' } }),
        prisma.prestamo.count({ where: { estado: 'AUTORIZADO' } }),
        prisma.prestamo.count({ where: { estado: 'PRESTADO' } }),
        prisma.prestamo.count({ where: { estado: 'DEVUELTO' } }),
        prisma.prestamo.count({ where: { estado: 'VENCIDO' } }),
        prisma.prestamo.count({ where: { estado: 'RECHAZADO' } }),
      ]);

      res.json({
        success: true,
        data: {
          total: totalPrestamos,
          pendientes,
          autorizados,
          prestados,
          devueltos,
          vencidos,
          rechazados,
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

export default new PrestamosController();
