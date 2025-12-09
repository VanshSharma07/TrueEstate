import axios from 'axios';

// In production VITE_API_URL = https://truestate-gzt7.onrender.com/api
// In dev, uses the proxy via /api
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error.response?.data || error);
    }
);

// Transaction API calls
export const transactionApi = {
    // Get paginated transactions with filters
    getTransactions: async (params = {}) => {
        const queryString = buildQueryString(params);
        return api.get(`/transactions${queryString}`);
    },

    // Get single transaction by ID
    getTransaction: async (id) => {
        return api.get(`/transactions/${id}`);
    },

    // Get filter options for dropdowns
    getFilterOptions: async () => {
        return api.get('/transactions/filters');
    },

    // Get transaction statistics (supports filters)
    getStats: async (params = {}) => {
        const queryString = buildQueryString(params);
        return api.get(`/transactions/stats${queryString}`);
    },

    // Export transactions as CSV
    exportCSV: async (params = {}) => {
        const queryString = buildQueryString(params);
        window.open(`${API_BASE_URL}/transactions/export${queryString}`, '_blank');
    },
};

// Build query string from params object
function buildQueryString(params) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') return;

        if (Array.isArray(value)) {
            value.forEach(v => {
                if (v !== null && v !== undefined && v !== '') {
                    searchParams.append(key, v);
                }
            });
        } else {
            searchParams.append(key, value);
        }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
}

export default api;
