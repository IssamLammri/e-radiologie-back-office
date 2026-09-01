import { httpClient } from './httpClient';
import type { CaseCategory } from '../types/cases';

export const categoriesApi = {
  // Public (active only)
  async getActive(): Promise<CaseCategory[]> {
    const response = await httpClient.get<any>('/api/case-categories');
    return response.data.items || response.data;
  },

  // Admin CRUD
  async getAdminAll(): Promise<CaseCategory[]> {
    const response = await httpClient.get<any>('/api/admin/case-categories');
    return response.data.items || response.data;
  },

  async getAdminById(id: number): Promise<CaseCategory> {
    const response = await httpClient.get<CaseCategory>(`/api/admin/case-categories/${id}`);
    return response.data;
  },

  async create(data: Partial<CaseCategory>): Promise<CaseCategory> {
    const response = await httpClient.post<CaseCategory>('/api/admin/case-categories', data);
    return response.data;
  },

  async update(id: number, data: Partial<CaseCategory>): Promise<CaseCategory> {
    const response = await httpClient.patch<CaseCategory>(`/api/admin/case-categories/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await httpClient.delete(`/api/admin/case-categories/${id}`);
  }
};
