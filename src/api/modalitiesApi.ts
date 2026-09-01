import { httpClient } from './httpClient';
import type { ImagingModality } from '../types/cases';

export const modalitiesApi = {
  // Public (active only)
  async getActive(): Promise<ImagingModality[]> {
    const response = await httpClient.get<any>('/api/imaging-modalities');
    return response.data.items || response.data;
  },

  // Admin CRUD
  async getAdminAll(): Promise<ImagingModality[]> {
    const response = await httpClient.get<any>('/api/admin/imaging-modalities');
    return response.data.items || response.data;
  },

  async getAdminById(id: number): Promise<ImagingModality> {
    const response = await httpClient.get<ImagingModality>(`/api/admin/imaging-modalities/${id}`);
    return response.data;
  },

  async create(data: Partial<ImagingModality>): Promise<ImagingModality> {
    const response = await httpClient.post<ImagingModality>('/api/admin/imaging-modalities', data);
    return response.data;
  },

  async update(id: number, data: Partial<ImagingModality>): Promise<ImagingModality> {
    const response = await httpClient.patch<ImagingModality>(`/api/admin/imaging-modalities/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await httpClient.delete(`/api/admin/imaging-modalities/${id}`);
  }
};
