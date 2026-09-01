import { httpClient } from './httpClient';
import type { User } from '../types/user';

export interface PaginatedUsers {
  items: User[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export const usersApi = {
    async getAll(params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedUsers> {
        const response = await httpClient.get<PaginatedUsers>('/api/admin/users', { params });
        return response.data;
    },

    async getById(id: number): Promise<User> {
        const response = await httpClient.get<User>(`/api/admin/users/${id}`);
        return response.data;
    },

    async create(userData: any): Promise<{ message: string; user: User }> {
        const response = await httpClient.post<{ message: string; user: User }>('/api/admin/users', userData);
        return response.data;
    },

    async update(id: number, userData: any): Promise<{ message: string; user: User }> {
        const response = await httpClient.patch<{ message: string; user: User }>(`/api/admin/users/${id}`, userData);
        return response.data;
    },

    async updatePassword(id: number, data: { newPassword?: string; passwordConfirmation?: string }): Promise<{ message: string }> {
        const response = await httpClient.patch<{ message: string }>(`/api/admin/users/${id}/password`, data);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await httpClient.delete(`/api/admin/users/${id}`);
    }
};
