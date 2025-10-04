# Changelog

Todos los cambios notables del proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto se adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2025-10-04

### 🎉 Lanzamiento Inicial

Primera versión funcional del Sistema de Gestión Archivística CCAMEM.

### ✨ Agregado

#### Backend
- Sistema de autenticación con JWT y refresh tokens
- CRUD completo de expedientes con validación
- Sistema de préstamos con workflow de autorización
- API de bitácora para auditoría completa
- Gestión de usuarios con 5 roles diferentes
- Catálogos de unidades administrativas, secciones, series y subseries
- Generación de reportes en Excel y PDF
- Migraciones de base de datos con Prisma
- Seed inicial con datos de ejemplo
- Tests unitarios con Jest
- Middleware de autenticación y autorización
- Rate limiting y seguridad con Helmet
- Manejo global de errores

#### Frontend
- Interfaz de login con Material-UI
- Dashboard con estadísticas y gráficas (Recharts)
- Formulario completo de expedientes con validación
- Tabla de inventario con paginación, filtros y búsqueda
- Vista detallada de expedientes con tabs:
  - Información general
  - Legajos
  - Préstamos
  - Bitácora (timeline interactivo)
- Diálogos para solicitar y devolver préstamos
- Módulo de gestión de usuarios (CRUD completo)
- Servicios API con Axios e interceptors
- Estado global con Redux Toolkit
- Tests E2E con Cypress
- Routing con React Router
- Notificaciones con Notistack

#### DevOps
- Docker Compose para desarrollo local
- Variables de entorno configurables
- GitHub Actions CI/CD:
  - Tests automáticos backend y frontend
  - Linting y formateo de código
  - Build de producción
  - Análisis de seguridad
  - CodeQL para detección de vulnerabilidades
  - Workflow de deployment
  - Checks de Pull Request
- Badges de status en README

#### Documentación
- README.md completo con instrucciones detalladas
- CONTRIBUTING.md con guía de contribución
- CLAUDE.md con prompts para desarrollo
- Documentación de API en código
- Ejemplos de uso

### 🔒 Seguridad
- Autenticación JWT con expiración
- Hash de contraseñas con bcrypt (10 rounds)
- CORS configurado
- Rate limiting (100 req/15min)
- Headers de seguridad con Helmet
- Validación de entrada en todos los endpoints
- Control de acceso basado en roles (RBAC)
- Auditoría completa de acciones

### 📊 Modelo de Datos
- 10 Unidades Administrativas
- 9 Secciones (Sustantivas y Comunes)
- 90 Series documentales
- 21 Subseries
- Expedientes con clasificación archivística completa
- Legajos asociados a expedientes
- Préstamos con workflow de autorización
- Bitácora de auditoría
- Sistema de usuarios y roles

---

## [Unreleased]

### 🚧 Pendiente
- API completa de transferencias
- Notificaciones por email
- Notificaciones en tiempo real (WebSockets)
- Tema oscuro
- Autenticación de 2 factores (2FA)
- Exportación masiva mejorada
- Cache con Redis
- Monitoreo con Sentry
- Backups automáticos
- Deployment a producción
- API Documentation con Swagger

---

## Tipos de Cambios

- `Agregado` - Nuevas funcionalidades
- `Cambiado` - Cambios en funcionalidad existente
- `Deprecado` - Funcionalidades que serán removidas
- `Removido` - Funcionalidades removidas
- `Corregido` - Corrección de bugs
- `Seguridad` - Vulnerabilidades corregidas

---

**Última actualización:** Octubre 2025
