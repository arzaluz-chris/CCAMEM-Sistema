# Sistema de Gestión Archivística CCAMEM - Claude Code Guide

## 📋 Descripción del Proyecto

Sistema web para la gestión digital del registro y consulta de archivos de la Comisión de Conciliación y Arbitraje Médico del Estado de México (CCAMEM), reemplazando el proceso manual en Excel.

## 🏗️ Arquitectura

- **Frontend**: React 18 + TypeScript + Material-UI v5
- **Backend**: Node.js + Express + TypeScript + Prisma ORM
- **Base de Datos**: PostgreSQL 15
- **Autenticación**: JWT
- **Reportes**: ExcelJS + jsPDF

## 📁 Estructura del Proyecto

```
ccamem-archivo/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   └── server.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── .env.example
│   ├── tsconfig.json
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── types/
│   │   ├── utils/
│   │   └── App.tsx
│   ├── public/
│   ├── tsconfig.json
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 🚀 Instrucciones de Inicio Rápido

### Paso 1: Configuración Inicial

```bash
# Crear estructura del proyecto
mkdir ccamem-archivo && cd ccamem-archivo
mkdir backend frontend

# Inicializar backend
cd backend
npm init -y
npm install express cors dotenv bcrypt jsonwebtoken
npm install @prisma/client prisma
npm install -D typescript @types/node @types/express @types/cors @types/bcrypt @types/jsonwebtoken
npm install -D ts-node nodemon eslint prettier

# Inicializar frontend
cd ../frontend
npx create-react-app . --template typescript
npm install @mui/material @emotion/react @emotion/styled
npm install axios react-router-dom react-hook-form
npm install @reduxjs/toolkit react-redux
npm install exceljs file-saver jspdf
```

## 📝 Prompts para Claude Code

### 1. CREAR ESQUEMA DE PRISMA

```
Crea el archivo prisma/schema.prisma con el siguiente modelo de datos para el Sistema de Gestión Archivística CCAMEM:

Necesito las siguientes entidades:
- UnidadAdministrativa (10 unidades: OC, UAA, UCSM, UP, OIC, SRSQ, SCAIG, DN, DT, DIS)
- Seccion (9 secciones del cuadro de clasificación: 1S, 2S, 3S, 4S, 1C, 2C, 3C, 4C, 5C)
- Serie (90 series documentales relacionadas con secciones)
- Subserie (21 subseries opcionales)
- Usuario (con roles: admin, coordinador_archivo, responsable_area, operador, consulta)
- Expediente (campos completos según inventario)
- Legajo (múltiples por expediente)
- Bitacora (auditoría)
- Prestamo
- Transferencia

Incluye relaciones, índices y campos de auditoría (createdAt, updatedAt, createdBy, updatedBy).
```

### 2. CREAR CONFIGURACIÓN DEL SERVIDOR

```
Crea el archivo backend/src/server.ts con:
- Configuración de Express con TypeScript
- Middleware de CORS, body parser, error handling
- Conexión a PostgreSQL via Prisma
- Rutas principales organizadas por módulos
- Puerto 3001
- Manejo de errores global
```

### 3. CREAR SISTEMA DE AUTENTICACIÓN

```
Crea el sistema de autenticación completo en backend/src/auth/:
- auth.controller.ts: login, logout, refresh token, verify token
- auth.service.ts: lógica de autenticación con bcrypt y JWT
- auth.middleware.ts: verificación de token y roles
- auth.routes.ts: rutas de autenticación

Incluye:
- Hash de contraseñas con bcrypt (10 rounds)
- JWT con expiración de 8 horas
- Refresh tokens
- Protección contra fuerza bruta
- Validación de roles
```

### 4. CREAR CRUD DE EXPEDIENTES

```
Crea el módulo completo de expedientes en backend/src/expedientes/:
- expedientes.controller.ts: CRUD completo con paginación y filtros
- expedientes.service.ts: lógica de negocio
- expedientes.validation.ts: validación con Joi o Zod
- expedientes.routes.ts: rutas protegidas por rol

Endpoints necesarios:
- GET /api/expedientes (paginación, filtros por unidad, sección, serie, estado, fechas)
- GET /api/expedientes/:id (detalle completo)
- POST /api/expedientes (crear con validación de fórmula clasificadora)
- PUT /api/expedientes/:id (actualizar con auditoría)
- DELETE /api/expedientes/:id (soft delete)
- GET /api/expedientes/buscar (búsqueda avanzada)
- POST /api/expedientes/:id/prestar (préstamo)
- POST /api/expedientes/:id/devolver (devolución)
```

### 5. CREAR GENERADOR DE REPORTES

```
Crea el módulo de reportes en backend/src/reportes/:
- reportes.controller.ts
- reportes.service.ts: generación de Excel y PDF
- reportes.routes.ts

Reportes necesarios:
1. Inventario General: todos los expedientes con formato oficial
2. Inventario por Unidad: filtrado por unidad administrativa
3. Estadísticas: dashboard con métricas
4. Exportación masiva a Excel con el formato exacto del inventario actual

Usa ExcelJS para generar archivos Excel con:
- Encabezados oficiales
- Formato de celdas
- Múltiples hojas si es necesario
- Fórmulas para totales
```

### 6. CREAR FRONTEND - LOGIN

```
Crea la página de login en frontend/src/pages/Login.tsx:
- Diseño con Material-UI
- Formulario con React Hook Form
- Validación client-side
- Manejo de errores
- Redirect después de login exitoso
- Recordar usuario (opcional)
- Logo de CCAMEM y Estado de México
```

### 7. CREAR FRONTEND - FORMULARIO DE EXPEDIENTES

```
Crea el formulario de expedientes en frontend/src/components/ExpedienteForm.tsx:
- Formulario completo con todos los campos del inventario
- Selects dependientes (sección -> serie -> subserie)
- Generación automática de fórmula clasificadora
- Validación en tiempo real
- Autocompletado para campos frecuentes
- Manejo de múltiples legajos
- Vista previa antes de guardar

Campos del formulario:
- Número de expediente
- Unidad administrativa (select)
- Sección/Serie/Subserie (selects en cascada)
- Nombre del expediente
- Asunto
- Total de legajos, documentos, fojas
- Fechas de apertura y cierre
- Valores documentales (checkboxes)
- Clasificación de información
- Ubicación física
```

### 8. CREAR FRONTEND - TABLA DE INVENTARIO

```
Crea el componente de tabla en frontend/src/components/InventarioTable.tsx:
- DataGrid de MUI con paginación server-side
- Columnas configurables
- Filtros avanzados
- Búsqueda en tiempo real
- Ordenamiento por columnas
- Selección múltiple para operaciones batch
- Exportación a Excel
- Vista rápida de detalles
- Acciones por fila (editar, prestar, transferir)

Columnas principales:
- No. Progresivo
- No. Expediente
- Sección/Serie
- Nombre
- Fechas
- Estado
- Ubicación
- Acciones
```

### 9. CREAR FRONTEND - DASHBOARD

```
Crea el dashboard en frontend/src/pages/Dashboard.tsx:
- Estadísticas generales con Cards de MUI
- Gráficos con Recharts o Chart.js:
  - Expedientes por unidad (barras)
  - Estado de expedientes (pie)
  - Tendencia mensual (líneas)
  - Expedientes prestados
- Accesos rápidos a funciones principales
- Últimos movimientos
- Notificaciones pendientes
- Resumen por unidad administrativa
```

### 10. CREAR SERVICIOS API

```
Crea los servicios de API en frontend/src/services/:
- api.service.ts: configuración base de axios con interceptors
- auth.service.ts: login, logout, token management
- expedientes.service.ts: CRUD de expedientes
- catalogos.service.ts: secciones, series, unidades
- reportes.service.ts: generación y descarga de reportes

Incluye:
- Interceptor para agregar token a headers
- Manejo global de errores
- Refresh token automático
- Loading states
- Cache de catálogos
```

### 11. CREAR ESTADO GLOBAL CON REDUX

```
Crea el store de Redux en frontend/src/store/:
- store.ts: configuración del store
- authSlice.ts: estado de autenticación
- expedientesSlice.ts: estado de expedientes
- catalogosSlice.ts: catálogos del sistema
- uiSlice.ts: loading, errores, notificaciones

Features necesarias:
- Persistencia del token en localStorage
- Carga lazy de catálogos
- Paginación y cache de expedientes
- Manejo de estado de carga global
```

### 12. DOCKER COMPOSE

```
Crea docker-compose.yml con:
- PostgreSQL 15 con volumen persistente
- PgAdmin para gestión de BD
- Backend Node.js
- Frontend React (nginx en producción)
- Redis para cache (opcional)
- Variables de entorno
- Red interna
- Healthchecks
```

### 13. SCRIPTS DE MIGRACIÓN

```
Crea scripts de migración en backend/prisma/migrations/:
- Script para importar datos desde Excel existente
- Script para crear usuario administrador inicial
- Script para poblar catálogos (secciones, series, subseries)
- Script para generar datos de prueba
```

## 🔧 Configuración de Desarrollo

### Variables de Entorno Backend (.env)

```env
# Database
DATABASE_URL="postgresql://ccamem:password@localhost:5432/ccamem_db"

# JWT
JWT_SECRET="tu-secret-super-seguro-cambiar-en-produccion"
JWT_EXPIRES_IN="8h"
REFRESH_TOKEN_SECRET="otro-secret-seguro"
REFRESH_TOKEN_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV=development

# CORS
FRONTEND_URL="http://localhost:3000"

# Email (opcional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="notificaciones@ccamem.gob.mx"
SMTP_PASS="password"

# Files
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="10485760"
```

### Variables de Entorno Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_TIMEOUT=30000
REACT_APP_TITLE="Sistema de Gestión Archivística CCAMEM"
```

## 🧪 Testing

### Backend Tests

```
Crea tests en backend/tests/:
- auth.test.ts: pruebas de autenticación
- expedientes.test.ts: CRUD de expedientes
- reportes.test.ts: generación de reportes
- integration.test.ts: flujos completos

Usa Jest y Supertest
```

### Frontend Tests

```
Crea tests en frontend/src/__tests__/:
- Login.test.tsx
- ExpedienteForm.test.tsx
- InventarioTable.test.tsx
- Dashboard.test.tsx

Usa React Testing Library
```

## 📚 Datos del Cuadro de Clasificación

### Secciones Sustantivas
- 1S: Recepción y seguimiento de quejas sobre prestación de servicios de salud
- 2S: Atención de inconformidades y solución de conflictos
- 3S: Programa operativo anual e información estadística
- 4S: Dictámenes técnico-médico institucionales

### Secciones Comunes
- 1C: Administración del capital humano, recursos materiales y financieros
- 2C: Control y evaluación
- 3C: Gestión documental y administración de archivos
- 4C: Planeación y coordinación de actividades de la persona titular
- 5C: Transparencia, acceso a la información y protección de datos personales

## 🚀 Comandos de Desarrollo

```bash
# Backend
cd backend
npm run dev          # Desarrollo con hot reload
npm run build        # Build para producción
npm run start        # Ejecutar en producción
npm run migrate      # Ejecutar migraciones
npm run seed         # Poblar base de datos
npm run test         # Ejecutar tests

# Frontend
cd frontend
npm start            # Desarrollo
npm run build        # Build para producción
npm test             # Ejecutar tests
npm run analyze      # Analizar bundle

# Docker
docker-compose up -d              # Levantar servicios
docker-compose logs -f backend    # Ver logs
docker-compose down               # Detener servicios
```

## 📋 Checklist de Implementación

- [ ] Configuración inicial del proyecto
- [ ] Base de datos y Prisma schema
- [ ] API Backend básica
- [ ] Sistema de autenticación
- [ ] CRUD de expedientes
- [ ] Generación de reportes
- [ ] Frontend login
- [ ] Formulario de expedientes
- [ ] Tabla de inventario
- [ ] Dashboard
- [ ] Integración completa
- [ ] Docker setup
- [ ] Tests
- [ ] Documentación
- [ ] Despliegue

## 🔍 Consideraciones Especiales

1. **Fórmula Clasificadora**: Generar automáticamente según formato CCAMEM/SECCION/SERIE/SUBSERIE/EXPEDIENTE
2. **Números de Expediente**: Validar unicidad por unidad
3. **Permisos**: Usuarios solo pueden ver/editar expedientes de su unidad (excepto admin)
4. **Auditoría**: Registrar todos los cambios en bitácora
5. **Respaldos**: Configurar backups automáticos diarios
6. **Seguridad**: Implementar rate limiting y protección CSRF