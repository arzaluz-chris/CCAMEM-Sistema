# Sistema de Gestión Archivística CCAMEM

Sistema web para la gestión digital del registro y consulta de archivos de la Comisión de Conciliación y Arbitraje Médico del Estado de México (CCAMEM).

## 🏗️ Arquitectura

- **Frontend**: React 18 + TypeScript + Material-UI v5
- **Backend**: Node.js + Express + TypeScript + Prisma ORM
- **Base de Datos**: PostgreSQL 15
- **Autenticación**: JWT
- **Reportes**: ExcelJS + jsPDF

## 📁 Estructura del Proyecto

```
ccamem-sistema/
├── backend/                    # API Node.js + Express
│   ├── src/                   # Código fuente
│   │   ├── controllers/       # Controladores de rutas
│   │   ├── middleware/        # Middleware de autenticación
│   │   ├── routes/            # Definición de rutas
│   │   ├── services/          # Lógica de negocio
│   │   └── server.ts          # Punto de entrada
│   ├── prisma/
│   │   ├── schema.prisma      # Modelo de datos
│   │   └── seed.ts            # Datos iniciales
│   └── package.json
├── frontend_backup/           # Frontend React
│   ├── src/
│   │   ├── components/        # Componentes reutilizables
│   │   ├── pages/             # Páginas principales
│   │   ├── services/          # Servicios API
│   │   └── App.tsx
│   └── package.json
└── README.md
```

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 18+
- PostgreSQL 15+
- npm o yarn

### Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de base de datos

# Ejecutar migraciones
npx prisma migrate deploy

# Poblar datos iniciales
npm run seed

# Compilar TypeScript
npm run build

# Iniciar servidor
npm start

# Servidor disponible en http://localhost:3001
```

### Frontend

```bash
cd frontend_backup

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start

# Aplicación disponible en http://localhost:3000
```

## 📝 Variables de Entorno

### Backend (.env)

```env
DATABASE_URL="postgresql://usuario@localhost:5432/ccamem_archivo"
JWT_SECRET="tu-secret-super-seguro"
JWT_EXPIRES_IN="8h"
PORT=3001
NODE_ENV=development
```

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_TITLE="Sistema de Gestión Archivística CCAMEM"
```

## 🔑 Credenciales de Acceso por Defecto

```
Admin:        admin / admin123
Coordinador:  coord.archivo / coord123
Responsable:  resp.oc / resp123
```

## 📊 Cuadro de Clasificación Archivística

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

## 🔧 Comandos Útiles

### Backend

```bash
# Desarrollo con hot reload
npm run dev

# Compilar
npm run build

# Tests
npm test

# Prisma
npx prisma studio           # Interfaz gráfica
npx prisma migrate dev      # Crear migración
npx prisma generate         # Generar cliente
```

### Frontend

```bash
# Desarrollo
npm start

# Build producción
npm run build

# Tests
npm test
```

## 📝 Formato de Inventarios

### Inventario General
```
NO. PROGRESIVO | NO. DEL EXPEDIENTE | SECCIÓN Y/O SUBSECCIÓN | SERIE Y/O SUBSERIE | FÓRMULA CLASIFICADORA | NOMBRE DEL EXPEDIENTE | TOTAL DE LEGAJOS | TOTAL DE DOCS | FECHA PRIMERO | FECHA ÚLTIMO | UBICACIÓN FÍSICA | OBSERVACIONES
```

### Inventario UAA
```
Sección | Serie | Subserie | Nombre | Total de Fojas | Legajos | Fecha de inicio | Fecha de Cierre | No. De Caja | Prestado a /Fecha | Devolución
```

## ⚙️ Notas Importantes

- **Legajos**: Se calculan automáticamente (180 fojas por legajo)
- **Fórmula Clasificadora**: Se genera automáticamente según formato CCAMEM/SECCIÓN/SERIE/SUBSERIE/EXP
- **Tiempo de Conservación**: Por defecto "Archivo de Trámite"
- **Número de Expediente**: Debe ser único por unidad administrativa

## 🔐 Seguridad

- JWT con expiración de 8 horas
- Hash de contraseñas con bcrypt (10 rounds)
- Validación de roles y permisos
- CORS configurado para frontend

## 📌 Estado del Proyecto

✅ Sistema funcional y probado
✅ Backend API operativo
✅ Frontend React funcionando
✅ Base de datos con seed de datos
✅ Autenticación JWT implementada
✅ Formulario de expedientes actualizado

## 📖 Más Información

Para detalles adicionales, consulta el README.md principal del proyecto.
