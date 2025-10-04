# 🚀 Guía de Deployment - Sistema CCAMEM

Esta guía te llevará paso a paso para desplegar el Sistema de Gestión Archivística CCAMEM en producción usando **Vercel** (frontend) y **Railway** (backend + base de datos).

---

## 📋 Tabla de Contenidos

- [Prerequisitos](#prerequisitos)
- [Arquitectura de Deployment](#arquitectura-de-deployment)
- [Paso 1: Deployment del Backend en Railway](#paso-1-deployment-del-backend-en-railway)
- [Paso 2: Deployment del Frontend en Vercel](#paso-2-deployment-del-frontend-en-vercel)
- [Paso 3: Configuración Post-Deployment](#paso-3-configuración-post-deployment)
- [Paso 4: Verificación](#paso-4-verificación)
- [Troubleshooting](#troubleshooting)
- [Mantenimiento](#mantenimiento)

---

## Prerequisitos

Antes de comenzar, asegúrate de tener:

- ✅ Cuenta en [Railway](https://railway.app) (gratuita)
- ✅ Cuenta en [Vercel](https://vercel.com) (gratuita)
- ✅ Cuenta en GitHub
- ✅ Código del proyecto en un repositorio de GitHub
- ✅ Git instalado localmente
- ✅ Node.js 20+ instalado

---

## Arquitectura de Deployment

```
┌─────────────────────────────────────────────────────────────┐
│                         USUARIO                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL (Frontend)                        │
│  • React App compilado                                      │
│  • CDN global                                               │
│  • HTTPS automático                                         │
│  • URL: https://ccamem-sistema.vercel.app                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓ API Calls
┌─────────────────────────────────────────────────────────────┐
│                   RAILWAY (Backend)                         │
│  • Node.js + Express + TypeScript                           │
│  • API REST                                                 │
│  • URL: https://ccamem-backend.up.railway.app              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              RAILWAY POSTGRESQL (Database)                  │
│  • PostgreSQL 15                                            │
│  • Backups automáticos                                      │
│  • Persistencia garantizada                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Paso 1: Deployment del Backend en Railway

### 1.1 Crear Cuenta en Railway

1. Ve a [railway.app](https://railway.app)
2. Regístrate con tu cuenta de GitHub
3. Verifica tu email

### 1.2 Crear Nuevo Proyecto

1. Click en **"New Project"**
2. Selecciona **"Deploy from GitHub repo"**
3. Conecta tu repositorio de GitHub
4. Selecciona el repositorio `ccamem-sistema`

### 1.3 Agregar PostgreSQL

1. En tu proyecto de Railway, click en **"+ New"**
2. Selecciona **"Database"** → **"Add PostgreSQL"**
3. Railway creará automáticamente la base de datos
4. Espera a que termine de provisionar (1-2 minutos)

### 1.4 Configurar Variables de Entorno del Backend

1. Click en el servicio del backend
2. Ve a **"Variables"**
3. Agrega las siguientes variables (copia de `.env.production.example`):

```bash
# Database (Railway la configura automáticamente)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT Secrets (IMPORTANTE: Generar secretos únicos)
JWT_SECRET=<generar-con-comando-abajo>
REFRESH_TOKEN_SECRET=<generar-con-comando-abajo>
JWT_EXPIRES_IN=8h
REFRESH_TOKEN_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=production

# CORS (actualizar después con URL de Vercel)
FRONTEND_URL=https://tu-app.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Para generar secretos seguros:**
```bash
# En tu terminal local
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Ejecuta este comando 2 veces y usa los resultados para `JWT_SECRET` y `REFRESH_TOKEN_SECRET`.

### 1.5 Configurar Build y Start

Railway debería detectar automáticamente el proyecto Node.js, pero verifica:

1. Ve a **"Settings"** del servicio backend
2. En **"Build Command"**, debe estar:
   ```bash
   cd backend && npm install && npm run prisma:generate && npm run build
   ```

3. En **"Start Command"**, debe estar:
   ```bash
   cd backend && npm run migrate:deploy && npm start
   ```

4. En **"Root Directory"**, déjalo en `/` (raíz del proyecto)

### 1.6 Deploy del Backend

1. Railway debería hacer deploy automáticamente
2. Ve a **"Deployments"** para ver el progreso
3. Espera a que aparezca **"Success"** (5-10 minutos en el primer deploy)

### 1.7 Obtener URL del Backend

1. En el servicio backend, ve a **"Settings"**
2. Click en **"Generate Domain"**
3. Railway generará una URL como: `https://ccamem-backend.up.railway.app`
4. **Guarda esta URL**, la necesitarás para el frontend

### 1.8 Ejecutar Seed Inicial (SOLO PRIMERA VEZ)

**Opción 1: Desde Railway CLI**

Instala Railway CLI:
```bash
npm install -g @railway/cli
railway login
railway link
railway run cd backend && npm run seed
```

**Opción 2: Desde código**

Agrega un endpoint temporal en `backend/src/routes/index.ts`:

```typescript
// SOLO PARA PRIMERA VEZ - REMOVER DESPUÉS
router.post('/setup/seed', async (req, res) => {
  const { secret } = req.body;
  if (secret !== process.env.SEED_SECRET) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    // Ejecutar seed
    const { execSync } = require('child_process');
    execSync('npm run seed', { cwd: './backend' });
    res.json({ success: true, message: 'Seed ejecutado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

Agrega variable `SEED_SECRET` en Railway y llama al endpoint con Postman/curl.

---

## Paso 2: Deployment del Frontend en Vercel

### 2.1 Crear Cuenta en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Regístrate con tu cuenta de GitHub

### 2.2 Importar Proyecto

1. Click en **"Add New..."** → **"Project"**
2. Importa tu repositorio `ccamem-sistema` desde GitHub
3. Vercel detectará automáticamente que es un proyecto React

### 2.3 Configurar Build Settings

1. **Framework Preset**: Create React App
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `build`
5. **Install Command**: `npm install`

### 2.4 Configurar Variables de Entorno

En **"Environment Variables"**, agrega:

```bash
REACT_APP_API_URL=https://tu-backend.up.railway.app/api
REACT_APP_TIMEOUT=30000
REACT_APP_TITLE=Sistema de Gestión Archivística CCAMEM
REACT_APP_ENV=production
```

**IMPORTANTE:** Reemplaza `https://tu-backend.up.railway.app` con la URL real de Railway del paso 1.7.

### 2.5 Deploy

1. Click en **"Deploy"**
2. Espera a que termine el build (3-5 minutos)
3. Una vez completado, Vercel te dará una URL como: `https://ccamem-sistema.vercel.app`

### 2.6 Configurar Dominio Personalizado (Opcional)

1. Ve a **"Settings"** → **"Domains"**
2. Agrega tu dominio personalizado (ej: `sistema.ccamem.gob.mx`)
3. Configura los DNS según las instrucciones de Vercel

---

## Paso 3: Configuración Post-Deployment

### 3.1 Actualizar CORS en Backend

1. Ve a Railway → Backend → Variables
2. Actualiza `FRONTEND_URL` con la URL real de Vercel:
   ```
   FRONTEND_URL=https://ccamem-sistema.vercel.app
   ```
3. Guarda y espera a que se redeploy automáticamente

### 3.2 Verificar Conexión

1. Abre la URL del frontend en Vercel
2. Intenta hacer login con:
   - **Username:** `admin`
   - **Password:** `Admin123!`
3. Si funciona, ¡deployment exitoso! 🎉

### 3.3 Cambiar Contraseña del Admin

**IMPORTANTE:** Cambia la contraseña por defecto inmediatamente:

1. Inicia sesión como admin
2. Ve a tu perfil
3. Cambia la contraseña

---

## Paso 4: Verificación

### Checklist de Verificación

- [ ] Backend responde en `/api/health`
- [ ] Frontend carga correctamente
- [ ] Login funciona
- [ ] Dashboard muestra datos
- [ ] CRUD de expedientes funciona
- [ ] No hay errores en la consola del navegador
- [ ] No hay errores en logs de Railway
- [ ] HTTPS está activo (candado verde)

### URLs de Verificación

```bash
# Health check del backend
curl https://tu-backend.up.railway.app/api/health

# Debe responder:
{
  "success": true,
  "message": "API CCAMEM funcionando correctamente",
  "timestamp": "2025-10-04T...",
  "environment": "production"
}
```

---

## Troubleshooting

### Error: "Cannot connect to API"

**Causa:** Frontend no puede comunicarse con el backend.

**Solución:**
1. Verifica que `REACT_APP_API_URL` en Vercel esté correcto
2. Verifica que `FRONTEND_URL` en Railway esté correcto
3. Verifica que el backend esté corriendo (Railway Deployments)
4. Revisa logs en Railway para errores

### Error: "Database connection failed"

**Causa:** Backend no puede conectar a PostgreSQL.

**Solución:**
1. Verifica que `DATABASE_URL` esté configurada en Railway
2. Asegúrate de que la variable sea `${{Postgres.DATABASE_URL}}`
3. Verifica que PostgreSQL esté corriendo en Railway
4. Revisa logs de Railway

### Error: "Prisma migration failed"

**Causa:** Migraciones de base de datos no se ejecutaron.

**Solución:**
```bash
# Desde Railway CLI
railway run cd backend && npm run migrate:deploy
```

### Error: "Module not found" en Vercel

**Causa:** Dependencias no instaladas correctamente.

**Solución:**
1. Ve a Vercel → Settings → General
2. Cambia Node.js version a **20.x**
3. Redeploy desde Deployments

### Frontend muestra página en blanco

**Causa:** Error de build o variables de entorno.

**Solución:**
1. Ve a Vercel → Deployments → Build Logs
2. Busca errores
3. Verifica que todas las variables `REACT_APP_*` estén configuradas
4. Redeploy

---

## Mantenimiento

### Actualizaciones de Código

**Automático (Recomendado):**
- Al hacer `git push` a `main`, ambos servicios se redesplegarán automáticamente
- Railway y Vercel están conectados a GitHub

**Manual:**
1. **Railway:** Deployments → Redeploy
2. **Vercel:** Deployments → Redeploy

### Backups de Base de Datos

Railway hace backups automáticos, pero puedes hacer backups manuales:

```bash
# Desde Railway CLI
railway run pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

### Monitoreo

**Railway:**
- Ve a "Observability" para ver logs y métricas
- Configura alertas en "Settings"

**Vercel:**
- Ve a "Analytics" para ver tráfico
- Ve a "Logs" para ver errores

### Actualizar Variables de Entorno

1. Modifica en Railway o Vercel según corresponda
2. El servicio se redesplegará automáticamente
3. Verifica que todo funcione después del redeploy

### Escalamiento

**Railway:**
- Plan gratuito: 500 hrs/mes, $5 de crédito
- Plan Pro: $20/mes, recursos ilimitados

**Vercel:**
- Plan gratuito: 100 GB bandwidth/mes
- Plan Pro: $20/mes, bandwidth ilimitado

---

## Costos Estimados

### Opción 1: Gratuito (Desarrollo/Pruebas)
- **Railway:** Plan gratuito ($5 crédito/mes)
- **Vercel:** Plan gratuito
- **Total:** $0/mes (con límites)

### Opción 2: Producción Básica
- **Railway:** Plan Hobby ($5/mes)
- **Vercel:** Plan gratuito
- **Total:** ~$5/mes

### Opción 3: Producción Profesional
- **Railway:** Plan Pro ($20/mes)
- **Vercel:** Plan Pro ($20/mes)
- **Total:** ~$40/mes

---

## Comandos Útiles

```bash
# Railway CLI
npm install -g @railway/cli
railway login
railway link
railway logs                 # Ver logs
railway run <comando>        # Ejecutar comando en producción
railway shell               # Abrir shell

# Vercel CLI
npm install -g vercel
vercel login
vercel                      # Deploy manual
vercel logs                 # Ver logs
vercel env ls               # Listar variables de entorno
```

---

## Recursos Adicionales

- [Documentación de Railway](https://docs.railway.app)
- [Documentación de Vercel](https://vercel.com/docs)
- [Prisma Deploy](https://www.prisma.io/docs/guides/deployment)

---

## Soporte

Si encuentras problemas durante el deployment:

1. Revisa los logs en Railway y Vercel
2. Verifica el checklist de troubleshooting
3. Abre un issue en el repositorio de GitHub
4. Contacta a: sistemas@ccamem.gob.mx

---

**✅ ¡Deployment Completado!**

Tu sistema ahora está en producción y accesible globalmente. 🚀
