import { Request, Response, NextFunction } from 'express';
import expedientesService from '../services/expedientes.service';
import { AppError } from '../middleware/errorHandler';
import Joi from 'joi';

// Esquemas de validación
const createExpedienteSchema = Joi.object({
  numeroExpediente: Joi.string().required().messages({
    'string.empty': 'El número de expediente es requerido',
  }),
  unidadAdministrativaId: Joi.string().uuid().required().messages({
    'string.empty': 'La unidad administrativa es requerida',
    'string.guid': 'La unidad administrativa debe ser un UUID válido',
  }),
  seccionId: Joi.string().uuid().required().messages({
    'string.empty': 'La sección es requerida',
  }),
  serieId: Joi.string().uuid().required().messages({
    'string.empty': 'La serie es requerida',
  }),
  subserieId: Joi.string().uuid().allow(null, ''),
  nombreExpediente: Joi.string().required().messages({
    'string.empty': 'El nombre del expediente es requerido',
  }),
  asunto: Joi.string().required().messages({
    'string.empty': 'El asunto es requerido',
  }),
  totalLegajos: Joi.number().integer().min(1).default(1),
  totalDocumentos: Joi.number().integer().min(0).default(0),
  totalFojas: Joi.number().integer().min(0).default(0),
  fechaApertura: Joi.date().required().messages({
    'date.base': 'La fecha de apertura debe ser una fecha válida',
  }),
  fechaCierre: Joi.date().allow(null),
  valorAdministrativo: Joi.boolean().default(false),
  valorLegal: Joi.boolean().default(false),
  valorContable: Joi.boolean().default(false),
  valorFiscal: Joi.boolean().default(false),
  clasificacionInfo: Joi.string().valid('PUBLICA', 'RESERVADA', 'CONFIDENCIAL').default('PUBLICA'),
  ubicacionFisica: Joi.string().allow('', null),
  observaciones: Joi.string().allow('', null),
});

const updateExpedienteSchema = Joi.object({
  numeroExpediente: Joi.string(),
  nombreExpediente: Joi.string(),
  asunto: Joi.string(),
  totalLegajos: Joi.number().integer().min(1),
  totalDocumentos: Joi.number().integer().min(0),
  totalFojas: Joi.number().integer().min(0),
  fechaCierre: Joi.date().allow(null),
  valorAdministrativo: Joi.boolean(),
  valorLegal: Joi.boolean(),
  valorContable: Joi.boolean(),
  valorFiscal: Joi.boolean(),
  clasificacionInfo: Joi.string().valid('PUBLICA', 'RESERVADA', 'CONFIDENCIAL'),
  ubicacionFisica: Joi.string().allow('', null),
  estado: Joi.string().valid('ACTIVO', 'CERRADO', 'PRESTADO', 'TRANSFERIDO', 'BAJA'),
  observaciones: Joi.string().allow('', null),
});

export class ExpedientesController {
  // Crear expediente
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('No autenticado', 401);
      }

      const { error, value } = createExpedienteSchema.validate(req.body);
      if (error) {
        throw new AppError(error.details[0].message, 400);
      }

      const result = await expedientesService.create(value, req.user.id);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  // Obtener todos los expedientes
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('No autenticado', 401);
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const filters = {
        unidadAdministrativaId: req.query.unidadAdministrativaId as string,
        seccionId: req.query.seccionId as string,
        serieId: req.query.serieId as string,
        subserieId: req.query.subserieId as string,
        estado: req.query.estado as any,
        clasificacionInfo: req.query.clasificacionInfo as any,
        fechaAperturaDesde: req.query.fechaAperturaDesde
          ? new Date(req.query.fechaAperturaDesde as string)
          : undefined,
        fechaAperturaHasta: req.query.fechaAperturaHasta
          ? new Date(req.query.fechaAperturaHasta as string)
          : undefined,
        search: req.query.search as string,
      };

      const result = await expedientesService.findAll(
        page,
        limit,
        filters,
        req.user.rol,
        req.user.unidadAdministrativaId
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Obtener expediente por ID
  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('No autenticado', 401);
      }

      const { id } = req.params;

      const result = await expedientesService.findById(
        id,
        req.user.rol,
        req.user.unidadAdministrativaId
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Actualizar expediente
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('No autenticado', 401);
      }

      const { id } = req.params;

      const { error, value } = updateExpedienteSchema.validate(req.body);
      if (error) {
        throw new AppError(error.details[0].message, 400);
      }

      const result = await expedientesService.update(
        id,
        value,
        req.user.id,
        req.user.rol,
        req.user.unidadAdministrativaId
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Eliminar expediente
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('No autenticado', 401);
      }

      const { id } = req.params;

      const result = await expedientesService.delete(
        id,
        req.user.id,
        req.user.rol,
        req.user.unidadAdministrativaId
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Buscar expedientes
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('No autenticado', 401);
      }

      const query = req.query.q as string;

      if (!query) {
        throw new AppError('El parámetro de búsqueda "q" es requerido', 400);
      }

      const result = await expedientesService.search(
        query,
        req.user.rol,
        req.user.unidadAdministrativaId
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new ExpedientesController();
