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
      update: {
        nombre: 'Oficina del Comisionado',
        descripcion: 'Oficina del Comisionado',
      },
      create: {
        clave: 'OC',
        nombre: 'Oficina del Comisionado',
        descripcion: 'Oficina del Comisionado',
      },
    }),
    prisma.unidadAdministrativa.upsert({
      where: { clave: 'SP' },
      update: {
        nombre: 'Secretaría Particular',
        descripcion: 'Secretaría Particular',
      },
      create: {
        clave: 'SP',
        nombre: 'Secretaría Particular',
        descripcion: 'Secretaría Particular',
      },
    }),
    prisma.unidadAdministrativa.upsert({
      where: { clave: 'UCSM' },
      update: {
        nombre: 'Unidad de Calidad en el Servicio Médico',
        descripcion: 'Unidad de Calidad en el Servicio Médico',
      },
      create: {
        clave: 'UCSM',
        nombre: 'Unidad de Calidad en el Servicio Médico',
        descripcion: 'Unidad de Calidad en el Servicio Médico',
      },
    }),
    prisma.unidadAdministrativa.upsert({
      where: { clave: 'UAA' },
      update: {
        nombre: 'Unidad de Apoyo Administrativo',
        descripcion: 'Unidad de Apoyo Administrativo',
      },
      create: {
        clave: 'UAA',
        nombre: 'Unidad de Apoyo Administrativo',
        descripcion: 'Unidad de Apoyo Administrativo',
      },
    }),
    prisma.unidadAdministrativa.upsert({
      where: { clave: 'UP' },
      update: {
        nombre: 'Unidad de Peritajes',
        descripcion: 'Unidad de Peritajes',
      },
      create: {
        clave: 'UP',
        nombre: 'Unidad de Peritajes',
        descripcion: 'Unidad de Peritajes',
      },
    }),
    prisma.unidadAdministrativa.upsert({
      where: { clave: 'OIC' },
      update: {
        nombre: 'Órgano Interno de Control',
        descripcion: 'Órgano Interno de Control',
      },
      create: {
        clave: 'OIC',
        nombre: 'Órgano Interno de Control',
        descripcion: 'Órgano Interno de Control',
      },
    }),
    prisma.unidadAdministrativa.upsert({
      where: { clave: 'SRSQ' },
      update: {
        nombre: 'Subcomisión de Recepción y Seguimiento de Quejas',
        descripcion: 'Subcomisión de Recepción y Seguimiento de Quejas',
      },
      create: {
        clave: 'SRSQ',
        nombre: 'Subcomisión de Recepción y Seguimiento de Quejas',
        descripcion: 'Subcomisión de Recepción y Seguimiento de Quejas',
      },
    }),
    prisma.unidadAdministrativa.upsert({
      where: { clave: 'SCAIG' },
      update: {
        nombre: 'Subcomisión de Conciliación, Arbitraje e Igualdad de Género',
        descripcion: 'Subcomisión de Conciliación, Arbitraje e Igualdad de Género',
      },
      create: {
        clave: 'SCAIG',
        nombre: 'Subcomisión de Conciliación, Arbitraje e Igualdad de Género',
        descripcion: 'Subcomisión de Conciliación, Arbitraje e Igualdad de Género',
      },
    }),
    prisma.unidadAdministrativa.upsert({
      where: { clave: 'DN' },
      update: {
        nombre: 'Delegación Naucalpan',
        descripcion: 'Delegación Naucalpan',
      },
      create: {
        clave: 'DN',
        nombre: 'Delegación Naucalpan',
        descripcion: 'Delegación Naucalpan',
      },
    }),
    prisma.unidadAdministrativa.upsert({
      where: { clave: 'DT' },
      update: {
        nombre: 'Delegación Texcoco',
        descripcion: 'Delegación Texcoco',
      },
      create: {
        clave: 'DT',
        nombre: 'Delegación Texcoco',
        descripcion: 'Delegación Texcoco',
      },
    }),
    prisma.unidadAdministrativa.upsert({
      where: { clave: 'DIS' },
      update: {
        nombre: 'Delegación Ixtapan de la Sal',
        descripcion: 'Delegación Ixtapan de la Sal',
      },
      create: {
        clave: 'DIS',
        nombre: 'Delegación Ixtapan de la Sal',
        descripcion: 'Delegación Ixtapan de la Sal',
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
    // SECCIONES SUSTANTIVAS
    // 1S - Recepción y seguimiento de quejas
    { seccion: '1S', clave: '1S.1', nombre: 'Registro y resguardo de expedientes de quejas sobre prestación de servicios de salud' },
    { seccion: '1S', clave: '1S.2', nombre: 'Buzón de quejas' },
    { seccion: '1S', clave: '1S.3', nombre: 'Recepción y orientación de quejas sobre prestación de servicios de salud' },
    { seccion: '1S', clave: '1S.4', nombre: 'Registro y control de quejas' },
    { seccion: '1S', clave: '1S.5', nombre: 'Convenios de colaboración interinstitucional' },
    { seccion: '1S', clave: '1S.6', nombre: 'Promoción y difusión de los servicios de la Comisión' },
    { seccion: '1S', clave: '1S.7', nombre: 'Asesoría y participación en materia de conciliación y arbitraje médico' },

    // 2S - Atención de inconformidades y solución de conflictos
    { seccion: '2S', clave: '2S.1', nombre: 'Recepción y trámite de inconformidades' },
    { seccion: '2S', clave: '2S.2', nombre: 'Conciliación' },
    { seccion: '2S', clave: '2S.3', nombre: 'Arbitraje médico' },
    { seccion: '2S', clave: '2S.4', nombre: 'Igualdad de género' },
    { seccion: '2S', clave: '2S.5', nombre: 'Amigable composición' },
    { seccion: '2S', clave: '2S.6', nombre: 'Seguimiento de casos concluidos' },
    { seccion: '2S', clave: '2S.7', nombre: 'Convenios de colaboración interinstitucional' },
    { seccion: '2S', clave: '2S.8', nombre: 'Difusión de actividades en materia de atención de inconformidades' },

    // 3S - Programa operativo anual e información estadística
    { seccion: '3S', clave: '3S.1', nombre: 'Programa operativo anual' },
    { seccion: '3S', clave: '3S.2', nombre: 'Indicadores de gestión' },
    { seccion: '3S', clave: '3S.3', nombre: 'Seguimiento del programa operativo anual' },
    { seccion: '3S', clave: '3S.4', nombre: 'Informes institucionales' },
    { seccion: '3S', clave: '3S.5', nombre: 'Investigación e información estadística' },

    // 4S - Dictámenes técnico-médico institucionales
    { seccion: '4S', clave: '4S.1', nombre: 'Dictámenes técnico-médico institucionales' },
    { seccion: '4S', clave: '4S.2', nombre: 'Asesoría pericial externa' },
    { seccion: '4S', clave: '4S.3', nombre: 'Convenios de colaboración interinstitucional' },
    { seccion: '4S', clave: '4S.4', nombre: 'Difusión de actividades en materia de peritajes médicos' },

    // SECCIONES COMUNES
    // 1C - Administración del capital humano, recursos materiales y financieros
    { seccion: '1C', clave: '1C.1', nombre: 'Administración de recursos humanos' },
    { seccion: '1C', clave: '1C.2', nombre: 'Administración de recursos materiales' },
    { seccion: '1C', clave: '1C.3', nombre: 'Administración de recursos financieros' },
    { seccion: '1C', clave: '1C.4', nombre: 'Capacitación y desarrollo del capital humano' },
    { seccion: '1C', clave: '1C.5', nombre: 'Servicios generales' },
    { seccion: '1C', clave: '1C.6', nombre: 'Tecnologías de la información' },
    { seccion: '1C', clave: '1C.7', nombre: 'Control de gestión y seguimiento de asuntos' },
    { seccion: '1C', clave: '1C.8', nombre: 'Asuntos jurídicos' },
    { seccion: '1C', clave: '1C.9', nombre: 'Comunicación social' },
    { seccion: '1C', clave: '1C.10', nombre: 'Equidad y género' },
    { seccion: '1C', clave: '1C.11', nombre: 'Modernización administrativa' },
    { seccion: '1C', clave: '1C.12', nombre: 'Programa de adquisiciones' },
    { seccion: '1C', clave: '1C.13', nombre: 'Convocatorias de licitación pública' },
    { seccion: '1C', clave: '1C.14', nombre: 'Propuestas de licitación pública' },
    { seccion: '1C', clave: '1C.15', nombre: 'Administración de contratos' },
    { seccion: '1C', clave: '1C.16', nombre: 'Entrega recepción de bienes muebles, inmuebles y recursos' },
    { seccion: '1C', clave: '1C.17', nombre: 'Comprobación del gasto' },
    { seccion: '1C', clave: '1C.18', nombre: 'Servicios de administración y enajenación de bienes' },
    { seccion: '1C', clave: '1C.19', nombre: 'Reporte de operaciones relevantes, internas y preocupantes' },
    { seccion: '1C', clave: '1C.20', nombre: 'Presupuesto' },
    { seccion: '1C', clave: '1C.21', nombre: 'Contabilidad' },
    { seccion: '1C', clave: '1C.22', nombre: 'Recursos humanos' },
    { seccion: '1C', clave: '1C.23', nombre: 'Estructura orgánica' },
    { seccion: '1C', clave: '1C.24', nombre: 'Reclutamiento y selección del capital humano' },
    { seccion: '1C', clave: '1C.25', nombre: 'Nombramiento del capital humano' },
    { seccion: '1C', clave: '1C.26', nombre: 'Evaluación del desempeño' },
    { seccion: '1C', clave: '1C.27', nombre: 'Remuneraciones, prestaciones y deducciones' },
    { seccion: '1C', clave: '1C.28', nombre: 'Control de asistencia y puntualidad' },
    { seccion: '1C', clave: '1C.29', nombre: 'Licencias y permisos' },
    { seccion: '1C', clave: '1C.30', nombre: 'Profesionalización' },
    { seccion: '1C', clave: '1C.31', nombre: 'Control de expedientes' },
    { seccion: '1C', clave: '1C.32', nombre: 'Relaciones laborales' },
    { seccion: '1C', clave: '1C.33', nombre: 'Administración del capital humano' },
    { seccion: '1C', clave: '1C.34', nombre: 'Control y evaluación del capital humano' },
    { seccion: '1C', clave: '1C.35', nombre: 'Higiene y seguridad en el trabajo' },
    { seccion: '1C', clave: '1C.36', nombre: 'Expedientes de personal' },
    { seccion: '1C', clave: '1C.37', nombre: 'Declaraciones patrimoniales' },

    // 2C - Control y evaluación
    { seccion: '2C', clave: '2C.1', nombre: 'Auditorías internas' },
    { seccion: '2C', clave: '2C.2', nombre: 'Órgano interno de control' },
    { seccion: '2C', clave: '2C.3', nombre: 'Revisión de la cuenta pública' },
    { seccion: '2C', clave: '2C.4', nombre: 'Quejas y denuncias' },
    { seccion: '2C', clave: '2C.5', nombre: 'Responsabilidades administrativas' },
    { seccion: '2C', clave: '2C.6', nombre: 'Inhabilidades' },
    { seccion: '2C', clave: '2C.7', nombre: 'Sistema Estatal de Control y Evaluación de la Gestión Pública' },

    // 3C - Gestión documental y administración de archivos
    { seccion: '3C', clave: '3C.1', nombre: 'Correspondencia recibida' },
    { seccion: '3C', clave: '3C.2', nombre: 'Correspondencia enviada' },
    { seccion: '3C', clave: '3C.3', nombre: 'Control de gestión' },
    { seccion: '3C', clave: '3C.4', nombre: 'Cuadro general de clasificación archivística' },
    { seccion: '3C', clave: '3C.5', nombre: 'Catálogo de disposición documental' },
    { seccion: '3C', clave: '3C.6', nombre: 'Inventario documental' },
    { seccion: '3C', clave: '3C.7', nombre: 'Transferencias primarias y secundarias' },

    // 4C - Planeación y coordinación de actividades de la persona titular
    { seccion: '4C', clave: '4C.1', nombre: 'Agenda de actividades de la persona titular' },
    { seccion: '4C', clave: '4C.2', nombre: 'Eventos institucionales' },
    { seccion: '4C', clave: '4C.3', nombre: 'Eventos especiales' },
    { seccion: '4C', clave: '4C.4', nombre: 'Giras de trabajo' },
    { seccion: '4C', clave: '4C.5', nombre: 'Invitaciones a eventos' },
    { seccion: '4C', clave: '4C.6', nombre: 'Logística' },

    // 5C - Transparencia, acceso a la información y protección de datos personales
    { seccion: '5C', clave: '5C.1', nombre: 'Solicitudes de acceso a la información pública' },
    { seccion: '5C', clave: '5C.2', nombre: 'Recursos de revisión' },
    { seccion: '5C', clave: '5C.3', nombre: 'Protección de datos personales' },
    { seccion: '5C', clave: '5C.4', nombre: 'Sistema de datos personales' },
    { seccion: '5C', clave: '5C.5', nombre: 'Comité de transparencia' },
    { seccion: '5C', clave: '5C.6', nombre: 'Unidad de transparencia' },
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

  // 3.1. Crear Subseries Documentales
  console.log('📑 Creando subseries documentales...');
  const seriesMap = new Map(series.map(s => [s.clave, s]));

  const subseriesData = [
    // SECCIONES SUSTANTIVAS
    // 1S.3 - Recepción y orientación de quejas (4 subseries)
    { serie: '1S.3', clave: '1S.3.1', nombre: 'Quejas' },
    { serie: '1S.3', clave: '1S.3.2', nombre: 'Asesorías' },
    { serie: '1S.3', clave: '1S.3.3', nombre: 'Orientaciones' },
    { serie: '1S.3', clave: '1S.3.4', nombre: 'Gestiones inmediatas' },

    // 2S.5 - Amigable composición (1 subserie)
    { serie: '2S.5', clave: '2S.5.1', nombre: 'Dictamen pericial' },

    // SECCIONES COMUNES
    // 1C.22 - Recursos humanos (6 subseries)
    { serie: '1C.22', clave: '1C.22.1', nombre: 'Movimientos de personal de confianza' },
    { serie: '1C.22', clave: '1C.22.2', nombre: 'Movimientos de personal de base' },
    { serie: '1C.22', clave: '1C.22.3', nombre: 'Expedientes de personal de confianza' },
    { serie: '1C.22', clave: '1C.22.4', nombre: 'Expedientes de personal de base' },
    { serie: '1C.22', clave: '1C.22.5', nombre: 'Prestaciones' },
    { serie: '1C.22', clave: '1C.22.6', nombre: 'Control de asistencia' },

    // 3C.1 - Correspondencia recibida (3 subseries)
    { serie: '3C.1', clave: '3C.1.1', nombre: 'Oficios recibidos' },
    { serie: '3C.1', clave: '3C.1.2', nombre: 'Circulares recibidas' },
    { serie: '3C.1', clave: '3C.1.3', nombre: 'Correos electrónicos recibidos' },

    // 3C.2 - Correspondencia enviada (3 subseries)
    { serie: '3C.2', clave: '3C.2.1', nombre: 'Oficios enviados' },
    { serie: '3C.2', clave: '3C.2.2', nombre: 'Circulares enviadas' },
    { serie: '3C.2', clave: '3C.2.3', nombre: 'Correos electrónicos enviados' },

    // 3C.4 - Cuadro general de clasificación archivística (1 subserie)
    { serie: '3C.4', clave: '3C.4.1', nombre: 'Cuadro general de clasificación archivística validado' },
  ];

  const subseries = await Promise.all(
    subseriesData.map(ssd => {
      const serie = seriesMap.get(ssd.serie);
      if (!serie) return null;
      return prisma.subserie.upsert({
        where: { serieId_clave: { serieId: serie.id, clave: ssd.clave } },
        update: {
          nombre: ssd.nombre,
        },
        create: {
          clave: ssd.clave,
          nombre: ssd.nombre,
          serieId: serie.id,
        },
      });
    }).filter(Boolean)
  );
  console.log(`✅ ${subseries.filter(s => s !== null).length} Subseries documentales creadas`);

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
  const serieQuejas = series.find(s => s.clave === '1S.3');
  const serieConciliacion = series.find(s => s.clave === '2S.2');
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
        formulaClasificadora: 'CCAMEM/OC/1S/1S.3/EXP-2025-001',
        nombreExpediente: 'Recepción y orientación - Queja Paciente González',
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
        formulaClasificadora: 'CCAMEM/OC/2S/2S.2/EXP-2025-002',
        nombreExpediente: 'Conciliación - Caso Hernández vs Hospital General',
        asunto: 'Proceso de conciliación médica por negligencia',
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
  console.log(`   - ${subseries.filter(s => s !== null).length} Subseries Documentales`);
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
