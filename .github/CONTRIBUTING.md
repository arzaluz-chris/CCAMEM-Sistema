# Guía de Contribución

¡Gracias por tu interés en contribuir al Sistema de Gestión Archivística CCAMEM!

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Cómo Contribuir](#cómo-contribuir)
- [Flujo de Trabajo Git](#flujo-de-trabajo-git)
- [Estándares de Código](#estándares-de-código)
- [Commits](#commits)
- [Pull Requests](#pull-requests)
- [Testing](#testing)

---

## Código de Conducta

Este proyecto se adhiere a un código de conducta profesional. Al participar, se espera que mantengas un ambiente respetuoso y colaborativo.

---

## Cómo Contribuir

### 1. Fork del Repositorio

```bash
git clone https://github.com/YOUR-USERNAME/ccamem-sistema.git
cd ccamem-sistema
```

### 2. Crear una Rama

```bash
git checkout -b feature/nueva-funcionalidad
# o
git checkout -b fix/correccion-bug
```

### 3. Realizar Cambios

Realiza tus cambios siguiendo los [Estándares de Código](#estándares-de-código).

### 4. Ejecutar Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### 5. Commit de Cambios

```bash
git add .
git commit -m "feat: descripción del cambio"
```

### 6. Push y Pull Request

```bash
git push origin feature/nueva-funcionalidad
```

Luego abre un Pull Request en GitHub.

---

## Flujo de Trabajo Git

### Ramas Principales

- **main**: Código en producción
- **develop**: Rama de desarrollo activo

### Ramas de Trabajo

- **feature/**: Nuevas funcionalidades
  - Ejemplo: `feature/modulo-transferencias`
- **fix/**: Corrección de bugs
  - Ejemplo: `fix/validacion-expedientes`
- **docs/**: Documentación
  - Ejemplo: `docs/api-documentation`
- **refactor/**: Refactorización de código
  - Ejemplo: `refactor/auth-middleware`
- **test/**: Agregar o actualizar tests
  - Ejemplo: `test/expedientes-controller`

---

## Estándares de Código

### TypeScript

- Usar TypeScript estricto
- Definir tipos explícitos
- Evitar `any` siempre que sea posible
- Documentar funciones públicas con JSDoc

```typescript
/**
 * Obtiene un expediente por ID
 * @param id - ID del expediente
 * @returns Promise con el expediente encontrado
 * @throws {Error} Si el expediente no existe
 */
async function obtenerExpediente(id: string): Promise<Expediente> {
  // ...
}
```

### ESLint y Prettier

El código debe pasar las validaciones de ESLint y Prettier:

```bash
# Backend
cd backend
npm run lint
npm run format

# Frontend
cd frontend
npm run lint
```

### Naming Conventions

- **Variables y funciones**: camelCase
  - `const nombreUsuario = "Juan"`
  - `function obtenerExpediente() {}`
- **Clases e Interfaces**: PascalCase
  - `class ExpedienteService {}`
  - `interface Usuario {}`
- **Constantes**: UPPER_SNAKE_CASE
  - `const API_BASE_URL = "..."`
- **Archivos**: kebab-case o PascalCase según tipo
  - Componentes: `ExpedienteForm.tsx`
  - Servicios: `expedientes.service.ts`
  - Utils: `format-date.ts`

---

## Commits

### Conventional Commits

Usamos el estándar [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<alcance>): <descripción>

[cuerpo opcional]

[pie(s) opcional(es)]
```

#### Tipos de Commit

- **feat**: Nueva funcionalidad
  - `feat(expedientes): agregar búsqueda avanzada`
- **fix**: Corrección de bug
  - `fix(auth): corregir validación de token`
- **docs**: Documentación
  - `docs(readme): actualizar guía de instalación`
- **style**: Cambios de formato (no afectan lógica)
  - `style(components): formatear código con prettier`
- **refactor**: Refactorización de código
  - `refactor(services): simplificar lógica de préstamos`
- **perf**: Mejoras de rendimiento
  - `perf(database): optimizar query de expedientes`
- **test**: Agregar o actualizar tests
  - `test(controllers): agregar tests de bitácora`
- **build**: Cambios en build o dependencias
  - `build(deps): actualizar prisma a v5.7`
- **ci**: Cambios en CI/CD
  - `ci(github): agregar workflow de deployment`
- **chore**: Tareas de mantenimiento
  - `chore(scripts): actualizar script de seed`

#### Ejemplos de Buenos Commits

```bash
feat(bitacora): implementar API de auditoría
fix(prestamos): corregir cálculo de fecha de devolución
docs(api): documentar endpoints de bitácora
test(expedientes): agregar tests de integración
refactor(auth): extraer lógica de JWT a servicio separado
```

---

## Pull Requests

### Checklist de PR

Antes de crear un PR, verifica:

- [ ] El código pasa todos los tests
- [ ] El código sigue los estándares de estilo
- [ ] Has agregado/actualizado tests si es necesario
- [ ] Has actualizado la documentación si es necesario
- [ ] El PR tiene un título descriptivo (Conventional Commits)
- [ ] Has agregado una descripción clara del cambio
- [ ] No hay conflictos con la rama base

### Plantilla de PR

```markdown
## Descripción

Breve descripción del cambio realizado.

## Tipo de Cambio

- [ ] Bug fix
- [ ] Nueva funcionalidad
- [ ] Cambio que rompe compatibilidad
- [ ] Documentación

## ¿Cómo se ha probado?

Describe cómo probaste tus cambios.

## Checklist

- [ ] Mi código sigue los estándares del proyecto
- [ ] He realizado una auto-revisión de mi código
- [ ] He comentado mi código en áreas complejas
- [ ] He actualizado la documentación
- [ ] Mis cambios no generan nuevas advertencias
- [ ] He agregado tests que prueban mi funcionalidad
- [ ] Tests unitarios y de integración pasan localmente
```

### Revisión de Código

- Mínimo 1 aprobación antes de merge
- Responder a comentarios de manera constructiva
- Realizar cambios solicitados
- CI/CD debe pasar exitosamente

---

## Testing

### Backend (Jest)

```bash
cd backend

# Ejecutar todos los tests
npm test

# Ejecutar con coverage
npm test -- --coverage

# Ejecutar tests específicos
npm test -- auth.test.ts

# Modo watch
npm test -- --watch
```

### Frontend (React Testing Library + Cypress)

```bash
cd frontend

# Tests unitarios
npm test

# Tests E2E
npx cypress open    # Modo interactivo
npx cypress run     # Modo headless
```

### Cobertura Mínima

- Backend: 70% de cobertura
- Frontend: 60% de cobertura

---

## Estructura de Archivos

Al agregar nuevos archivos, sigue la estructura existente:

```
backend/
├── src/
│   ├── controllers/    # Lógica de controladores
│   ├── routes/         # Definición de rutas
│   ├── services/       # Lógica de negocio
│   ├── middleware/     # Middleware personalizado
│   ├── types/          # Tipos TypeScript
│   └── __tests__/      # Tests

frontend/
├── src/
│   ├── components/     # Componentes reutilizables
│   ├── pages/          # Páginas/Vistas
│   ├── services/       # Servicios API
│   ├── store/          # Redux store
│   └── types/          # Tipos TypeScript
```

---

## Reporte de Bugs

### Antes de Reportar

1. Verifica que no exista un issue similar
2. Asegúrate de estar usando la última versión
3. Reproduce el bug en un ambiente limpio

### Información a Incluir

- Versión de Node.js y npm
- Sistema operativo
- Pasos para reproducir el bug
- Comportamiento esperado vs. actual
- Screenshots/logs si aplica
- Código de ejemplo mínimo

---

## Preguntas

Si tienes preguntas sobre cómo contribuir:

- Abre un issue con la etiqueta `question`
- Contacta al equipo: sistemas@ccamem.gob.mx

---

**¡Gracias por contribuir al proyecto! 🚀**
