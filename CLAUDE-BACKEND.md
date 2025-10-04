# Backend Development - Sistema de Gestión Archivística CCAMEM

## 🔧 Configuración Inicial del Backend

### 1. INICIALIZAR PROYECTO

```bash
mkdir backend && cd backend
npm init -y
```

### 2. INSTALAR DEPENDENCIAS

```bash
# Dependencias principales
npm install express cors dotenv helmet morgan compression
npm install @prisma/client prisma
npm install bcrypt jsonwebtoken
npm install joi express-rate-limit
npm install multer exceljs pdfkit
npm install node-cron winston

# Dependencias de desarrollo
npm install -D typescript @types/node
npm install -D @types/express @types/cors @types/bcrypt
npm install -D @types/jsonwebtoken @types/multer @types/node-cron
npm install -D ts-node nodemon
npm install -D @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D prettier eslint-config-prettier
npm install -D jest @types/jest ts-jest supertest @types/supertest
```

## 📝 Prompts Detallados para Claude Code

### PROMPT 1: CREAR ESTRUCTURA BASE

```
Crea la estructura base del backend con TypeScript en la carpeta backend/ con los siguientes archivos:

backend/tsconfig.json:
- target: ES2021
- module: commonjs
- rootDir: ./src
- outDir: ./dist
- strict: true
- esModuleInterop: true
- skipLibCheck: true
- forceConsistentCasingInFileNames: true
- resolveJsonModule: true
- paths con alias @/* para src/*

backend/nodemon.json:
- watch: src
- ext: ts
- exec: ts-node con alias
- env: development

backend/.eslintrc.json:
- extends: eslint:recommended, plugin:@typescript-eslint/recommended, prettier
- parser: @typescript-eslint/parser
- reglas para TypeScript

backend/.prettierrc:
- semi: true
- singleQuote: true
- tabWidth: 2
- trailingComma: es5

backend/package.json scripts:
- dev: nodemon
- build: tsc
- start: node dist/server.js
- prisma:generate
- prisma:migrate
- prisma:seed
- test: jest
- lint: eslint
- format: prettier
```

### PROMPT 2: CREAR SCHEMA DE PRISMA COMPLETO

```
Crea backend/prisma/schema.prisma con el modelo completo para CCAMEM:

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

Modelos necesarios con todas las relaciones:

1. UnidadAdministrativa
   - id, codigo, nombre, responsable, email, telefono
   - delegacion, activa, createdAt, updatedAt

2. Seccion
   - id, codigo (1S, 2S, etc), nombre, tipo (sustantiva/comun)
   - descripcion, orden, activa

3. Serie  
   - id, seccionId, codigo, nombre, descripcion, orden, activa
   - relacion con Seccion

4. Subserie
   - id, serieId, codigo, nombre, descripcion, orden, activa
   - relacion con Serie

5. Rol
   - id, nombre, descripcion, permisos (Json)

6. Usuario
   - id, username, passwordHash, nombre, apellidoPaterno, apellidoMaterno
   - email, telefono, unidadId, rolId, activo
   - ultimoAcceso, intentosFallidos, bloqueadoHasta
   - debeCambiarPassword, createdAt, updatedAt
   - relaciones con UnidadAdministrativa y Rol

7. Expediente (modelo principal)
   - id, numeroProgresivo, numeroExpediente, nombreExpediente, asunto
   - unidadId, seccionId, serieId, subserieId (opcional)
   - formulaClasificadora, totalLegajos, totalDocumentos, totalFojas
   - numeroCaja, ubicacionFisica
   - fechaApertura, fechaCierre, fechaPrimerDocumento, fechaUltimoDocumento
   - estado (enum: TRAMITE, CONCENTRACION, HISTORICO, BAJA)
   - tiempoConservacionTramite, tiempoConservacionConcentracion
   - valorAdministrativo, valorJuridico, valorFiscal, valorContable (Boolean)
   - clasificacionInformacion (enum: PUBLICA, RESERVADA, CONFIDENCIAL)
   - prestadoA, fechaPrestamo, fechaDevolucionEsperada, fechaDevolucionReal
   - digitalizado, rutaDigital, fechaDigitalizacion
   - observaciones
   - createdAt, createdBy, updatedAt, updatedBy
   - Índices únicos y relaciones completas

8. Legajo
   - id, expedienteId, numeroLegajo, totalFojas
   - fechaInicio, fechaFin, ubicacionFisica, observaciones

9. Bitacora
   - id, usuarioId, accion, tablaAfectada, registroId
   - descripcion, datosAnteriores, datosNuevos (Json)
   - ipAddress, userAgent, timestamp

10. Prestamo
    - id, expedienteId, solicitante, areaSolicitante, motivo
    - fechaSolicitud, fechaPrestamo, fechaDevolucionEsperada, fechaDevolucionReal
    - estado (enum: SOLICITADO, APROBADO, PRESTADO, DEVUELTO, RECHAZADO)
    - autorizadoPor, observaciones

11. Transferencia
    - id, tipo, fechaTransferencia, unidadRemitenteId, unidadReceptora
    - totalExpedientes, totalCajas, oficioTransferencia, observaciones
    - estado, createdBy

Incluye todos los índices necesarios para optimización.
```

### PROMPT 3: CREAR SERVIDOR EXPRESS CON TYPESCRIPT

```
Crea backend/src/server.ts con configuración completa de Express:

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import routes from './routes';
import logger from './utils/logger';

Configuraciones necesarias:
- Cargar variables de entorno
- Inicializar Prisma con logging
- Configurar CORS con opciones específicas
- Helmet para seguridad
- Morgan para logging HTTP
- Compression para respuestas
- Body parser con límites
- Rate limiting global
- Montar todas las rutas
- Error handler global
- Graceful shutdown
- Puerto 3001
```

### PROMPT 4: CREAR SISTEMA DE AUTENTICACIÓN COMPLETO

```
Crea el módulo de autenticación en backend/src/modules/auth/:

1. auth.types.ts:
   - Interfaces LoginDTO, RegisterDTO, TokenPayload, AuthResponse

2. auth.controller.ts:
   ```typescript
   - login(req, res): validar credenciales, generar tokens
   - register(req, res): crear usuario con hash
   - refreshToken(req, res): renovar access token
   - logout(req, res): invalidar tokens
   - me(req, res): obtener usuario actual
   - changePassword(req, res): cambiar contraseña
   ```

3. auth.service.ts:
   ```typescript
   - validateUser(username, password): verificar con bcrypt
   - generateTokens(user): crear access y refresh tokens
   - verifyRefreshToken(token): validar refresh token
   - hashPassword(password): bcrypt con 10 rounds
   - comparePasswords(plain, hash): comparar contraseñas
   - createPasswordResetToken(email): token temporal
   ```

4. auth.middleware.ts:
   ```typescript
   - authenticate: verificar JWT en headers
   - authorize(...roles): verificar roles permitidos
   - refreshTokenMiddleware: validar refresh token
   - preventBruteForce: limitar intentos de login
   ```

5. auth.validation.ts:
   - Esquemas Joi para login, register, changePassword

6. auth.routes.ts:
   - POST /auth/login
   - POST /auth/register
   - POST /auth/refresh
   - POST /auth/logout
   - GET /auth/me (protegida)
   - POST /auth/change-password (protegida)

Incluye manejo de errores, logging y respuestas consistentes.
```

### PROMPT 5: CREAR CRUD COMPLETO DE EXPEDIENTES

```
Crea el módulo de expedientes en backend/src/modules/expedientes/:

1. expedientes.types.ts:
   - CreateExpedienteDTO
   - UpdateExpedienteDTO
   - ExpedienteFilters
   - ExpedienteResponse
   - PaginationParams

2. expedientes.controller.ts:
   ```typescript
   export class ExpedientesController {
     async findAll(req, res): // paginación, filtros, ordenamiento
     async findOne(req, res): // incluir relaciones
     async create(req, res): // validar y crear con auditoría
     async update(req, res): // actualizar parcial con auditoría
     async delete(req, res): // soft delete
     async search(req, res): // búsqueda avanzada
     async prestar(req, res): // registrar préstamo
     async devolver(req, res): // registrar devolución
     async transferir(req, res): // transferencia
     async generarFormula(req, res): // generar fórmula clasificadora
   }
   ```

3. expedientes.service.ts:
   ```typescript
   export class ExpedientesService {
     async findAll(filters, pagination): // query builder dinámico
     async findById(id): // con includes
     async create(data, userId): // transacción con bitácora
     async update(id, data, userId): // actualización parcial
     async delete(id, userId): // cambiar estado a BAJA
     async search(query): // búsqueda full text
     async generarNumeroExpediente(unidadId): // autonumerico
     async generarFormulaClasificadora(seccion, serie, subserie, numero)
     async validarExpedienteDuplicado(numeroExpediente, unidadId)
     async registrarEnBitacora(accion, expedienteId, userId, cambios)
   }
   ```

4. expedientes.validation.ts:
   - Esquema Joi completo para create y update
   - Validación de fechas, enums, campos requeridos
   - Mensajes de error personalizados

5. expedientes.routes.ts:
   ```typescript
   router.get('/', authenticate, expedientesController.findAll);
   router.get('/search', authenticate, expedientesController.search);
   router.get('/:id', authenticate, expedientesController.findOne);
   router.post('/', authenticate, authorize('operador'), validate(createSchema), expedientesController.create);
   router.put('/:id', authenticate, authorize('operador'), validate(updateSchema), expedientesController.update);
   router.delete('/:id', authenticate, authorize('admin'), expedientesController.delete);
   router.post('/:id/prestar', authenticate, authorize('responsable'), expedientesController.prestar);
   router.post('/:id/devolver', authenticate, authorize('responsable'), expedientesController.devolver);
   ```

Incluye transacciones, manejo de errores, y logging.
```

### PROMPT 6: CREAR GENERADOR DE REPORTES

```
Crea el módulo de reportes en backend/src/modules/reportes/:

1. reportes.controller.ts:
   ```typescript
   - inventarioGeneral(req, res): Excel con todos los expedientes
   - inventarioPorUnidad(req, res): Excel filtrado por unidad
   - estadisticas(req, res): JSON con métricas para dashboard
   - exportarPDF(req, res): Inventario en PDF
   - reporteTransferencias(req, res): Expedientes transferidos
   - reportePrestamos(req, res): Expedientes prestados
   ```

2. reportes.service.ts con ExcelJS:
   ```typescript
   export class ReportesService {
     async generarInventarioExcel(expedientes) {
       const workbook = new ExcelJS.Workbook();
       const worksheet = workbook.addWorksheet('Inventario');
       
       // Encabezados institucionales
       worksheet.mergeCells('B4:J4');
       worksheet.getCell('B4').value = 'INVENTARIO GENERAL DE ARCHIVO';
       
       // Headers de columnas
       const headers = [
         'No. Progresivo',
         'No. Expediente', 
         'Sección',
         'Serie',
         'Subserie',
         'Fórmula Clasificadora',
         'Nombre del Expediente',
         'Total Legajos',
         'Total Docs',
         'Fecha Apertura',
         'Fecha Cierre',
         'Estado',
         'Ubicación'
       ];
       
       // Aplicar estilos, bordes, colores
       // Agregar datos
       // Agregar fórmulas para totales
       // Proteger hoja
       
       return workbook;
     }
     
     async generarPDF(expedientes) {
       // Usar PDFKit para generar PDF
     }
     
     async calcularEstadisticas() {
       // Queries agregadas con Prisma
     }
   }
   ```

3. reportes.routes.ts:
   - GET /api/reportes/inventario-general
   - GET /api/reportes/inventario-unidad/:unidadId
   - GET /api/reportes/estadisticas
   - POST /api/reportes/exportar

Incluye streaming para archivos grandes y cache de reportes frecuentes.
```

### PROMPT 7: CREAR MIDDLEWARE Y UTILIDADES

```
Crea los middleware y utilidades en backend/src/middleware/ y backend/src/utils/:

1. middleware/errorHandler.ts:
   ```typescript
   export const errorHandler = (err, req, res, next) => {
     // Logging del error
     // Formatear respuesta según tipo de error
     // Errores de Prisma
     // Errores de validación
     // Errores de autenticación
     // Error 500 genérico
   }
   ```

2. middleware/rateLimiter.ts:
   ```typescript
   import rateLimit from 'express-rate-limit';
   
   export const loginLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutos
     max: 5, // 5 intentos
     message: 'Demasiados intentos de login'
   });
   
   export const apiLimiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 100
   });
   ```

3. middleware/validation.ts:
   ```typescript
   export const validate = (schema) => (req, res, next) => {
     const { error } = schema.validate(req.body);
     if (error) {
       return res.status(400).json({ 
         error: error.details[0].message 
       });
     }
     next();
   }
   ```

4. utils/logger.ts con Winston:
   ```typescript
   import winston from 'winston';
   
   const logger = winston.createLogger({
     level: 'info',
     format: winston.format.json(),
     transports: [
       new winston.transports.File({ filename: 'error.log', level: 'error' }),
       new winston.transports.File({ filename: 'combined.log' }),
       new winston.transports.Console({
         format: winston.format.simple()
       })
     ]
   });
   ```

5. utils/pagination.ts:
   ```typescript
   export const paginate = (page = 1, limit = 20) => {
     const skip = (page - 1) * limit;
     return { skip, take: limit };
   }
   
   export const paginationResponse = (data, total, page, limit) => ({
     data,
     pagination: {
       total,
       page,
       limit,
       totalPages: Math.ceil(total / limit),
       hasNext: page * limit < total,
       hasPrev: page > 1
     }
   });
   ```

6. utils/formulaClasificadora.ts:
   ```typescript
   export const generarFormula = (unidad, seccion, serie, subserie, numero) => {
     // CCAMEM/SECCION/SERIE/SUBSERIE/EXPEDIENTE
     const parts = ['CCAMEM', seccion.codigo];
     if (serie) parts.push(serie.codigo);
     if (subserie) parts.push(subserie.codigo);
     parts.push(`E${numero.toString().padStart(4, '0')}`);
     return parts.join('/');
   }
   ```
```

### PROMPT 8: CREAR SEEDS Y MIGRACIONES

```
Crea los archivos de seed y migración en backend/prisma/:

1. seed.ts:
   ```typescript
   import { PrismaClient } from '@prisma/client';
   import bcrypt from 'bcrypt';
   
   const prisma = new PrismaClient();
   
   async function main() {
     // 1. Crear roles
     const roles = await createRoles();
     
     // 2. Crear unidades administrativas
     const unidades = await createUnidades();
     
     // 3. Crear secciones del cuadro de clasificación
     const secciones = await createSecciones();
     
     // 4. Crear series documentales
     const series = await createSeries(secciones);
     
     // 5. Crear subseries
     const subseries = await createSubseries(series);
     
     // 6. Crear usuario administrador
     const admin = await createAdmin();
     
     // 7. Crear usuarios de prueba
     const usuarios = await createUsuariosPrueba(unidades, roles);
     
     // 8. Crear expedientes de ejemplo
     await createExpedientesEjemplo(unidades, secciones, series, usuarios);
   }
   
   // Funciones individuales para cada entidad...
   ```

2. migrations/import-excel.ts:
   ```typescript
   // Script para importar datos desde los Excel existentes
   import ExcelJS from 'exceljs';
   import { PrismaClient } from '@prisma/client';
   
   async function importFromExcel(filePath: string) {
     const workbook = new ExcelJS.Workbook();
     await workbook.xlsx.readFile(filePath);
     
     const worksheet = workbook.worksheets[0];
     
     // Mapear columnas del Excel a campos del modelo
     // Procesar fila por fila
     // Crear expedientes en la BD
   }
   ```

3. backup.ts:
   ```typescript
   // Script para respaldo automático
   import { exec } from 'child_process';
   import cron from 'node-cron';
   
   // Respaldar BD cada día a las 2 AM
   cron.schedule('0 2 * * *', async () => {
     const date = new Date().toISOString().split('T')[0];
     const command = `pg_dump ${process.env.DATABASE_URL} > ./backups/backup-${date}.sql`;
     exec(command, (error, stdout, stderr) => {
       if (error) logger.error('Error en backup:', error);
       else logger.info('Backup completado:', date);
     });
   });
   ```
```

### PROMPT 9: CREAR TESTS UNITARIOS Y DE INTEGRACIÓN

```
Crea tests completos en backend/tests/:

1. jest.config.js:
   ```javascript
   module.exports = {
     preset: 'ts-jest',
     testEnvironment: 'node',
     roots: ['<rootDir>/tests'],
     testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
     collectCoverageFrom: [
       'src/**/*.ts',
       '!src/**/*.d.ts',
     ],
   };
   ```

2. tests/auth.test.ts:
   ```typescript
   import request from 'supertest';
   import app from '../src/server';
   
   describe('Auth Endpoints', () => {
     describe('POST /auth/login', () => {
       it('should login with valid credentials', async () => {
         const res = await request(app)
           .post('/auth/login')
           .send({
             username: 'admin',
             password: 'Admin123!'
           });
         
         expect(res.status).toBe(200);
         expect(res.body).toHaveProperty('accessToken');
         expect(res.body).toHaveProperty('refreshToken');
       });
       
       it('should reject invalid credentials', async () => {
         const res = await request(app)
           .post('/auth/login')
           .send({
             username: 'admin',
             password: 'wrong'
           });
         
         expect(res.status).toBe(401);
       });
     });
   });
   ```

3. tests/expedientes.test.ts:
   ```typescript
   describe('Expedientes CRUD', () => {
     let token: string;
     
     beforeAll(async () => {
       // Login para obtener token
     });
     
     describe('GET /api/expedientes', () => {
       it('should return paginated expedientes', async () => {
         const res = await request(app)
           .get('/api/expedientes')
           .set('Authorization', `Bearer ${token}`)
           .query({ page: 1, limit: 10 });
         
         expect(res.status).toBe(200);
         expect(res.body).toHaveProperty('data');
         expect(res.body).toHaveProperty('pagination');
       });
     });
     
     describe('POST /api/expedientes', () => {
       it('should create new expediente', async () => {
         const newExpediente = {
           numeroExpediente: 'TEST-001',
           nombreExpediente: 'Expediente de prueba',
           // ... más campos
         };
         
         const res = await request(app)
           .post('/api/expedientes')
           .set('Authorization', `Bearer ${token}`)
           .send(newExpediente);
         
         expect(res.status).toBe(201);
         expect(res.body.numeroExpediente).toBe('TEST-001');
       });
     });
   });
   ```

4. tests/integration.test.ts:
   ```typescript
   // Test de flujo completo
   describe('Flujo completo de gestión', () => {
     it('should complete full expediente lifecycle', async () => {
       // 1. Login
       // 2. Crear expediente
       // 3. Actualizar expediente
       // 4. Prestar expediente
       // 5. Devolver expediente
       // 6. Generar reporte
       // 7. Transferir a concentración
     });
   });
   ```
```

### PROMPT 10: CONFIGURACIÓN DE PRODUCCIÓN

```
Crea configuración para producción:

1. backend/Dockerfile:
   ```dockerfile
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   COPY prisma ./prisma/
   RUN npm ci --only=production
   RUN npx prisma generate
   COPY . .
   RUN npm run build
   
   FROM node:18-alpine
   WORKDIR /app
   COPY --from=builder /app/dist ./dist
   COPY --from=builder /app/node_modules ./node_modules
   COPY --from=builder /app/package*.json ./
   COPY --from=builder /app/prisma ./prisma
   
   EXPOSE 3001
   CMD ["npm", "start"]
   ```

2. backend/.env.production:
   ```env
   NODE_ENV=production
   DATABASE_URL=postgresql://ccamem:${DB_PASSWORD}@postgres:5432/ccamem_prod
   JWT_SECRET=${JWT_SECRET}
   CORS_ORIGIN=https://archivo.ccamem.gob.mx
   ```

3. backend/pm2.config.js:
   ```javascript
   module.exports = {
     apps: [{
       name: 'ccamem-backend',
       script: './dist/server.js',
       instances: 'max',
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 3001
       },
       error_file: './logs/err.log',
       out_file: './logs/out.log',
       log_file: './logs/combined.log',
       time: true
     }]
   };
   ```
```

## 📚 Comandos Útiles para Claude Code

```bash
# Generar toda la estructura del backend
claude-code "Genera la estructura completa del backend según CLAUDE-BACKEND.md"

# Crear un módulo específico
claude-code "Crea el módulo de expedientes completo con controller, service, validation y routes"

# Generar tests
claude-code "Genera tests unitarios para el servicio de expedientes"

# Optimizar código
claude-code "Revisa y optimiza el código del backend para producción"

# Documentar API
claude-code "Genera documentación OpenAPI/Swagger para todos los endpoints"
```

## 🚀 Orden Recomendado de Implementación

1. Configuración inicial y TypeScript
2. Prisma schema y conexión BD
3. Servidor Express básico
4. Sistema de autenticación
5. CRUD de expedientes
6. Validaciones y middleware
7. Generación de reportes
8. Seeds y datos iniciales
9. Tests
10. Configuración de producción