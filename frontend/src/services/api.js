import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Use development endpoints for now (no database required)
const USE_DEV_ENDPOINTS = false;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => {
    const endpoint = USE_DEV_ENDPOINTS ? '/auth-dev/register' : '/auth/register';
    return api.post(endpoint, userData);
  },
  login: (credentials) => {
    const endpoint = USE_DEV_ENDPOINTS ? '/auth-dev/login' : '/auth/login';
    return api.post(endpoint, credentials);
  },
  getMe: () => {
    const endpoint = USE_DEV_ENDPOINTS ? '/auth-dev/me' : '/auth/me';
    return api.get(endpoint);
  },
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
};

// Scenarios API
export const scenariosAPI = {
  getScenarios: (params) => {
    const endpoint = USE_DEV_ENDPOINTS ? '/scenarios-dev' : '/scenarios';
    return api.get(endpoint, { params });
  },
  getScenario: (id) => {
    const endpoint = USE_DEV_ENDPOINTS ? `/scenarios-dev/${id}` : `/scenarios/${id}`;
    return api.get(endpoint);
  },
  startGame: (scenarioId) => {
    const endpoint = USE_DEV_ENDPOINTS ? `/scenarios-dev/${scenarioId}/start` : `/scenarios/${scenarioId}/start`;
    return api.post(endpoint);
  },
  makeDecision: (sessionId, decisionData) => {
    const endpoint = USE_DEV_ENDPOINTS ? `/scenarios-dev/sessions/${sessionId}/decision` : `/scenarios/sessions/${sessionId}/decision`;
    return api.post(endpoint, decisionData);
  },
  getProgress: () => {
    const endpoint = USE_DEV_ENDPOINTS ? '/scenarios-dev/progress/stats' : '/scenarios/sessions/my-progress';
    return api.get(endpoint);
  },
  submitCompletion: (id, data) => {
    const endpoint = USE_DEV_ENDPOINTS ? `/scenarios-dev/${id}/complete` : `/scenarios/${id}/complete`;
    return api.post(endpoint, data);
  }
};

// Users API
export const usersAPI = {
  getStats: () => api.get('/users/stats'),
  updatePreferences: (preferences) => api.put('/users/preferences', preferences),
  getLeaderboard: (params) => api.get('/users/leaderboard', { params }),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  changePassword: (passwordData) => api.put('/users/password', passwordData),
};

export default api;