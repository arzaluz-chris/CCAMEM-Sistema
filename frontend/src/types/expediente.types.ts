export interface UnidadAdministrativa {
  id: string;
  clave: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface Seccion {
  id: string;
  clave: string;
  nombre: string;
  tipo: 'SUSTANTIVA' | 'COMUN';
  descripcion?: string;
  activo: boolean;
}

export interface Serie {
  id: string;
  seccionId: string;
  clave: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface Subserie {
  id: string;
  serieId: string;
  clave: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface Legajo {
  id?: string;
  numeroLegajo: number;
  descripcion?: string;
  fojas: number;
  observaciones?: string;
}

export type EstadoExpediente = 'ACTIVO' | 'CERRADO' | 'PRESTADO' | 'TRANSFERIDO' | 'BAJA';
export type ClasificacionInfo = 'PUBLICA' | 'RESERVADA' | 'CONFIDENCIAL';
export type TiempoConservacion = 'TRAMITE' | 'CONCENTRACION' | 'HISTORICO';

export interface Expediente {
  id: string;
  numeroProgresivo: number;
  numeroExpediente: string;
  unidadAdministrativaId: string;
  seccionId: string;
  serieId: string;
  subserieId?: string;
  formulaClasificadora: string;
  nombreExpediente: string;
  asunto?: string;

  // Información física
  totalLegajos: number;
  totalDocumentos: number;
  totalFojas: number;

  // Fechas
  fechaApertura: string | Date;
  fechaCierre?: string | Date;

  // Valores documentales
  valorAdministrativo: boolean;
  valorLegal: boolean;
  valorContable: boolean;
  valorFiscal: boolean;

  // Clasificación
  clasificacionInfo: ClasificacionInfo;
  fundamentoLegal?: string;

  // Ubicación
  ubicacionFisica?: string;

  // Estado
  estado: EstadoExpediente;
  observaciones?: string;

  // Auditoría
  createdAt: string | Date;
  updatedAt: string | Date;
  createdById: string;
  updatedById?: string;
}

export interface CreateExpedienteDto {
  numeroExpediente: string;
  unidadAdministrativaId: string;
  seccionId: string;
  serieId: string;
  subserieId?: string;
  nombreExpediente: string;
  asunto?: string;
  totalLegajos?: number;
  totalDocumentos?: number;
  totalFojas?: number;
  fechaApertura: Date | string;
  fechaCierre?: Date | string;
  valorAdministrativo?: boolean;
  valorLegal?: boolean;
  valorContable?: boolean;
  valorFiscal?: boolean;
  clasificacionInfo?: ClasificacionInfo;
  fundamentoLegal?: string;
  ubicacionFisica?: string;
  observaciones?: string;
  tiempoConservacion?: TiempoConservacion;
  fondoDocumental?: string;
}

export interface ExpedienteFormData {
  // Orden según requisitos
  nombreExpediente: string;  // 1. Nombre del Expediente (fórmula)
  numeroLegajo: number;       // 2. Número de legajo (ej: 1)
  totalLegajos: number;       // 3. Total de legajos (automático)
  asunto: string;            // 4. Asunto
  fechaApertura: Date | null; // 5. Fecha de apertura
  fechaCierre: Date | null;   // 6. Fecha de cierre
  totalDocumentos: number;   // 7. Total de documentos
  fondoDocumental: string;   // 8. Fondo documental
  seccionId: string;         // 9. Sección
  serieId: string;           // 10. Serie Documental
  subserieId: string;        // 11. Subserie documental
  tiempoConservacion: TiempoConservacion; // 12. Tiempo de conservación

  // Campos adicionales
  numeroExpediente: string;
  unidadAdministrativaId: string;
  totalFojas: number;
  ubicacionFisica: string;
  observaciones: string;
}
