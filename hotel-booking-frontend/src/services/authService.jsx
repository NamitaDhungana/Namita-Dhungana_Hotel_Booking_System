import apiClient from './apiClient';

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

    login: async (credentials) => {
        try {
            const response = await apiClient.post('/login', credentials);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
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
        return !!localStorage.getItem('token');
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
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
