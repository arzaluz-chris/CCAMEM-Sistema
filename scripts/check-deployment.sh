#!/bin/bash

# ============================================
# Script de Verificación Pre-Deployment
# ============================================
# Este script verifica que todo esté configurado
# correctamente antes de hacer deployment

echo "🔍 Verificando configuración de deployment..."
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# ============================================
# 1. Verificar Node.js y npm
# ============================================
echo "📦 Verificando Node.js y npm..."

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    ((ERRORS++))
else
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✅ Node.js instalado: $NODE_VERSION${NC}"

    # Verificar versión mínima (20.x)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -lt 20 ]; then
        echo -e "${YELLOW}⚠️  Se recomienda Node.js 20.x o superior${NC}"
        ((WARNINGS++))
    fi
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm no está instalado${NC}"
    ((ERRORS++))
else
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✅ npm instalado: $NPM_VERSION${NC}"
fi

echo ""

# ============================================
# 2. Verificar estructura de archivos
# ============================================
echo "📁 Verificando estructura de archivos..."

required_files=(
    "backend/package.json"
    "backend/prisma/schema.prisma"
    "backend/src/server.ts"
    "frontend/package.json"
    "frontend/src/App.tsx"
    "vercel.json"
    "railway.json"
    "Procfile"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ Falta: $file${NC}"
        ((ERRORS++))
    fi
done

echo ""

# ============================================
# 3. Verificar archivos .env.example
# ============================================
echo "🔐 Verificando archivos de configuración..."

if [ -f "backend/.env.production.example" ]; then
    echo -e "${GREEN}✅ backend/.env.production.example${NC}"
else
    echo -e "${RED}❌ Falta: backend/.env.production.example${NC}"
    ((ERRORS++))
fi

if [ -f "frontend/.env.production.example" ]; then
    echo -e "${GREEN}✅ frontend/.env.production.example${NC}"
else
    echo -e "${RED}❌ Falta: frontend/.env.production.example${NC}"
    ((ERRORS++))
fi

echo ""

# ============================================
# 4. Verificar dependencias del backend
# ============================================
echo "🔧 Verificando dependencias del backend..."

cd backend

if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules instalado${NC}"
else
    echo -e "${YELLOW}⚠️  Dependencias no instaladas. Ejecutando npm install...${NC}"
    npm install
fi

# Verificar que las dependencias críticas estén instaladas
critical_deps=("express" "prisma" "@prisma/client" "jsonwebtoken" "bcrypt")

for dep in "${critical_deps[@]}"; do
    if npm list "$dep" &> /dev/null; then
        echo -e "${GREEN}✅ $dep instalado${NC}"
    else
        echo -e "${RED}❌ Falta dependencia: $dep${NC}"
        ((ERRORS++))
    fi
done

cd ..
echo ""

# ============================================
# 5. Verificar dependencias del frontend
# ============================================
echo "🎨 Verificando dependencias del frontend..."

cd frontend

if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules instalado${NC}"
else
    echo -e "${YELLOW}⚠️  Dependencias no instaladas. Ejecutando npm install...${NC}"
    npm install
fi

# Verificar que las dependencias críticas estén instaladas
critical_deps=("react" "react-dom" "@mui/material" "axios" "react-router-dom")

for dep in "${critical_deps[@]}"; do
    if npm list "$dep" &> /dev/null; then
        echo -e "${GREEN}✅ $dep instalado${NC}"
    else
        echo -e "${RED}❌ Falta dependencia: $dep${NC}"
        ((ERRORS++))
    fi
done

cd ..
echo ""

# ============================================
# 6. Verificar build
# ============================================
echo "🔨 Verificando que el proyecto compile..."

echo "  Backend..."
cd backend
if npm run build &> /dev/null; then
    echo -e "${GREEN}✅ Backend compila correctamente${NC}"
else
    echo -e "${RED}❌ Backend no compila. Revisa los errores con: cd backend && npm run build${NC}"
    ((ERRORS++))
fi
cd ..

echo "  Frontend..."
cd frontend
if npm run build &> /dev/null; then
    echo -e "${GREEN}✅ Frontend compila correctamente${NC}"
else
    echo -e "${RED}❌ Frontend no compila. Revisa los errores con: cd frontend && npm run build${NC}"
    ((ERRORS++))
fi
cd ..

echo ""

# ============================================
# 7. Verificar Git
# ============================================
echo "📝 Verificando repositorio Git..."

if [ -d ".git" ]; then
    echo -e "${GREEN}✅ Repositorio Git inicializado${NC}"

    # Verificar rama actual
    CURRENT_BRANCH=$(git branch --show-current)
    echo "  Rama actual: $CURRENT_BRANCH"

    # Verificar cambios sin commitear
    if git diff-index --quiet HEAD --; then
        echo -e "${GREEN}✅ No hay cambios sin commitear${NC}"
    else
        echo -e "${YELLOW}⚠️  Hay cambios sin commitear${NC}"
        ((WARNINGS++))
    fi

    # Verificar remote
    if git remote -v | grep -q "origin"; then
        echo -e "${GREEN}✅ Remote 'origin' configurado${NC}"
        REMOTE_URL=$(git remote get-url origin)
        echo "  URL: $REMOTE_URL"
    else
        echo -e "${YELLOW}⚠️  No hay remote 'origin' configurado${NC}"
        ((WARNINGS++))
    fi
else
    echo -e "${RED}❌ No es un repositorio Git${NC}"
    ((ERRORS++))
fi

echo ""

# ============================================
# 8. Verificar archivos sensibles
# ============================================
echo "🔒 Verificando que archivos sensibles estén en .gitignore..."

if [ -f ".gitignore" ]; then
    echo -e "${GREEN}✅ .gitignore existe${NC}"

    # Verificar que .env esté ignorado
    if grep -q "\.env" .gitignore; then
        echo -e "${GREEN}✅ .env está en .gitignore${NC}"
    else
        echo -e "${RED}❌ .env NO está en .gitignore (PELIGRO)${NC}"
        ((ERRORS++))
    fi

    # Verificar que node_modules esté ignorado
    if grep -q "node_modules" .gitignore; then
        echo -e "${GREEN}✅ node_modules está en .gitignore${NC}"
    else
        echo -e "${YELLOW}⚠️  node_modules NO está en .gitignore${NC}"
        ((WARNINGS++))
    fi
else
    echo -e "${RED}❌ .gitignore no existe${NC}"
    ((ERRORS++))
fi

echo ""

# ============================================
# RESUMEN
# ============================================
echo "========================================"
echo "📊 RESUMEN DE VERIFICACIÓN"
echo "========================================"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ TODO ESTÁ CORRECTO${NC}"
    echo "El proyecto está listo para deployment."
    echo ""
    echo "Próximos pasos:"
    echo "1. Hacer commit y push a GitHub"
    echo "2. Configurar proyecto en Railway"
    echo "3. Configurar proyecto en Vercel"
    echo "4. Ver guía completa en DEPLOYMENT.md"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  HAY ADVERTENCIAS ($WARNINGS)${NC}"
    echo "El proyecto puede desplegarse, pero revisa las advertencias."
    exit 0
else
    echo -e "${RED}❌ HAY ERRORES ($ERRORS) y ADVERTENCIAS ($WARNINGS)${NC}"
    echo "Corrige los errores antes de hacer deployment."
    exit 1
fi
