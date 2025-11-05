import apiService from './api.service';
import { ReportOptions, DashboardStats } from '../types';

class ReportesService {
  async getStats(): Promise<DashboardStats> {
    const response = await apiService.get<{ data: DashboardStats }>('/reportes/stats');
    return response.data;
  }

  async generarReporte(options: ReportOptions): Promise<void> {
    const params = new URLSearchParams();
    params.append('tipo', options.tipo);
    params.append('formato', options.formato);

    if (options.unidadAdministrativaId) {
      params.append('unidadAdministrativaId', options.unidadAdministrativaId);
    }

    if (options.fechaDesde) {
      params.append('fechaDesde', options.fechaDesde);
    }

    if (options.fechaHasta) {
      params.append('fechaHasta', options.fechaHasta);
    }

    if (options.filtros) {
      Object.entries(options.filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const extension = options.formato === 'excel' ? 'xlsx' : 'pdf';
    const filename = `reporte-${options.tipo}-${new Date().toISOString().split('T')[0]}.${extension}`;

    await apiService.download(`/reportes/generar?${params.toString()}`, filename);
  }

  async generarInventarioGeneral(formato: 'excel' | 'pdf'): Promise<void> {
    await this.generarReporte({
      tipo: 'inventario_general',
      formato,
    });
  }

  async generarInventarioPorUnidad(unidadId: string, formato: 'excel' | 'pdf'): Promise<void> {
    await this.generarReporte({
      tipo: 'inventario_unidad',
      formato,
      unidadAdministrativaId: unidadId,
    });
  }

  async generarReportePrestamos(fechaDesde: string, fechaHasta: string, formato: 'excel' | 'pdf'): Promise<void> {
    await this.generarReporte({
      tipo: 'prestamos',
      formato,
      fechaDesde,
      fechaHasta,
    });
  }

  async generarReporteTransferencias(fechaDesde: string, fechaHasta: string, formato: 'excel' | 'pdf'): Promise<void> {
    await this.generarReporte({
      tipo: 'transferencias',
      formato,
      fechaDesde,
      fechaHasta,
    });
  }
}

export default new ReportesService();
