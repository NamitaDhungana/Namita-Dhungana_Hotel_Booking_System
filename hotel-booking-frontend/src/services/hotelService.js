import apiClient from './apiClient';

const hotelService = {
    getHotels: async () => {
        try {
            const response = await apiClient.get('/hotels');
            // Return response.data.data for paginated results, otherwise response.data
            return response.data.data || response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getHotelDetails: async (id) => {
        try {
            const response = await apiClient.get(`/hotels/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getRoomTypesByHotel: async (hotelId) => {
        try {
            const response = await apiClient.get(`/hotels/${hotelId}/room-types`);
            return response.data.data || response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    checkAvailability: async (availabilityData) => {
        try {
            const response = await apiClient.post('/rooms/availability', availabilityData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getPropertyTypes: async () => {
        try {
            const response = await apiClient.get('/property-types');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    showRoomType: async (id) => {
        try {
            const response = await apiClient.get(`/room-types/${id}`);
            return response.data.data || response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getUnavailableDates: async (id) => {
        try {
            const response = await apiClient.get(`/room-types/${id}/unavailable-dates`);
            return response.data; // Array of date strings
        } catch (error) {
            console.error("Failed to fetch unavailable dates", error);
            return [];
        }
    },

    getAllRoomTypes: async () => {
        try {
            const response = await apiClient.get('/room-types');
            return response.data.data || response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default hotelService;
