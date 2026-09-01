import { httpClient } from './httpClient';
import type { RadiologyCase, PaginatedResponse } from '../types/cases';

export const casesApi = {
  // --- Public Routes ---
  async getRecent(): Promise<RadiologyCase[]> {
    const response = await httpClient.get<any>('/api/cases/recent');
    return response.data.items || response.data;
  },

  async getPublished(params?: Record<string, any>): Promise<PaginatedResponse<RadiologyCase>> {
    const response = await httpClient.get<PaginatedResponse<RadiologyCase>>('/api/cases', { params });
    return response.data;
  },

  async getPublishedBySlug(slug: string): Promise<RadiologyCase> {
    const response = await httpClient.get<RadiologyCase>(`/api/cases/${slug}`);
    return response.data;
  },

  // --- Admin Routes ---
  async getAdminAll(params?: Record<string, any>): Promise<PaginatedResponse<RadiologyCase>> {
    const response = await httpClient.get<PaginatedResponse<RadiologyCase>>('/api/admin/radiology-cases', { params });
    return response.data;
  },

  async getAdminById(id: number): Promise<RadiologyCase> {
    const response = await httpClient.get<RadiologyCase>(`/api/admin/radiology-cases/${id}`);
    return response.data;
  },

  async create(data: Partial<RadiologyCase>): Promise<RadiologyCase> {
    const response = await httpClient.post<RadiologyCase>('/api/admin/radiology-cases', data);
    return response.data;
  },

  async update(id: number, data: Partial<RadiologyCase>): Promise<RadiologyCase> {
    const response = await httpClient.patch<RadiologyCase>(`/api/admin/radiology-cases/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await httpClient.delete(`/api/admin/radiology-cases/${id}`);
  },

  async publish(id: number): Promise<void> {
    await httpClient.post(`/api/admin/radiology-cases/${id}/publish`, {});
  },

  async archive(id: number): Promise<void> {
    await httpClient.post(`/api/admin/radiology-cases/${id}/archive`, {});
  }
};
