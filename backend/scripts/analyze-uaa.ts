import * as XLSX from 'xlsx';

const excelFilePath = '/Users/christianarzaluz/Downloads/UAA.xlsx';

console.log('📊 Analizando archivo UAA...\n');

try {
  const workbook = XLSX.readFile(excelFilePath);

  console.log('📁 Hojas encontradas:');
  workbook.SheetNames.forEach((sheetName, index) => {
    console.log(`   ${index + 1}. ${sheetName}`);
  });
  console.log('');

  // Analizar hoja 2024
  const hoja2024 = workbook.SheetNames.find(name => name.includes('2024'));

  if (!hoja2024) {
    console.log('⚠️  No se encontró hoja de 2024. Analizando todas las hojas...\n');

    workbook.SheetNames.forEach((sheetName) => {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📄 Hoja: ${sheetName}`);
      console.log('='.repeat(60));

      const worksheet = workbook.Sheets[sheetName];
      const allData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];

      console.log(`Total de filas: ${allData.length}`);

      // Mostrar primeras 20 filas para identificar encabezados
      console.log('\nPrimeras 20 filas:');
      allData.slice(0, 20).forEach((row, index) => {
        const rowData = row.filter(cell => cell && String(cell).trim() !== '').join(' | ');
        if (rowData) {
          console.log(`   Fila ${index + 1}: ${rowData.substring(0, 150)}${rowData.length > 150 ? '...' : ''}`);
        }
      });
    });
  } else {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📄 Analizando hoja: ${hoja2024}`);
    console.log('='.repeat(60));

    const worksheet = workbook.Sheets[hoja2024];
    const allData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];

    // Buscar fila de encabezados
    let headerRowIndex = -1;
    console.log('\n🔍 Buscando fila de encabezados...\n');

    for (let i = 0; i < Math.min(allData.length, 30); i++) {
      const row = allData[i];
      const rowText = row.join('|').toUpperCase();

      console.log(`Fila ${i + 1}: ${rowText.substring(0, 100)}...`);

      if (rowText.includes('PROGRESIVO') ||
          rowText.includes('EXPEDIENTE') ||
          rowText.includes('CÓDIGO') ||
          rowText.includes('SERIE') ||
          rowText.includes('SECCIÓN')) {
        headerRowIndex = i;
        console.log(`\n✓ Encabezados encontrados en fila ${i + 1}`);
        break;
      }
    }

    if (headerRowIndex === -1) {
      console.log('\n⚠️  No se encontraron encabezados automáticamente');
      console.log('Mostrando todas las primeras 30 filas para análisis manual:\n');

      allData.slice(0, 30).forEach((row, index) => {
        const rowData = row.map((cell, colIndex) => `[${colIndex}]=${cell}`).join(' | ');
        if (rowData.replace(/\[.*?\]=/g, '').trim()) {
          console.log(`\nFila ${index + 1}:`);
          console.log(rowData);
        }
      });
    } else {
      // Leer con encabezados
      const data = XLSX.utils.sheet_to_json(worksheet, {
        range: headerRowIndex,
        defval: '',
        raw: false
      });

      console.log(`\n📊 Total de filas de datos: ${data.length}`);

      if (data.length > 0) {
        console.log('\n📋 Columnas detectadas:');
        const firstRow = data[0] as any;
        Object.keys(firstRow).forEach((key, index) => {
          console.log(`   ${index + 1}. "${key}"`);
        });

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
        const registrosConDatos = data.filter((row: any) => {
          const valores = Object.values(row);
          return valores.some(v => v && String(v).trim() !== '');
        });

        console.log('\n📈 Estadísticas:');
        console.log(`   - Total de registros: ${data.length}`);
        console.log(`   - Registros con datos: ${registrosConDatos.length}`);
        console.log(`   - Total de columnas: ${Object.keys(firstRow).length}`);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Análisis completado');
  console.log('='.repeat(60));

} catch (error) {
  console.error('❌ Error al analizar el archivo:', error);
  process.exit(1);
}
