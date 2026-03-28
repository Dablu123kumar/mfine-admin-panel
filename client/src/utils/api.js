import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mfine_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('mfine_token');
      localStorage.removeItem('mfine_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── API helpers ──────────────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  registerCustomer: (data) => api.post('/auth/register-customer', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/update-profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.put(`/auth/reset-password/${token}`, data),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getActivity: () => api.get('/dashboard/activity'),
};

const buildCRUD = (base) => ({
  getAll: (params) => api.get(base, { params }),
  getOne: (id) => api.get(`${base}/${id}`),
  create: (data) => api.post(base, data),
  update: (id, data) => api.put(`${base}/${id}`, data),
  delete: (id) => api.delete(`${base}/${id}`),
});

export const doctorsAPI = {
  ...buildCRUD('/doctors'),
  getStats: () => api.get('/doctors/stats'),
  verify: (id) => api.put(`/doctors/${id}/verify`),
  suspend: (id) => api.put(`/doctors/${id}/suspend`),
};

export const patientsAPI = {
  ...buildCRUD('/patients'),
  getStats: () => api.get('/patients/stats'),
  block: (id) => api.put(`/patients/${id}/block`),
  addWallet: (id, data) => api.put(`/patients/${id}/wallet`, data),
};

export const appointmentsAPI = {
  ...buildCRUD('/appointments'),
  getStats: () => api.get('/appointments/stats'),
  cancel: (id, data) => api.put(`/appointments/${id}/cancel`, data),
};

export const paymentsAPI = {
  ...buildCRUD('/payments'),
  getStats: () => api.get('/payments/stats'),
  refund: (id, data) => api.post(`/payments/${id}/refund`, data),
};

export const specialitiesAPI = buildCRUD('/specialities');
export const labTestsAPI = buildCRUD('/lab-tests');
export const medicinesAPI = buildCRUD('/medicines');
export const prescriptionsAPI = buildCRUD('/prescriptions');
export const usersAPI = buildCRUD('/users');
export const notificationsAPI = {
  ...buildCRUD('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
};
export const reportsAPI = {
  getRevenue: (params) => api.get('/reports/revenue', { params }),
};

export const customerAPI = {
  getDoctors: (params) => api.get('/doctors', { params }),
  getAppointments: (params) => api.get('/customer/appointments', { params }),
  bookAppointment: (data) => api.post('/customer/appointments', data),
  getLabTests: (params) => api.get('/customer/lab-tests', { params }),
  orderLabTest: (data) => api.post('/customer/lab-tests', data),
  getMedicines: (params) => api.get('/customer/medicines', { params }),
  orderMedicine: (data) => api.post('/customer/medicines', data),
  getPayments: (params) => api.get('/customer/payments', { params }),
  processPayment: (data) => api.post('/customer/payments/process', data),
  getPrescriptions: (params) => api.get('/customer/prescriptions', { params }),
};

export const medicineCatalogAPI = {
  browse: (params) => api.get('/medicine-catalog', { params }),
  getAll: (params) => api.get('/medicine-catalog', { params }),
  getOne: (id) => api.get(`/medicine-catalog/${id}`),
  create: (data) => api.post('/medicine-catalog', data),
  update: (id, data) => api.put(`/medicine-catalog/${id}`, data),
  delete: (id) => api.delete(`/medicine-catalog/${id}`),
};
