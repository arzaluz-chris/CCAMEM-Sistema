import request from 'supertest';
import app from '../server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

describe('Préstamos API', () => {
  let testUser: any;
  let testExpediente: any;
  let testUnidad: any;
  let testSeccion: any;
  let testSerie: any;
  let token: string;

  beforeAll(async () => {
    // Crear usuario de prueba
    const hashedPassword = await bcrypt.hash('testpass123', 10);
    testUser = await prisma.usuario.create({
      data: {
        username: 'testprestamos',
        email: 'prestamos@ccamem.gob.mx',
        password: hashedPassword,
        nombre: 'Test',
        apellidoPaterno: 'Préstamos',
        rol: 'OPERADOR',
        activo: true,
      },
    });

    // Crear datos necesarios para expediente
    testUnidad = await prisma.unidadAdministrativa.findFirst();
    testSeccion = await prisma.seccion.findFirst();
    testSerie = await prisma.serie.findFirst();

    // Crear expediente de prueba
    testExpediente = await prisma.expediente.create({
      data: {
        numeroExpediente: 'TEST-PRES-001',
        numeroProgresivo: 9999,
        unidadAdministrativaId: testUnidad!.id,
        seccionId: testSeccion!.id,
        serieId: testSerie!.id,
        formulaClasificadora: 'CCAMEM/TEST/001',
        nombreExpediente: 'Expediente Test Préstamos',
        asunto: 'Expediente para pruebas de préstamos',
        fechaApertura: new Date(),
        estado: 'ACTIVO',
        createdById: testUser.id,
      },
    });

    // Obtener token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testprestamos',
        password: 'testpass123',
      });

    token = loginResponse.body.data.accessToken;
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    if (testExpediente) {
      await prisma.prestamo.deleteMany({
        where: { expedienteId: testExpediente.id },
      });
      await prisma.bitacora.deleteMany({
        where: { expedienteId: testExpediente.id },
      });
      await prisma.expediente.delete({ where: { id: testExpediente.id } });
    }
    if (testUser) {
      await prisma.usuario.delete({ where: { id: testUser.id } });
    }
    await prisma.$disconnect();
  });

  describe('POST /api/prestamos/solicitar', () => {
    it('debe crear solicitud de préstamo', async () => {
      const response = await request(app)
        .post('/api/prestamos/solicitar')
        .set('Authorization', `Bearer ${token}`)
        .send({
          expedienteId: testExpediente.id,
          fechaDevolucionEsperada: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          motivoPrestamo: 'Revisión de documentos para auditoría',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.estado).toBe('PENDIENTE');
    });

    it('debe rechazar préstamo de expediente inexistente', async () => {
      const response = await request(app)
        .post('/api/prestamos/solicitar')
        .set('Authorization', `Bearer ${token}`)
        .send({
          expedienteId: 'invalid-id',
          fechaDevolucionEsperada: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          motivoPrestamo: 'Test',
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/prestamos', () => {
    it('debe listar préstamos', async () => {
      const response = await request(app)
        .get('/api/prestamos')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
    });

    it('debe filtrar préstamos por estado', async () => {
      const response = await request(app)
        .get('/api/prestamos')
        .query({ estado: 'PENDIENTE' })
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/prestamos/stats/general', () => {
    it('debe obtener estadísticas de préstamos', async () => {
      const response = await request(app)
        .get('/api/prestamos/stats/general')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('pendientes');
      expect(response.body.data).toHaveProperty('autorizados');
    });
  });
});
