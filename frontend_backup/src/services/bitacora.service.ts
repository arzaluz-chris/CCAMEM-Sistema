import apiService from './api.service';

export interface BitacoraRegistro {
  id: string;
  expedienteId?: string;
  usuarioId: string;
  accion: string;
  entidad: string;
  entidadId: string;
  descripcion: string;
  datosPrevios?: any;
  datosNuevos?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  usuario?: {
    id: string;
    username: string;
    nombre: string;
    apellidos: string;
    rol?: string;
  };
  expediente?: {
    id: string;
    numeroExpediente: string;
    nombre: string;
  };
}

export interface BitacoraStats {
  total: number;
  porAccion: Array<{ accion: string; count: number }>;
  porEntidad: Array<{ entidad: string; count: number }>;
  usuariosMasActivos: Array<{
    usuarioId: string;
    count: number;
    usuario?: {
      id: string;
      username: string;
      nombre: string;
      apellidos: string;
    };
  }>;
}

export interface BitacoraListResponse {
  success: boolean;
  data: BitacoraRegistro[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BitacoraExpedienteResponse {
  success: boolean;
  data: {
    expediente: {
      id: string;
      numeroExpediente: string;
      nombre: string;
    };
    bitacoras: BitacoraRegistro[];
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class BitacoraService {
  private baseUrl = '/bitacora';

  /**
   * Registrar nueva entrada en bitácora
   */
  async registrar(data: {
    accion: string;
    entidad: string;
    entidadId: string;
    descripcion: string;
    datosPrevios?: any;
    datosNuevos?: any;
    expedienteId?: string;
  }) {
    const response = await apiService.post(this.baseUrl, data);
    return response.data;
  }

  /**
   * Listar bitácoras con filtros
   */
  async listar(params?: {
    page?: number;
    limit?: number;
    accion?: string;
    entidad?: string;
    usuarioId?: string;
    expedienteId?: string;
    fechaDesde?: string;
    fechaHasta?: string;
  }): Promise<BitacoraListResponse> {
    const response = await apiService.get(this.baseUrl, { params });
    return response.data;
  }

  /**
   * Obtener bitácora por ID
   */
  async obtenerPorId(id: string) {
    const response = await apiService.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Obtener bitácora de un expediente
   */
  async obtenerPorExpediente(
    expedienteId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<BitacoraExpedienteResponse> {
    const response = await apiService.get(
      `${this.baseUrl}/expediente/${expedienteId}`,
      { params: { page, limit } }
    );
    return response.data;
  }

  /**
   * Obtener estadísticas de bitácora
   */
  async obtenerEstadisticas(fechaDesde?: string, fechaHasta?: string): Promise<BitacoraStats> {
    const response = await apiService.get(`${this.baseUrl}/stats`, {
      params: { fechaDesde, fechaHasta },
    });
    return response.data.data;
  }

  /**
   * Limpiar registros antiguos (solo admin)
   */
  async limpiar(diasAntiguedad: number = 365) {
    const response = await apiService.delete(`${this.baseUrl}/limpiar`, {
      data: { diasAntiguedad },
    });
    return response.data;
  }

  /**
   * Registrar consulta de expediente
   */
  async registrarConsulta(expedienteId: string, descripcion: string) {
    return this.registrar({
      accion: 'CONSULTAR',
      entidad: 'Expediente',
      entidadId: expedienteId,
      descripcion,
      expedienteId,
    });
  }

  /**
   * Registrar creación de expediente
   */
  async registrarCreacion(expedienteId: string, datos: any) {
    return this.registrar({
      accion: 'CREAR',
      entidad: 'Expediente',
      entidadId: expedienteId,
      descripcion: `Expediente creado: ${datos.numeroExpediente}`,
      datosNuevos: datos,
      expedienteId,
    });
  }

  /**
   * Registrar actualización de expediente
   */
  async registrarActualizacion(
    expedienteId: string,
    datosPrevios: any,
    datosNuevos: any
  ) {
    return this.registrar({
      accion: 'ACTUALIZAR',
      entidad: 'Expediente',
      entidadId: expedienteId,
      descripcion: `Expediente actualizado: ${datosNuevos.numeroExpediente}`,
      datosPrevios,
      datosNuevos,
      expedienteId,
    });
  }

  /**
   * Registrar eliminación de expediente
   */
  async registrarEliminacion(expedienteId: string, datos: any) {
    return this.registrar({
      accion: 'ELIMINAR',
      entidad: 'Expediente',
      entidadId: expedienteId,
      descripcion: `Expediente eliminado: ${datos.numeroExpediente}`,
      datosPrevios: datos,
      expedienteId,
    });
  }

  /**
   * Registrar préstamo
   */
  async registrarPrestamo(expedienteId: string, prestamoId: string, descripcion: string) {
    return this.registrar({
      accion: 'PRESTAR',
      entidad: 'Prestamo',
      entidadId: prestamoId,
      descripcion,
      expedienteId,
    });
  }

  /**
   * Registrar devolución
   */
  async registrarDevolucion(expedienteId: string, prestamoId: string, descripcion: string) {
    return this.registrar({
      accion: 'DEVOLVER',
      entidad: 'Prestamo',
      entidadId: prestamoId,
      descripcion,
      expedienteId,
    });
  }
}

export default new BitacoraService();
