import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();
const excelFilePath = '/Users/christianarzaluz/Downloads/UAA.xlsx';
const SHEET_NAME = '2024';

// Usaremos arrays en lugar de objetos con claves
type ExcelRowUAA = string[];

async function main() {
  console.log('📊 Importando inventario UAA 2024...\n');

  try {
    // 1. Buscar la unidad UAA
    const unidadUAA = await prisma.unidadAdministrativa.findUnique({
      where: { clave: 'UAA' }
    });

    if (!unidadUAA) {
      throw new Error('No se encontró la unidad administrativa UAA');
    }

    console.log(`✓ Unidad UAA encontrada: ${unidadUAA.nombre}`);

    // 2. Buscar usuario admin
    const adminUser = await prisma.usuario.findFirst({
      where: { rol: 'ADMIN' }
    });

    if (!adminUser) {
      throw new Error('No se encontró usuario administrador');
    }

    console.log(`✓ Usuario admin encontrado: ${adminUser.username}\n`);

    // 3. Cargar catálogos
    const secciones = await prisma.seccion.findMany();
    const series = await prisma.serie.findMany({ include: { seccion: true } });
    const subseries = await prisma.subserie.findMany({ include: { serie: true } });

    console.log(`✓ Catálogos cargados:`);
    console.log(`   - ${secciones.length} secciones`);
    console.log(`   - ${series.length} series`);
    console.log(`   - ${subseries.length} subseries\n`);

    // 4. Obtener el último número progresivo
    const ultimoExpediente = await prisma.expediente.findFirst({
      orderBy: { numeroProgresivo: 'desc' }
    });

    let siguienteProgresivo = ultimoExpediente ? ultimoExpediente.numeroProgresivo + 1 : 1;
    console.log(`✓ Siguiente número progresivo: ${siguienteProgresivo}\n`);

    // 5. Leer el archivo Excel
    console.log('📁 Leyendo archivo Excel...');
    const workbook = XLSX.readFile(excelFilePath);

    if (!workbook.SheetNames.includes(SHEET_NAME)) {
      throw new Error(`No se encontró la hoja "${SHEET_NAME}"`);
    }

    const worksheet = workbook.Sheets[SHEET_NAME];

    // Leer todas las filas como arrays
    const allRows = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      raw: false
    }) as ExcelRowUAA[];

    // Buscar la fila de encabezados
    let headerRowIndex = 0;
    for (let i = 0; i < Math.min(allRows.length, 5); i++) {
      const row = allRows[i];
      const rowText = row.join('|').toUpperCase();
      if (rowText.includes('SECCIÓN') || rowText.includes('SERIE')) {
        headerRowIndex = i;
        console.log(`✓ Encabezados encontrados en fila ${i + 1}`);
        break;
      }
    }

    // Usar las filas después del encabezado
    const rawData = allRows.slice(headerRowIndex + 1);

    console.log(`📋 Total de filas en Excel: ${rawData.length}`);
    console.log(`📋 Primeras 5 filas para inspección:`);
    rawData.slice(0, 5).forEach((row, idx) => {
      console.log(`   Fila ${idx}: [${row[0]}] [${row[1]}] [${row[2]}] [${row[3]}]`);
    });

    // Filtrar registros válidos
    const data = rawData.filter((row) => {
      const nombre = String(row[3] || '').trim(); // Columna 3 = NOMBRE
      const esEncabezado = nombre.toLowerCase() === 'nombre';
      const esTitulo = nombre.includes('Programa Operativo') ||
                       nombre.includes('Información Estadistica');
      const tieneNombre = nombre !== '';
      const tieneSerie = String(row[1] || '').trim() !== ''; // Columna 1 = SERIE

      // Mantener si tiene nombre y no es encabezado y (tiene serie O es título de sección)
      return tieneNombre && !esEncabezado && (tieneSerie || esTitulo);
    });

    console.log(`✓ ${data.length} registros válidos encontrados\n`);

    // 6. Generar números de expediente únicos para UAA
    let contadorExpediente = 1;
    const expedientesExistentes = await prisma.expediente.findMany({
      where: { unidadAdministrativaId: unidadUAA.id },
      select: { numeroExpediente: true }
    });

    const numerosExistentes = new Set(expedientesExistentes.map(e => e.numeroExpediente));

    const generarNumeroExpediente = (): string => {
      let numero = String(contadorExpediente).padStart(4, '0');
      while (numerosExistentes.has(numero)) {
        contadorExpediente++;
        numero = String(contadorExpediente).padStart(4, '0');
      }
      contadorExpediente++;
      return numero;
    };

    // 7. Procesar e importar expedientes
    let importados = 0;
    let errores = 0;
    const erroresDetalle: Array<{ fila: number; error: string }> = [];
    let seccionActual: any = null;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const numeroFila = i + 3; // +3 porque saltamos 2 filas al inicio

      try {
        // Si la fila tiene sección, actualizar la sección actual
        const seccionClave = String(row[0] || '').trim(); // Columna 0 = SECCIÓN
        if (seccionClave !== '') {
          const seccion = secciones.find(s => s.clave === seccionClave);
          if (seccion) {
            seccionActual = seccion;
            console.log(`   📂 Procesando sección: ${seccionClave} - ${seccion.nombre}`);
          }
        }

        if (!seccionActual) {
          throw new Error('No se ha definido una sección');
        }

        // Extraer datos (usando índices de columnas)
        const serieClave = String(row[1] || '').trim();         // Columna 1 = SERIE
        const subserieClave = String(row[2] || '').trim();      // Columna 2 = SUBSERIE
        const nombreExpediente = String(row[3] || '').trim();   // Columna 3 = NOMBRE
        const totalFojas = parseInt(String(row[4] || '0'));     // Columna 4 = TOTAL DE FOJAS
        const totalLegajos = parseInt(String(row[5] || '1'));   // Columna 5 = LEGAJOS
        const fechaInicio = String(row[6] || '').trim();        // Columna 6 = FECHA DE INICIO
        const fechaCierre = String(row[7] || '').trim();        // Columna 7 = FECHA DE CIERRE
        const numeroCaja = String(row[8] || '').trim();         // Columna 8 = NO. DE CAJA
        const prestadoA = String(row[9] || '').trim();          // Columna 9 = PRESTADO A
        const devolucion = String(row[10] || '').trim();        // Columna 10 = DEVOLUCIÓN

        // Buscar serie
        let serie = series.find(s =>
          s.seccionId === seccionActual.id &&
          (s.clave === serieClave || s.nombre.includes(nombreExpediente.substring(0, 20)))
        );

        if (!serie) {
          // Usar la primera serie de esa sección
          serie = series.find(s => s.seccionId === seccionActual.id);
        }

        if (!serie) {
          throw new Error(`No se encontró serie para sección ${seccionActual.clave}`);
        }

        // Buscar subserie si existe
        let subserie = null;
        if (subserieClave !== '') {
          subserie = subseries.find(s =>
            s.serieId === serie!.id &&
            s.clave === subserieClave
          );
        }

        // Parsear fechas (formato M/D/YY)
        const parseFecha = (fechaStr: string): Date => {
          if (!fechaStr || fechaStr === '') {
            return new Date();
          }

          try {
            const partes = fechaStr.split('/');
            if (partes.length === 3) {
              let [mes, dia, anio] = partes.map(p => parseInt(p));
              if (anio < 100) {
                anio = anio < 50 ? 2000 + anio : 1900 + anio;
              }
              return new Date(anio, mes - 1, dia);
            }
          } catch (e) {
            // Si falla, usar fecha actual
          }

          return new Date();
        };

        const fechaApertura = parseFecha(fechaInicio);
        const fechaCierreDate = fechaCierre !== '' ? parseFecha(fechaCierre) : null;

        // Generar número de expediente
        const numeroExpediente = generarNumeroExpediente();

        // Generar fórmula clasificadora
        const formulaClasificadora = subserie
          ? `CCAMEM/${seccionActual.clave}/${serie.clave}/${subserie.clave}/${numeroExpediente}`
          : `CCAMEM/${seccionActual.clave}/${serie.clave}/${numeroExpediente}`;

        // Preparar ubicación física y observaciones
        const ubicacionFisica = numeroCaja !== '' ? `Caja ${numeroCaja}` : 'UAA';

        let observaciones = '';
        if (prestadoA !== '') {
          observaciones += `Prestado a: ${prestadoA}`;
        }
        if (devolucion !== '') {
          observaciones += observaciones !== '' ? ` | Devolución: ${devolucion}` : `Devolución: ${devolucion}`;
        }

        // Crear expediente
        await prisma.expediente.create({
          data: {
            numeroProgresivo: siguienteProgresivo++,
            numeroExpediente: numeroExpediente,
            unidadAdministrativaId: unidadUAA.id,
            seccionId: seccionActual.id,
            serieId: serie.id,
            subserieId: subserie?.id || null,
            formulaClasificadora: formulaClasificadora,
            nombreExpediente: nombreExpediente,
            asunto: null,
            totalLegajos: totalLegajos || 1,
            totalDocumentos: 0, // No está en el Excel de UAA
            totalFojas: totalFojas || 0,
            fechaApertura: fechaApertura,
            fechaCierre: fechaCierreDate,
            valorAdministrativo: true,
            valorLegal: false,
            valorContable: false,
            valorFiscal: false,
            clasificacionInfo: 'PUBLICA',
            ubicacionFisica: ubicacionFisica,
            estado: 'ACTIVO',
            observaciones: observaciones !== '' ? observaciones : null,
            createdById: adminUser.id,
            updatedById: adminUser.id
          }
        });

        importados++;

        if (importados % 20 === 0) {
          console.log(`   📝 ${importados} expedientes importados...`);
        }

      } catch (error: any) {
        errores++;
        erroresDetalle.push({
          fila: numeroFila,
          error: error.message
        });

        if (errores <= 10) {
          console.error(`   ❌ Error en fila ${numeroFila}: ${error.message}`);
        }
      }
    }

    // 8. Resumen
    console.log('\n' + '='.repeat(60));
    console.log('✅ Importación completada\n');
    console.log('📊 Resumen:');
    console.log(`   - Total de registros procesados: ${data.length}`);
    console.log(`   - Expedientes importados: ${importados}`);
    console.log(`   - Errores: ${errores}`);

    if (errores > 0 && errores <= 10) {
      console.log('\n❌ Detalles de errores:');
      erroresDetalle.forEach(({ fila, error }) => {
        console.log(`   Fila ${fila}: ${error}`);
      });
    } else if (errores > 10) {
      console.log(`\n⚠️  Demasiados errores (${errores}). Mostrando solo los primeros 10.`);
    }

    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
