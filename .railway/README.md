# Railway Deployment Configuration

Este directorio contiene la configuración específica para Railway.

## 🚂 Railway Setup

### Quick Start

1. **Crear cuenta en Railway:**
   ```
   https://railway.app
   ```

2. **Crear nuevo proyecto:**
   - New Project → Deploy from GitHub repo
   - Seleccionar repositorio `ccamem-sistema`

3. **Agregar PostgreSQL:**
   - + New → Database → Add PostgreSQL

4. **Configurar variables de entorno:**
   Ver lista completa en `backend/.env.production.example`

### Variables de Entorno Requeridas

```bash
# Database (Railway la configura automáticamente)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT (generar con: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=<tu-secret-aqui>
REFRESH_TOKEN_SECRET=<tu-secret-aqui>
JWT_EXPIRES_IN=8h
REFRESH_TOKEN_EXPIRES_IN=7d

# Server
NODE_ENV=production
PORT=3001

# CORS (actualizar con URL de Vercel)
FRONTEND_URL=https://tu-app.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Build Command

Railway detecta automáticamente el proyecto, pero verifica que esté configurado:

```bash
cd backend && npm install && npm run prisma:generate && npm run build
```

### Start Command

```bash
cd backend && npm run migrate:deploy && npm start
```

### Health Check

Después del deploy, verifica:

```bash
curl https://tu-proyecto.up.railway.app/api/health
```

Debe responder con:
```json
{
  "success": true,
  "message": "API CCAMEM funcionando correctamente",
  "timestamp": "...",
  "environment": "production"
}
```

## 📊 Monitoreo

- **Logs:** Railway dashboard → Observability
- **Metrics:** Railway dashboard → Metrics
- **Database:** Railway dashboard → PostgreSQL

## 🔄 Actualizaciones

Railway se actualiza automáticamente cuando haces push a `main`:

```bash
git push origin main
```

## 💰 Costos

- **Plan Hobby:** $5/mes por servicio
- **Plan gratuito:** $5 de crédito mensual (~500 horas)

## 🆘 Troubleshooting

### Error: "Port already in use"
→ Railway asigna automáticamente el puerto. Asegúrate de usar `process.env.PORT`

### Error: "Cannot connect to database"
→ Verifica que la variable `DATABASE_URL` esté configurada como `${{Postgres.DATABASE_URL}}`

### Migraciones fallan
→ Ejecuta manualmente: `railway run npm run migrate:deploy`

## 📚 Recursos

- [Railway Docs](https://docs.railway.app)
- [Railway CLI](https://docs.railway.app/develop/cli)
- [Prisma + Railway](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-railway)
