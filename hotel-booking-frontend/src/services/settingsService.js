import apiClient from './apiClient';

let cached = null;

const settingsService = {
    // Public endpoint — no auth needed
    get: async () => {
        if (cached) return cached;
        try {
            const res = await apiClient.get('/site-settings');
            cached = res.data;
            return cached;
        } catch {
            return {};
        }
    },
    clearCache: () => { cached = null; },
};

export default settingsService;
