# Deployment Guide - Sistema de Gestión Archivística CCAMEM

## 🐳 Docker Configuration

### PROMPT 1: CREAR DOCKER-COMPOSE COMPLETO

```
Crea docker-compose.yml en la raíz del proyecto con los siguientes servicios:

docker-compose.yml:
```yaml
version: '3.8'

services:
  # Base de datos PostgreSQL
  postgres:
    image: postgres:15-alpine
    container_name: ccamem_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ccamem_db
      POSTGRES_USER: ccamem_user
      POSTGRES_PASSWORD: ${DB_PASSWORD:-SecurePassword123!}
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/prisma/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    networks:
      - ccamem_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ccamem_user -d ccamem_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  # pgAdmin para gestión de BD
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: ccamem_pgadmin
    restart: unless-stopped
    environment:
      PGADMIN_DEFAULT_EMAIL: ${PGADMIN_EMAIL:-admin@ccamem.gob.mx}
      PGADMIN_DEFAULT_PASSWORD: ${PGADMIN_PASSWORD:-Admin123!}
      PGADMIN_CONFIG_SERVER_MODE: 'False'
    volumes:
      - pgadmin_data:/var/lib/pgadmin
    ports:
      - "5050:80"
    networks:
      - ccamem_network
    depends_on:
      - postgres

  # Redis para cache y sesiones
  redis:
    image: redis:7-alpine
    container_name: ccamem_redis
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD:-RedisPass123!}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - ccamem_network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: ccamem_backend
    restart: unless-stopped
    environment:
      NODE_ENV: ${NODE_ENV:-production}
      PORT: 3001
      DATABASE_URL: postgresql://ccamem_user:${DB_PASSWORD:-SecurePassword123!}@postgres:5432/ccamem_db
      JWT_SECRET: ${JWT_SECRET:-your-super-secret-jwt-key-change-in-production}
      JWT_EXPIRES_IN: 8h
      REFRESH_TOKEN_SECRET: ${REFRESH_TOKEN_SECRET:-your-refresh-token-secret}
      REDIS_URL: redis://:${REDIS_PASSWORD:-RedisPass123!}@redis:6379
      FRONTEND_URL: ${FRONTEND_URL:-http://localhost:3000}
      UPLOAD_DIR: /app/uploads
    volumes:
      - ./backend:/app
      - /app/node_modules
      - uploads_data:/app/uploads
      - logs_data:/app/logs
    ports:
      - "3001:3001"
    networks:
      - ccamem_network
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    command: >
      sh -c "
        npx prisma migrate deploy &&
        npx prisma generate &&
        npm run start:prod
      "

  # Frontend React
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        REACT_APP_API_URL: ${REACT_APP_API_URL:-http://localhost:3001/api}
    container_name: ccamem_frontend
    restart: unless-stopped
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "3000:80"
    networks:
      - ccamem_network
    depends_on:
      - backend

  # Nginx Reverse Proxy (Producción)
  nginx:
    image: nginx:alpine
    container_name: ccamem_nginx
    restart: unless-stopped
    profiles: ["production"]
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./ssl:/etc/nginx/ssl
      - nginx_cache:/var/cache/nginx
    ports:
      - "80:80"
      - "443:443"
    networks:
      - ccamem_network
    depends_on:
      - frontend
      - backend

  # Backup Service
  backup:
    image: postgres:15-alpine
    container_name: ccamem_backup
    profiles: ["backup"]
    environment:
      PGPASSWORD: ${DB_PASSWORD:-SecurePassword123!}
    volumes:
      - ./backups:/backups
    networks:
      - ccamem_network
    command: >
      sh -c "
        while true; do
          BACKUP_FILE=/backups/ccamem_backup_$$(date +%Y%m%d_%H%M%S).sql
          pg_dump -h postgres -U ccamem_user -d ccamem_db > $$BACKUP_FILE
          gzip $$BACKUP_FILE
          find /backups -name '*.sql.gz' -mtime +30 -delete
          sleep 86400
        done
      "
    depends_on:
      - postgres

networks:
  ccamem_network:
    driver: bridge

volumes:
  postgres_data:
  pgadmin_data:
  redis_data:
  uploads_data:
  logs_data:
  nginx_cache:
```

### PROMPT 2: CREAR DOCKERFILES

```
Crea los Dockerfiles para backend y frontend:

backend/Dockerfile:
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Build de la aplicación
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Instalar dumb-init para manejo de señales
RUN apk add --no-cache dumb-init

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copiar archivos necesarios desde builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma

# Crear directorios necesarios
RUN mkdir -p uploads logs && \
    chown -R nodejs:nodejs uploads logs

# Cambiar a usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 3001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)})"

# Usar dumb-init para manejar señales correctamente
ENTRYPOINT ["dumb-init", "--"]

# Comando de inicio
CMD ["node", "dist/server.js"]
```

frontend/Dockerfile:
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Argumentos de build
ARG REACT_APP_API_URL
ARG REACT_APP_TITLE="Sistema de Gestión Archivística CCAMEM"

# Variables de entorno para build
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_TITLE=$REACT_APP_TITLE

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Build de producción
RUN npm run build

# Production stage con nginx
FROM nginx:alpine

# Copiar build de React
COPY --from=builder /app/build /usr/share/nginx/html

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Script para reemplazar variables de entorno en runtime
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Exponer puerto
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
```

frontend/nginx.conf:
```nginx
server {
    listen 80;
    server_name localhost;
    
    root /usr/share/nginx/html;
    index index.html;
    
    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Cache de assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API Proxy
    location /api {
        proxy_pass http://backend:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # React Router
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
}
```

frontend/docker-entrypoint.sh:
```bash
#!/bin/sh
set -eu

# Reemplazar variables de entorno en archivos JS
find /usr/share/nginx/html -name '*.js' -exec sed -i \
  -e "s|REACT_APP_API_URL_PLACEHOLDER|${REACT_APP_API_URL}|g" \
  {} \;

exec "$@"
```

### PROMPT 3: CREAR ARCHIVO DE VARIABLES DE ENTORNO

```
Crea archivos de configuración de entorno:

.env.example:
```env
# Environment
NODE_ENV=production

# Database
DB_PASSWORD=SecurePassword123!
PGADMIN_EMAIL=admin@ccamem.gob.mx
PGADMIN_PASSWORD=Admin123!

# Redis
REDIS_PASSWORD=RedisPass123!

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=8h
REFRESH_TOKEN_SECRET=your-refresh-token-secret-key
REFRESH_TOKEN_EXPIRES_IN=7d

# Frontend
REACT_APP_API_URL=http://localhost:3001/api
FRONTEND_URL=http://localhost:3000

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notificaciones@ccamem.gob.mx
SMTP_PASS=your-email-password

# Storage
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# SSL (producción)
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/key.pem
```

.env.development:
```env
NODE_ENV=development
DB_PASSWORD=DevPassword123
JWT_SECRET=development-secret-key
REDIS_PASSWORD=RedisDevPass
REACT_APP_API_URL=http://localhost:3001/api
```

.env.production:
```env
NODE_ENV=production
DB_PASSWORD=${DB_PASSWORD}
JWT_SECRET=${JWT_SECRET}
REDIS_PASSWORD=${REDIS_PASSWORD}
REACT_APP_API_URL=https://archivo.ccamem.gob.mx/api
FRONTEND_URL=https://archivo.ccamem.gob.mx
```

### PROMPT 4: CREAR SCRIPTS DE DESPLIEGUE

```
Crea scripts de despliegue y mantenimiento:

scripts/deploy.sh:
```bash
#!/bin/bash
set -e

echo "🚀 Iniciando despliegue de CCAMEM Sistema de Gestión Archivística..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar Docker y Docker Compose
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose no está instalado${NC}"
    exit 1
fi

# Cargar variables de entorno
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo -e "${YELLOW}⚠️  No se encontró archivo .env, usando .env.example${NC}"
    cp .env.example .env
fi

# Función para esperar que un servicio esté listo
wait_for_service() {
    local service=$1
    local port=$2
    local max_attempts=30
    local attempt=1
    
    echo -e "${YELLOW}⏳ Esperando que $service esté listo...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if nc -z localhost $port 2>/dev/null; then
            echo -e "${GREEN}✅ $service está listo${NC}"
            return 0
        fi
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}❌ Timeout esperando $service${NC}"
    return 1
}

# Menú de opciones
echo "Seleccione el tipo de despliegue:"
echo "1) Desarrollo"
echo "2) Producción"
echo "3) Producción con SSL"
read -p "Opción: " option

case $option in
    1)
        echo -e "${GREEN}🔧 Desplegando en modo DESARROLLO${NC}"
        
        # Build de imágenes
        docker-compose build
        
        # Levantar servicios
        docker-compose up -d postgres redis
        
        # Esperar que PostgreSQL esté listo
        wait_for_service "PostgreSQL" 5432
        
        # Ejecutar migraciones
        docker-compose run --rm backend npx prisma migrate dev
        
        # Seed de datos iniciales
        docker-compose run --rm backend npx prisma db seed
        
        # Levantar todos los servicios
        docker-compose up -d
        
        echo -e "${GREEN}✅ Despliegue de desarrollo completado${NC}"
        echo "📍 Frontend: http://localhost:3000"
        echo "📍 Backend API: http://localhost:3001"
        echo "📍 pgAdmin: http://localhost:5050"
        ;;
        
    2)
        echo -e "${GREEN}🚀 Desplegando en modo PRODUCCIÓN${NC}"
        
        # Build de imágenes con optimización
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
        
        # Levantar servicios de base de datos
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d postgres redis
        
        wait_for_service "PostgreSQL" 5432
        
        # Migraciones de producción
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml run --rm backend npx prisma migrate deploy
        
        # Levantar todos los servicios
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
        
        echo -e "${GREEN}✅ Despliegue de producción completado${NC}"
        ;;
        
    3)
        echo -e "${GREEN}🔐 Desplegando en modo PRODUCCIÓN con SSL${NC}"
        
        # Verificar certificados SSL
        if [ ! -f ssl/cert.pem ] || [ ! -f ssl/key.pem ]; then
            echo -e "${YELLOW}⚠️  No se encontraron certificados SSL${NC}"
            echo "Generando certificados autofirmados para pruebas..."
            
            mkdir -p ssl
            openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
                -keyout ssl/key.pem \
                -out ssl/cert.pem \
                -subj "/C=MX/ST=Mexico/L=Toluca/O=CCAMEM/CN=archivo.ccamem.gob.mx"
        fi
        
        # Desplegar con perfil de producción + nginx
        docker-compose --profile production -f docker-compose.yml -f docker-compose.prod.yml up -d
        
        echo -e "${GREEN}✅ Despliegue con SSL completado${NC}"
        echo "📍 Aplicación: https://archivo.ccamem.gob.mx"
        ;;
        
    *)
        echo -e "${RED}Opción inválida${NC}"
        exit 1
        ;;
esac

# Mostrar estado de los servicios
echo -e "\n${YELLOW}📊 Estado de los servicios:${NC}"
docker-compose ps

# Mostrar logs
echo -e "\n${YELLOW}📝 Para ver los logs use:${NC}"
echo "docker-compose logs -f [servicio]"
```

scripts/backup.sh:
```bash
#!/bin/bash
set -e

# Configuración
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/ccamem_backup_${DATE}.sql"
DAYS_TO_KEEP=30

# Crear directorio si no existe
mkdir -p ${BACKUP_DIR}

echo "🔄 Iniciando respaldo de base de datos..."

# Realizar backup
docker-compose exec -T postgres pg_dump -U ccamem_user ccamem_db > ${BACKUP_FILE}

# Comprimir
gzip ${BACKUP_FILE}

echo "✅ Respaldo creado: ${BACKUP_FILE}.gz"

# Limpiar backups antiguos
echo "🧹 Limpiando respaldos antiguos..."
find ${BACKUP_DIR} -name "*.sql.gz" -mtime +${DAYS_TO_KEEP} -delete

# Listar backups actuales
echo "📁 Respaldos disponibles:"
ls -lh ${BACKUP_DIR}/*.sql.gz 2>/dev/null || echo "No hay respaldos"
```

scripts/restore.sh:
```bash
#!/bin/bash
set -e

if [ $# -eq 0 ]; then
    echo "Uso: $0 <archivo_backup.sql.gz>"
    exit 1
fi

BACKUP_FILE=$1

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ El archivo $BACKUP_FILE no existe"
    exit 1
fi

echo "⚠️  ADVERTENCIA: Esto sobrescribirá la base de datos actual"
read -p "¿Está seguro? (y/n): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Operación cancelada"
    exit 0
fi

echo "🔄 Restaurando base de datos desde $BACKUP_FILE..."

# Descomprimir si es necesario
if [[ $BACKUP_FILE == *.gz ]]; then
    gunzip -c $BACKUP_FILE | docker-compose exec -T postgres psql -U ccamem_user ccamem_db
else
    docker-compose exec -T postgres psql -U ccamem_user ccamem_db < $BACKUP_FILE
fi

echo "✅ Base de datos restaurada exitosamente"
```

scripts/health-check.sh:
```bash
#!/bin/bash

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🏥 Verificando salud del sistema CCAMEM..."

# Verificar PostgreSQL
if docker-compose exec -T postgres pg_isready -U ccamem_user > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL está funcionando${NC}"
else
    echo -e "${RED}❌ PostgreSQL no responde${NC}"
fi

# Verificar Redis
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis está funcionando${NC}"
else
    echo -e "${RED}❌ Redis no responde${NC}"
fi

# Verificar Backend API
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health | grep -q "200"; then
    echo -e "${GREEN}✅ Backend API está funcionando${NC}"
else
    echo -e "${RED}❌ Backend API no responde${NC}"
fi

# Verificar Frontend
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo -e "${GREEN}✅ Frontend está funcionando${NC}"
else
    echo -e "${RED}❌ Frontend no responde${NC}"
fi

# Verificar espacio en disco
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -lt 80 ]; then
    echo -e "${GREEN}✅ Espacio en disco: ${DISK_USAGE}% usado${NC}"
else
    echo -e "${YELLOW}⚠️  Espacio en disco: ${DISK_USAGE}% usado${NC}"
fi

# Verificar memoria
MEMORY_USAGE=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
if [ $MEMORY_USAGE -lt 80 ]; then
    echo -e "${GREEN}✅ Memoria: ${MEMORY_USAGE}% usada${NC}"
else
    echo -e "${YELLOW}⚠️  Memoria: ${MEMORY_USAGE}% usada${NC}"
fi
```

### PROMPT 5: CREAR CONFIGURACIÓN DE NGINX PARA PRODUCCIÓN

```
Crea configuración completa de Nginx:

nginx/nginx.conf:
```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    
    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 50M;
    
    # Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/rss+xml application/atom+xml image/svg+xml 
               text/x-js text/x-cross-domain-policy application/x-font-ttf 
               application/x-font-opentype application/vnd.ms-fontobject 
               image/x-icon;
    
    # Cache
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m 
                     max_size=100m inactive=60m use_temp_path=off;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;
    
    # Upstream
    upstream backend {
        least_conn;
        server backend:3001 max_fails=3 fail_timeout=30s;
    }
    
    include /etc/nginx/conf.d/*.conf;
}
```

nginx/conf.d/default.conf:
```nginx
server {
    listen 80;
    server_name archivo.ccamem.gob.mx;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name archivo.ccamem.gob.mx;
    
    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Root directory
    root /usr/share/nginx/html;
    index index.html;
    
    # API Proxy with cache
    location /api {
        # Rate limiting
        limit_req zone=api_limit burst=20 nodelay;
        
        # Proxy settings
        proxy_pass http://backend;
        proxy_http_version 1.1;
        
        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Request-ID $request_id;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Cache for GET requests
        proxy_cache api_cache;
        proxy_cache_valid 200 10m;
        proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;
        proxy_cache_bypass $http_cache_control;
        add_header X-Cache-Status $upstream_cache_status;
    }
    
    # Login endpoint with stricter rate limiting
    location /api/auth/login {
        limit_req zone=login_limit burst=2 nodelay;
        
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # WebSocket support for real-time features
    location /ws {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts for WebSocket
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # Static files with aggressive caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # React Router - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
        
        # Disable caching for index.html
        location = /index.html {
            add_header Cache-Control "no-cache, no-store, must-revalidate";
            add_header Pragma "no-cache";
            add_header Expires "0";
        }
    }
    
    # Deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

### PROMPT 6: CREAR GITHUB ACTIONS CI/CD

```
Crea workflow de GitHub Actions:

.github/workflows/ci-cd.yml:
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # Testing Backend
  test-backend:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_pass
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json
      
      - name: Install dependencies
        working-directory: ./backend
        run: npm ci
      
      - name: Run linter
        working-directory: ./backend
        run: npm run lint
      
      - name: Setup database
        working-directory: ./backend
        env:
          DATABASE_URL: postgresql://test_user:test_pass@localhost:5432/test_db
        run: |
          npx prisma generate
          npx prisma migrate deploy
      
      - name: Run tests
        working-directory: ./backend
        env:
          DATABASE_URL: postgresql://test_user:test_pass@localhost:5432/test_db
          JWT_SECRET: test-secret
        run: npm test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/lcov.info
  
  # Testing Frontend
  test-frontend:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci
      
      - name: Run linter
        working-directory: ./frontend
        run: npm run lint
      
      - name: Run tests
        working-directory: ./frontend
        run: npm test -- --coverage --watchAll=false
      
      - name: Build
        working-directory: ./frontend
        run: npm run build
  
  # Build and Push Docker Images
  build-and-push:
    needs: [test-backend, test-frontend]
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && (github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop')
    
    permissions:
      contents: read
      packages: write
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Log in to the Container registry
        uses: docker/login-action@v2
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v4
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=sha
      
      - name: Build and push Backend Docker image
        uses: docker/build-push-action@v4
        with:
          context: ./backend
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/backend:${{ github.sha }}
          labels: ${{ steps.meta.outputs.labels }}
      
      - name: Build and push Frontend Docker image
        uses: docker/build-push-action@v4
        with:
          context: ./frontend
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/frontend:${{ github.sha }}
          labels: ${{ steps.meta.outputs.labels }}
  
  # Deploy to Production
  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Deploy to production
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            cd /opt/ccamem-archivo
            git pull origin main
            docker-compose pull
            docker-compose up -d --no-deps --build
            docker system prune -f
```

## 🚀 Comandos Útiles de Docker

```bash
# Desarrollo
docker-compose up -d                    # Iniciar todos los servicios
docker-compose down                      # Detener todos los servicios
docker-compose logs -f backend          # Ver logs del backend
docker-compose exec backend sh          # Entrar al contenedor del backend
docker-compose restart backend          # Reiniciar backend

# Base de datos
docker-compose exec postgres psql -U ccamem_user ccamem_db  # Acceder a PostgreSQL
docker-compose exec postgres pg_dump -U ccamem_user ccamem_db > backup.sql  # Backup

# Prisma
docker-compose exec backend npx prisma migrate dev  # Crear migración
docker-compose exec backend npx prisma generate     # Generar cliente
docker-compose exec backend npx prisma studio       # GUI de Prisma

# Limpieza
docker system prune -a                   # Limpiar todo no usado
docker volume prune                      # Limpiar volúmenes no usados

# Producción
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
docker-compose --profile production up -d
```

## 📋 Checklist de Despliegue

- [ ] Clonar repositorio
- [ ] Copiar y configurar archivo .env
- [ ] Instalar Docker y Docker Compose
- [ ] Generar certificados SSL (producción)
- [ ] Ejecutar script de despliegue
- [ ] Verificar servicios con health-check
- [ ] Configurar backups automáticos
- [ ] Configurar monitoreo
- [ ] Documentar accesos y credenciales
- [ ] Pruebas de funcionamiento