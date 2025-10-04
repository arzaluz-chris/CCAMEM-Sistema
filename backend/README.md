# Backend - Sistema de Gestión Archivística CCAMEM

API REST desarrollada con Node.js, Express, TypeScript y Prisma ORM para la gestión digital del archivo de la Comisión de Conciliación y Arbitraje Médico del Estado de México.

## 🚀 Tecnologías

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Lenguaje**: TypeScript
- **ORM**: Prisma
- **Base de Datos**: PostgreSQL 14+
- **Autenticación**: JWT (JSON Web Tokens)
- **Validación**: Joi
- **Reportes**: ExcelJS
- **Seguridad**: Helmet, CORS, Rate Limiting

## 📁 Estructura del Proyecto

```
backend/
├── prisma/
│   ├── schema.prisma          # Esquema de base de datos
│   ├── seed.ts                # Datos iniciales
│   └── migrations/            # Migraciones
├── src/
│   ├── config/
│   │   └── database.ts        # Configuración de Prisma
│   ├── controllers/           # Controladores
│   │   ├── auth.controller.ts
│   │   ├── expedientes.controller.ts
│   │   ├── catalogos.controller.ts
│   │   └── reportes.controller.ts
│   ├── middleware/            # Middlewares
│   │   ├── auth.middleware.ts
│   │   └── errorHandler.ts
│   ├── routes/                # Rutas
│   │   ├── index.ts
│   │   ├── auth.routes.ts
│   │   ├── expedientes.routes.ts
│   │   ├── catalogos.routes.ts
│   │   └── reportes.routes.ts
│   ├── services/              # Lógica de negocio
│   │   ├── auth.service.ts
│   │   ├── expedientes.service.ts
│   │   ├── catalogos.service.ts
│   │   └── reportes.service.ts
│   ├── types/                 # Tipos TypeScript
│   │   └── express.d.ts
│   ├── utils/                 # Utilidades
│   │   ├── jwt.ts
│   │   └── validation.ts
│   └── server.ts              # Punto de entrada
├── .env                       # Variables de entorno
├── .env.example               # Ejemplo de variables
├── package.json
└── tsconfig.json
```

## 🔧 Instalación

### 1. Clonar el repositorio
```bash
cd backend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

### 4. Configurar base de datos

**Opción A: PostgreSQL local**
```bash
# Crear base de datos y usuario
psql postgres
CREATE USER ccamem WITH PASSWORD 'password';
CREATE DATABASE ccamem_db OWNER ccamem;
GRANT ALL PRIVILEGES ON DATABASE ccamem_db TO ccamem;
ALTER USER ccamem CREATEDB;
\q
```

**Opción B: Docker**
```bash
cd ..
docker compose up -d postgres pgadmin
```

### 5. Ejecutar migraciones
```bash
npm run prisma:generate
npx prisma migrate deploy
```

### 6. Poblar base de datos
```bash
npm run seed
```

### 7. Iniciar servidor
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3001`

## 📝 Scripts Disponibles

```bash
npm run dev              # Servidor en modo desarrollo
npm run build            # Compilar TypeScript
npm start                # Servidor en producción
npm run seed             # Poblar base de datos
npm run prisma:generate  # Generar cliente Prisma
npm run prisma:studio    # Abrir Prisma Studio
```

## 🔐 Autenticación

El sistema utiliza JWT para autenticación. Usuario administrador por defecto:

- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `admin@ccamem.gob.mx`

### Obtener Token

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Usar Token

```bash
curl http://localhost:3001/api/catalogos/unidades \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📚 API Endpoints

### Autenticación (`/api/auth`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/login` | Iniciar sesión | No |
| POST | `/refresh` | Renovar token | No |
| GET | `/profile` | Obtener perfil | Sí |
| POST | `/change-password` | Cambiar contraseña | Sí |
| POST | `/logout` | Cerrar sesión | Sí |

### Expedientes (`/api/expedientes`)

| Método | Endpoint | Descripción | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/` | Listar expedientes (paginado) | Sí | Todos |
| GET | `/:id` | Obtener expediente | Sí | Todos |
| POST | `/` | Crear expediente | Sí | ADMIN, COORDINADOR, RESPONSABLE, OPERADOR |
| PUT | `/:id` | Actualizar expediente | Sí | ADMIN, COORDINADOR, RESPONSABLE, OPERADOR |
| DELETE | `/:id` | Eliminar expediente | Sí | ADMIN |
| GET | `/search?q=texto` | Buscar expedientes | Sí | Todos |

**Parámetros de consulta para listar:**
- `page`: Número de página (default: 1)
- `limit`: Resultados por página (default: 10)
- `unidadAdministrativaId`: Filtrar por unidad
- `seccionId`: Filtrar por sección
- `serieId`: Filtrar por serie
- `estado`: Filtrar por estado (ACTIVO, CERRADO, PRESTADO, TRANSFERIDO, BAJA)
- `search`: Búsqueda en múltiples campos

### Catálogos (`/api/catalogos`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/unidades` | Obtener unidades administrativas | Sí |
| GET | `/secciones` | Obtener secciones | Sí |
| GET | `/secciones/:id/series` | Obtener series por sección | Sí |
| GET | `/series/:id/subseries` | Obtener subseries por serie | Sí |
| GET | `/estructura-completa` | Estructura jerárquica completa | Sí |
| GET | `/estadisticas` | Estadísticas generales | Sí |
| GET | `/valores-documentales` | Catálogo de valores documentales | Sí |
| GET | `/estados-expediente` | Catálogo de estados | Sí |
| GET | `/clasificaciones-info` | Catálogo de clasificaciones | Sí |

### Reportes (`/api/reportes`)

| Método | Endpoint | Descripción | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/inventario/general` | Reporte de inventario (Excel) | Sí | Todos |
| GET | `/inventario/unidad/:id` | Inventario por unidad (Excel) | Sí | Todos |
| GET | `/estadisticas` | Reporte de estadísticas (Excel) | Sí | Todos |
| GET | `/bitacora` | Reporte de bitácora (Excel) | Sí | ADMIN, COORDINADOR |

## 👥 Roles de Usuario

1. **ADMIN**: Acceso total al sistema
2. **COORDINADOR_ARCHIVO**: Gestión completa de expedientes de todas las unidades
3. **RESPONSABLE_AREA**: Gestión de expedientes de su unidad
4. **OPERADOR**: Creación y edición de expedientes de su unidad
5. **CONSULTA**: Solo lectura de expedientes de su unidad

## 📊 Modelo de Datos

### Entidades Principales

1. **UnidadAdministrativa**: 10 unidades (OC, UAA, UCSM, UP, OIC, SRSQ, SCAIG, DN, DT, DIS)
2. **Seccion**: 9 secciones (4 sustantivas: 1S-4S, 5 comunes: 1C-5C)
3. **Serie**: Series documentales relacionadas con secciones
4. **Subserie**: Subseries opcionales
5. **Usuario**: Usuarios del sistema con roles
6. **Expediente**: Expedientes con toda la información
7. **Legajo**: Legajos de los expedientes
8. **Bitacora**: Auditoría de todas las operaciones
9. **Prestamo**: Control de préstamos de expedientes
10. **Transferencia**: Control de transferencias

### Fórmula Clasificadora

Se genera automáticamente con el formato:
```
CCAMEM/{UNIDAD}/{SECCION}/{SERIE}/{SUBSERIE}/{NUM_EXPEDIENTE}
```

Ejemplo: `CCAMEM/OC/1S/001/01/2024-001`

## 🔒 Seguridad

- ✅ Autenticación JWT con expiración
- ✅ Hashing de contraseñas con bcrypt (10 rounds)
- ✅ Rate limiting para prevenir ataques
- ✅ Helmet para headers de seguridad
- ✅ CORS configurado
- ✅ Validación de datos con Joi
- ✅ Control de acceso basado en roles (RBAC)
- ✅ Auditoría completa en bitácora

## 📈 Auditoría

Todas las operaciones importantes se registran en la tabla `bitacoras`:
- Login/Logout de usuarios
- Creación, modificación y eliminación de expedientes
- Préstamos y devoluciones
- Transferencias

## 🧪 Testing

```bash
npm test
```

## 📄 Licencia

MIT

## 👨‍💻 Desarrollado por

Sistema de Gestión Archivística - CCAMEM
Estado de México
