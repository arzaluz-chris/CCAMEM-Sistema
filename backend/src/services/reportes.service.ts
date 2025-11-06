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

  // Generar INVENTARIO GENERAL (formato InventarioSRSQ.xlsx)
  async generarInventarioGeneral(
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
      },
    });

    // Obtener nombre de la unidad para el encabezado
    let nombreUnidad = 'Todas las Unidades';
    if (filters.unidadAdministrativaId) {
      const unidad = await prisma.unidadAdministrativa.findUnique({
        where: { id: filters.unidadAdministrativaId },
      });
      nombreUnidad = unidad?.nombre || nombreUnidad;
    }

    // Crear libro de Excel según formato InventarioSRSQ.xlsx
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Hoja1');

    // Fila 5: Título principal
    worksheet.mergeCells('B5:M5');
    const titleCell = worksheet.getCell('B5');
    titleCell.value = 'INVENTARIO GENERAL DE ARCHIVO';
    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Fila 10: Dependencia y fecha
    worksheet.getCell('B10').value = 'DEPENDENCIA U ORGANISMO: Comisión de Conciliación y Arbitraje Médico del Estado de México';
    worksheet.getCell('J10').value = 'FECHA DE ELABORACIÓN';

    const hoy = new Date();
    worksheet.getCell('K11').value = hoy.getDate();
    worksheet.getCell('L11').value = hoy.getMonth() + 1;
    worksheet.getCell('M11').value = hoy.getFullYear();

    // Fila 13: Unidad administrativa
    worksheet.getCell('B13').value = `UNIDAD ADMINISTRATIVA: ${nombreUnidad}`;
    worksheet.getCell('K13').value = 'DÍA';
    worksheet.getCell('L13').value = 'MES';
    worksheet.getCell('M13').value = 'AÑO';

    // Fila 17: Encabezados de tabla
    const headers = [
      { cell: 'B17', value: 'NO. PROGRESIVO' },
      { cell: 'C17', value: 'NO. DEL EXPEDIENTE' },
      { cell: 'D17', value: 'SECCIÓN Y/O SUBSECCIÓN' },
      { cell: 'E17', value: 'SERIE Y/O SUBSERIE DOCUMENTAL' },
      { cell: 'F17', value: 'FÓRMULA CLASIFICADORA' },
      { cell: 'G17', value: 'NOMBRE DEL EXPEDIENTE' },
      { cell: 'H17', value: 'TOTAL DE LEGAJOS' },
      { cell: 'I17', value: 'TOTAL DE DOCS' },
      { cell: 'J17', value: 'FECHA DE LOS DOCUMENTOS' },
      { cell: 'L17', value: 'UBICACIÓN FÍSICA DEL ARCHIVO DE TRÁMITE' },
      { cell: 'M17', value: 'OBSERVACIONES' },
    ];

    headers.forEach(({ cell, value }) => {
      const excelCell = worksheet.getCell(cell);
      excelCell.value = value;
      excelCell.font = { bold: true };
      excelCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      excelCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9E1F2' },
      };
      excelCell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // Fila 18: Sub-encabezados para fechas
    worksheet.getCell('J18').value = 'PRIMERO';
    worksheet.getCell('K18').value = 'ÚLTIMO';
    ['J18', 'K18'].forEach(cell => {
      const excelCell = worksheet.getCell(cell);
      excelCell.font = { bold: true };
      excelCell.alignment = { horizontal: 'center', vertical: 'middle' };
      excelCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9E1F2' },
      };
      excelCell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // Agregar datos (a partir de fila 19)
    let currentRow = 19;
    expedientes.forEach((exp) => {
      // Generar serie/subserie con formato especial
      let serieTexto = `${exp.serie.clave} ${exp.serie.nombre}`;
      if (exp.subserie) {
        serieTexto += ` / ${exp.subserie.clave} ${exp.subserie.nombre}`;
      }

      // Formatear fechas
      const fechaPrimero = exp.fechaApertura ?
        exp.fechaApertura.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '';
      const fechaUltimo = exp.fechaCierre ?
        exp.fechaCierre.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '';

      worksheet.getCell(`B${currentRow}`).value = exp.numeroProgresivo;
      worksheet.getCell(`C${currentRow}`).value = exp.numeroExpediente;
      worksheet.getCell(`D${currentRow}`).value = exp.seccion.clave;
      worksheet.getCell(`E${currentRow}`).value = serieTexto;
      worksheet.getCell(`F${currentRow}`).value = exp.formulaClasificadora;
      worksheet.getCell(`G${currentRow}`).value = exp.nombreExpediente;
      worksheet.getCell(`H${currentRow}`).value = exp.totalLegajos;
      worksheet.getCell(`I${currentRow}`).value = exp.totalDocumentos;
      worksheet.getCell(`J${currentRow}`).value = fechaPrimero;
      worksheet.getCell(`K${currentRow}`).value = fechaUltimo;
      worksheet.getCell(`L${currentRow}`).value = exp.ubicacionFisica || exp.unidadAdministrativa.clave;
      worksheet.getCell(`M${currentRow}`).value = exp.observaciones || 'NINGUNA';

      // Aplicar bordes a todas las celdas de datos
      ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'].forEach(col => {
        const cell = worksheet.getCell(`${col}${currentRow}`);
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        cell.alignment = { vertical: 'middle' };
      });

      currentRow++;
    });

    // Ajustar anchos de columna
    worksheet.getColumn('B').width = 15; // NO. PROGRESIVO
    worksheet.getColumn('C').width = 18; // NO. DEL EXPEDIENTE
    worksheet.getColumn('D').width = 12; // SECCIÓN
    worksheet.getColumn('E').width = 35; // SERIE
    worksheet.getColumn('F').width = 35; // FÓRMULA
    worksheet.getColumn('G').width = 35; // NOMBRE
    worksheet.getColumn('H').width = 12; // LEGAJOS
    worksheet.getColumn('I').width = 12; // DOCS
    worksheet.getColumn('J').width = 12; // FECHA PRIMERO
    worksheet.getColumn('K').width = 12; // FECHA ÚLTIMO
    worksheet.getColumn('L').width = 25; // UBICACIÓN
    worksheet.getColumn('M').width = 20; // OBSERVACIONES

    return await workbook.xlsx.writeBuffer() as ExcelJS.Buffer;
  }

  // Generar INVENTARIO UAA (formato UAA.xlsx - inventario interno)
  async generarInventarioUAA(
    unidadId?: string,
    userRol?: string,
    userUnidadId?: string | null
  ): Promise<ExcelJS.Buffer> {
    // Si no se especifica unidad, usar la del usuario (para UAA)
    const targetUnidadId = unidadId || userUnidadId;

    if (!targetUnidadId) {
      throw new AppError('Debe especificar una unidad administrativa', 400);
    }

    // Verificar permisos
    if (
      userRol !== 'ADMIN' &&
      userRol !== 'COORDINADOR_ARCHIVO' &&
      targetUnidadId !== userUnidadId
    ) {
      throw new AppError('No tiene permisos para generar este reporte', 403);
    }

    // Obtener expedientes de la unidad
    const expedientes = await prisma.expediente.findMany({
      where: { unidadAdministrativaId: targetUnidadId },
      orderBy: [
        { seccionId: 'asc' },
        { serieId: 'asc' },
        { numeroExpediente: 'asc' },
      ],
      include: {
        unidadAdministrativa: true,
        seccion: true,
        serie: true,
        subserie: true,
      },
    });

    // Crear libro de Excel según formato UAA.xlsx
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('2024'); // Nombre de hoja según año actual

    // Fila 2: Encabezados
    const headers = [
      { col: 'A', value: 'Sección' },
      { col: 'B', value: '  Serie' }, // Nota: tiene espacios para indentación
      { col: 'C', value: 'Subserie' },
      { col: 'D', value: 'Nombre' },
      { col: 'E', value: 'Total de Fojas ' }, // Nota: tiene espacio al final
      { col: 'F', value: 'Legajos' },
      { col: 'G', value: 'Fecha de inicio' },
      { col: 'H', value: 'Fecha de Cierre' },
      { col: 'I', value: 'No. De Caja' },
      { col: 'J', value: 'Prestado a /Fecha' },
      { col: 'K', value: 'Devolución' },
    ];

    headers.forEach(({ col, value }) => {
      const cell = worksheet.getCell(`${col}2`);
      cell.value = value;
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9E1F2' },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // Agrupar expedientes por sección
    const expedientesPorSeccion = expedientes.reduce((acc, exp) => {
      const seccionClave = exp.seccion.clave;
      if (!acc[seccionClave]) {
        acc[seccionClave] = {
          seccion: exp.seccion,
          expedientes: [],
        };
      }
      acc[seccionClave].expedientes.push(exp);
      return acc;
    }, {} as Record<string, any>);

    // Agregar datos agrupados por sección
    let currentRow = 3;

    Object.values(expedientesPorSeccion).forEach((grupo: any) => {
      // Fila de sección
      worksheet.getCell(`A${currentRow}`).value = grupo.seccion.clave;
      worksheet.getCell(`D${currentRow}`).value = grupo.seccion.nombre;

      // Estilo para fila de sección
      ['A', 'D'].forEach(col => {
        const cell = worksheet.getCell(`${col}${currentRow}`);
        cell.font = { bold: true };
      });

      currentRow++;

      // Expedientes de esta sección
      grupo.expedientes.forEach((exp: any) => {
        // Serie en columna B (con indentación)
        const serieClave = exp.serie.clave;
        worksheet.getCell(`B${currentRow}`).value = serieClave;

        // Subserie en columna C (si existe)
        if (exp.subserie) {
          worksheet.getCell(`C${currentRow}`).value = exp.subserie.clave;
        }

        // Nombre del expediente
        worksheet.getCell(`D${currentRow}`).value = exp.serie.nombre;

        // Total de fojas
        if (exp.totalFojas > 0) {
          worksheet.getCell(`E${currentRow}`).value = exp.totalFojas;
        }

        // Legajos
        if (exp.totalLegajos > 0) {
          worksheet.getCell(`F${currentRow}`).value = exp.totalLegajos;
        }

        // Fecha de inicio (apertura)
        if (exp.fechaApertura) {
          worksheet.getCell(`G${currentRow}`).value = exp.fechaApertura;
          worksheet.getCell(`G${currentRow}`).numFmt = 'yyyy-mm-dd hh:mm:ss';
        }

        // Fecha de cierre
        if (exp.fechaCierre) {
          worksheet.getCell(`H${currentRow}`).value = exp.fechaCierre;
          worksheet.getCell(`H${currentRow}`).numFmt = 'yyyy-mm-dd hh:mm:ss';
        }

        currentRow++;
      });
    });

    // Ajustar anchos de columna
    worksheet.getColumn('A').width = 10;  // Sección
    worksheet.getColumn('B').width = 12;  // Serie
    worksheet.getColumn('C').width = 12;  // Subserie
    worksheet.getColumn('D').width = 60;  // Nombre
    worksheet.getColumn('E').width = 15;  // Total de Fojas
    worksheet.getColumn('F').width = 10;  // Legajos
    worksheet.getColumn('G').width = 20;  // Fecha inicio
    worksheet.getColumn('H').width = 20;  // Fecha cierre
    worksheet.getColumn('I').width = 12;  // No. De Caja
    worksheet.getColumn('J').width = 20;  // Prestado a
    worksheet.getColumn('K').width = 15;  // Devolución

    return await workbook.xlsx.writeBuffer() as ExcelJS.Buffer;
  }

  // Método de compatibilidad (usa el inventario general)
  async generarInventarioExcel(
    filters: any = {},
    userRol?: string,
    userUnidadId?: string | null
  ): Promise<ExcelJS.Buffer> {
    return this.generarInventarioGeneral(filters, userRol, userUnidadId);
  }

  // Generar reporte de inventario por unidad (usa inventario general)
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

    return this.generarInventarioGeneral({ unidadAdministrativaId: unidadId }, userRol, userUnidadId);
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
