# CCAMEM - Frontend del Sistema de Gestión Archivística

Sistema web para la gestión digital del registro y consulta de archivos de la Comisión de Conciliación y Arbitraje Médico del Estado de México (CCAMEM).

## 🚀 Tecnologías

- **React 18** con TypeScript
- **Material-UI v5** para la interfaz de usuario
- **React Hook Form** para manejo de formularios
- **Day.js** para manejo de fechas
- **Axios** para peticiones HTTP
- **Notistack** para notificaciones

## 📋 Características del Formulario de Expedientes

El formulario de captura de expedientes sigue el orden específico requerido:

1. **Nombre del Expediente** - Generalmente la fórmula clasificadora (ej: CCAMEM/TOL/A/1003/2025)
2. **Número de Legajo** - Número del legajo actual (ej: 1 de 1, 1 de 2, etc.)
3. **Total de Legajos** - Calculado automáticamente (1 legajo cada 180 documentos)
4. **Asunto** - Descripción del asunto (ej: Asesoría, Gestión Inmediata)
5. **Fecha de Apertura** - Fecha del primer documento
6. **Fecha de Cierre** - Fecha del último documento (opcional)
7. **Total de Documentos** - Cantidad total de documentos
8. **Fondo Documental** - Por defecto: CCAMEM
9. **Sección Documental** - Sección del cuadro de clasificación
10. **Serie Documental** - Serie documental (dependiente de la sección)
11. **Subserie Documental** - Subserie (opcional, dependiente de la serie)
12. **Tiempo de Conservación** - Por defecto: "Archivo de trámite"

### Lógica Automática

El sistema calcula automáticamente el total de legajos basándose en el total de documentos:

- **1 legajo** = hasta 180 documentos
- **2 legajos** = 181-360 documentos
- **3 legajos** = 361-540 documentos
- Y así sucesivamente...

**Ejemplo:**
- 560 documentos → 4 legajos automáticamente
- 180 documentos → 1 legajo
- 200 documentos → 2 legajos

## 🛠️ Instalación

1. Instalar dependencias:

```bash
npm install
```

2. Configurar variables de entorno:

Copia el archivo `.env` y ajusta las variables según tu entorno:

```bash
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_TITLE=Sistema de Gestión Archivística CCAMEM
REACT_APP_VERSION=1.0.0
REACT_APP_TIMEOUT=30000
```

3. Iniciar el servidor de desarrollo:

```bash
npm start
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 📦 Scripts Disponibles

- `npm start` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm test` - Ejecuta las pruebas
- `npm run eject` - Expone la configuración de Create React App (irreversible)

## 📁 Estructura del Proyecto

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/        # Componentes reutilizables
│   ├── pages/            # Páginas de la aplicación
│   │   └── Expedientes/  # Módulo de expedientes
│   │       └── ExpedienteForm.tsx  # Formulario principal
│   ├── services/         # Servicios de API
│   │   ├── api.ts       # Configuración de Axios
│   │   └── expedientes.service.ts  # Servicio de expedientes
│   ├── types/           # Definiciones de TypeScript
│   │   └── expediente.types.ts
│   ├── App.tsx          # Componente principal
│   ├── index.tsx        # Punto de entrada
│   └── theme.ts         # Tema de Material-UI
├── .env                 # Variables de entorno
├── package.json
└── tsconfig.json
```

## 🔗 Integración con Backend

El frontend se conecta al backend a través de la API REST:

- **Base URL**: `http://localhost:3001/api` (configurable en `.env`)
- **Endpoints principales**:
  - `POST /api/expedientes` - Crear expediente
  - `GET /api/expedientes/:id` - Obtener expediente
  - `PUT /api/expedientes/:id` - Actualizar expediente
  - `GET /api/catalogos/unidades` - Obtener unidades administrativas
  - `GET /api/catalogos/secciones` - Obtener secciones
  - `GET /api/catalogos/series/:seccionId` - Obtener series por sección
  - `GET /api/catalogos/subseries/:serieId` - Obtener subseries por serie

## 📊 Formato de Inventario

El sistema genera inventarios en Excel con el siguiente formato:

```
NO. PROGRESIVO | NO. DEL EXPEDIENTE | SECCIÓN | SERIE | FÓRMULA CLASIFICADORA | NOMBRE | TOTAL DE LEGAJOS | TOTAL DE DOCS | FECHA PRIMERO | FECHA ÚLTIMO | UBICACIÓN | OBSERVACIONES
```

**Ejemplo:**
```
23094 | 0001 | 1S | 1S.3.2 Asesoría | CCAMEM/1S/1S.3/1S.3.2/E0001 | CCAMEM/TOL/A/0001/2025 | 1 | 4 | 02/01/25 | 02/01/25 | SRSQ | NINGUNA
```

## 🎨 Personalización

El tema de Material-UI está configurado con los colores institucionales de CCAMEM:

- **Color Principal**: #8B1538 (Guinda institucional)
- **Color Secundario**: #757575
- **Fondo**: #F5F5F5

Puedes modificar el tema en `src/theme.ts`

## 📝 Notas Importantes

1. El formulario valida que los campos requeridos estén completos antes de enviar
2. Los selects de Serie y Subserie son dependientes (en cascada)
3. El cálculo de legajos se actualiza automáticamente al cambiar el total de documentos
4. Las fechas se manejan en formato DD/MM/YYYY
5. El sistema muestra notificaciones (snackbar) para confirmar acciones y errores

## 🔧 Solución de Problemas

### El formulario no carga los catálogos

Verifica que el backend esté ejecutándose y que la URL de la API en `.env` sea correcta.

### Error de CORS

Asegúrate de que el backend tenga configurado CORS para permitir peticiones desde `http://localhost:3000`

### Las series/subseries no se cargan

Verifica que:
1. Hayas seleccionado primero una sección (para series)
2. Hayas seleccionado primero una serie (para subseries)
3. El backend tenga datos en los catálogos

## 📄 Licencia

Sistema desarrollado para la Comisión de Conciliación y Arbitraje Médico del Estado de México (CCAMEM)
