import api from './api';
import {
  Expediente,
  CreateExpedienteDto,
  UnidadAdministrativa,
  Seccion,
  Serie,
  Subserie
} from '../types/expediente.types';

export const expedientesService = {
  // Crear expediente
  create: async (data: CreateExpedienteDto): Promise<Expediente> => {
    const response = await api.post<Expediente>('/expedientes', data);
    return response.data;
  },

  // Obtener expediente por ID
  getById: async (id: string): Promise<Expediente> => {
    const response = await api.get<Expediente>(`/expedientes/${id}`);
    return response.data;
  },

  // Actualizar expediente
  update: async (id: string, data: Partial<CreateExpedienteDto>): Promise<Expediente> => {
    const response = await api.put<Expediente>(`/expedientes/${id}`, data);
    return response.data;
  },

  // Obtener lista de expedientes
  getAll: async (params?: any): Promise<{ data: Expediente[]; total: number }> => {
    const response = await api.get('/expedientes', { params });
    return response.data;
  },
};

export const catalogosService = {
  // Obtener unidades administrativas
  getUnidades: async (): Promise<UnidadAdministrativa[]> => {
    const response = await api.get<UnidadAdministrativa[]>('/catalogos/unidades');
    return response.data;
  },

  // Obtener secciones
  getSecciones: async (): Promise<Seccion[]> => {
    const response = await api.get<Seccion[]>('/catalogos/secciones');
    return response.data;
  },

  // Obtener series por sección
  getSeriesBySeccion: async (seccionId: string): Promise<Serie[]> => {
    const response = await api.get<Serie[]>(`/catalogos/series/${seccionId}`);
    return response.data;
  },

  // Obtener subseries por serie
  getSubseriesBySerie: async (serieId: string): Promise<Subserie[]> => {
    const response = await api.get<Subserie[]>(`/catalogos/subseries/${serieId}`);
    return response.data;
  },
};
