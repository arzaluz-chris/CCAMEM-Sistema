// Configurar variables de entorno antes de ejecutar tests
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://ccamem:testpassword@localhost:5432/ccamem_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-ci';
process.env.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'test-refresh-secret-key';
process.env.JWT_EXPIRES_IN = '8h';
process.env.REFRESH_TOKEN_EXPIRES_IN = '7d';
