# Data Migration Guide - Importación desde Excel

## 📊 Migración de Datos Existentes

### PROMPT 1: CREAR SCRIPT DE IMPORTACIÓN DESDE EXCEL

```
Crea un script completo para importar los inventarios existentes desde Excel:

backend/src/scripts/import-excel.ts:
```typescript
import { PrismaClient } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';
import { parse } from 'date-fns';
import chalk from 'chalk';
import ora from 'ora';

const prisma = new PrismaClient();

interface ExpedienteExcel {
  numeroProgresivo: number;
  numeroExpediente: string;
  seccion: string;
  serie: string;
  subserie?: string;
  formulaClasificadora: string;
  nombreExpediente: string;
  totalLegajos: number;
  totalDocumentos: number;
  fechaApertura: Date;
  fechaCierre?: Date;
  unidad?: string;
  ubicacionFisica?: string;
  numeroCaja?: string;
}

class ExcelImporter {
  private errors: string[] = [];
  private warnings: string[] = [];
  private imported = 0;
  private skipped = 0;

  async importFromExcel(filePath: string, unidadCodigo: string) {
    const spinner = ora('Iniciando importación...').start();
    
    try {
      // Verificar que el archivo existe
      if (!fs.existsSync(filePath)) {
        throw new Error(`El archivo ${filePath} no existe`);
      }

      // Obtener la unidad administrativa
      const unidad = await prisma.unidadAdministrativa.findUnique({
        where: { codigo: unidadCodigo }
      });

      if (!unidad) {
        throw new Error(`La unidad ${unidadCodigo} no existe en la base de datos`);
      }

      spinner.text = 'Leyendo archivo Excel...';
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      
      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        throw new Error('No se encontró ninguna hoja en el archivo Excel');
      }

      spinner.text = 'Analizando estructura del archivo...';
      const expedientes = await this.parseWorksheet(worksheet, unidad.id);
      
      spinner.text = `Importando ${expedientes.length} expedientes...`;
      
      // Importar en lotes para mejor rendimiento
      const batchSize = 50;
      for (let i = 0; i < expedientes.length; i += batchSize) {
        const batch = expedientes.slice(i, i + batchSize);
        await this.importBatch(batch, unidad.id);
        
        spinner.text = `Importados ${Math.min(i + batchSize, expedientes.length)} de ${expedientes.length} expedientes...`;
      }

      spinner.succeed(chalk.green(`✓ Importación completada: ${this.imported} expedientes importados`));
      
      // Mostrar resumen
      this.showSummary();
      
    } catch (error) {
      spinner.fail(chalk.red('✗ Error en la importación'));
      console.error(error);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }

  private async parseWorksheet(worksheet: ExcelJS.Worksheet, unidadId: number): Promise<any[]> {
    const expedientes = [];
    let headerRow = 0;
    
    // Buscar la fila de encabezados
    worksheet.eachRow((row, rowNumber) => {
      const values = row.values as any[];
      if (values.some(v => v?.toString().includes('NO. EXPEDIENTE'))) {
        headerRow = rowNumber;
        return false;
      }
    });

    if (headerRow === 0) {
      throw new Error('No se encontraron los encabezados esperados en el Excel');
    }

    // Mapeo de columnas basado en los archivos de ejemplo
    const columnMap = this.detectColumns(worksheet.getRow(headerRow));
    
    // Procesar cada fila de datos
    for (let rowNumber = headerRow + 1; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      
      // Saltar filas vacías
      if (!row.values || (row.values as any[]).every(v => !v)) continue;
      
      try {
        const expediente = await this.parseRow(row, columnMap, unidadId);
        if (expediente) {
          expedientes.push(expediente);
        }
      } catch (error) {
        this.warnings.push(`Fila ${rowNumber}: ${error.message}`);
      }
    }

    return expedientes;
  }

  private detectColumns(headerRow: ExcelJS.Row): Map<string, number> {
    const columnMap = new Map<string, number>();
    const values = headerRow.values as any[];
    
    const mappings = {
      'numeroProgresivo': ['NO. PROGRESIVO', 'NO.', 'PROGRESIVO'],
      'numeroExpediente': ['NO. DEL EXPEDIENTE', 'NO. EXPEDIENTE', 'EXPEDIENTE'],
      'seccion': ['SECCIÓN', 'SECCION', 'SECCIÓN Y/O SUBSECCIÓN'],
      'serie': ['SERIE', 'SERIE Y/O SUBSERIE', 'SERIE DOCUMENTAL'],
      'subserie': ['SUBSERIE', 'SUBSERIE DOCUMENTAL'],
      'formulaClasificadora': ['FÓRMULA CLASIFICADORA', 'FORMULA', 'CLASIFICACION'],
      'nombreExpediente': ['NOMBRE DEL EXPEDIENTE', 'NOMBRE', 'DESCRIPCION'],
      'totalLegajos': ['TOTAL DE LEGAJOS', 'LEGAJOS', 'TOTAL LEGAJOS'],
      'totalDocumentos': ['TOTAL DE DOCS', 'TOTAL DOCUMENTOS', 'DOCUMENTOS'],
      'fechaApertura': ['FECHA DE LOS DOCUMENTOS', 'FECHA APERTURA', 'FECHA INICIO', 'PRIMERO'],
      'fechaCierre': ['FECHA CIERRE', 'FECHA FIN', 'ULTIMO'],
      'ubicacionFisica': ['UBICACIÓN', 'UBICACION', 'UBICACIÓN FÍSICA'],
      'numeroCaja': ['NO. DE CAJA', 'CAJA', 'NUMERO CAJA']
    };

    values.forEach((value, index) => {
      if (!value) return;
      const header = value.toString().toUpperCase().trim();
      
      for (const [field, patterns] of Object.entries(mappings)) {
        if (patterns.some(pattern => header.includes(pattern))) {
          columnMap.set(field, index);
          break;
        }
      }
    });

    return columnMap;
  }

  private async parseRow(row: ExcelJS.Row, columnMap: Map<string, number>, unidadId: number): Promise<any> {
    const getValue = (field: string): any => {
      const colIndex = columnMap.get(field);
      if (!colIndex) return null;
      const value = (row.values as any[])[colIndex];
      return value?.toString().trim() || null;
    };

    const numeroExpediente = getValue('numeroExpediente');
    if (!numeroExpediente) {
      return null; // Saltar filas sin número de expediente
    }

    // Parsear sección y serie
    const seccionCodigo = this.extractSeccionCodigo(getValue('seccion'));
    const serieCodigo = this.extractSerieCodigo(getValue('serie'));
    
    // Buscar o crear sección
    let seccion = await prisma.seccion.findFirst({
      where: { codigo: seccionCodigo }
    });

    if (!seccion) {
      // Crear sección genérica si no existe
      seccion = await prisma.seccion.create({
        data: {
          codigo: seccionCodigo,
          nombre: `Sección ${seccionCodigo}`,
          tipo: seccionCodigo.endsWith('S') ? 'sustantiva' : 'comun',
          activa: true
        }
      });
    }

    // Buscar o crear serie
    let serie = await prisma.serie.findFirst({
      where: { 
        codigo: serieCodigo,
        seccionId: seccion.id
      }
    });

    if (!serie) {
      serie = await prisma.serie.create({
        data: {
          codigo: serieCodigo,
          nombre: `Serie ${serieCodigo}`,
          seccionId: seccion.id,
          activa: true
        }
      });
    }

    // Parsear fechas
    const fechaApertura = this.parseDate(getValue('fechaApertura'));
    const fechaCierre = getValue('fechaCierre') ? this.parseDate(getValue('fechaCierre')) : null;

    return {
      numeroProgresivo: parseInt(getValue('numeroProgresivo')) || null,
      numeroExpediente,
      nombreExpediente: getValue('nombreExpediente') || 'Sin nombre',
      unidadId,
      seccionId: seccion.id,
      serieId: serie.id,
      subserieId: null, // TODO: Manejar subseries
      formulaClasificadora: getValue('formulaClasificadora') || this.generarFormula(seccionCodigo, serieCodigo, numeroExpediente),
      totalLegajos: parseInt(getValue('totalLegajos')) || 1,
      totalDocumentos: parseInt(getValue('totalDocumentos')) || 0,
      totalFojas: parseInt(getValue('totalDocumentos')) || 0,
      fechaApertura,
      fechaCierre,
      fechaPrimerDocumento: fechaApertura,
      fechaUltimoDocumento: fechaCierre || fechaApertura,
      estado: 'TRAMITE',
      ubicacionFisica: getValue('ubicacionFisica'),
      numeroCaja: getValue('numeroCaja'),
      valorAdministrativo: true,
      clasificacionInformacion: 'PUBLICA',
      createdBy: 1, // Usuario sistema
      updatedBy: 1
    };
  }

  private extractSeccionCodigo(value: string): string {
    if (!value) return '1S';
    
    // Buscar patrones como "1S", "2S", "1C", etc.
    const match = value.match(/(\d+[SC])/);
    if (match) return match[1];
    
    // Si solo es un número, asumir que es sección sustantiva
    const numMatch = value.match(/^(\d+)/);
    if (numMatch) return `${numMatch[1]}S`;
    
    return '1S'; // Default
  }

  private extractSerieCodigo(value: string): string {
    if (!value) return '1';
    
    // Buscar patrones como "1S.3.2"
    const match = value.match(/(\d+[SC])?\.?(\d+)/);
    if (match) return match[2] || match[1] || '1';
    
    // Si es solo texto, generar código
    return '1';
  }

  private parseDate(value: any): Date {
    if (!value) return new Date();
    
    // Si es un número de Excel (días desde 1900)
    if (typeof value === 'number') {
      const excelEpoch = new Date(1900, 0, 1);
      const days = value - 2; // Excel cuenta desde 1, y tiene un bug con 1900
      return new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);
    }
    
    // Si es string, intentar parsear
    if (typeof value === 'string') {
      // Intentar diferentes formatos
      const formats = [
        'dd/MM/yyyy',
        'MM/dd/yyyy',
        'yyyy-MM-dd',
        'dd-MM-yyyy'
      ];
      
      for (const format of formats) {
        try {
          const parsed = parse(value, format, new Date());
          if (!isNaN(parsed.getTime())) {
            return parsed;
          }
        } catch (e) {
          // Continuar con siguiente formato
        }
      }
    }
    
    // Si es Date
    if (value instanceof Date) {
      return value;
    }
    
    // Default
    return new Date();
  }

  private generarFormula(seccion: string, serie: string, numero: string): string {
    return `CCAMEM/${seccion}/${serie}/${numero}`;
  }

  private async importBatch(expedientes: any[], unidadId: number) {
    for (const expediente of expedientes) {
      try {
        // Verificar si ya existe
        const exists = await prisma.expediente.findFirst({
          where: {
            numeroExpediente: expediente.numeroExpediente,
            unidadId: unidadId
          }
        });

        if (exists) {
          this.skipped++;
          this.warnings.push(`Expediente ${expediente.numeroExpediente} ya existe, saltando...`);
          continue;
        }

        // Crear expediente
        await prisma.expediente.create({
          data: expediente
        });

        this.imported++;
      } catch (error) {
        this.errors.push(`Error importando ${expediente.numeroExpediente}: ${error.message}`);
      }
    }
  }

  private showSummary() {
    console.log('\n' + chalk.cyan('═'.repeat(60)));
    console.log(chalk.cyan.bold('RESUMEN DE IMPORTACIÓN'));
    console.log(chalk.cyan('═'.repeat(60)));
    
    console.log(chalk.green(`✓ Expedientes importados: ${this.imported}`));
    console.log(chalk.yellow(`⚠ Expedientes saltados: ${this.skipped}`));
    console.log(chalk.red(`✗ Errores: ${this.errors.length}`));
    console.log(chalk.yellow(`⚠ Advertencias: ${this.warnings.length}`));
    
    if (this.errors.length > 0) {
      console.log('\n' + chalk.red.bold('ERRORES:'));
      this.errors.slice(0, 10).forEach(error => {
        console.log(chalk.red(`  • ${error}`));
      });
      if (this.errors.length > 10) {
        console.log(chalk.red(`  ... y ${this.errors.length - 10} errores más`));
      }
    }
    
    if (this.warnings.length > 0) {
      console.log('\n' + chalk.yellow.bold('ADVERTENCIAS:'));
      this.warnings.slice(0, 10).forEach(warning => {
        console.log(chalk.yellow(`  • ${warning}`));
      });
      if (this.warnings.length > 10) {
        console.log(chalk.yellow(`  ... y ${this.warnings.length - 10} advertencias más`));
      }
    }
  }
}

// Script principal
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log(chalk.red('Uso: npm run import-excel <archivo.xlsx> <codigo-unidad>'));
    console.log(chalk.gray('Ejemplo: npm run import-excel inventarios/SRSQ.xlsx SRSQ'));
    process.exit(1);
  }

  const [filePath, unidadCodigo] = args;
  const importer = new ExcelImporter();
  
  try {
    await importer.importFromExcel(filePath, unidadCodigo);
    console.log(chalk.green.bold('\n✓ Proceso completado exitosamente'));
  } catch (error) {
    console.error(chalk.red.bold('\n✗ Error fatal:'), error.message);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

export default ExcelImporter;
```

### PROMPT 2: CREAR SCRIPT DE VALIDACIÓN DE DATOS

```
Crea script para validar datos antes de importar:

backend/src/scripts/validate-excel.ts:
```typescript
import * as ExcelJS from 'exceljs';
import chalk from 'chalk';
import Table from 'cli-table3';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    duplicates: number;
    missingRequired: number;
  };
}

class ExcelValidator {
  async validate(filePath: string): Promise<ValidationResult> {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      stats: {
        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
        duplicates: 0,
        missingRequired: 0
      }
    };

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      const worksheet = workbook.worksheets[0];

      // Validar estructura
      this.validateStructure(worksheet, result);
      
      // Validar datos
      this.validateData(worksheet, result);
      
      // Mostrar resultados
      this.showResults(result);
      
    } catch (error) {
      result.valid = false;
      result.errors.push(`Error leyendo archivo: ${error.message}`);
    }

    return result;
  }

  private validateStructure(worksheet: ExcelJS.Worksheet, result: ValidationResult) {
    // Verificar columnas requeridas
    const requiredColumns = [
      'NO. EXPEDIENTE',
      'NOMBRE DEL EXPEDIENTE',
      'SECCIÓN',
      'SERIE'
    ];

    let headerRow = null;
    for (let i = 1; i <= Math.min(20, worksheet.rowCount); i++) {
      const row = worksheet.getRow(i);
      const values = (row.values as any[]).map(v => v?.toString().toUpperCase());
      
      if (requiredColumns.some(col => values.some(v => v?.includes(col)))) {
        headerRow = i;
        break;
      }
    }

    if (!headerRow) {
      result.valid = false;
      result.errors.push('No se encontraron los encabezados esperados');
      return;
    }

    // Verificar cada columna requerida
    const headers = (worksheet.getRow(headerRow).values as any[])
      .map(v => v?.toString().toUpperCase());
    
    requiredColumns.forEach(col => {
      if (!headers.some(h => h?.includes(col))) {
        result.warnings.push(`Columna requerida no encontrada: ${col}`);
      }
    });
  }

  private validateData(worksheet: ExcelJS.Worksheet, result: ValidationResult) {
    const expedientesSet = new Set<string>();
    let dataStartRow = 0;

    // Encontrar donde empiezan los datos
    for (let i = 1; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const firstCell = (row.values as any[])[1];
      if (typeof firstCell === 'number') {
        dataStartRow = i;
        break;
      }
    }

    if (dataStartRow === 0) {
      result.errors.push('No se encontraron datos para procesar');
      return;
    }

    // Validar cada fila de datos
    for (let i = dataStartRow; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const values = row.values as any[];
      
      // Saltar filas vacías
      if (!values || values.every(v => !v)) continue;
      
      result.stats.totalRows++;
      
      let rowValid = true;
      const rowErrors = [];
      
      // Validar número de expediente
      const numeroExpediente = values[2]?.toString();
      if (!numeroExpediente) {
        rowErrors.push('Falta número de expediente');
        result.stats.missingRequired++;
        rowValid = false;
      } else if (expedientesSet.has(numeroExpediente)) {
        rowErrors.push(`Expediente duplicado: ${numeroExpediente}`);
        result.stats.duplicates++;
        rowValid = false;
      } else {
        expedientesSet.add(numeroExpediente);
      }
      
      // Validar fechas
      const fecha = values[10];
      if (fecha && typeof fecha === 'string') {
        if (!this.isValidDate(fecha)) {
          rowErrors.push('Fecha inválida');
          rowValid = false;
        }
      }
      
      if (rowValid) {
        result.stats.validRows++;
      } else {
        result.stats.invalidRows++;
        result.errors.push(`Fila ${i}: ${rowErrors.join(', ')}`);
      }
    }
    
    result.valid = result.stats.invalidRows === 0;
  }

  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  private showResults(result: ValidationResult) {
    console.log('\n' + chalk.cyan('═'.repeat(60)));
    console.log(chalk.cyan.bold('VALIDACIÓN DE ARCHIVO EXCEL'));
    console.log(chalk.cyan('═'.repeat(60)));

    // Tabla de estadísticas
    const table = new Table({
      head: ['Métrica', 'Valor'],
      colWidths: [30, 20]
    });

    table.push(
      ['Total de filas', result.stats.totalRows],
      ['Filas válidas', chalk.green(result.stats.validRows)],
      ['Filas inválidas', chalk.red(result.stats.invalidRows)],
      ['Duplicados', chalk.yellow(result.stats.duplicates)],
      ['Campos requeridos faltantes', chalk.yellow(result.stats.missingRequired)]
    );

    console.log(table.toString());

    // Estado general
    if (result.valid) {
      console.log('\n' + chalk.green.bold('✓ El archivo es válido para importación'));
    } else {
      console.log('\n' + chalk.red.bold('✗ El archivo tiene errores que deben corregirse'));
    }

    // Mostrar errores
    if (result.errors.length > 0) {
      console.log('\n' + chalk.red.bold('ERRORES ENCONTRADOS:'));
      result.errors.slice(0, 10).forEach(error => {
        console.log(chalk.red(`  • ${error}`));
      });
      if (result.errors.length > 10) {
        console.log(chalk.red(`  ... y ${result.errors.length - 10} errores más`));
      }
    }

    // Mostrar advertencias
    if (result.warnings.length > 0) {
      console.log('\n' + chalk.yellow.bold('ADVERTENCIAS:'));
      result.warnings.forEach(warning => {
        console.log(chalk.yellow(`  • ${warning}`));
      });
    }
  }
}

// Ejecutar validación
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log(chalk.red('Uso: npm run validate-excel <archivo.xlsx>'));
    process.exit(1);
  }

  const validator = new ExcelValidator();
  const result = await validator.validate(args[0]);
  
  process.exit(result.valid ? 0 : 1);
}

if (require.main === module) {
  main();
}

export default ExcelValidator;
```

### PROMPT 3: CREAR SEEDER INICIAL DE DATOS

```
Crea el seeder principal con todos los catálogos:

backend/prisma/seed.ts:
```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import chalk from 'chalk';

const prisma = new PrismaClient();

async function main() {
  console.log(chalk.cyan('🌱 Iniciando seed de base de datos...'));

  // 1. Crear Roles
  console.log(chalk.yellow('→ Creando roles...'));
  const roles = await seedRoles();
  
  // 2. Crear Unidades Administrativas
  console.log(chalk.yellow('→ Creando unidades administrativas...'));
  const unidades = await seedUnidades();
  
  // 3. Crear Secciones del Cuadro de Clasificación
  console.log(chalk.yellow('→ Creando secciones...'));
  const secciones = await seedSecciones();
  
  // 4. Crear Series Documentales
  console.log(chalk.yellow('→ Creando series documentales...'));
  const series = await seedSeries();
  
  // 5. Crear Subseries
  console.log(chalk.yellow('→ Creando subseries...'));
  const subseries = await seedSubseries();
  
  // 6. Crear Usuario Administrador
  console.log(chalk.yellow('→ Creando usuario administrador...'));
  await seedAdminUser();
  
  // 7. Crear Usuarios de Prueba
  console.log(chalk.yellow('→ Creando usuarios de prueba...'));
  await seedTestUsers();
  
  // 8. Crear Expedientes de Ejemplo (opcional)
  if (process.env.SEED_DEMO_DATA === 'true') {
    console.log(chalk.yellow('→ Creando expedientes de ejemplo...'));
    await seedDemoExpedientes();
  }
  
  console.log(chalk.green('✓ Seed completado exitosamente'));
}

async function seedRoles() {
  const rolesData = [
    {
      nombre: 'administrador',
      descripcion: 'Control total del sistema',
      permisos: {
        expedientes: ['crear', 'leer', 'actualizar', 'eliminar'],
        usuarios: ['crear', 'leer', 'actualizar', 'eliminar'],
        reportes: ['generar', 'exportar'],
        sistema: ['configurar', 'backup']
      }
    },
    {
      nombre: 'coordinador_archivo',
      descripcion: 'Coordinador de archivos institucional',
      permisos: {
        expedientes: ['crear', 'leer', 'actualizar'],
        reportes: ['generar', 'exportar'],
        transferencias: ['aprobar']
      }
    },
    {
      nombre: 'responsable_area',
      descripcion: 'Responsable de archivo de área',
      permisos: {
        expedientes: ['crear', 'leer', 'actualizar'],
        reportes: ['generar'],
        prestamos: ['aprobar']
      }
    },
    {
      nombre: 'operador',
      descripcion: 'Captura y consulta de su área',
      permisos: {
        expedientes: ['crear', 'leer', 'actualizar'],
        reportes: ['generar']
      }
    },
    {
      nombre: 'consulta',
      descripcion: 'Solo consulta de información',
      permisos: {
        expedientes: ['leer'],
        reportes: ['ver']
      }
    }
  ];

  for (const rol of rolesData) {
    await prisma.rol.upsert({
      where: { nombre: rol.nombre },
      update: {},
      create: rol
    });
  }

  return await prisma.rol.findMany();
}

async function seedUnidades() {
  const unidadesData = [
    { codigo: 'OC', nombre: 'Oficina del Comisionado' },
    { codigo: 'UAA', nombre: 'Unidad de Apoyo Administrativo' },
    { codigo: 'UCSM', nombre: 'Unidad de Calidad en el Servicio Médico' },
    { codigo: 'UP', nombre: 'Unidad de Peritajes' },
    { codigo: 'OIC', nombre: 'Órgano Interno de Control' },
    { codigo: 'SRSQ', nombre: 'Subcomisión de Recepción y Seguimiento de Quejas' },
    { codigo: 'SCAIG', nombre: 'Subcomisión de Conciliación, Arbitraje e Igualdad de Género' },
    { codigo: 'DN', nombre: 'Delegación Naucalpan', delegacion: 'Naucalpan' },
    { codigo: 'DT', nombre: 'Delegación Texcoco', delegacion: 'Texcoco' },
    { codigo: 'DIS', nombre: 'Delegación Ixtapan de la Sal', delegacion: 'Ixtapan de la Sal' }
  ];

  for (const unidad of unidadesData) {
    await prisma.unidadAdministrativa.upsert({
      where: { codigo: unidad.codigo },
      update: {},
      create: {
        ...unidad,
        activa: true
      }
    });
  }

  return await prisma.unidadAdministrativa.findMany();
}

async function seedSecciones() {
  const seccionesData = [
    {
      codigo: '1S',
      nombre: 'Recepción y seguimiento de quejas sobre prestación de servicios de salud',
      tipo: 'sustantiva',
      orden: 1
    },
    {
      codigo: '2S',
      nombre: 'Atención de inconformidades y solución de conflictos',
      tipo: 'sustantiva',
      orden: 2
    },
    {
      codigo: '3S',
      nombre: 'Programa operativo anual e información estadística',
      tipo: 'sustantiva',
      orden: 3
    },
    {
      codigo: '4S',
      nombre: 'Dictámenes técnico-médico institucionales',
      tipo: 'sustantiva',
      orden: 4
    },
    {
      codigo: '1C',
      nombre: 'Administración del capital humano, recursos materiales y financieros',
      tipo: 'comun',
      orden: 5
    },
    {
      codigo: '2C',
      nombre: 'Control y evaluación',
      tipo: 'comun',
      orden: 6
    },
    {
      codigo: '3C',
      nombre: 'Gestión documental y administración de archivos',
      tipo: 'comun',
      orden: 7
    },
    {
      codigo: '4C',
      nombre: 'Planeación y coordinación de actividades de la persona titular de la Comisión',
      tipo: 'comun',
      orden: 8
    },
    {
      codigo: '5C',
      nombre: 'Transparencia, acceso a la información y protección de datos personales',
      tipo: 'comun',
      orden: 9
    }
  ];

  for (const seccion of seccionesData) {
    await prisma.seccion.upsert({
      where: { codigo: seccion.codigo },
      update: {},
      create: {
        ...seccion,
        activa: true
      }
    });
  }

  return await prisma.seccion.findMany();
}

async function seedSeries() {
  // Series de la Sección 1S
  const series1S = [
    { codigo: '1S.1', nombre: 'Asesoría y orientación a usuarios y prestadores de servicios' },
    { codigo: '1S.2', nombre: 'Resolución de inconformidades entre usuarios y prestadores' },
    { codigo: '1S.3', nombre: 'Quejas derivadas de la prestación de los servicios de salud' },
    { codigo: '1S.4', nombre: 'Pláticas, conferencias y otros mecanismos de comunicación' }
  ];

  const seccion1S = await prisma.seccion.findUnique({ where: { codigo: '1S' } });
  
  for (const serie of series1S) {
    await prisma.serie.upsert({
      where: { codigo: serie.codigo },
      update: {},
      create: {
        ...serie,
        seccionId: seccion1S.id,
        activa: true
      }
    });
  }

  // Continuar con las demás secciones...
  // (Aquí agregarías todas las 90 series según el cuadro de clasificación)
  
  return await prisma.serie.findMany();
}

async function seedSubseries() {
  // Subseries de 1S.3
  const subseries1S3 = [
    { codigo: '1S.3.1', nombre: 'Quejas' },
    { codigo: '1S.3.2', nombre: 'Asesorías' },
    { codigo: '1S.3.3', nombre: 'Orientaciones' },
    { codigo: '1S.3.4', nombre: 'Gestiones inmediatas' }
  ];

  const serie1S3 = await prisma.serie.findUnique({ where: { codigo: '1S.3' } });
  
  for (const subserie of subseries1S3) {
    await prisma.subserie.upsert({
      where: { codigo: subserie.codigo },
      update: {},
      create: {
        ...subserie,
        serieId: serie1S3.id,
        activa: true
      }
    });
  }

  // Continuar con las demás subseries...
  
  return await prisma.subserie.findMany();
}

async function seedAdminUser() {
  const adminRole = await prisma.rol.findUnique({
    where: { nombre: 'administrador' }
  });

  const hashedPassword = await bcrypt.hash('Admin123!', 10);

  await prisma.usuario.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: hashedPassword,
      nombre: 'Administrador',
      apellidoPaterno: 'Sistema',
      apellidoMaterno: 'CCAMEM',
      email: 'admin@ccamem.gob.mx',
      rolId: adminRole.id,
      activo: true,
      debeCambiarPassword: true
    }
  });

  console.log(chalk.green('  ✓ Usuario admin creado'));
  console.log(chalk.gray('    Username: admin'));
  console.log(chalk.gray('    Password: Admin123!'));
}

async function seedTestUsers() {
  const roles = await prisma.rol.findMany();
  const unidades = await prisma.unidadAdministrativa.findMany();
  
  const testUsers = [
    {
      username: 'coordinador',
      nombre: 'María',
      apellidoPaterno: 'González',
      apellidoMaterno: 'López',
      email: 'coordinador@ccamem.gob.mx',
      rol: 'coordinador_archivo',
      unidad: 'UAA'
    },
    {
      username: 'responsable_srsq',
      nombre: 'Juan',
      apellidoPaterno: 'Hernández',
      apellidoMaterno: 'Martínez',
      email: 'responsable.srsq@ccamem.gob.mx',
      rol: 'responsable_area',
      unidad: 'SRSQ'
    },
    {
      username: 'operador1',
      nombre: 'Ana',
      apellidoPaterno: 'Rodríguez',
      apellidoMaterno: 'Sánchez',
      email: 'operador1@ccamem.gob.mx',
      rol: 'operador',
      unidad: 'SRSQ'
    }
  ];

  const hashedPassword = await bcrypt.hash('Test123!', 10);

  for (const userData of testUsers) {
    const rol = roles.find(r => r.nombre === userData.rol);
    const unidad = unidades.find(u => u.codigo === userData.unidad);

    await prisma.usuario.upsert({
      where: { username: userData.username },
      update: {},
      create: {
        username: userData.username,
        passwordHash: hashedPassword,
        nombre: userData.nombre,
        apellidoPaterno: userData.apellidoPaterno,
        apellidoMaterno: userData.apellidoMaterno,
        email: userData.email,
        rolId: rol.id,
        unidadId: unidad.id,
        activo: true
      }
    });
  }

  console.log(chalk.green(`  ✓ ${testUsers.length} usuarios de prueba creados`));
}

async function seedDemoExpedientes() {
  // Crear algunos expedientes de ejemplo
  const unidades = await prisma.unidadAdministrativa.findMany();
  const secciones = await prisma.seccion.findMany();
  const usuarios = await prisma.usuario.findMany();
  
  const demoExpedientes = [
    {
      numeroExpediente: 'DEMO-001-2025',
      nombreExpediente: 'Expediente de demostración - Queja médica',
      asunto: 'Queja por mala atención en hospital general',
      fechaApertura: new Date('2025-01-15'),
      totalLegajos: 1,
      totalDocumentos: 5,
      estado: 'TRAMITE'
    },
    {
      numeroExpediente: 'DEMO-002-2025',
      nombreExpediente: 'Expediente de demostración - Conciliación',
      asunto: 'Proceso de conciliación entre paciente y médico',
      fechaApertura: new Date('2025-01-10'),
      fechaCierre: new Date('2025-01-20'),
      totalLegajos: 2,
      totalDocumentos: 12,
      estado: 'CONCENTRACION'
    }
  ];

  for (const expData of demoExpedientes) {
    const unidad = unidades[Math.floor(Math.random() * unidades.length)];
    const seccion = secciones[0];
    const serie = await prisma.serie.findFirst({ where: { seccionId: seccion.id } });
    const usuario = usuarios[0];

    await prisma.expediente.create({
      data: {
        ...expData,
        unidadId: unidad.id,
        seccionId: seccion.id,
        serieId: serie.id,
        formulaClasificadora: `CCAMEM/${seccion.codigo}/${serie.codigo}/${expData.numeroExpediente}`,
        ubicacionFisica: 'Archivo Central - Estante A1',
        valorAdministrativo: true,
        clasificacionInformacion: 'PUBLICA',
        createdBy: usuario.id,
        updatedBy: usuario.id
      }
    });
  }

  console.log(chalk.green(`  ✓ ${demoExpedientes.length} expedientes de demo creados`));
}

// Ejecutar seed
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(chalk.red('Error en seed:'), e);
    await prisma.$disconnect();
    process.exit(1);
  });
```

### PROMPT 4: CREAR COMANDOS NPM PARA MIGRACIÓN

```
Actualiza package.json del backend con scripts de migración:

backend/package.json - agregar en scripts:
```json
{
  "scripts": {
    // ... otros scripts existentes
    "db:migrate": "prisma migrate dev",
    "db:migrate:prod": "prisma migrate deploy",
    "db:generate": "prisma generate",
    "db:seed": "ts-node prisma/seed.ts",
    "db:reset": "prisma migrate reset",
    "db:studio": "prisma studio",
    
    // Scripts de importación
    "import:excel": "ts-node src/scripts/import-excel.ts",
    "import:validate": "ts-node src/scripts/validate-excel.ts",
    "import:all": "ts-node src/scripts/import-all.ts",
    
    // Scripts de mantenimiento
    "backup:create": "ts-node src/scripts/backup.ts",
    "backup:restore": "ts-node src/scripts/restore.ts",
    "clean:orphans": "ts-node src/scripts/clean-orphans.ts"
  }
}
```

### PROMPT 5: CREAR SCRIPT PARA IMPORTAR TODOS LOS INVENTARIOS

```
Crea script maestro para importar todos los archivos:

backend/src/scripts/import-all.ts:
```typescript
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ExcelImporter from './import-excel';
import ExcelValidator from './validate-excel';

interface ImportConfig {
  directory: string;
  mappings: Array<{
    filename: string;
    unidadCodigo: string;
  }>;
  validateFirst: boolean;
  continueOnError: boolean;
}

async function importAll() {
  console.log(chalk.cyan.bold('═'.repeat(60)));
  console.log(chalk.cyan.bold('IMPORTACIÓN MASIVA DE INVENTARIOS CCAMEM'));
  console.log(chalk.cyan.bold('═'.repeat(60)));

  // Configuración de archivos a importar
  const config: ImportConfig = {
    directory: './inventarios',
    mappings: [
      { filename: 'InventarioSRSQ.xlsx', unidadCodigo: 'SRSQ' },
      { filename: 'UAA.xlsx', unidadCodigo: 'UAA' },
      { filename: 'UCSM.xlsx', unidadCodigo: 'UCSM' },
      { filename: 'UP.xlsx', unidadCodigo: 'UP' },
      { filename: 'OIC.xlsx', unidadCodigo: 'OIC' },
      { filename: 'SCAIG.xlsx', unidadCodigo: 'SCAIG' },
      { filename: 'DN.xlsx', unidadCodigo: 'DN' },
      { filename: 'DT.xlsx', unidadCodigo: 'DT' },
      { filename: 'DIS.xlsx', unidadCodigo: 'DIS' },
      { filename: 'OC.xlsx', unidadCodigo: 'OC' }
    ],
    validateFirst: true,
    continueOnError: false
  };

  // Verificar que el directorio existe
  if (!fs.existsSync(config.directory)) {
    console.log(chalk.red(`❌ El directorio ${config.directory} no existe`));
    console.log(chalk.yellow('Cree el directorio y coloque los archivos Excel de inventarios'));
    process.exit(1);
  }

  // Buscar archivos disponibles
  const availableFiles = config.mappings.filter(mapping => {
    const filePath = path.join(config.directory, mapping.filename);
    return fs.existsSync(filePath);
  });

  if (availableFiles.length === 0) {
    console.log(chalk.red('❌ No se encontraron archivos para importar'));
    process.exit(1);
  }

  console.log(chalk.green(`\n✓ Se encontraron ${availableFiles.length} archivos para importar:\n`));
  availableFiles.forEach(file => {
    console.log(chalk.gray(`  • ${file.filename} → ${file.unidadCodigo}`));
  });

  // Confirmar importación
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: '¿Desea continuar con la importación?',
      default: true
    }
  ]);

  if (!confirm) {
    console.log(chalk.yellow('Importación cancelada'));
    process.exit(0);
  }

  // Validación previa opcional
  if (config.validateFirst) {
    console.log(chalk.cyan('\n📋 Validando archivos antes de importar...\n'));
    
    const validator = new ExcelValidator();
    let allValid = true;
    
    for (const mapping of availableFiles) {
      const filePath = path.join(config.directory, mapping.filename);
      console.log(chalk.yellow(`Validando ${mapping.filename}...`));
      
      const result = await validator.validate(filePath);
      if (!result.valid) {
        allValid = false;
        console.log(chalk.red(`  ✗ ${mapping.filename} tiene errores`));
      } else {
        console.log(chalk.green(`  ✓ ${mapping.filename} es válido`));
      }
    }
    
    if (!allValid && !config.continueOnError) {
      console.log(chalk.red('\n❌ Algunos archivos tienen errores. Corrija antes de importar.'));
      process.exit(1);
    }
  }

  // Importación
  console.log(chalk.cyan('\n📥 Iniciando importación...\n'));
  
  const importer = new ExcelImporter();
  const results = {
    success: [],
    failed: []
  };
  
  for (const mapping of availableFiles) {
    const filePath = path.join(config.directory, mapping.filename);
    console.log(chalk.yellow(`\nImportando ${mapping.filename} para ${mapping.unidadCodigo}...`));
    
    try {
      await importer.importFromExcel(filePath, mapping.unidadCodigo);
      results.success.push(mapping.filename);
    } catch (error) {
      console.error(chalk.red(`Error importando ${mapping.filename}:`), error.message);
      results.failed.push({ file: mapping.filename, error: error.message });
      
      if (!config.continueOnError) {
        console.log(chalk.red('Importación detenida debido a error'));
        break;
      }
    }
  }
  
  // Resumen final
  console.log('\n' + chalk.cyan('═'.repeat(60)));
  console.log(chalk.cyan.bold('RESUMEN DE IMPORTACIÓN MASIVA'));
  console.log(chalk.cyan('═'.repeat(60)));
  
  console.log(chalk.green(`\n✓ Archivos importados exitosamente: ${results.success.length}`));
  results.success.forEach(file => {
    console.log(chalk.green(`  • ${file}`));
  });
  
  if (results.failed.length > 0) {
    console.log(chalk.red(`\n✗ Archivos con errores: ${results.failed.length}`));
    results.failed.forEach(({ file, error }) => {
      console.log(chalk.red(`  • ${file}: ${error}`));
    });
  }
  
  console.log(chalk.cyan('\n' + '═'.repeat(60)));
  console.log(chalk.green.bold('Proceso completado'));
}

// Ejecutar
importAll().catch(error => {
  console.error(chalk.red('Error fatal:'), error);
  process.exit(1);
});
```

## 📋 Flujo de Migración Completo

### Paso 1: Preparar archivos Excel
```bash
# Crear directorio para inventarios
mkdir backend/inventarios

# Colocar archivos Excel en el directorio
# - InventarioSRSQ.xlsx
# - UAA.xlsx
# - etc.
```

### Paso 2: Validar archivos
```bash
# Validar un archivo individual
npm run import:validate inventarios/InventarioSRSQ.xlsx

# Validar todos (desde el script import-all)
npm run import:all -- --validate-only
```

### Paso 3: Preparar base de datos
```bash
# Crear base de datos limpia
npm run db:reset

# Ejecutar migraciones
npm run db:migrate

# Cargar datos iniciales (catálogos)
npm run db:seed
```

### Paso 4: Importar datos
```bash
# Importar un archivo individual
npm run import:excel inventarios/SRSQ.xlsx SRSQ

# Importar todos los archivos
npm run import:all
```

### Paso 5: Verificar importación
```bash
# Abrir Prisma Studio para ver datos
npm run db:studio

# Generar reporte de verificación
npm run report:inventory
```

## 🔧 Solución de Problemas Comunes

### Problema: Fechas incorrectas
- Excel maneja fechas como números seriales
- El script convierte automáticamente
- Formatos soportados: dd/MM/yyyy, MM/dd/yyyy, yyyy-MM-dd

### Problema: Caracteres especiales
- UTF-8 encoding automático
- Limpieza de espacios en blanco
- Normalización de acentos

### Problema: Duplicados
- Validación por número de expediente + unidad
- Opción de saltar o actualizar existentes
- Log de duplicados encontrados

### Problema: Memoria insuficiente
- Procesamiento por lotes (batch)
- Límite configurable de registros por lote
- Garbage collection entre lotes

## 📊 Reportes Post-Migración

```typescript
// Script para generar reporte de migración
npm run report:migration

// Estadísticas de importación
- Total de expedientes importados por unidad
- Expedientes por sección/serie
- Fechas mínimas y máximas
- Registros con datos faltantes
- Duplicados detectados
```