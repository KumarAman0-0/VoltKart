import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(original);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  getMe: () => api.get('/auth/me'),
};

// Buyer / Shop
export const shopAPI = {
  getDevices: (params) => api.get('/devices', { params }),
  getDevice: (id) => api.get(`/devices/${id}`),
  createOrder: (data) => api.post('/orders', data),
  verifyPayment: (id, data) => api.post(`/orders/${id}/pay`, data),
  getMyOrders: () => api.get('/orders/mine'),
  getOrder: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id, data) => api.post(`/orders/${id}/cancel`, data),
};

// Seller
export const sellerAPI = {
  createRequest: (data) => api.post('/sell-requests', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMyRequests: () => api.get('/sell-requests/mine'),
  getRequest: (id) => api.get(`/sell-requests/${id}`),
  getEstimate: (params) => api.get('/sell-requests/estimate', { params }),
  respondToOffer: (id, response) => api.post(`/sell-requests/${id}/accept-offer`, { response }),
  getProfile: () => api.get('/sell-requests/profile'),
  updateProfile: (data) => api.put('/sell-requests/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getPendingCounterOffer: (sellRequestId) => api.get(`/counter-offers/sell-request/${sellRequestId}`),
  acceptCounterOffer: (id) => api.post(`/counter-offers/${id}/accept`),
  declineCounterOffer: (id, data) => api.post(`/counter-offers/${id}/decline`, data),
};

// Admin
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getRequests: (params) => api.get('/admin/requests', { params }),
  getRequest: (id) => api.get(`/admin/requests/${id}`),
  setOffer: (id, data) => api.patch(`/admin/requests/${id}/offer`, data),
  setEstimatedMax: (id, data) => api.post(`/admin/requests/${id}/set-estimated-max`, data),
  assignAgent: (id, agentId) => api.post(`/admin/requests/${id}/assign-agent`, { agentId }),
  getUsers: (params) => api.get('/admin/users', { params }),
  getAgents: () => api.get('/admin/agents'),
  toggleBlock: (id) => api.patch(`/admin/users/${id}/block`),
  getOrders: (params) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id, data) => api.patch(`/admin/orders/${id}/status`, data),
  // Price tables
  getBasePrices: (params) => api.get('/admin/price-tables/base', { params }),
  upsertBasePrice: (data) => api.post('/admin/price-tables/base', data),
  deleteBasePrice: (id) => api.delete(`/admin/price-tables/base/${id}`),
  getDeductions: () => api.get('/admin/price-tables/deductions'),
  upsertDeduction: (data) => api.post('/admin/price-tables/deductions', data),
  deleteDeduction: (id) => api.delete(`/admin/price-tables/deductions/${id}`),
  getGradeRules: () => api.get('/admin/price-tables/grades'),
  upsertGradeRule: (data) => api.post('/admin/price-tables/grades', data),
  getAlerts: () => api.get('/admin/alerts'),
  // Counter offers & payouts
  getCounterOffers: (params) => api.get('/admin/counter-offers', { params }),
  approveCounterOffer: (id) => api.patch(`/admin/counter-offers/${id}/approve`),
  getPayouts: (params) => api.get('/admin/payouts', { params }),
  retryPayout: (id) => api.post(`/admin/payouts/${id}/retry`),
};

// Agent
export const agentAPI = {
  getPickups: () => api.get('/agent/pickups'),
  getPickup: (id) => api.get(`/agent/pickups/${id}`),
  startTrip: (id) => api.post(`/agent/pickups/${id}/start-trip`),
  verifyPickup: (id, data) => api.post(`/agent/pickups/${id}/verify`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// Inspection (agent + seller + admin)
export const inspectionAPI = {
  submit: (data) => api.post('/inspections', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  get: (sellRequestId) => api.get(`/inspections/${sellRequestId}`),
  sendOtp: (inspectionId) => api.post(`/inspections/${inspectionId}/send-otp`),
  confirmHandover: (inspectionId, data) => api.post(`/inspections/${inspectionId}/confirm`, data),
  createDiagnosticSession: (inspectionId) => api.post(`/inspections/${inspectionId}/diagnostic-session`),
  getLiveStatus: (inspectionId) => api.get(`/inspections/${inspectionId}/live-status`),
};

// Diagnostic (Seller phone browser)
export const diagnosticAPI = {
  getByCode: (code) => api.get(`/diagnostic/${code}`),
  submitTests: (code, data) => api.post(`/diagnostic/${code}/auto-tests`, data),
};

// Engineer
export const engineerAPI = {
  getDevices: (params) => api.get('/warehouse/devices', { params }),
  getDevice: (id) => api.get(`/warehouse/devices/${id}`),
  updateStatus: (id, data) => api.patch(`/warehouse/devices/${id}/status`, data),
  addFlashLog: (id, data) => api.post(`/warehouse/devices/${id}/flash-log`, data),
  setPricing: (id, data) => api.patch(`/warehouse/devices/${id}/pricing`, data),
  verifyDevice: (id, data) => api.post(`/warehouse/devices/${id}/verify`, data),
  createCounterOffer: (id, data) => api.post(`/warehouse/devices/${id}/counter-offer`, data),
};
