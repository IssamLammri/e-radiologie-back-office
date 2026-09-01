import { httpClient } from './httpClient';
import type { LoginResponse } from '../types/auth';
import type { User } from '../types/user';

export const authApi = {
    async login(email: string, password: string): Promise<LoginResponse> {
        const response = await httpClient.post<LoginResponse>('/api/login_check', { email, password });
        return response.data;
    },

    async me(): Promise<User> {
        const response = await httpClient.get<User>('/api/auth/me');
        return response.data;
    },

    async forgotPassword(email: string): Promise<void> {
        await httpClient.post('/api/auth/forgot-password', { email });
    },

    async resetPassword(token: string, password: string, passwordConfirmation: string): Promise<void> {
        await httpClient.post('/api/auth/reset-password', { token, password, passwordConfirmation });
    },

    async updateProfile(data: { firstName?: string; lastName?: string; email?: string }) {
        const response = await httpClient.patch<{ message: string; user: User; requiresReauthentication: boolean }>('/api/auth/me', data);
        return response.data;
    },

    async updatePassword(data: { currentPassword?: string; newPassword?: string; passwordConfirmation?: string }) {
        const response = await httpClient.patch<{ message: string }>('/api/auth/me/password', data);
        return response.data;
    }
};
