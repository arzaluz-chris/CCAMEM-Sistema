import { Request, Response, NextFunction } from 'express';
import reportesService from '../services/reportes.service';
import { AppError } from '../middleware/errorHandler';

export class ReportesController {
  // Generar inventario general
  async generarInventarioGeneral(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('No autenticado', 401);
      }

      const filters = {
        unidadAdministrativaId: req.query.unidadId as string,
        seccionId: req.query.seccionId as string,
        estado: req.query.estado as any,
      };

      const buffer = await reportesService.generarInventarioExcel(
        filters,
        req.user.rol,
        req.user.unidadAdministrativaId
      );

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=inventario_general_${new Date().getTime()}.xlsx`
      );

      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  // Generar inventario por unidad
  async generarInventarioPorUnidad(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('No autenticado', 401);
      }

      const { unidadId } = req.params;

      if (!unidadId) {
        throw new AppError('El ID de unidad es requerido', 400);
      }

      const buffer = await reportesService.generarInventarioPorUnidad(
        unidadId,
        req.user.rol,
        req.user.unidadAdministrativaId
      );

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=inventario_unidad_${new Date().getTime()}.xlsx`
      );

      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  // Generar inventario UAA (interno)
  async generarInventarioUAA(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('No autenticado', 401);
      }

      const unidadId = (req.params.unidadId || req.query.unidadId) as string;

      const buffer = await reportesService.generarInventarioUAA(
        unidadId,
        req.user.rol,
        req.user.unidadAdministrativaId
      );

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=inventario_uaa_interno_${new Date().getTime()}.xlsx`
      );

      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  // Obtener estadísticas para el dashboard
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('No autenticado', 401);
      }

      const stats = await reportesService.obtenerEstadisticas(
        req.user.rol,
        req.user.unidadAdministrativaId
      );

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  // Generar reporte de estadísticas
  async generarEstadisticas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('No autenticado', 401);
      }

      const buffer = await reportesService.generarEstadisticasExcel(
        req.user.rol,
        req.user.unidadAdministrativaId
      );

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=estadisticas_${new Date().getTime()}.xlsx`
      );

      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  // Generar reporte de bitácora
  async generarBitacora(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('No autenticado', 401);
      }

      // Solo admins y coordinadores pueden generar bitácora
      if (req.user.rol !== 'ADMIN' && req.user.rol !== 'COORDINADOR_ARCHIVO') {
        throw new AppError('No tiene permisos para generar este reporte', 403);
      }

      const fechaInicio = req.query.fechaInicio
        ? new Date(req.query.fechaInicio as string)
        : undefined;
      const fechaFin = req.query.fechaFin ? new Date(req.query.fechaFin as string) : undefined;
      const userId = req.query.userId as string;

      const buffer = await reportesService.generarBitacoraExcel(fechaInicio, fechaFin, userId);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=bitacora_${new Date().getTime()}.xlsx`
      );

      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }
}

export default new ReportesController();
