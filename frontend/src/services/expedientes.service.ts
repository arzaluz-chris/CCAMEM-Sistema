import apiService from './api.service';
import { Expediente, ExpedienteFilters, PaginatedResponse, ExpedienteFormData } from '../types';

class ExpedientesService {
  async getAll(filters?: ExpedienteFilters): Promise<PaginatedResponse<Expediente>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const response = await apiService.get<{ success: boolean; data: { expedientes: Expediente[]; pagination: any } }>(
      `/expedientes?${params.toString()}`
    );
    return {
      data: response.data.expedientes,
      page: response.data.pagination.page,
      limit: response.data.pagination.limit,
      total: response.data.pagination.total,
      totalPages: response.data.pagination.totalPages,
    };
  }

  async getById(id: string): Promise<Expediente> {
    const response = await apiService.get<{ data: Expediente }>(`/expedientes/${id}`);
    return response.data;
  }

  async create(data: ExpedienteFormData): Promise<Expediente> {
    const response = await apiService.post<{ data: Expediente }>('/expedientes', data);
    return response.data;
  }

  async update(id: string, data: Partial<ExpedienteFormData>): Promise<Expediente> {
    const response = await apiService.put<{ data: Expediente }>(`/expedientes/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiService.delete(`/expedientes/${id}`);
  }

  async search(query: string): Promise<Expediente[]> {
    const response = await apiService.get<{ data: Expediente[] }>(`/expedientes/buscar?q=${query}`);
    return response.data;
  }

  async prestar(id: string, motivo: string, fechaDevolucion: string): Promise<void> {
    await apiService.post(`/expedientes/${id}/prestar`, { motivo, fechaDevolucion });
  }

  async devolver(id: string, observaciones?: string): Promise<void> {
    await apiService.post(`/expedientes/${id}/devolver`, { observaciones });
  }

  async transferir(expedientesIds: string[], tipo: 'primaria' | 'secundaria'): Promise<void> {
    await apiService.post('/expedientes/transferir', { expedientesIds, tipo });
  }

  async exportar(formato: 'excel' | 'pdf', filters?: ExpedienteFilters): Promise<void> {
    const params = new URLSearchParams();
    params.append('formato', formato);

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    await apiService.download(
      `/expedientes/exportar?${params.toString()}`,
      `expedientes-${new Date().toISOString().split('T')[0]}.${formato === 'excel' ? 'xlsx' : 'pdf'}`
    );
  }
}

export default new ExpedientesService();
