import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();
const excelFilePath = '/Users/christianarzaluz/Downloads/InventarioSRSQ.xlsx';

interface ExcelRow {
  'NO. PROGRESIVO': string | number;
  'NO. DEL EXPEDIENTE': string | number;
  'SECCIÓN Y/O SUBSECCIÓN': string;
  'SERIE Y/O SUBSERIE DOCUMENTAL': string;
  'FÓRMULA CLASIFICADORA': string;
  'NOMBRE DEL EXPEDIENTE': string;
  'TOTAL DE LEGAJOS': string | number;
  'TOTAL DE DOCS': string | number;
  'FECHA DE LOS DOCUMENTOS': string;
  '__EMPTY_1': string; // Fecha fin
  'UBICACIÓN FÍSICA DEL ARCHIVO DE TRÁMITE': string;
  'OBSERVACIONES': string;
}

async function main() {
  console.log('📊 Importando inventario SRSQ...\n');

  try {
    // 1. Buscar la unidad SRSQ
    const unidadSRSQ = await prisma.unidadAdministrativa.findUnique({
      where: { clave: 'SRSQ' }
    });

    if (!unidadSRSQ) {
      throw new Error('No se encontró la unidad administrativa SRSQ');
    }

    console.log(`✓ Unidad SRSQ encontrada: ${unidadSRSQ.nombre}`);

    // 2. Buscar usuario admin para asignar como creador
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

    // 4. Leer el archivo Excel
    console.log('📁 Leyendo archivo Excel...');
    const workbook = XLSX.readFile(excelFilePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    // Buscar fila de encabezados
    const allData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    let headerRowIndex = -1;
    for (let i = 0; i < 20; i++) {
      const row = allData[i];
      const rowText = row.join('|').toUpperCase();
      if (rowText.includes('PROGRESIVO')) {
        headerRowIndex = i;
        break;
      }
    }

    const rawData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet, {
      range: headerRowIndex,
      defval: '',
      raw: false
    });

    // Filtrar registros válidos (que tengan número de expediente)
    const data = rawData.filter(row =>
      row['NO. DEL EXPEDIENTE'] &&
      String(row['NO. DEL EXPEDIENTE']).trim() !== '' &&
      row['NO. PROGRESIVO'] &&
      String(row['NO. PROGRESIVO']).trim() !== ''
    );

    console.log(`✓ ${data.length} registros válidos encontrados\n`);

    // 5. Procesar e importar expedientes
    let importados = 0;
    let errores = 0;
    const erroresDetalle: Array<{ fila: number; error: string }> = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const numeroFila = i + 2 + headerRowIndex;

      try {
        // Parsear datos
        const numeroProgresivo = parseInt(String(row['NO. PROGRESIVO']));
        const numeroExpediente = String(row['NO. DEL EXPEDIENTE']).padStart(4, '0');
        const seccionClave = String(row['SECCIÓN Y/O SUBSECCIÓN']).trim();
        const serieTexto = String(row['SERIE Y/O SUBSERIE DOCUMENTAL']).trim();
        const nombreExpediente = String(row['NOMBRE DEL EXPEDIENTE']).trim();
        const totalLegajos = parseInt(String(row['TOTAL DE LEGAJOS'] || 1));
        const totalDocumentos = parseInt(String(row['TOTAL DE DOCS'] || 0));
        const fechaInicio = String(row['FECHA DE LOS DOCUMENTOS']).trim();
        const fechaFin = String(row['__EMPTY_1']).trim();
        const ubicacion = String(row['UBICACIÓN FÍSICA DEL ARCHIVO DE TRÁMITE']).trim();
        const observaciones = String(row['OBSERVACIONES'] || '').trim();

        // Buscar sección
        const seccion = secciones.find(s => s.clave === seccionClave);
        if (!seccion) {
          throw new Error(`Sección ${seccionClave} no encontrada`);
        }

        // Buscar serie (extraer el código de la serie del texto)
        const serieCodigoMatch = serieTexto.match(/^([\d\w.]+)/);
        const serieCodigo = serieCodigoMatch ? serieCodigoMatch[1] : null;

        let serie = series.find(s =>
          s.seccionId === seccion.id &&
          (serieTexto.includes(s.nombre) || (serieCodigo && serieTexto.startsWith(serieCodigo)))
        );

        // Si no se encuentra, usar la primera serie de esa sección
        if (!serie) {
          serie = series.find(s => s.seccionId === seccion.id);
        }

        if (!serie) {
          throw new Error(`No se encontró serie para: ${serieTexto}`);
        }

        // Parsear fechas (formato M/D/YY)
        const parseFecha = (fechaStr: string): Date => {
          if (!fechaStr || fechaStr === '' || fechaStr.toUpperCase() === 'NINGUNA') {
            return new Date();
          }

          const partes = fechaStr.split('/');
          if (partes.length === 3) {
            let [mes, dia, anio] = partes.map(p => parseInt(p));
            // Convertir año de 2 dígitos a 4 dígitos
            if (anio < 100) {
              anio = anio < 50 ? 2000 + anio : 1900 + anio;
            }
            return new Date(anio, mes - 1, dia);
          }

          return new Date();
        };

        const fechaApertura = parseFecha(fechaInicio);
        const fechaCierre = fechaFin && fechaFin !== '' ? parseFecha(fechaFin) : null;

        // Generar fórmula clasificadora
        const formulaClasificadora = row['FÓRMULA CLASIFICADORA'] ||
          `CCAMEM/${seccion.clave}/${serie.clave}/${numeroExpediente}`;

        // Verificar si ya existe
        const existente = await prisma.expediente.findFirst({
          where: {
            unidadAdministrativaId: unidadSRSQ.id,
            numeroExpediente: numeroExpediente
          }
        });

        if (existente) {
          console.log(`   ⚠️  Expediente ${numeroExpediente} ya existe, omitiendo...`);
          continue;
        }

        // Crear expediente
        await prisma.expediente.create({
          data: {
            numeroProgresivo: numeroProgresivo,
            numeroExpediente: numeroExpediente,
            unidadAdministrativaId: unidadSRSQ.id,
            seccionId: seccion.id,
            serieId: serie.id,
            subserieId: null, // Opcional por ahora
            formulaClasificadora: formulaClasificadora,
            nombreExpediente: nombreExpediente,
            asunto: observaciones !== 'NINGUNA' ? observaciones : null,
            totalLegajos: totalLegajos || 1,
            totalDocumentos: totalDocumentos || 0,
            totalFojas: 0, // No está en el Excel
            fechaApertura: fechaApertura,
            fechaCierre: fechaCierre,
            valorAdministrativo: true, // Por defecto
            valorLegal: false,
            valorContable: false,
            valorFiscal: false,
            clasificacionInfo: 'PUBLICA',
            ubicacionFisica: ubicacion,
            estado: 'ACTIVO',
            observaciones: observaciones !== 'NINGUNA' ? observaciones : null,
            createdById: adminUser.id,
            updatedById: adminUser.id
          }
        });

        importados++;

        if (importados % 100 === 0) {
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

    // 6. Resumen
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
