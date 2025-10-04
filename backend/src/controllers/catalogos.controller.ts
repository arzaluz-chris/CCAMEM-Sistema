import { Request, Response, NextFunction } from 'express';
import catalogosService from '../services/catalogos.service';
import { AppError } from '../middleware/errorHandler';

export class CatalogosController {
  // Obtener unidades administrativas
  async getUnidadesAdministrativas(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await catalogosService.getUnidadesAdministrativas();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Obtener secciones
  async getSecciones(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await catalogosService.getSecciones();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Obtener series por sección
  async getSeriesBySeccion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { seccionId } = req.params;
      const result = await catalogosService.getSeriesBySeccion(seccionId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Obtener subseries por serie
  async getSubseriesBySerie(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { serieId } = req.params;
      const result = await catalogosService.getSubseriesBySerie(serieId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Obtener estructura completa
  async getEstructuraCompleta(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await catalogosService.getEstructuraCompleta();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Obtener estadísticas
  async getEstadisticas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('No autenticado', 401);
      }

      const result = await catalogosService.getEstadisticas(
        req.user.rol,
        req.user.unidadAdministrativaId
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Obtener valores documentales
  async getValoresDocumentales(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await catalogosService.getValoresDocumentales();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Obtener estados de expediente
  async getEstadosExpediente(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await catalogosService.getEstadosExpediente();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Obtener clasificaciones de información
  async getClasificacionesInfo(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await catalogosService.getClasificacionesInfo();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new CatalogosController();
