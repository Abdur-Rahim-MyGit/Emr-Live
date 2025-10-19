import axios from "axios";

const API_BASE_URL = "http://localhost:5001/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  clinicLogin: (data) => api.post("/auth/clinic-login", data),
  requestLoginOTP: (data) => api.post("/auth/request-login-otp", data),
  verifyLoginOTP: (data) => api.post("/auth/verify-login-otp", data),
  verifyOTP: (data) => api.post("/auth/verify-otp", data),
  requestPasswordReset: (data) => api.post("/auth/forgot-password", data),
  verifyResetOTP: (data) => api.post("/auth/verify-reset-otp", data),
  resetPassword: (data) => api.post("/auth/reset-password", data),
  me: () => api.get("/auth/me"),
};

// Users API
export const usersAPI = {
  getAll: (params) => api.get("/users", { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// Clinics API
export const clinicsAPI = {
  getAll: () => api.get("/clinics"),
  getById: (id) => api.get(`/clinics/${id}`),
  create: (data) => api.post("/clinics", data),
  update: (id, data) => api.put(`/clinics/${id}`, data),
  delete: (id) => api.delete(`/clinics/${id}`),
  getDashboardData: (id) => api.get(`/clinics/${id}/dashboard-data`),

  // Validity management
  getValidity: (id) => api.get(`/clinics/${id}/validity`),
  renewValidity: (id, data) => api.put(`/clinics/${id}/renew`, data),
  getExpiringSoon: (days = 30) => api.get(`/clinics/expiring/${days}`),
  getExpired: () => api.get("/clinics/expired/list"),

  // Additional users management
  getUsers: (id) => api.get(`/clinics/${id}/users`),
  addUser: (id, userData) => api.post(`/clinics/${id}/users`, userData),
  updateUser: (id, userId, userData) =>
    api.put(`/clinics/${id}/users/${userId}`, userData),
  deleteUser: (id, userId) => api.delete(`/clinics/${id}/users/${userId}`),

  // Debug endpoint
  debug: (id) => api.get(`/clinics/${id}/debug`),
};

// Dashboard API
export const dashboardAPI = {
  getSuperMasterStats: () => api.get("/dashboard/super-master-stats"),
  getOverview: () => api.get("/dashboard/overview"),
  getAnalytics: (period = "30d") =>
    api.get(`/dashboard/analytics?period=${period}`),
  getSystemHealth: () => api.get("/dashboard/system-health"),
  getAlerts: () => api.get("/dashboard/alerts"),
};

// Patients API
export const patientsAPI = {
  getAll: (params) => api.get("/patients", { params }),
  getById: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post("/patients", data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`),
};

// Appointments API
export const appointmentsAPI = {
  getAll: (params) => api.get("/appointments", { params }),
  create: (data) => api.post("/appointments", data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
};

// Billing API
export const billingAPI = {
  getAll: (params) => api.get("/billing", { params }),
  create: (data) => api.post("/billing", data),
  update: (id, data) => api.put(`/billing/${id}`, data),
  getById: (id) => api.get(`/billing/${id}`),
};

// Invoices API
export const invoicesAPI = {
  getAll: (params) => api.get("/invoices", { params }),
  getById: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post("/invoices", data),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  delete: (id) => api.delete(`/invoices/${id}`),
  getStats: () => api.get("/invoices/stats"),
};

// Doctors API
export const doctorsAPI = {
  getAll: (params) => api.get("/doctors", { params }),
  getById: (id) => api.get(`/doctors/${id}`),
  create: (data) => api.post("/doctors", data),
  update: (id, data) => api.put(`/doctors/${id}`, data),
  delete: (id) => api.delete(`/doctors/${id}`),
  getStats: () => api.get("/doctors/stats/overview"),
};

// Referrals API
export const referralsAPI = {
  getAll: (params) => api.get("/referrals", { params }),
  getById: (id) => api.get(`/referrals/${id}`),
  create: (data) => api.post("/referrals", data),
  update: (id, data) => api.put(`/referrals/${id}`, data),
  delete: (id) => api.delete(`/referrals/${id}`),
};

// Nurses API
export const nursesAPI = {
  getAll: (params) => api.get("/nurses", { params }),
  getById: (id) => api.get(`/nurses/${id}`),
  create: (data) => api.post("/nurses", data),
  update: (id, data) => api.put(`/nurses/${id}`, data),
  delete: (id) => api.delete(`/nurses/${id}`),
};

// Case Log API
export const caseLogAPI = {
  // System-wide activity log
  getSystemActivity: (params) => api.get("/patientCaseLogs/system-activity", { params }),
  getLoginHistory: (params) => api.get("/patientCaseLogs/login-history", { params }),
  getLiveActivity: () => api.get("/patientCaseLogs/live-activity"),
  
  // Patient-specific case logs
  getByPatient: (patientId) => api.get(`/patientCaseLogs/${patientId}`),
  getLoginHistoryByPatient: (patientId, params) => api.get(`/patientCaseLogs/login-history/${patientId}`, { params }),
  getActivityByPatient: (patientId, params) => api.get(`/patientCaseLogs/activity/${patientId}`, { params }),
  addActivity: (patientId, data) => api.post(`/patientCaseLogs/activity/${patientId}`, data),
  
  // System monitoring
  getSystemHealth: () => api.get("/patientCaseLogs/system-health"),
  getActiveSessions: () => api.get("/patientCaseLogs/active-sessions"),
};

export default api;
