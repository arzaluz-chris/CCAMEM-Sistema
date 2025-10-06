import ExcelJS from 'exceljs';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { Prisma } from '@prisma/client';

export class ReportesService {
  // Obtener estadísticas para el dashboard
  async obtenerEstadisticas(userRol?: string, userUnidadId?: string | null) {
    const where: any = {};

    if (userRol !== 'ADMIN' && userRol !== 'COORDINADOR_ARCHIVO' && userUnidadId) {
      where.unidadAdministrativaId = userUnidadId;
    }

    const [
      totalExpedientes,
      expedientesActivos,
      expedientesCerrados,
      expedientesTransferidos,
      expedientesPorEstado,
      expedientesPorUnidad,
      totalLegajos,
      totalFojas,
      prestamosPendientes,
      prestamosActivos,
    ] = await Promise.all([
      prisma.expediente.count({ where }),
      prisma.expediente.count({ where: { ...where, estado: 'ACTIVO' } }),
      prisma.expediente.count({ where: { ...where, estado: 'CERRADO' } }),
      prisma.expediente.count({ where: { ...where, estado: 'TRANSFERIDO' } }),
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
      prisma.expediente.aggregate({
        _sum: { totalLegajos: true },
        where,
      }),
      prisma.expediente.aggregate({
        _sum: { totalFojas: true },
        where,
      }),
      prisma.prestamo.count({
        where: {
          estado: 'PENDIENTE',
        },
      }),
      prisma.prestamo.count({
        where: {
          estado: 'PRESTADO',
        },
      }),
    ]);

    // Obtener nombres de unidades
    const unidadesIds = expedientesPorUnidad.map((u) => u.unidadAdministrativaId);
    const unidades = await prisma.unidadAdministrativa.findMany({
      where: { id: { in: unidadesIds } },
    });

    const expedientesPorUnidadConNombre = expedientesPorUnidad.map((item) => {
      const unidad = unidades.find((u) => u.id === item.unidadAdministrativaId);
      return {
        unidad: unidad?.nombre || 'Sin unidad',
        unidadClave: unidad?.clave || '',
        total: item._count,
      };
    });

    return {
      totalExpedientes,
      expedientesActivos,
      expedientesCerrados,
      expedientesTransferidos,
      totalLegajos: totalLegajos._sum.totalLegajos || 0,
      totalFojas: totalFojas._sum.totalFojas || 0,
      prestamosPendientes,
      prestamosActivos,
      expedientesPorEstado: expedientesPorEstado.map((item) => ({
        estado: item.estado,
        total: item._count,
      })),
      expedientesPorUnidad: expedientesPorUnidadConNombre,
      expedientesPorMes: [], // Por ahora vacío, se puede implementar después
    };
  }

  // Generar reporte de inventario general en Excel
  async generarInventarioExcel(
    filters: any = {},
    userRol?: string,
    userUnidadId?: string | null
  ): Promise<ExcelJS.Buffer> {
    const where: Prisma.ExpedienteWhereInput = {};

    // Aplicar filtros de permisos
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

    if (filters.estado) {
      where.estado = filters.estado;
    }

    // Obtener expedientes
    const expedientes = await prisma.expediente.findMany({
      where,
      orderBy: { numeroProgresivo: 'asc' },
      include: {
        unidadAdministrativa: true,
        seccion: true,
        serie: true,
        subserie: true,
        legajos: true,
      },
    });

    // Crear libro de Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inventario de Expedientes');

    // Configurar columnas
    worksheet.columns = [
      { header: 'No. Progresivo', key: 'numeroProgresivo', width: 15 },
      { header: 'No. Expediente', key: 'numeroExpediente', width: 20 },
      { header: 'Unidad', key: 'unidad', width: 15 },
      { header: 'Sección', key: 'seccion', width: 15 },
      { header: 'Serie', key: 'serie', width: 40 },
      { header: 'Subserie', key: 'subserie', width: 40 },
      { header: 'Fórmula Clasificadora', key: 'formula', width: 45 },
      { header: 'Nombre del Expediente', key: 'nombre', width: 50 },
      { header: 'Asunto', key: 'asunto', width: 60 },
      { header: 'Fecha Apertura', key: 'fechaApertura', width: 15 },
      { header: 'Fecha Cierre', key: 'fechaCierre', width: 15 },
      { header: 'Legajos', key: 'legajos', width: 10 },
      { header: 'Documentos', key: 'documentos', width: 12 },
      { header: 'Fojas', key: 'fojas', width: 10 },
      { header: 'Valor Administrativo', key: 'valorAdmin', width: 10 },
      { header: 'Valor Legal', key: 'valorLegal', width: 10 },
      { header: 'Valor Contable', key: 'valorContable', width: 10 },
      { header: 'Valor Fiscal', key: 'valorFiscal', width: 10 },
      { header: 'Clasificación', key: 'clasificacion', width: 15 },
      { header: 'Ubicación Física', key: 'ubicacion', width: 30 },
      { header: 'Estado', key: 'estado', width: 15 },
      { header: 'Observaciones', key: 'observaciones', width: 40 },
    ];

    // Estilo de encabezados
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0070C0' },
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Agregar datos
    expedientes.forEach((exp) => {
      worksheet.addRow({
        numeroProgresivo: exp.numeroProgresivo,
        numeroExpediente: exp.numeroExpediente,
        unidad: exp.unidadAdministrativa.clave,
        seccion: exp.seccion.clave,
        serie: exp.serie.nombre,
        subserie: exp.subserie?.nombre || '',
        formula: exp.formulaClasificadora,
        nombre: exp.nombreExpediente,
        asunto: exp.asunto,
        fechaApertura: exp.fechaApertura.toLocaleDateString('es-MX'),
        fechaCierre: exp.fechaCierre?.toLocaleDateString('es-MX') || '',
        legajos: exp.totalLegajos,
        documentos: exp.totalDocumentos,
        fojas: exp.totalFojas,
        valorAdmin: exp.valorAdministrativo ? 'Sí' : 'No',
        valorLegal: exp.valorLegal ? 'Sí' : 'No',
        valorContable: exp.valorContable ? 'Sí' : 'No',
        valorFiscal: exp.valorFiscal ? 'Sí' : 'No',
        clasificacion: exp.clasificacionInfo,
        ubicacion: exp.ubicacionFisica || '',
        estado: exp.estado,
        observaciones: exp.observaciones || '',
      });
    });

    // Agregar bordes a todas las celdas
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    // Agregar fila de totales
    const totalRow = worksheet.addRow({
      numeroProgresivo: '',
      numeroExpediente: '',
      unidad: '',
      seccion: '',
      serie: '',
      subserie: '',
      formula: '',
      nombre: '',
      asunto: '',
      fechaApertura: '',
      fechaCierre: 'TOTALES:',
      legajos: { formula: `SUM(L2:L${expedientes.length + 1})` },
      documentos: { formula: `SUM(M2:M${expedientes.length + 1})` },
      fojas: { formula: `SUM(N2:N${expedientes.length + 1})` },
    });

    totalRow.font = { bold: true };
    totalRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9E1F2' },
    };

    return await workbook.xlsx.writeBuffer() as ExcelJS.Buffer;
  }

  // Generar reporte de inventario por unidad
  async generarInventarioPorUnidad(
    unidadId: string,
    userRol?: string,
    userUnidadId?: string | null
  ): Promise<ExcelJS.Buffer> {
    // Verificar permisos
    if (
      userRol !== 'ADMIN' &&
      userRol !== 'COORDINADOR_ARCHIVO' &&
      unidadId !== userUnidadId
    ) {
      throw new AppError('No tiene permisos para generar este reporte', 403);
    }

    return this.generarInventarioExcel({ unidadAdministrativaId: unidadId }, userRol, userUnidadId);
  }

  // Generar reporte de estadísticas
  async generarEstadisticasExcel(
    userRol?: string,
    userUnidadId?: string | null
  ): Promise<ExcelJS.Buffer> {
    const where: any = {};

    if (userRol !== 'ADMIN' && userRol !== 'COORDINADOR_ARCHIVO' && userUnidadId) {
      where.unidadAdministrativaId = userUnidadId;
    }

    const [
      totalExpedientes,
      expedientesPorEstado,
      expedientesPorUnidad,
      expedientesPorSeccion,
      valoresDocumentales,
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
        _sum: {
          totalLegajos: true,
          totalFojas: true,
        },
        where,
      }),
      prisma.expediente.groupBy({
        by: ['seccionId'],
        _count: true,
        where,
      }),
      Promise.all([
        prisma.expediente.count({ where: { ...where, valorAdministrativo: true } }),
        prisma.expediente.count({ where: { ...where, valorLegal: true } }),
        prisma.expediente.count({ where: { ...where, valorContable: true } }),
        prisma.expediente.count({ where: { ...where, valorFiscal: true } }),
      ]),
    ]);

    // Crear libro de Excel
    const workbook = new ExcelJS.Workbook();

    // Hoja 1: Resumen General
    const resumenSheet = workbook.addWorksheet('Resumen General');
    resumenSheet.addRow(['ESTADÍSTICAS DEL SISTEMA DE GESTIÓN ARCHIVÍSTICA CCAMEM']);
    resumenSheet.addRow([]);
    resumenSheet.addRow(['Total de Expedientes:', totalExpedientes]);
    resumenSheet.addRow([]);
    resumenSheet.addRow(['VALORES DOCUMENTALES']);
    resumenSheet.addRow(['Con Valor Administrativo:', valoresDocumentales[0]]);
    resumenSheet.addRow(['Con Valor Legal:', valoresDocumentales[1]]);
    resumenSheet.addRow(['Con Valor Contable:', valoresDocumentales[2]]);
    resumenSheet.addRow(['Con Valor Fiscal:', valoresDocumentales[3]]);

    // Hoja 2: Por Estado
    const estadoSheet = workbook.addWorksheet('Por Estado');
    estadoSheet.columns = [
      { header: 'Estado', key: 'estado', width: 20 },
      { header: 'Total', key: 'total', width: 15 },
    ];
    estadoSheet.getRow(1).font = { bold: true };
    expedientesPorEstado.forEach((item) => {
      estadoSheet.addRow({
        estado: item.estado,
        total: item._count,
      });
    });

    // Hoja 3: Por Unidad
    const unidadSheet = workbook.addWorksheet('Por Unidad');
    unidadSheet.columns = [
      { header: 'Unidad', key: 'unidad', width: 40 },
      { header: 'Expedientes', key: 'expedientes', width: 15 },
      { header: 'Legajos', key: 'legajos', width: 15 },
      { header: 'Fojas', key: 'fojas', width: 15 },
    ];
    unidadSheet.getRow(1).font = { bold: true };

    const unidadesIds = expedientesPorUnidad.map((u) => u.unidadAdministrativaId);
    const unidades = await prisma.unidadAdministrativa.findMany({
      where: { id: { in: unidadesIds } },
    });

    expedientesPorUnidad.forEach((item) => {
      const unidad = unidades.find((u) => u.id === item.unidadAdministrativaId);
      unidadSheet.addRow({
        unidad: unidad?.nombre || 'Sin unidad',
        expedientes: item._count,
        legajos: item._sum.totalLegajos || 0,
        fojas: item._sum.totalFojas || 0,
      });
    });

    return await workbook.xlsx.writeBuffer() as ExcelJS.Buffer;
  }

  // Generar reporte de bitácora
  async generarBitacoraExcel(
    fechaInicio?: Date,
    fechaFin?: Date,
    userId?: string
  ): Promise<ExcelJS.Buffer> {
    const where: any = {};

    if (fechaInicio || fechaFin) {
      where.createdAt = {};
      if (fechaInicio) where.createdAt.gte = fechaInicio;
      if (fechaFin) where.createdAt.lte = fechaFin;
    }

    if (userId) {
      where.usuarioId = userId;
    }

    const bitacoras = await prisma.bitacora.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 1000, // Limitar a 1000 registros
      include: {
        usuario: {
          select: {
            username: true,
            nombre: true,
            apellidoPaterno: true,
          },
        },
        expediente: {
          select: {
            numeroExpediente: true,
            nombreExpediente: true,
          },
        },
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Bitácora de Auditoría');

    worksheet.columns = [
      { header: 'Fecha/Hora', key: 'fecha', width: 20 },
      { header: 'Usuario', key: 'usuario', width: 30 },
      { header: 'Acción', key: 'accion', width: 15 },
      { header: 'Entidad', key: 'entidad', width: 20 },
      { header: 'Expediente', key: 'expediente', width: 30 },
      { header: 'Descripción', key: 'descripcion', width: 60 },
      { header: 'IP', key: 'ip', width: 15 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0070C0' },
    };

    bitacoras.forEach((bit) => {
      worksheet.addRow({
        fecha: bit.createdAt.toLocaleString('es-MX'),
        usuario: `${bit.usuario.nombre} ${bit.usuario.apellidoPaterno}`,
        accion: bit.accion,
        entidad: bit.entidad,
        expediente: bit.expediente
          ? `${bit.expediente.numeroExpediente} - ${bit.expediente.nombreExpediente}`
          : '',
        descripcion: bit.descripcion,
        ip: bit.ipAddress || '',
      });
    });

    return await workbook.xlsx.writeBuffer() as ExcelJS.Buffer;
  }
}

export default new ReportesService();
