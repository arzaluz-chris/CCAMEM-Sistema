// Setup para tests
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Hook global antes de todos los tests
beforeAll(async () => {
  console.log('🧪 Iniciando suite de tests...');
});

// Hook global después de todos los tests
afterAll(async () => {
  await prisma.$disconnect();
  console.log('✅ Tests completados');
});

// Exportar prisma para uso en tests
export { prisma };
