# Sistema de Gestión Archivística CCAMEM

![CI Status](https://github.com/YOUR-USERNAME/ccamem-sistema/workflows/CI%20-%20Continuous%20Integration/badge.svg)
![CodeQL](https://github.com/YOUR-USERNAME/ccamem-sistema/workflows/CodeQL%20Security%20Analysis/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)

Sistema web para la gestión digital del registro y consulta de archivos de la **Comisión de Conciliación y Arbitraje Médico del Estado de México (CCAMEM)**.

---

## 📋 Descripción

Sistema desarrollado para digitalizar el proceso de gestión archivística de la CCAMEM, que actualmente se realiza manualmente mediante Microsoft Excel. Permite el registro, consulta, préstamo y generación de reportes de inventarios archivísticos según el Cuadro General de Clasificación Archivística.

### Funcionalidades Principales

- ✅ **Gestión de Expedientes**: Registro, edición, consulta y búsqueda avanzada
- ✅ **Control de Préstamos**: Solicitud, autorización y devolución de expedientes
- ✅ **Sistema de Usuarios**: 5 roles con permisos diferenciados
- ✅ **Reportes e Inventarios**: Generación de inventarios en Excel y PDF
- ✅ **Dashboard Estadístico**: Visualización de métricas y tendencias
- ✅ **Auditoría**: Registro de todas las acciones realizadas
- ✅ **Multi-unidad**: Soporte para 10 unidades administrativas

---

## 🏗️ Arquitectura

### Stack Tecnológico

**Backend:**
- Node.js 20+ con Express
- TypeScript 5.3
- Prisma ORM 5.7
- PostgreSQL 15
- JWT para autenticación
- Jest para testing

**Frontend:**
- React 19 con TypeScript
- Material-UI v7
- Redux Toolkit para estado global
- Axios para API calls
- React Hook Form para formularios
- Recharts para gráficas
- Cypress para testing E2E

**DevOps:**
- Docker & Docker Compose
- PostgreSQL en contenedor
- Volúmenes persistentes

---

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
│   │   ├── __tests__/       # Tests unitarios
│   │   └── server.ts        # Entry point
│   ├── prisma/
│   │   ├── schema.prisma    # Modelo de datos
│   │   ├── migrations/      # Migraciones
│   │   └── seed.ts          # Datos iniciales
│   ├── .env                 # Variables de entorno
│   ├── tsconfig.json
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── pages/           # Páginas principales
│   │   ├── services/        # Servicios API
│   │   ├── store/           # Redux store
│   │   ├── hooks/           # Custom hooks
│   │   ├── types/           # Tipos TypeScript
│   │   ├── utils/           # Utilidades
│   │   └── App.tsx          # Componente principal
│   ├── cypress/
│   │   ├── e2e/             # Tests E2E
│   │   └── support/         # Configuración Cypress
│   ├── public/
│   ├── .env                 # Variables de entorno
│   ├── tsconfig.json
│   └── package.json
├── docker-compose.yml       # Orquestación de contenedores
├── CLAUDE.md                # Guía para Claude Code
├── IMPLEMENTACION-COMPLETA.md
└── README.md                # Este archivo
```

---

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 20+ y npm 9+
- Docker y Docker Compose
- Git

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd ccamem-sistema
```

### 2. Configurar Variables de Entorno

**Backend (.env):**
```bash
cd backend
cp .env.example .env
```

Editar `backend/.env`:
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

**Frontend (.env):**
```bash
cd ../frontend
cp .env.example .env
```

Editar `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_TIMEOUT=30000
REACT_APP_TITLE="Sistema de Gestión Archivística CCAMEM"
```

### 3. Instalar Dependencias

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
```

### 4. Configurar Base de Datos con Docker

```bash
# Desde la raíz del proyecto
docker-compose up -d
```

Esto levantará:
- PostgreSQL en puerto 5432
- PgAdmin en puerto 5050 (opcional)

### 5. Ejecutar Migraciones y Seed

```bash
cd backend
npm run prisma:generate
npm run migrate
npm run seed
```

El seed creará:
- **Usuario Admin**:
  - Username: `admin`
  - Password: `Admin123!`
- 10 Unidades Administrativas
- 9 Secciones
- 90 Series documentales
- 21 Subseries
- Datos de prueba (expedientes, préstamos)

---

## 🎮 Ejecución en Desarrollo

### Opción 1: Modo Desarrollo Local

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend corriendo en: http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
Frontend corriendo en: http://localhost:3000

### Opción 2: Con Docker Compose (Próximamente)

```bash
docker-compose -f docker-compose.dev.yml up
```

---

## 👥 Usuarios y Roles

El sistema maneja 5 roles con diferentes permisos:

| Rol | Permisos |
|-----|----------|
| **ADMIN** | Acceso total, gestión de usuarios, todas las unidades |
| **COORDINADOR_ARCHIVO** | Gestión de expedientes de todas las unidades, autorización de préstamos |
| **RESPONSABLE_AREA** | Gestión de expedientes de su unidad, solicitud de préstamos |
| **OPERADOR** | Captura de expedientes de su unidad |
| **CONSULTA** | Solo lectura de expedientes de su unidad |

### Credenciales de Prueba

Después de ejecutar el seed:

```
Usuario: admin
Password: Admin123!
Rol: ADMIN
```

---

## 📚 API Endpoints

### Autenticación
```
POST   /api/auth/login           # Login
POST   /api/auth/logout          # Logout
POST   /api/auth/refresh         # Refresh token
GET    /api/auth/verify          # Verificar token
```

### Expedientes
```
GET    /api/expedientes          # Listar con filtros y paginación
GET    /api/expedientes/:id      # Obtener por ID
POST   /api/expedientes          # Crear
PUT    /api/expedientes/:id      # Actualizar
DELETE /api/expedientes/:id      # Eliminar (soft delete)
GET    /api/expedientes/buscar   # Búsqueda avanzada
```

### Préstamos
```
GET    /api/prestamos                    # Listar préstamos
GET    /api/prestamos/:id                # Obtener préstamo
POST   /api/prestamos/solicitar          # Solicitar préstamo
POST   /api/prestamos/:id/autorizar      # Autorizar (Admin/Coordinador)
POST   /api/prestamos/:id/rechazar       # Rechazar (Admin/Coordinador)
POST   /api/prestamos/:id/devolver       # Devolver
GET    /api/prestamos/stats/general      # Estadísticas
```

### Usuarios
```
GET    /api/usuarios             # Listar usuarios (Admin)
GET    /api/usuarios/:id         # Obtener usuario
POST   /api/usuarios             # Crear usuario (Admin)
PUT    /api/usuarios/:id         # Actualizar (Admin)
DELETE /api/usuarios/:id         # Eliminar (Admin)
POST   /api/usuarios/:id/cambiar-password
PATCH  /api/usuarios/:id/toggle-activo
```

### Catálogos
```
GET    /api/catalogos/unidades   # Unidades administrativas
GET    /api/catalogos/secciones  # Secciones
GET    /api/catalogos/series     # Series documentales
GET    /api/catalogos/subseries  # Subseries
```

### Reportes
```
POST   /api/reportes/inventario         # Generar inventario Excel
POST   /api/reportes/inventario-pdf     # Generar inventario PDF
GET    /api/reportes/estadisticas       # Estadísticas generales
```

---

## 🧪 Testing

### Tests Unitarios Backend (Jest)

```bash
cd backend
npm test                    # Ejecutar todos los tests
npm test -- --coverage      # Con cobertura
npm test -- --watch         # Modo watch
```

**Tests implementados:**
- `auth.test.ts`: Autenticación y autorización
- `prestamos.test.ts`: Lógica de préstamos

### Tests E2E Frontend (Cypress)

```bash
cd frontend
npx cypress open            # Modo interactivo
npx cypress run             # Modo headless (CI)
npx cypress run --spec "cypress/e2e/login.cy.ts"  # Test específico
```

**Tests implementados:**
- `login.cy.ts`: Flujo de login
- `expedientes.cy.ts`: CRUD de expedientes
- `usuarios.cy.ts`: Gestión de usuarios

---

## 📊 Scripts Disponibles

### Backend

```bash
npm run dev              # Desarrollo con hot reload
npm run build            # Build para producción
npm start                # Ejecutar build de producción
npm run migrate          # Ejecutar migraciones
npm run migrate:deploy   # Deploy de migraciones (producción)
npm run migrate:reset    # Reset de base de datos
npm run prisma:generate  # Generar cliente Prisma
npm run prisma:studio    # Abrir Prisma Studio
npm run seed             # Poblar base de datos
npm test                 # Ejecutar tests
npm run lint             # Linter
npm run format           # Formatear código
```

### Frontend

```bash
npm start                # Desarrollo
npm run build            # Build para producción
npm test                 # Ejecutar tests
```

---

## 🔒 Seguridad

### Implementaciones de Seguridad

- ✅ **Autenticación JWT** con tokens de corta duración (8h)
- ✅ **Refresh tokens** con rotación
- ✅ **Bcrypt** para hash de contraseñas (10 rounds)
- ✅ **Helmet.js** para headers de seguridad
- ✅ **Rate limiting** (100 req/15min por IP)
- ✅ **CORS** configurado
- ✅ **Validación de entrada** en todos los endpoints
- ✅ **Control de acceso basado en roles (RBAC)**
- ✅ **Soft delete** para preservar datos

### Recomendaciones de Seguridad

1. **Cambiar secrets en producción**:
   ```env
   JWT_SECRET="usar-comando-openssl-rand-hex-64"
   REFRESH_TOKEN_SECRET="otro-secret-diferente"
   ```

2. **Usar HTTPS** en producción

3. **Configurar firewall** para PostgreSQL

4. **Backups automáticos** diarios

5. **Monitoreo de logs** de seguridad

---

## 🗂️ Modelo de Datos

### Entidades Principales

1. **Usuario**: Usuarios del sistema con roles
2. **UnidadAdministrativa**: 10 unidades de CCAMEM
3. **Seccion**: 9 secciones del cuadro de clasificación
4. **Serie**: 90 series documentales
5. **Subserie**: 21 subseries opcionales
6. **Expediente**: Expedientes archivísticos
7. **Legajo**: Legajos dentro de expedientes
8. **Prestamo**: Control de préstamos
9. **Transferencia**: Transferencias de expedientes
10. **Bitacora**: Auditoría de cambios

### Relaciones

- Un Expediente pertenece a una Unidad, Sección y Serie
- Un Expediente puede tener múltiples Legajos
- Un Expediente puede tener múltiples Préstamos
- Un Usuario pertenece a una Unidad
- Todas las entidades registran auditoría

---

## 📦 Despliegue a Producción

### 🚀 Deployment Rápido (Vercel + Railway)

El proyecto está configurado para deployment en:
- **Frontend:** Vercel (gratuito)
- **Backend + DB:** Railway (plan gratuito disponible)

**Guía completa:** Ver [DEPLOYMENT.md](./DEPLOYMENT.md)

### Pasos Resumidos

1. **Backend en Railway:**
   - Crear proyecto en [railway.app](https://railway.app)
   - Conectar repositorio de GitHub
   - Agregar PostgreSQL
   - Configurar variables de entorno
   - Deploy automático

2. **Frontend en Vercel:**
   - Crear proyecto en [vercel.com](https://vercel.com)
   - Importar repositorio
   - Configurar `REACT_APP_API_URL`
   - Deploy automático

3. **Configurar CORS:**
   - Actualizar `FRONTEND_URL` en Railway
   - Redeploy automático

**⏱️ Tiempo estimado:** 15-20 minutos

### Archivos de Configuración

- `vercel.json` - Configuración de Vercel
- `railway.json` - Configuración de Railway
- `Procfile` - Comandos de inicio
- `.env.production.example` - Variables de entorno de producción

### Opciones Alternativas

**Backend:**
- Railway ⭐ (Recomendado)
- Render
- Heroku
- AWS EC2/ECS
- DigitalOcean

**Frontend:**
- Vercel ⭐ (Recomendado)
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

**Base de Datos:**
- Railway PostgreSQL ⭐ (Recomendado)
- AWS RDS
- Supabase
- DigitalOcean Managed PostgreSQL

---

## 🐛 Troubleshooting

### Error: "Cannot connect to database"

```bash
# Verificar que Docker esté corriendo
docker ps

# Reiniciar contenedor de PostgreSQL
docker-compose restart postgres

# Verificar logs
docker-compose logs postgres
```

### Error: "Port 3001 already in use"

```bash
# Encontrar proceso
lsof -i :3001

# Matar proceso
kill -9 <PID>
```

### Error: "Prisma Client not generated"

```bash
cd backend
npm run prisma:generate
```

### Tests fallan

```bash
# Limpiar caché
npm test -- --clearCache

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

---

## 📖 Documentación Adicional

- **[CLAUDE.md](./CLAUDE.md)**: Guía de implementación con Claude Code
- **[CLAUDE-BACKEND.md](./CLAUDE-BACKEND.md)**: Detalles del backend
- **[CLAUDE-FRONTEND.md](./CLAUDE-FRONTEND.md)**: Detalles del frontend
- **[CLAUDE-DEPLOYMENT.md](./CLAUDE-DEPLOYMENT.md)**: Guía de deployment
- **[IMPLEMENTACION-COMPLETA.md](./IMPLEMENTACION-COMPLETA.md)**: Resumen de implementación

---

## 🤝 Contribución

### Flujo de Trabajo

1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit de cambios: `git commit -m "feat: descripción"`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abrir Pull Request

### Estándares de Código

- **TypeScript** estricto
- **ESLint** + **Prettier** configurados
- **Conventional Commits**: `feat:`, `fix:`, `docs:`, `refactor:`, etc.
- **Tests** para nuevas funcionalidades
- **Documentación** de endpoints y componentes

---

## 📄 Licencia

Este proyecto fue desarrollado para la **Comisión de Conciliación y Arbitraje Médico del Estado de México (CCAMEM)** como parte del programa de Servicio Social.

---

## 👨‍💻 Autor

**Christian Arzaluz**
Estudiante de Ingeniería en Sistemas Computacionales
Servicio Social - CCAMEM 2024-2025

---

## 📞 Soporte

Para reportar bugs o solicitar nuevas funcionalidades, por favor contactar a:

- **Email**: sistemas@ccamem.gob.mx
- **Issues**: [GitHub Issues](enlace-a-repo/issues)

---

## 🎯 Roadmap

### Versión 1.1 (Próximamente)
- [ ] API de Bitácora completa
- [ ] Módulo de Transferencias
- [ ] Notificaciones por email
- [ ] Exportación masiva mejorada

### Versión 1.2
- [ ] Notificaciones en tiempo real (WebSockets)
- [ ] Tema oscuro
- [ ] Autenticación 2FA
- [ ] Dashboard personalizable

### Versión 2.0
- [ ] Escaneo y almacenamiento de documentos
- [ ] OCR para búsqueda de contenido
- [ ] Firma electrónica
- [ ] Integración con sistemas externos

---

**Última actualización:** Octubre 2025
**Versión:** 1.0.0
