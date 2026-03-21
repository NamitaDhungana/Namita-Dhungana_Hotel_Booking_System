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

    getRoomTypesByHotel: async (hotelId, filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.min_price) params.append('min_price', filters.min_price);
            if (filters.max_price) params.append('max_price', filters.max_price);
            if (filters.min_guests) params.append('min_guests', filters.min_guests);
            if (filters.amenity) params.append('amenity', filters.amenity);
            const query = params.toString() ? `?${params.toString()}` : '';
            const response = await apiClient.get(`/hotels/${hotelId}/room-types${query}`);
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
    },

    getAmenities: async () => {
        try {
            const response = await apiClient.get('/amenities');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default hotelService;
