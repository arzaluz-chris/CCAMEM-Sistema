import request from 'supertest';
import app from '../server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

describe('Auth API', () => {
  let testUser: any;

  beforeAll(async () => {
    // Crear usuario de prueba
    const hashedPassword = await bcrypt.hash('testpass123', 10);
    testUser = await prisma.usuario.create({
      data: {
        username: 'testuser',
        email: 'test@ccamem.gob.mx',
        password: hashedPassword,
        nombre: 'Test',
        apellidoPaterno: 'User',
        rol: 'OPERADOR',
        activo: true,
      },
    });
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    if (testUser) {
      await prisma.usuario.delete({ where: { id: testUser.id } });
    }
    await prisma.$disconnect();
  });

  describe('POST /api/auth/login', () => {
    it('debe iniciar sesión con credenciales válidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'testpass123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user.username).toBe('testuser');
    });

    it('debe rechazar credenciales inválidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('debe rechazar usuario inexistente', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'noexiste',
          password: 'testpass123',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('debe rechazar usuario inactivo', async () => {
      // Desactivar usuario
      await prisma.usuario.update({
        where: { id: testUser.id },
        data: { activo: false },
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'testpass123',
        })
        .expect(401);

      expect(response.body.success).toBe(false);

      // Reactivar usuario
      await prisma.usuario.update({
        where: { id: testUser.id },
        data: { activo: true },
      });
    });
  });

  describe('POST /api/auth/verify', () => {
    it('debe verificar token válido', async () => {
      // Primero hacer login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'testpass123',
        });

      const token = loginResponse.body.data.accessToken;

      const response = await request(app)
        .post('/api/auth/verify')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.username).toBe('testuser');
    });

    it('debe rechazar token inválido', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('debe cerrar sesión correctamente', async () => {
      // Primero hacer login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'testpass123',
        });

      const token = loginResponse.body.data.accessToken;

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
