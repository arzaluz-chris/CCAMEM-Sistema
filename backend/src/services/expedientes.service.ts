import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { Prisma, EstadoExpediente } from '@prisma/client';

export interface CreateExpedienteDto {
  numeroExpediente: string;
  unidadAdministrativaId: string;
  seccionId: string;
  serieId: string;
  subserieId?: string;
  nombreExpediente: string;
  asunto?: string;
  totalLegajos?: number;
  totalDocumentos?: number;
  totalFojas?: number;
  fechaApertura: Date;
  fechaCierre?: Date;
  valorAdministrativo?: boolean;
  valorLegal?: boolean;
  valorContable?: boolean;
  valorFiscal?: boolean;
  clasificacionInfo?: 'PUBLICA' | 'RESERVADA' | 'CONFIDENCIAL';
  fundamentoLegal?: string;
  ubicacionFisica?: string;
  observaciones?: string;
}

export interface UpdateExpedienteDto {
  numeroExpediente?: string;
  nombreExpediente?: string;
  asunto?: string;
  totalLegajos?: number;
  totalDocumentos?: number;
  totalFojas?: number;
  fechaCierre?: Date;
  valorAdministrativo?: boolean;
  valorLegal?: boolean;
  valorContable?: boolean;
  valorFiscal?: boolean;
  clasificacionInfo?: 'PUBLICA' | 'RESERVADA' | 'CONFIDENCIAL';
  fundamentoLegal?: string;
  ubicacionFisica?: string;
  estado?: EstadoExpediente;
  observaciones?: string;
}

export interface ExpedienteFilters {
  unidadAdministrativaId?: string;
  seccionId?: string;
  serieId?: string;
  subserieId?: string;
  estado?: EstadoExpediente;
  fechaAperturaDesde?: Date;
  fechaAperturaHasta?: Date;
  clasificacionInfo?: 'PUBLICA' | 'RESERVADA' | 'CONFIDENCIAL';
  search?: string;
}

export class ExpedientesService {
  // Generar fórmula clasificadora
  private async generateFormulaClasificadora(data: {
    unidadAdministrativaId: string;
    seccionId: string;
    serieId: string;
    subserieId?: string;
    numeroExpediente: string;
  }): Promise<string> {
    const unidad = await prisma.unidadAdministrativa.findUnique({
      where: { id: data.unidadAdministrativaId },
    });

    const seccion = await prisma.seccion.findUnique({
      where: { id: data.seccionId },
    });

    const serie = await prisma.serie.findUnique({
      where: { id: data.serieId },
    });

    let formula = `CCAMEM/${unidad?.clave}/${seccion?.clave}/${serie?.clave}`;

    if (data.subserieId) {
      const subserie = await prisma.subserie.findUnique({
        where: { id: data.subserieId },
      });
      formula += `/${subserie?.clave}`;
    }

    formula += `/${data.numeroExpediente}`;

    return formula;
  }

  // Crear expediente
  async create(data: CreateExpedienteDto, userId: string) {
    // Verificar que no exista expediente con el mismo número en la misma unidad
    const existingExpediente = await prisma.expediente.findUnique({
      where: {
        unidadAdministrativaId_numeroExpediente: {
          unidadAdministrativaId: data.unidadAdministrativaId,
          numeroExpediente: data.numeroExpediente,
        },
      },
    });

    if (existingExpediente) {
      throw new AppError(
        `Ya existe un expediente con el número ${data.numeroExpediente} en esta unidad administrativa`,
        400
      );
    }

    // Generar fórmula clasificadora
    const formulaClasificadora = await this.generateFormulaClasificadora({
      unidadAdministrativaId: data.unidadAdministrativaId,
      seccionId: data.seccionId,
      serieId: data.serieId,
      subserieId: data.subserieId,
      numeroExpediente: data.numeroExpediente,
    });

    // Crear expediente
    const expediente = await prisma.expediente.create({
      data: {
        ...data,
        formulaClasificadora,
        createdById: userId,
      },
      include: {
        unidadAdministrativa: true,
        seccion: true,
        serie: true,
        subserie: true,
        createdBy: {
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
        usuarioId: userId,
        expedienteId: expediente.id,
        accion: 'CREAR',
        entidad: 'Expediente',
        entidadId: expediente.id,
        descripcion: `Expediente ${expediente.numeroExpediente} creado`,
        datosNuevos: expediente as any,
      },
    });

    return {
      success: true,
      data: expediente,
    };
  }

  // Obtener todos los expedientes con paginación y filtros
  async findAll(
    page: number = 1,
    limit: number = 10,
    filters: ExpedienteFilters = {},
    userRol?: string,
    userUnidadId?: string | null
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.ExpedienteWhereInput = {};

    // Aplicar filtro por unidad si el usuario no es admin o coordinador
    if (userRol !== 'ADMIN' && userRol !== 'COORDINADOR_ARCHIVO' && userUnidadId) {
      where.unidadAdministrativaId = userUnidadId;
    }

    // Aplicar filtros adicionales
    if (filters.unidadAdministrativaId) {
      where.unidadAdministrativaId = filters.unidadAdministrativaId;
    }

    if (filters.seccionId) {
      where.seccionId = filters.seccionId;
    }

    if (filters.serieId) {
      where.serieId = filters.serieId;
    }

    if (filters.subserieId) {
      where.subserieId = filters.subserieId;
    }

    if (filters.estado) {
      where.estado = filters.estado;
    }

    if (filters.clasificacionInfo) {
      where.clasificacionInfo = filters.clasificacionInfo;
    }

    if (filters.fechaAperturaDesde || filters.fechaAperturaHasta) {
      where.fechaApertura = {};
      if (filters.fechaAperturaDesde) {
        where.fechaApertura.gte = filters.fechaAperturaDesde;
      }
      if (filters.fechaAperturaHasta) {
        where.fechaApertura.lte = filters.fechaAperturaHasta;
      }
    }

    if (filters.search) {
      where.OR = [
        { numeroExpediente: { contains: filters.search, mode: 'insensitive' } },
        { nombreExpediente: { contains: filters.search, mode: 'insensitive' } },
        { asunto: { contains: filters.search, mode: 'insensitive' } },
        { formulaClasificadora: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [expedientes, total] = await Promise.all([
      prisma.expediente.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          numeroProgresivo: 'desc',
        },
        include: {
          unidadAdministrativa: true,
          seccion: true,
          serie: true,
          subserie: true,
          createdBy: {
            select: {
              id: true,
              username: true,
              nombre: true,
              apellidoPaterno: true,
            },
          },
        },
      }),
      prisma.expediente.count({ where }),
    ]);

    return {
      success: true,
      data: {
        expedientes,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  // Obtener expediente por ID
  async findById(id: string, userRol?: string, userUnidadId?: string | null) {
    const expediente = await prisma.expediente.findUnique({
      where: { id },
      include: {
        unidadAdministrativa: true,
        seccion: true,
        serie: true,
        subserie: true,
        legajos: {
          orderBy: { numeroLegajo: 'asc' },
        },
        createdBy: {
          select: {
            id: true,
            username: true,
            nombre: true,
            apellidoPaterno: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            username: true,
            nombre: true,
            apellidoPaterno: true,
          },
        },
      },
    });

    if (!expediente) {
      throw new AppError('Expediente no encontrado', 404);
    }

    // Verificar permisos de acceso
    if (
      userRol !== 'ADMIN' &&
      userRol !== 'COORDINADOR_ARCHIVO' &&
      expediente.unidadAdministrativaId !== userUnidadId
    ) {
      throw new AppError('No tiene permisos para ver este expediente', 403);
    }

    return {
      success: true,
      data: expediente,
    };
  }

  // Actualizar expediente
  async update(
    id: string,
    data: UpdateExpedienteDto,
    userId: string,
    userRol?: string,
    userUnidadId?: string | null
  ) {
    const expediente = await prisma.expediente.findUnique({
      where: { id },
    });

    if (!expediente) {
      throw new AppError('Expediente no encontrado', 404);
    }

    // Verificar permisos
    if (
      userRol !== 'ADMIN' &&
      userRol !== 'COORDINADOR_ARCHIVO' &&
      expediente.unidadAdministrativaId !== userUnidadId
    ) {
      throw new AppError('No tiene permisos para modificar este expediente', 403);
    }

    const expedienteActualizado = await prisma.expediente.update({
      where: { id },
      data: {
        ...data,
        updatedById: userId,
      },
      include: {
        unidadAdministrativa: true,
        seccion: true,
        serie: true,
        subserie: true,
      },
    });

    // Registrar en bitácora
    await prisma.bitacora.create({
      data: {
        usuarioId: userId,
        expedienteId: id,
        accion: 'ACTUALIZAR',
        entidad: 'Expediente',
        entidadId: id,
        descripcion: `Expediente ${expediente.numeroExpediente} actualizado`,
        datosPrevios: expediente as any,
        datosNuevos: expedienteActualizado as any,
      },
    });

    return {
      success: true,
      data: expedienteActualizado,
    };
  }

  // Eliminar expediente (soft delete)
  async delete(id: string, userId: string, userRol?: string, userUnidadId?: string | null) {
    const expediente = await prisma.expediente.findUnique({
      where: { id },
    });

    if (!expediente) {
      throw new AppError('Expediente no encontrado', 404);
    }

    // Solo admins pueden eliminar
    if (userRol !== 'ADMIN') {
      throw new AppError('No tiene permisos para eliminar expedientes', 403);
    }

    const expedienteEliminado = await prisma.expediente.update({
      where: { id },
      data: {
        estado: 'BAJA',
        updatedById: userId,
      },
    });

    // Registrar en bitácora
    await prisma.bitacora.create({
      data: {
        usuarioId: userId,
        expedienteId: id,
        accion: 'ELIMINAR',
        entidad: 'Expediente',
        entidadId: id,
        descripcion: `Expediente ${expediente.numeroExpediente} dado de baja`,
        datosPrevios: expediente as any,
      },
    });

    return {
      success: true,
      message: 'Expediente dado de baja exitosamente',
      data: expedienteEliminado,
    };
  }

  // Buscar expedientes
  async search(query: string, userRol?: string, userUnidadId?: string | null) {
    const where: Prisma.ExpedienteWhereInput = {
      OR: [
        { numeroExpediente: { contains: query, mode: 'insensitive' } },
        { nombreExpediente: { contains: query, mode: 'insensitive' } },
        { asunto: { contains: query, mode: 'insensitive' } },
        { formulaClasificadora: { contains: query, mode: 'insensitive' } },
      ],
    };

    // Aplicar filtro por unidad si corresponde
    if (userRol !== 'ADMIN' && userRol !== 'COORDINADOR_ARCHIVO' && userUnidadId) {
      where.unidadAdministrativaId = userUnidadId;
    }

    const expedientes = await prisma.expediente.findMany({
      where,
      take: 20,
      include: {
        unidadAdministrativa: true,
        seccion: true,
        serie: true,
        subserie: true,
      },
      orderBy: {
        numeroProgresivo: 'desc',
      },
    });

    return {
      success: true,
      data: expedientes,
    };
  }
}

export default new ExpedientesService();
