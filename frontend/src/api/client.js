import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // Non-negotiable: sends HttpOnly cookies automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for responses to handle 401 unauthenticated gracefully
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMsg =
      error.response?.data?.error ||
      error.response?.data?.details?.[0]?.message ||
      error.message ||
      'An unexpected network error occurred.';
    return Promise.reject(new Error(errorMsg));
  }
);

// ============================================================================
// MODULAR API SERVICES
// ============================================================================

export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
};

export const caseApi = {
  getCategories: () => api.get('/cases/categories'),
  getCategoryBySlug: (slug) => api.get(`/cases/categories/${slug}`),
  getCases: () => api.get('/cases'),
  getCaseById: (id) => api.get(`/cases/${id}`),
  createCase: (payload) => api.post('/cases', payload),
  updateCaseStatus: (id, status) => api.patch(`/cases/${id}/status`, { status }),
};

export const docApi = {
  uploadDocument: (formData) =>
    api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  listDocuments: () => api.get('/documents'),
  deleteDocument: (id) => api.delete(`/documents/${id}`),
  getDownloadUrl: (id) => `/api/documents/${id}/download`,
};

export const agentApi = {
  listLawyers: (params = {}) => api.get('/agents', { params }),
  getLawyerById: (id) => api.get(`/agents/${id}`),
  updateProfile: (profileData) => api.put('/agents/profile', profileData),
};

export const chatApi = {
  getSessions: () => api.get('/chat/sessions'),
  getMessages: (sessionId) => api.get(`/chat/sessions/${sessionId}/messages`),
  sendMessage: (payload) => api.post('/chat/messages', payload),
};

export default api;
