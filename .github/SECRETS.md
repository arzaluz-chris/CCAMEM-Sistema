# 🔐 Configuración de Secrets para GitHub Actions

Para que los workflows de deployment automático funcionen, necesitas configurar los siguientes secrets en GitHub.

---

## 📍 Cómo Configurar Secrets

1. Ve a tu repositorio en GitHub
2. Click en **Settings** → **Secrets and variables** → **Actions**
3. Click en **New repository secret**
4. Agrega cada secret listado abajo

---

## 🔑 Secrets Requeridos

### Para Vercel (Frontend)

#### `VERCEL_TOKEN`
**Descripción:** Token de autenticación de Vercel

**Cómo obtenerlo:**
1. Ve a [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Click en **Create Token**
3. Nombre: `GitHub Actions`
4. Scope: `Full Account`
5. Copia el token y agrégalo como secret

---

#### `VERCEL_ORG_ID`
**Descripción:** ID de tu organización/cuenta de Vercel

**Cómo obtenerlo:**
1. Ve a tu proyecto en Vercel
2. Settings → General
3. Busca **Project ID** y **Organization ID**
4. Copia el **Team ID** (o **Personal Account ID** si no tienes team)

Alternativamente, desde terminal:
```bash
# Instalar Vercel CLI
npm install -g vercel

# Hacer login
vercel login

# Vincular proyecto
cd frontend
vercel link

# El org ID estará en .vercel/project.json
cat .vercel/project.json
```

---

#### `VERCEL_PROJECT_ID`
**Descripción:** ID de tu proyecto en Vercel

**Cómo obtenerlo:**
1. Mismo método que `VERCEL_ORG_ID` arriba
2. Busca **Project ID** en Settings → General
3. O desde `.vercel/project.json` después de `vercel link`

---

### Para Railway (Backend)

Railway se despliega automáticamente via webhook de GitHub, pero necesitas estos secrets para verificación:

#### `BACKEND_URL`
**Descripción:** URL de tu backend desplegado en Railway

**Valor:**
```
https://tu-proyecto.up.railway.app
```

**Cómo obtenerlo:**
1. Ve a Railway → tu proyecto backend
2. Settings → Generate Domain
3. Copia la URL completa

---

#### `FRONTEND_URL`
**Descripción:** URL de tu frontend desplegado en Vercel

**Valor:**
```
https://tu-proyecto.vercel.app
```

**Cómo obtenerlo:**
1. Después de desplegar en Vercel
2. Copia la URL de producción
3. O usa tu dominio personalizado

---

### Opcionales (Notificaciones)

#### `SLACK_WEBHOOK`
**Descripción:** Webhook para notificaciones en Slack

**Cómo obtenerlo:**
1. Ve a [api.slack.com/apps](https://api.slack.com/apps)
2. Crea una app
3. Activa **Incoming Webhooks**
4. Crea un nuevo webhook
5. Copia la URL del webhook

---

## 📋 Checklist de Secrets

Marca los secrets que ya configuraste:

- [ ] `VERCEL_TOKEN`
- [ ] `VERCEL_ORG_ID`
- [ ] `VERCEL_PROJECT_ID`
- [ ] `BACKEND_URL`
- [ ] `FRONTEND_URL`
- [ ] `SLACK_WEBHOOK` (opcional)

---

## 🧪 Verificar Secrets

Para verificar que los secrets están configurados correctamente:

1. Ve a **Actions** en tu repositorio
2. Selecciona el workflow **Deploy to Production**
3. Click en **Run workflow**
4. Si falla, revisa los logs para identificar qué secret falta

---

## 🔒 Seguridad

**IMPORTANTE:**
- ❌ **NUNCA** compartas estos secrets públicamente
- ❌ **NUNCA** los commits en el código
- ✅ Solo configúralos en GitHub Secrets
- ✅ Rota los tokens periódicamente (cada 6 meses)
- ✅ Elimina tokens que ya no uses

---

## 📖 Ejemplo de Configuración Completa

```yaml
# Así se ven en GitHub Secrets:

VERCEL_TOKEN: ••••••••••••••••••••••••••••••••
VERCEL_ORG_ID: team_xxxxxxxxxxxxxxxxxxxx
VERCEL_PROJECT_ID: prj_xxxxxxxxxxxxxxxxxxxx
BACKEND_URL: https://ccamem-backend.up.railway.app
FRONTEND_URL: https://ccamem-sistema.vercel.app
```

---

## 🆘 Troubleshooting

### Error: "VERCEL_TOKEN is required"
→ Verifica que agregaste el secret con el nombre exacto (sensible a mayúsculas)

### Error: "Invalid Vercel token"
→ Regenera el token en Vercel y actualiza el secret

### Error: "Project not found"
→ Verifica que `VERCEL_PROJECT_ID` y `VERCEL_ORG_ID` sean correctos

### Backend health check falla
→ Verifica que `BACKEND_URL` sea la URL correcta de Railway
→ Asegúrate de que el backend esté desplegado y corriendo

---

## 📚 Recursos

- [GitHub Secrets Docs](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Vercel Tokens](https://vercel.com/docs/rest-api#creating-an-access-token)
- [Railway Docs](https://docs.railway.app)

---

**Última actualización:** Octubre 2025
