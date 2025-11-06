// Types para el Sistema de Gestión Archivística CCAMEM

export interface User {
  id: string;
  nombre: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  username: string;
  email: string;
  rol: string; // ADMIN, COORDINADOR_ARCHIVO, RESPONSABLE_AREA, OPERADOR, CONSULTA
  unidadAdministrativaId?: string | null;
  unidadAdministrativa?: UnidadAdministrativa;
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Rol {
  id: string;
  nombre: 'administrador' | 'coordinador_archivo' | 'responsable_area' | 'operador' | 'consulta';
  descripcion: string;
}

export interface UnidadAdministrativa {
  id: string;
  clave: string;
  nombre: string;
  descripcion?: string;
  responsable?: string;
  activo: boolean;
}

export interface Seccion {
  id: string;
  clave: string;
  nombre: string;
  tipo: 'SUSTANTIVA' | 'COMUN';
  descripcion?: string;
  series?: Serie[];
}

export interface Serie {
  id: string;
  clave: string;
  nombre: string;
  seccionId: string;
  seccion?: Seccion;
  descripcion?: string;
  subseries?: Subserie[];
  valorDocumental?: string;
  vigenciaDocumental?: string;
}

export interface Subserie {
  id: string;
  clave: string;
  nombre: string;
  serieId: string;
  serie?: Serie;
  descripcion?: string;
}

export interface Expediente {
  id: string;
  numeroExpediente: string;
  numeroProgresivo: number;
  unidadAdministrativaId: string;
  unidadAdministrativa?: UnidadAdministrativa;
  seccionId: string;
  seccion?: Seccion;
  serieId: string;
  serie?: Serie;
  subserieId?: string;
  subserie?: Subserie;
  nombreExpediente: string;
  asunto?: string;
  formulaClasificadora: string;
  fechaApertura?: string;
  fechaCierre?: string;
  totalLegajos: number;
  totalDocumentos: number;
  totalFojas: number;
  valorDocumental: string[];
  clasificacionInformacion: 'publica' | 'reservada' | 'confidencial';
  fundamentoLegal?: string;
  ubicacionFisica?: string;
  observaciones?: string;
  estado: 'activo' | 'cerrado' | 'transferido' | 'dado_de_baja';
  legajos?: Legajo[];
  prestamos?: Prestamo[];
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Legajo {
  id: string;
  expedienteId: string;
  expediente?: Expediente;
  numeroLegajo: number;
  numeroDocumentos: number;
  numeroFojas: number;
  fechaInicio?: string;
  fechaFin?: string;
  observaciones?: string;
}

export interface Prestamo {
  id: string;
  expedienteId: string;
  expediente?: Expediente;
  usuarioSolicitanteId: string;
  usuarioSolicitante?: User;
  usuarioAutorizaId?: string;
  usuarioAutoriza?: User;
  fechaSolicitud: string;
  fechaPrestamo?: string;
  fechaDevolucion?: string;
  fechaDevolucionReal?: string;
  motivo: string;
  observaciones?: string;
  estado: 'solicitado' | 'autorizado' | 'prestado' | 'devuelto' | 'rechazado';
}

export interface Transferencia {
  id: string;
  tipo: 'primaria' | 'secundaria';
  fechaTransferencia: string;
  unidadOrigenId: string;
  unidadOrigen?: UnidadAdministrativa;
  totalExpedientes: number;
  totalCajas: number;
  observaciones?: string;
  estado: 'programada' | 'en_proceso' | 'completada' | 'cancelada';
  expedientes?: Expediente[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bitacora {
  id: string;
  tipo: 'expediente' | 'prestamo' | 'transferencia' | 'usuario' | 'sistema';
  accion: 'crear' | 'actualizar' | 'eliminar' | 'consultar' | 'prestar' | 'devolver' | 'transferir';
  entidadId: string;
  entidadTipo: string;
  usuarioId: string;
  usuario?: User;
  descripcion: string;
  datosAnteriores?: any;
  datosNuevos?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// Auth types
export interface LoginCredentials {
  username: string;
  password: string;
  remember?: boolean;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filter types
export interface ExpedienteFilters {
  search?: string;
  unidadAdministrativaId?: string;
  seccionId?: string;
  serieId?: string;
  subserieId?: string;
  estado?: string;
  fechaAperturaDesde?: string;
  fechaAperturaHasta?: string;
  fechaCierreDesde?: string;
  fechaCierreHasta?: string;
  clasificacionInformacion?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Form types
export interface ExpedienteFormData {
  numeroExpediente: string;
  unidadAdministrativaId: string;
  seccionId: string;
  serieId: string;
  subserieId?: string;
  nombreExpediente: string;
  asunto?: string;
  fechaApertura?: string;
  fechaCierre?: string;
  totalLegajos: number;
  totalDocumentos: number;
  totalFojas: number;
  valorDocumental: string[];
  clasificacionInformacion: 'publica' | 'reservada' | 'confidencial';
  fundamentoLegal?: string;
  ubicacionFisica?: string;
  observaciones?: string;
  legajos?: LegajoFormData[];
}

export interface LegajoFormData {
  numeroLegajo: number;
  numeroDocumentos: number;
  numeroFojas: number;
  fechaInicio?: string;
  fechaFin?: string;
  observaciones?: string;
}

export interface PrestamoFormData {
  expedienteId: string;
  motivo: string;
  fechaDevolucion: string;
  observaciones?: string;
}

// Stats types
export interface DashboardStats {
  totalExpedientes: number;
  expedientesActivos: number;
  expedientesCerrados: number;
  expedientesTransferidos: number;
  prestamosPendientes: number;
  prestamosActivos: number;
  expedientesPorUnidad: {
    unidad: string;
    total: number;
  }[];
  expedientesPorEstado: {
    estado: string;
    total: number;
  }[];
  expedientesPorMes: {
    mes: string;
    total: number;
  }[];
}

// Report types
export interface ReportOptions {
  tipo: 'inventario_general' | 'inventario_unidad' | 'prestamos' | 'transferencias' | 'estadisticas';
  formato: 'excel' | 'pdf';
  filtros?: ExpedienteFilters;
  unidadAdministrativaId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}
