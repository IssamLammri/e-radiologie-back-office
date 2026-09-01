import { defineStore } from 'pinia';
import { authApi } from '../api/authApi';
import type { User } from '../types/user';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('e_radiologie_token') || null as string | null,
        user: null as User | null,
        loading: false,
        initialized: false,
    }),
    
    getters: {
        isAuthenticated: (state) => !!state.user && !!state.token,
        isAdmin: (state) => !!state.user?.roles.includes('ROLE_ADMIN'),
        fullName: (state) => state.user ? `${state.user.firstName} ${state.user.lastName}` : '',
    },
    
    actions: {
        async initialize() {
            this.loading = true;
            if (this.token) {
                try {
                    await this.fetchMe();
                } catch (error) {
                    // Token invalid or expired
                    this.logout();
                }
            }
            this.initialized = true;
            this.loading = false;
        },
        
        async login(email: string, password: string) {
            this.loading = true;
            try {
                const data = await authApi.login(email, password);
                this.token = data.token;
                localStorage.setItem('e_radiologie_token', data.token);
                await this.fetchMe();
            } finally {
                this.loading = false;
            }
        },
        
        async fetchMe() {
            try {
                const user = await authApi.me();
                this.user = user;
            } catch (error) {
                this.logout();
                throw error;
            }
        },
        
        logout() {
            this.token = null;
            this.user = null;
            localStorage.removeItem('e_radiologie_token');
        }
    }
});
