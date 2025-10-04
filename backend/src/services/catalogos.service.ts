import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class CatalogosService {
  // Obtener todas las unidades administrativas
  async getUnidadesAdministrativas() {
    const unidades = await prisma.unidadAdministrativa.findMany({
      where: { activo: true },
      orderBy: { clave: 'asc' },
    });

    return {
      success: true,
      data: unidades,
    };
  }

  // Obtener todas las secciones
  async getSecciones() {
    const secciones = await prisma.seccion.findMany({
      where: { activo: true },
      orderBy: { clave: 'asc' },
      include: {
        _count: {
          select: { series: true },
        },
      },
    });

    return {
      success: true,
      data: secciones,
    };
  }

  // Obtener series por sección
  async getSeriesBySeccion(seccionId: string) {
    const series = await prisma.serie.findMany({
      where: {
        seccionId,
        activo: true,
      },
      orderBy: { clave: 'asc' },
      include: {
        seccion: true,
        _count: {
          select: { subseries: true },
        },
      },
    });

    return {
      success: true,
      data: series,
    };
  }

  // Obtener subseries por serie
  async getSubseriesBySerie(serieId: string) {
    const subseries = await prisma.subserie.findMany({
      where: {
        serieId,
        activo: true,
      },
      orderBy: { clave: 'asc' },
      include: {
        serie: {
          include: {
            seccion: true,
          },
        },
      },
    });

    return {
      success: true,
      data: subseries,
    };
  }

  // Obtener toda la estructura jerárquica
  async getEstructuraCompleta() {
    const secciones = await prisma.seccion.findMany({
      where: { activo: true },
      orderBy: { clave: 'asc' },
      include: {
        series: {
          where: { activo: true },
          orderBy: { clave: 'asc' },
          include: {
            subseries: {
              where: { activo: true },
              orderBy: { clave: 'asc' },
            },
          },
        },
      },
    });

    return {
      success: true,
      data: secciones,
    };
  }

  // Obtener estadísticas generales
  async getEstadisticas(userRol?: string, userUnidadId?: string | null) {
    const where: any = {};

    // Filtrar por unidad si no es admin o coordinador
    if (userRol !== 'ADMIN' && userRol !== 'COORDINADOR_ARCHIVO' && userUnidadId) {
      where.unidadAdministrativaId = userUnidadId;
    }

    const [
      totalExpedientes,
      expedientesPorEstado,
      expedientesPorUnidad,
      expedientesPorClasificacion,
      totalLegajos,
      totalFojas,
    ] = await Promise.all([
      prisma.expediente.count({ where }),
      prisma.expediente.groupBy({
        by: ['estado'],
        _count: true,
        where,
      }),
      prisma.expediente.groupBy({
        by: ['unidadAdministrativaId'],
        _count: true,
        where,
      }),
      prisma.expediente.groupBy({
        by: ['clasificacionInfo'],
        _count: true,
        where,
      }),
      prisma.expediente.aggregate({
        _sum: { totalLegajos: true },
        where,
      }),
      prisma.expediente.aggregate({
        _sum: { totalFojas: true },
        where,
      }),
    ]);

    // Obtener nombres de unidades
    const unidadesIds = expedientesPorUnidad.map((u) => u.unidadAdministrativaId);
    const unidades = await prisma.unidadAdministrativa.findMany({
      where: { id: { in: unidadesIds } },
      select: { id: true, clave: true, nombre: true },
    });

    const expedientesPorUnidadConNombres = expedientesPorUnidad.map((item) => {
      const unidad = unidades.find((u) => u.id === item.unidadAdministrativaId);
      return {
        unidad: unidad?.nombre || 'Sin unidad',
        clave: unidad?.clave || '',
        total: item._count,
      };
    });

    return {
      success: true,
      data: {
        totalExpedientes,
        totalLegajos: totalLegajos._sum.totalLegajos || 0,
        totalFojas: totalFojas._sum.totalFojas || 0,
        porEstado: expedientesPorEstado.map((item) => ({
          estado: item.estado,
          total: item._count,
        })),
        porUnidad: expedientesPorUnidadConNombres,
        porClasificacion: expedientesPorClasificacion.map((item) => ({
          clasificacion: item.clasificacionInfo,
          total: item._count,
        })),
      },
    };
  }

  // Obtener valores documentales (para filtros)
  async getValoresDocumentales() {
    return {
      success: true,
      data: [
        { value: 'valorAdministrativo', label: 'Administrativo' },
        { value: 'valorLegal', label: 'Legal' },
        { value: 'valorContable', label: 'Contable' },
        { value: 'valorFiscal', label: 'Fiscal' },
      ],
    };
  }

  // Obtener estados de expedientes
  async getEstadosExpediente() {
    return {
      success: true,
      data: [
        { value: 'ACTIVO', label: 'Activo' },
        { value: 'CERRADO', label: 'Cerrado' },
        { value: 'PRESTADO', label: 'Prestado' },
        { value: 'TRANSFERIDO', label: 'Transferido' },
        { value: 'BAJA', label: 'Baja' },
      ],
    };
  }

  // Obtener clasificaciones de información
  async getClasificacionesInfo() {
    return {
      success: true,
      data: [
        { value: 'PUBLICA', label: 'Pública' },
        { value: 'RESERVADA', label: 'Reservada' },
        { value: 'CONFIDENCIAL', label: 'Confidencial' },
      ],
    };
  }
}

export default new CatalogosService();
