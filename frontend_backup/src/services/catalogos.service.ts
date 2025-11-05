import apiService from './api.service';
import { UnidadAdministrativa, Seccion, Serie, Subserie } from '../types';

class CatalogosService {
  // Unidades Administrativas
  async getUnidades(): Promise<UnidadAdministrativa[]> {
    const response = await apiService.get<{ data: UnidadAdministrativa[] }>('/catalogos/unidades');
    return response.data;
  }

  async getUnidadById(id: string): Promise<UnidadAdministrativa> {
    const response = await apiService.get<{ data: UnidadAdministrativa }>(`/catalogos/unidades/${id}`);
    return response.data;
  }

  // Secciones
  async getSecciones(): Promise<Seccion[]> {
    const response = await apiService.get<{ data: Seccion[] }>('/catalogos/secciones');
    return response.data;
  }

  async getSeccionById(id: string): Promise<Seccion> {
    const response = await apiService.get<{ data: Seccion }>(`/catalogos/secciones/${id}`);
    return response.data;
  }

  // Series
  async getSeries(seccionId?: string): Promise<Serie[]> {
    const url = seccionId
      ? `/catalogos/secciones/${seccionId}/series`
      : '/catalogos/series';
    const response = await apiService.get<{ data: Serie[] }>(url);
    return response.data;
  }

  async getSerieById(id: string): Promise<Serie> {
    const response = await apiService.get<{ data: Serie }>(`/catalogos/series/${id}`);
    return response.data;
  }

  // Subseries
  async getSubseries(serieId?: string): Promise<Subserie[]> {
    const url = serieId
      ? `/catalogos/series/${serieId}/subseries`
      : '/catalogos/subseries';
    const response = await apiService.get<{ data: Subserie[] }>(url);
    return response.data;
  }

  async getSubserieById(id: string): Promise<Subserie> {
    const response = await apiService.get<{ data: Subserie }>(`/catalogos/subseries/${id}`);
    return response.data;
  }

  // Generar fórmula clasificadora
  generateFormulaClasificadora(
    unidad: UnidadAdministrativa,
    seccion: Seccion,
    serie: Serie,
    subserie: Subserie | null,
    numeroExpediente: string
  ): string {
    const partes = [
      'CCAMEM',
      unidad.clave,
      seccion.clave,
      serie.clave,
    ];

    if (subserie) {
      partes.push(subserie.clave);
    }

    partes.push(numeroExpediente);

    return partes.join('/');
  }
}

export default new CatalogosService();
