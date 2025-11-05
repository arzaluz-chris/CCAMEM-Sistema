# Sistema de Gestión Archivística CCAMEM - Guía de Desarrollo

## 📋 Descripción

Sistema web para la gestión digital del registro y consulta de archivos de la Comisión de Conciliación y Arbitraje Médico del Estado de México (CCAMEM).

## 🏗️ Stack Tecnológico

- **Frontend**: React 19 + TypeScript + Material-UI v7 + Redux Toolkit
- **Backend**: Node.js + Express + TypeScript + Prisma ORM
- **Base de Datos**: PostgreSQL 15
- **Autenticación**: JWT con refresh tokens
- **Testing**: Jest (Backend) + Cypress (Frontend E2E)

## 📁 Estructura del Proyecto

```
ccamem-sistema/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuración (DB, JWT)
│   │   ├── controllers/     # Lógica de controladores
│   │   ├── middleware/      # Auth, validación, errores
│   │   ├── routes/          # Definición de rutas API
│   │   ├── types/           # Tipos TypeScript
│   │   ├── utils/           # Utilidades
│   │   ├── __tests__/       # Tests unitarios (Jest)
│   │   └── server.ts        # Entry point
│   ├── prisma/
│   │   ├── schema.prisma    # Modelo de datos
│   │   ├── migrations/      # Migraciones
│   │   └── seed.ts          # Datos iniciales
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── pages/           # Páginas principales
│   │   ├── services/        # Servicios API
│   │   ├── store/           # Redux store y slices
│   │   ├── hooks/           # Custom hooks
│   │   ├── types/           # Tipos TypeScript
│   │   └── App.tsx
│   ├── cypress/             # Tests E2E
│   └── package.json
└── README.md
```

## ⚙️ Configuración de Entorno

### Backend (.env)

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

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_TIMEOUT=30000
REACT_APP_TITLE="Sistema de Gestión Archivística CCAMEM"
```

## 🚀 Comandos de Desarrollo

### Backend

```bash
cd backend
npm run dev              # Desarrollo con hot reload
npm run build            # Build para producción
npm start                # Ejecutar build de producción
npm run migrate          # Ejecutar migraciones
npm run migrate:reset    # Reset de base de datos
npm run prisma:generate  # Generar cliente Prisma
npm run prisma:studio    # Abrir Prisma Studio
npm run seed             # Poblar base de datos
npm test                 # Ejecutar tests (Jest)
```

### Frontend

```bash
cd frontend
npm start                # Desarrollo
npm run build            # Build para producción
npx cypress open         # Tests E2E modo interactivo
npx cypress run          # Tests E2E modo headless
```

## 📚 Cuadro de Clasificación Archivística

### Secciones Sustantivas
- **1S**: Recepción y seguimiento de quejas sobre prestación de servicios de salud
- **2S**: Atención de inconformidades y solución de conflictos
- **3S**: Programa operativo anual e información estadística
- **4S**: Dictámenes técnico-médico institucionales

### Secciones Comunes
- **1C**: Administración del capital humano, recursos materiales y financieros
- **2C**: Control y evaluación
- **3C**: Gestión documental y administración de archivos
- **4C**: Planeación y coordinación de actividades de la persona titular
- **5C**: Transparencia, acceso a la información y protección de datos personales

## 🔑 Roles y Permisos

| Rol | Permisos |
|-----|----------|
| **ADMIN** | Acceso total, gestión de usuarios, todas las unidades |
| **COORDINADOR_ARCHIVO** | Gestión de expedientes de todas las unidades, autorización de préstamos |
| **RESPONSABLE_AREA** | Gestión de expedientes de su unidad, solicitud de préstamos |
| **OPERADOR** | Captura de expedientes de su unidad |
| **CONSULTA** | Solo lectura de expedientes de su unidad |

## 🔍 Consideraciones Especiales

1. **Fórmula Clasificadora**: Se genera automáticamente con formato:
   - `CCAMEM/UNIDAD/SECCION/SERIE/SUBSERIE/EXPEDIENTE`

2. **Números de Expediente**: Validar unicidad por unidad administrativa

3. **Permisos**: Los usuarios solo pueden ver/editar expedientes de su unidad (excepto Admin y Coordinador)

4. **Auditoría**: Todos los cambios se registran en bitácora con:
   - Usuario que realizó la acción
   - Fecha y hora
   - Tipo de acción (CREATE, UPDATE, DELETE)
   - Valores anteriores y nuevos

5. **Seguridad**:
   - Rate limiting (100 req/15min)
   - Helmet.js para headers de seguridad
   - Validación de entrada en todos los endpoints
   - Hash de contraseñas con bcrypt (10 rounds)

## 🎯 Estado Actual del Proyecto

### ✅ Implementado

- [x] Base de datos y Prisma schema
- [x] API Backend completa
- [x] Sistema de autenticación (JWT + refresh tokens)
- [x] CRUD de expedientes con paginación y filtros
- [x] CRUD de usuarios
- [x] API de préstamos (solicitar, autorizar, rechazar, devolver)
- [x] API de catálogos (unidades, secciones, series, subseries)
- [x] Frontend: Login y autenticación
- [x] Frontend: Formulario de expedientes con validación
- [x] Frontend: Lista de expedientes con búsqueda y filtros
- [x] Frontend: Vista detallada de expedientes con tabs
- [x] Frontend: Dashboard con gráficas (Recharts)
- [x] Frontend: Gestión de usuarios (Admin)
- [x] Frontend: Diálogos de préstamos
- [x] Tests unitarios backend (Jest)
- [x] Tests E2E frontend (Cypress)
- [x] Seed de base de datos con datos de prueba

### 🚧 Pendiente/En Desarrollo

- [ ] API de Bitácora completa
- [ ] Módulo de Transferencias
- [ ] Generación de reportes (Excel/PDF)
- [ ] Integración completa de préstamos en frontend
- [ ] Notificaciones por email
- [ ] Exportación masiva de inventarios

## 📝 Notas de Desarrollo

- El proyecto usa **TypeScript strict mode** en todo el stack
- Todos los endpoints de API requieren autenticación JWT (excepto `/auth/login`)
- La base de datos usa **soft deletes** para preservar datos históricos
- Los tests E2E de Cypress asumen que el backend está corriendo en `http://localhost:3001`
- El seed crea un usuario admin por defecto:
  - Username: `admin`
  - Password: `Admin123!`

---

**Última actualización**: Noviembre 2024
