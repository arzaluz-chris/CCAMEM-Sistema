import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // 1. Crear Unidades Administrativas
  console.log('📁 Creando Unidades Administrativas...');
  const unidades = await Promise.all([
    prisma.unidadAdministrativa.upsert({
      where: { clave: 'OC' },
      update: {},
      create: {
        clave: 'OC',
        nombre: 'Oficina del Comisionado',
        descripcion: 'Oficina del Comisionado',
      },
    }),
    prisma.unidadAdministrativa.upsert({
      where: { clave: 'UAA' },
      update: {},
      create: {
        clave: 'UAA',
        nombre: 'Unidad de Asuntos Administrativos',
        descripcion: 'Unidad de Asuntos Administrativos',
      },
    }),
    prisma.unidadAdministrativa.upsert({
      where: { clave: 'UCSM' },
      update: {},
      create: {
        clave: 'UCSM',
        nombre: 'Unidad de Conciliación de Servicios Médicos',
        descripcion: 'Unidad de Conciliación de Servicios Médicos',
      },
    }),
    prisma.unidadAdministrativa.upsert({
      where: { clave: 'UP' },
      update: {},
      create: {
        clave: 'UP',
        nombre: 'Unidad de Planeación',
        descripcion: 'Unidad de Planeación',
      },
    }),
    prisma.unidadAdministrativa.upsert({
      where: { clave: 'OIC' },
      update: {},
      create: {
        clave: 'OIC',
        nombre: 'Órgano Interno de Control',
        descripcion: 'Órgano Interno de Control',
      },
    }),
    prisma.unidadAdministrativa.upsert({
      where: { clave: 'SRSQ' },
      update: {},
      create: {
        clave: 'SRSQ',
        nombre: 'Sala Regional de Supervisión de Quejas',
        descripcion: 'Sala Regional de Supervisión de Quejas',
      },
    }),
    prisma.unidadAdministrativa.upsert({
      where: { clave: 'SCAIG' },
      update: {},
      create: {
        clave: 'SCAIG',
        nombre: 'Sala de Coordinación de Arbitraje e Integración de Grupos',
        descripcion: 'Sala de Coordinación de Arbitraje e Integración de Grupos',
      },
    }),
    prisma.unidadAdministrativa.upsert({
      where: { clave: 'DN' },
      update: {},
      create: {
        clave: 'DN',
        nombre: 'Dirección de Normatividad',
        descripcion: 'Dirección de Normatividad',
      },
    }),
    prisma.unidadAdministrativa.upsert({
      where: { clave: 'DT' },
      update: {},
      create: {
        clave: 'DT',
        nombre: 'Dirección Técnica',
        descripcion: 'Dirección Técnica',
      },
    }),
    prisma.unidadAdministrativa.upsert({
      where: { clave: 'DIS' },
      update: {},
      create: {
        clave: 'DIS',
        nombre: 'Dirección de Investigación en Salud',
        descripcion: 'Dirección de Investigación en Salud',
      },
    }),
  ]);
  console.log(`✅ ${unidades.length} Unidades Administrativas creadas`);

  // 2. Crear Secciones
  console.log('📂 Creando Secciones...');
  const secciones = await Promise.all([
    // Secciones Sustantivas
    prisma.seccion.upsert({
      where: { clave: '1S' },
      update: {},
      create: {
        clave: '1S',
        nombre: 'Recepción y seguimiento de quejas sobre prestación de servicios de salud',
        tipo: 'SUSTANTIVA',
      },
    }),
    prisma.seccion.upsert({
      where: { clave: '2S' },
      update: {},
      create: {
        clave: '2S',
        nombre: 'Atención de inconformidades y solución de conflictos',
        tipo: 'SUSTANTIVA',
      },
    }),
    prisma.seccion.upsert({
      where: { clave: '3S' },
      update: {},
      create: {
        clave: '3S',
        nombre: 'Programa operativo anual e información estadística',
        tipo: 'SUSTANTIVA',
      },
    }),
    prisma.seccion.upsert({
      where: { clave: '4S' },
      update: {},
      create: {
        clave: '4S',
        nombre: 'Dictámenes técnico-médico institucionales',
        tipo: 'SUSTANTIVA',
      },
    }),
    // Secciones Comunes
    prisma.seccion.upsert({
      where: { clave: '1C' },
      update: {},
      create: {
        clave: '1C',
        nombre: 'Administración del capital humano, recursos materiales y financieros',
        tipo: 'COMUN',
      },
    }),
    prisma.seccion.upsert({
      where: { clave: '2C' },
      update: {},
      create: {
        clave: '2C',
        nombre: 'Control y evaluación',
        tipo: 'COMUN',
      },
    }),
    prisma.seccion.upsert({
      where: { clave: '3C' },
      update: {},
      create: {
        clave: '3C',
        nombre: 'Gestión documental y administración de archivos',
        tipo: 'COMUN',
      },
    }),
    prisma.seccion.upsert({
      where: { clave: '4C' },
      update: {},
      create: {
        clave: '4C',
        nombre: 'Planeación y coordinación de actividades de la persona titular',
        tipo: 'COMUN',
      },
    }),
    prisma.seccion.upsert({
      where: { clave: '5C' },
      update: {},
      create: {
        clave: '5C',
        nombre: 'Transparencia, acceso a la información y protección de datos personales',
        tipo: 'COMUN',
      },
    }),
  ]);
  console.log(`✅ ${secciones.length} Secciones creadas`);

  // 3. Crear Series Documentales
  console.log('📑 Creando series documentales...');
  const seccionesMap = new Map(secciones.map(s => [s.clave, s]));

  const seriesData = [
    { seccion: '1S', clave: '1S.1', nombre: 'Quejas médicas' },
    { seccion: '1S', clave: '1S.2', nombre: 'Seguimiento de quejas' },
    { seccion: '2S', clave: '2S.1', nombre: 'Conciliación' },
    { seccion: '2S', clave: '2S.2', nombre: 'Arbitraje médico' },
    { seccion: '2S', clave: '2S.3', nombre: 'Dictámenes médicos' },
    { seccion: '3S', clave: '3S.1', nombre: 'Programa operativo anual' },
    { seccion: '3S', clave: '3S.2', nombre: 'Informes estadísticos' },
    { seccion: '4S', clave: '4S.1', nombre: 'Dictámenes técnico-médicos' },
    { seccion: '1C', clave: '1C.1', nombre: 'Recursos humanos' },
    { seccion: '1C', clave: '1C.2', nombre: 'Recursos materiales' },
    { seccion: '1C', clave: '1C.3', nombre: 'Recursos financieros' },
    { seccion: '2C', clave: '2C.1', nombre: 'Auditorías' },
    { seccion: '2C', clave: '2C.2', nombre: 'Evaluaciones' },
    { seccion: '3C', clave: '3C.1', nombre: 'Correspondencia' },
    { seccion: '3C', clave: '3C.2', nombre: 'Archivo de trámite' },
    { seccion: '4C', clave: '4C.1', nombre: 'Agenda de la persona titular' },
    { seccion: '5C', clave: '5C.1', nombre: 'Solicitudes de información' },
    { seccion: '5C', clave: '5C.2', nombre: 'Datos personales' },
  ];

  const series = await Promise.all(
    seriesData.map(sd => {
      const seccion = seccionesMap.get(sd.seccion)!;
      return prisma.serie.upsert({
        where: { seccionId_clave: { seccionId: seccion.id, clave: sd.clave } },
        update: {},
        create: {
          clave: sd.clave,
          nombre: sd.nombre,
          seccionId: seccion.id,
        },
      });
    })
  );
  console.log(`✅ ${series.length} Series documentales creadas`);

  // 4. Crear usuario administrador
  console.log('👤 Creando usuario administrador...');
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const adminUser = await prisma.usuario.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@ccamem.gob.mx',
      password: hashedPassword,
      nombre: 'Administrador',
      apellidoPaterno: 'Sistema',
      apellidoMaterno: 'CCAMEM',
      rol: 'ADMIN',
      activo: true,
    },
  });
  console.log(`✅ Usuario administrador creado: ${adminUser.username}`);

  // 5. Crear usuarios adicionales
  console.log('👥 Creando usuarios adicionales...');
  const coordPassword = await bcrypt.hash('coord123', 10);
  const coordUser = await prisma.usuario.upsert({
    where: { username: 'coord.archivo' },
    update: {},
    create: {
      username: 'coord.archivo',
      email: 'coordinador@ccamem.gob.mx',
      password: coordPassword,
      nombre: 'Coordinador',
      apellidoPaterno: 'del',
      apellidoMaterno: 'Archivo',
      rol: 'COORDINADOR_ARCHIVO',
      activo: true,
    },
  });

  const respPassword = await bcrypt.hash('resp123', 10);
  const unidadOC = unidades.find(u => u.clave === 'OC');
  const respUser = await prisma.usuario.upsert({
    where: { username: 'resp.oc' },
    update: {},
    create: {
      username: 'resp.oc',
      email: 'responsable.oc@ccamem.gob.mx',
      password: respPassword,
      nombre: 'Responsable',
      apellidoPaterno: 'de',
      apellidoMaterno: 'OC',
      rol: 'RESPONSABLE_AREA',
      activo: true,
      unidadAdministrativaId: unidadOC!.id,
    },
  });
  console.log(`✅ 3 usuarios creados (admin, coordinador, responsable)`);

  // 6. Crear expedientes de ejemplo
  console.log('📁 Creando expedientes de ejemplo...');
  const serieQuejas = series.find(s => s.clave === '1S.1');
  const serieConciliacion = series.find(s => s.clave === '2S.1');
  const seccion1S = seccionesMap.get('1S')!;
  const seccion2S = seccionesMap.get('2S')!;

  const expedientes = await Promise.all([
    prisma.expediente.upsert({
      where: {
        unidadAdministrativaId_numeroExpediente: {
          unidadAdministrativaId: unidadOC!.id,
          numeroExpediente: 'EXP-2025-001'
        }
      },
      update: {},
      create: {
        numeroExpediente: 'EXP-2025-001',
        unidadAdministrativaId: unidadOC!.id,
        seccionId: seccion1S.id,
        serieId: serieQuejas!.id,
        formulaClasificadora: 'CCAMEM/1S/1S.1/EXP-2025-001',
        nombreExpediente: 'Queja médica - Paciente González',
        asunto: 'Queja por servicio médico inadecuado en urgencias',
        totalLegajos: 1,
        totalDocumentos: 15,
        totalFojas: 45,
        fechaApertura: new Date('2025-01-15'),
        valorAdministrativo: true,
        valorLegal: true,
        clasificacionInfo: 'RESERVADA',
        estado: 'ACTIVO',
        ubicacionFisica: 'Estante 1, Anaquel A, Caja 001',
        createdById: adminUser.id,
      },
    }),
    prisma.expediente.upsert({
      where: {
        unidadAdministrativaId_numeroExpediente: {
          unidadAdministrativaId: unidadOC!.id,
          numeroExpediente: 'EXP-2025-002'
        }
      },
      update: {},
      create: {
        numeroExpediente: 'EXP-2025-002',
        unidadAdministrativaId: unidadOC!.id,
        seccionId: seccion2S.id,
        serieId: serieConciliacion!.id,
        formulaClasificadora: 'CCAMEM/2S/2S.1/EXP-2025-002',
        nombreExpediente: 'Conciliación - Caso Hernández vs Hospital General',
        asunto: 'Proceso de conciliación médica por negligencia médica',
        totalLegajos: 2,
        totalDocumentos: 30,
        totalFojas: 90,
        fechaApertura: new Date('2025-02-01'),
        fechaCierre: new Date('2025-03-15'),
        valorLegal: true,
        clasificacionInfo: 'CONFIDENCIAL',
        estado: 'CERRADO',
        ubicacionFisica: 'Estante 1, Anaquel B, Caja 002',
        createdById: adminUser.id,
      },
    }),
  ]);
  console.log(`✅ ${expedientes.length} expedientes de ejemplo creados`);

  console.log('\n✨ Seed completado exitosamente!');
  console.log('\n📊 Resumen:');
  console.log(`   - ${unidades.length} Unidades Administrativas`);
  console.log(`   - ${secciones.length} Secciones`);
  console.log(`   - ${series.length} Series Documentales`);
  console.log(`   - 3 Usuarios`);
  console.log(`   - ${expedientes.length} Expedientes de ejemplo`);
  console.log('\n🔑 Credenciales de acceso:');
  console.log('   Admin: admin / admin123');
  console.log('   Coordinador: coord.archivo / coord123');
  console.log('   Responsable: resp.oc / resp123');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
