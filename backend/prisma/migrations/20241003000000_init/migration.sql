-- CreateEnum
CREATE TYPE "TipoSeccion" AS ENUM ('SUSTANTIVA', 'COMUN');

-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('ADMIN', 'COORDINADOR_ARCHIVO', 'RESPONSABLE_AREA', 'OPERADOR', 'CONSULTA');

-- CreateEnum
CREATE TYPE "ClasificacionInfo" AS ENUM ('PUBLICA', 'RESERVADA', 'CONFIDENCIAL');

-- CreateEnum
CREATE TYPE "EstadoExpediente" AS ENUM ('ACTIVO', 'CERRADO', 'PRESTADO', 'TRANSFERIDO', 'BAJA');

-- CreateEnum
CREATE TYPE "AccionBitacora" AS ENUM ('CREAR', 'ACTUALIZAR', 'ELIMINAR', 'CONSULTAR', 'PRESTAR', 'DEVOLVER', 'TRANSFERIR', 'LOGIN', 'LOGOUT');

-- CreateEnum
CREATE TYPE "EstadoPrestamo" AS ENUM ('PENDIENTE', 'AUTORIZADO', 'PRESTADO', 'DEVUELTO', 'VENCIDO', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "TipoTransferencia" AS ENUM ('PRIMARIA', 'SECUNDARIA', 'BAJA');

-- CreateEnum
CREATE TYPE "EstadoTransferencia" AS ENUM ('PENDIENTE', 'AUTORIZADA', 'COMPLETADA', 'RECHAZADA');

-- CreateTable
CREATE TABLE "unidades_administrativas" (
    "id" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unidades_administrativas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "secciones" (
    "id" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoSeccion" NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "secciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "series" (
    "id" TEXT NOT NULL,
    "seccionId" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subseries" (
    "id" TEXT NOT NULL,
    "serieId" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subseries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidoPaterno" TEXT NOT NULL,
    "apellidoMaterno" TEXT,
    "rol" "RolUsuario" NOT NULL,
    "unidadAdministrativaId" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimoAcceso" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expedientes" (
    "id" TEXT NOT NULL,
    "numeroProgresivo" SERIAL NOT NULL,
    "numeroExpediente" TEXT NOT NULL,
    "unidadAdministrativaId" TEXT NOT NULL,
    "seccionId" TEXT NOT NULL,
    "serieId" TEXT NOT NULL,
    "subserieId" TEXT,
    "formulaClasificadora" TEXT NOT NULL,
    "nombreExpediente" TEXT NOT NULL,
    "asunto" TEXT NOT NULL,
    "totalLegajos" INTEGER NOT NULL DEFAULT 1,
    "totalDocumentos" INTEGER NOT NULL DEFAULT 0,
    "totalFojas" INTEGER NOT NULL DEFAULT 0,
    "fechaApertura" TIMESTAMP(3) NOT NULL,
    "fechaCierre" TIMESTAMP(3),
    "valorAdministrativo" BOOLEAN NOT NULL DEFAULT false,
    "valorLegal" BOOLEAN NOT NULL DEFAULT false,
    "valorContable" BOOLEAN NOT NULL DEFAULT false,
    "valorFiscal" BOOLEAN NOT NULL DEFAULT false,
    "clasificacionInfo" "ClasificacionInfo" NOT NULL DEFAULT 'PUBLICA',
    "ubicacionFisica" TEXT,
    "estado" "EstadoExpediente" NOT NULL DEFAULT 'ACTIVO',
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "expedientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legajos" (
    "id" TEXT NOT NULL,
    "expedienteId" TEXT NOT NULL,
    "numeroLegajo" INTEGER NOT NULL,
    "descripcion" TEXT,
    "fojas" INTEGER NOT NULL DEFAULT 0,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legajos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bitacoras" (
    "id" TEXT NOT NULL,
    "expedienteId" TEXT,
    "usuarioId" TEXT NOT NULL,
    "accion" "AccionBitacora" NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "datosPrevios" JSONB,
    "datosNuevos" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bitacoras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prestamos" (
    "id" TEXT NOT NULL,
    "expedienteId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "autorizadoPorId" TEXT,
    "fechaPrestamo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaDevolucionEsperada" TIMESTAMP(3) NOT NULL,
    "fechaDevolucionReal" TIMESTAMP(3),
    "motivoPrestamo" TEXT NOT NULL,
    "observaciones" TEXT,
    "estado" "EstadoPrestamo" NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prestamos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transferencias" (
    "id" TEXT NOT NULL,
    "expedienteId" TEXT NOT NULL,
    "unidadOrigenId" TEXT NOT NULL,
    "tipoTransferencia" "TipoTransferencia" NOT NULL,
    "fechaTransferencia" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descripcion" TEXT NOT NULL,
    "documentoSoporte" TEXT,
    "estado" "EstadoTransferencia" NOT NULL DEFAULT 'PENDIENTE',
    "observaciones" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transferencias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unidades_administrativas_clave_key" ON "unidades_administrativas"("clave");

-- CreateIndex
CREATE UNIQUE INDEX "secciones_clave_key" ON "secciones"("clave");

-- CreateIndex
CREATE INDEX "series_seccionId_idx" ON "series"("seccionId");

-- CreateIndex
CREATE UNIQUE INDEX "series_seccionId_clave_key" ON "series"("seccionId", "clave");

-- CreateIndex
CREATE INDEX "subseries_serieId_idx" ON "subseries"("serieId");

-- CreateIndex
CREATE UNIQUE INDEX "subseries_serieId_clave_key" ON "subseries"("serieId", "clave");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_username_key" ON "usuarios"("username");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_unidadAdministrativaId_idx" ON "usuarios"("unidadAdministrativaId");

-- CreateIndex
CREATE INDEX "expedientes_unidadAdministrativaId_idx" ON "expedientes"("unidadAdministrativaId");

-- CreateIndex
CREATE INDEX "expedientes_seccionId_idx" ON "expedientes"("seccionId");

-- CreateIndex
CREATE INDEX "expedientes_serieId_idx" ON "expedientes"("serieId");

-- CreateIndex
CREATE INDEX "expedientes_estado_idx" ON "expedientes"("estado");

-- CreateIndex
CREATE INDEX "expedientes_fechaApertura_idx" ON "expedientes"("fechaApertura");

-- CreateIndex
CREATE INDEX "expedientes_formulaClasificadora_idx" ON "expedientes"("formulaClasificadora");

-- CreateIndex
CREATE UNIQUE INDEX "expedientes_unidadAdministrativaId_numeroExpediente_key" ON "expedientes"("unidadAdministrativaId", "numeroExpediente");

-- CreateIndex
CREATE INDEX "legajos_expedienteId_idx" ON "legajos"("expedienteId");

-- CreateIndex
CREATE UNIQUE INDEX "legajos_expedienteId_numeroLegajo_key" ON "legajos"("expedienteId", "numeroLegajo");

-- CreateIndex
CREATE INDEX "bitacoras_expedienteId_idx" ON "bitacoras"("expedienteId");

-- CreateIndex
CREATE INDEX "bitacoras_usuarioId_idx" ON "bitacoras"("usuarioId");

-- CreateIndex
CREATE INDEX "bitacoras_entidad_entidadId_idx" ON "bitacoras"("entidad", "entidadId");

-- CreateIndex
CREATE INDEX "bitacoras_createdAt_idx" ON "bitacoras"("createdAt");

-- CreateIndex
CREATE INDEX "prestamos_expedienteId_idx" ON "prestamos"("expedienteId");

-- CreateIndex
CREATE INDEX "prestamos_usuarioId_idx" ON "prestamos"("usuarioId");

-- CreateIndex
CREATE INDEX "prestamos_estado_idx" ON "prestamos"("estado");

-- CreateIndex
CREATE INDEX "prestamos_fechaPrestamo_idx" ON "prestamos"("fechaPrestamo");

-- CreateIndex
CREATE INDEX "transferencias_expedienteId_idx" ON "transferencias"("expedienteId");

-- CreateIndex
CREATE INDEX "transferencias_unidadOrigenId_idx" ON "transferencias"("unidadOrigenId");

-- CreateIndex
CREATE INDEX "transferencias_estado_idx" ON "transferencias"("estado");

-- CreateIndex
CREATE INDEX "transferencias_fechaTransferencia_idx" ON "transferencias"("fechaTransferencia");

-- AddForeignKey
ALTER TABLE "series" ADD CONSTRAINT "series_seccionId_fkey" FOREIGN KEY ("seccionId") REFERENCES "secciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subseries" ADD CONSTRAINT "subseries_serieId_fkey" FOREIGN KEY ("serieId") REFERENCES "series"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_unidadAdministrativaId_fkey" FOREIGN KEY ("unidadAdministrativaId") REFERENCES "unidades_administrativas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expedientes" ADD CONSTRAINT "expedientes_unidadAdministrativaId_fkey" FOREIGN KEY ("unidadAdministrativaId") REFERENCES "unidades_administrativas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expedientes" ADD CONSTRAINT "expedientes_seccionId_fkey" FOREIGN KEY ("seccionId") REFERENCES "secciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expedientes" ADD CONSTRAINT "expedientes_serieId_fkey" FOREIGN KEY ("serieId") REFERENCES "series"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expedientes" ADD CONSTRAINT "expedientes_subserieId_fkey" FOREIGN KEY ("subserieId") REFERENCES "subseries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expedientes" ADD CONSTRAINT "expedientes_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expedientes" ADD CONSTRAINT "expedientes_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legajos" ADD CONSTRAINT "legajos_expedienteId_fkey" FOREIGN KEY ("expedienteId") REFERENCES "expedientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bitacoras" ADD CONSTRAINT "bitacoras_expedienteId_fkey" FOREIGN KEY ("expedienteId") REFERENCES "expedientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bitacoras" ADD CONSTRAINT "bitacoras_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prestamos" ADD CONSTRAINT "prestamos_expedienteId_fkey" FOREIGN KEY ("expedienteId") REFERENCES "expedientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prestamos" ADD CONSTRAINT "prestamos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prestamos" ADD CONSTRAINT "prestamos_autorizadoPorId_fkey" FOREIGN KEY ("autorizadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferencias" ADD CONSTRAINT "transferencias_expedienteId_fkey" FOREIGN KEY ("expedienteId") REFERENCES "expedientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferencias" ADD CONSTRAINT "transferencias_unidadOrigenId_fkey" FOREIGN KEY ("unidadOrigenId") REFERENCES "unidades_administrativas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferencias" ADD CONSTRAINT "transferencias_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
