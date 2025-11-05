import * as XLSX from 'xlsx';
import * as path from 'path';

const excelFilePath = '/Users/christianarzaluz/Downloads/InventarioSRSQ.xlsx';

console.log('📊 Analizando archivo Excel...\n');

try {
  // Leer el archivo Excel
  const workbook = XLSX.readFile(excelFilePath);

  console.log('📁 Hojas encontradas:');
  workbook.SheetNames.forEach((sheetName, index) => {
    console.log(`   ${index + 1}. ${sheetName}`);
  });
  console.log('');

  // Analizar cada hoja
  workbook.SheetNames.forEach((sheetName) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📄 Hoja: ${sheetName}`);
    console.log('='.repeat(60));

    const worksheet = workbook.Sheets[sheetName];

    // Primero, convertir toda la hoja para encontrar los encabezados reales
    console.log('\n🔍 Buscando fila de encabezados...');
    const allData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];

    // Buscar la fila que contiene "No. PROGRESIVO" o encabezados similares
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(allData.length, 20); i++) {
      const row = allData[i];
      const rowText = row.join('|').toUpperCase();
      if (rowText.includes('PROGRESIVO') || rowText.includes('EXPEDIENTE') || rowText.includes('CÓDIGO')) {
        headerRowIndex = i;
        console.log(`✓ Encabezados encontrados en fila ${i + 1}`);
        break;
      }
    }

    if (headerRowIndex === -1) {
      console.log('⚠️  No se encontraron encabezados reconocibles');
      return;
    }

    // Leer de nuevo con los encabezados correctos
    const data = XLSX.utils.sheet_to_json(worksheet, {
      range: headerRowIndex,
      defval: '',
      raw: false
    });

    console.log(`\n📊 Total de filas de datos: ${data.length}`);

    if (data.length > 0) {
      // Mostrar columnas (encabezados)
      console.log('\n📋 Columnas detectadas:');
      const firstRow = data[0] as any;
      Object.keys(firstRow).forEach((key, index) => {
        console.log(`   ${index + 1}. "${key}"`);
      });

      // Mostrar primeras 5 filas como ejemplo
      console.log('\n📝 Primeras 5 filas de datos:');
      data.slice(0, 5).forEach((row: any, index) => {
        console.log(`\n   === Registro ${index + 1} ===`);
        Object.entries(row).forEach(([key, value]) => {
          if (value && String(value).trim() !== '') {
            console.log(`      ${key}: ${value}`);
          }
        });
      });

      // Estadísticas
      console.log('\n📈 Estadísticas:');
      console.log(`   - Total de registros: ${data.length}`);
      console.log(`   - Total de columnas: ${Object.keys(firstRow).length}`);

      // Contar registros con datos
      const registrosConDatos = data.filter((row: any) => {
        const valores = Object.values(row);
        return valores.some(v => v && String(v).trim() !== '');
      });
      console.log(`   - Registros con datos: ${registrosConDatos.length}`);
    } else {
      console.log('\n⚠️  La hoja está vacía');
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log('✅ Análisis completado');
  console.log('='.repeat(60));

} catch (error) {
  console.error('❌ Error al analizar el archivo:', error);
  process.exit(1);
}
