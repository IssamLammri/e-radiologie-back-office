import axios from 'axios';

// Get the base URL from env variables, fallback to production URL if not set
const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://api.e-radiologie.com';

export const httpClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
});

// Interceptor to add auth token
httpClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('e_radiologie_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor to handle global 401s
httpClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // We shouldn't remove token if it's the login request itself that failed with 401
            if (error.config && error.config.url !== '/api/login_check') {
                localStorage.removeItem('e_radiologie_token');
                // The store will need to be cleared too, but doing it from the router/store directly is better.
                // We will emit an event or just let the router guard or component catch it, 
                // but standard practice is to redirect.
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);
