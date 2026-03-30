import apiClient from './apiClient';

const bookingService = {
    createBooking: async (bookingData) => {
        try {
            const response = await apiClient.post('/bookings', bookingData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getUserBookings: async (page = 1) => {
        try {
            const response = await apiClient.get('/user/bookings', { params: { page, per_page: 10 } });
            return response.data; // return full paginated response
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getBookingDetails: async (id) => {
        try {
            const response = await apiClient.get(`/bookings/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    createMultiBooking: async (payload) => {
        try {
            const response = await apiClient.post('/bookings/multi', payload);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    cancelBooking: async (id, reason = '') => {
        try {
            const response = await apiClient.post(`/bookings/${id}/cancel`, { reason });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    checkCancellationEligibility: async (id) => {
        try {
            const response = await apiClient.post(`/bookings/${id}/cancel`, { check_only: true });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default bookingService;
