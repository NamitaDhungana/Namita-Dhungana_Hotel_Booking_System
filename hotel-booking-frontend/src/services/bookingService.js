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

    getUserBookings: async () => {
        try {
            const response = await apiClient.get('/user/bookings');
            return response.data;
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

    cancelBooking: async (id) => {
        try {
            const response = await apiClient.post(`/bookings/${id}/cancel`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default bookingService;
