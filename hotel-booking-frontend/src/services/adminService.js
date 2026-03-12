import apiClient from './apiClient';

const adminService = {
    getDashboardStats: async () => {
        try {
            const response = await apiClient.get('/admin/dashboard');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getRevenueReport: async () => {
        try {
            const response = await apiClient.get('/admin/revenue');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Hotel Management
    createHotel: async (hotelData) => {
        try {
            const response = await apiClient.post('/admin/hotels', hotelData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateHotel: async (id, hotelData) => {
        try {
            const response = await apiClient.put(`/admin/hotels/${id}`, hotelData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    deleteHotel: async (id) => {
        try {
            const response = await apiClient.delete(`/admin/hotels/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Room Management
    createRoomType: async (roomTypeData) => {
        try {
            const response = await apiClient.post('/admin/room-types', roomTypeData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateRoomType: async (id, roomTypeData) => {
        try {
            const response = await apiClient.put(`/admin/room-types/${id}`, roomTypeData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateRoomStatus: async (id, status) => {
        try {
            const response = await apiClient.put(`/admin/rooms/${id}/status`, { status });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Booking Management
    getAllBookings: async () => {
        try {
            const response = await apiClient.get('/admin/bookings');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateBookingStatus: async (id, status) => {
        try {
            const response = await apiClient.put(`/admin/bookings/${id}/status`, { status });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default adminService;
