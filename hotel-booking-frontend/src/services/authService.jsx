import apiClient from './apiClient';

// Use localStorage if remember me, else sessionStorage
const getStorage = () => {
    return localStorage.getItem('rememberMe') === 'true' ? localStorage : sessionStorage;
};

const authService = {
    register: async (userData) => {
        try {
            const response = await apiClient.post('/register', userData);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    login: async (credentials, rememberMe = false) => {
        try {
            const response = await apiClient.post('/login', credentials);
            if (response.data.token) {
                // Always persist rememberMe flag in localStorage so getStorage() works
                localStorage.setItem('rememberMe', rememberMe ? 'true' : 'false');
                const storage = rememberMe ? localStorage : sessionStorage;
                storage.setItem('token', response.data.token);
                storage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    logout: async () => {
        try {
            await apiClient.post('/logout');
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            localStorage.removeItem('rememberMe');
        }
    },

    getProfile: async () => {
        try {
            const response = await apiClient.get('/profile');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    isAuthenticated: () => {
        return !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('user') || sessionStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    getToken: () => {
        return localStorage.getItem('token') || sessionStorage.getItem('token');
    },

    verifyEmailCode: async (userId, code) => {
        try {
            const response = await apiClient.post('/email/verify-code', { user_id: userId, code });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    resendVerificationCode: async (userId) => {
        try {
            const response = await apiClient.post('/email/resend-code', { user_id: userId });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default authService;
