import axios from 'axios';

// Support VITE_API_URL for production deployment (e.g. Render/Railway backend)
// In local dev, falls back to '/api' which Vite proxies to localhost:5001
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor for clear cyber error messaging
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'Network communication failure. Please verify backend server is active.';
    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.code === 'ECONNABORTED') {
      message = 'Request timed out while scanning target host.';
    }
    return Promise.reject(new Error(message));
  }
);

export const scanApi = {
  // Execute full target scan
  performScan: async (target, mode = 'full') => {
    const res = await apiClient.post('/scan', { target, mode });
    return res.data;
  },

  // Get specific scan report
  getScanReport: async (id) => {
    const res = await apiClient.get(`/scan/${id}`);
    return res.data;
  },

  // Get scan history list
  getScanHistory: async (params = {}) => {
    const res = await apiClient.get('/history', { params });
    return res.data;
  },

  // Delete a scan from history
  deleteScan: async (id) => {
    const res = await apiClient.delete(`/history/${id}`);
    return res.data;
  },

  // Clear entire scan history
  clearAllHistory: async () => {
    const res = await apiClient.delete('/history');
    return res.data;
  },

  // Get dashboard statistics and charts
  getDashboardStats: async () => {
    const res = await apiClient.get('/stats');
    return res.data;
  },

  // Dedicated IP lookup
  lookupIp: async (ip) => {
    const res = await apiClient.get(`/ip/${encodeURIComponent(ip)}`);
    return res.data;
  },

  // Dedicated Domain lookup
  lookupDomain: async (domain) => {
    const res = await apiClient.get(`/domain/${encodeURIComponent(domain)}`);
    return res.data;
  },

  // Dedicated URL analysis
  analyzeUrl: async (url) => {
    const res = await apiClient.get(`/url/analyze`, { params: { url } });
    return res.data;
  },

  // Health check
  checkHealth: async () => {
    const res = await apiClient.get('/health');
    return res.data;
  }
};

export default scanApi;
