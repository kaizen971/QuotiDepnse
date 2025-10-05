import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://mabouya.servegame.com/QuotiDepnse/QuotiDepnse';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (name, email, password) => {
    const response = await api.post('/register', { name, email, password });
    if (response.data.token) {
      await AsyncStorage.setItem('userToken', response.data.token);
    }
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/login', { email, password });
    if (response.data.token) {
      await AsyncStorage.setItem('userToken', response.data.token);
    }
    return response.data;
  },
};

export const expenseAPI = {
  getAll: async () => {
    const response = await api.get('/expenses');
    return response.data;
  },

  create: async (expenseData) => {
    const response = await api.post('/expenses', expenseData);
    return response.data;
  },

  update: async (id, expenseData) => {
    const response = await api.put(`/expenses/${id}`, expenseData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/expenses/stats');
    return response.data;
  },
};

export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/profile', profileData);
    return response.data;
  },
};

export const feedbackAPI = {
  submit: async (feedbackData) => {
    const response = await api.post('/feedback', feedbackData);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/feedback');
    return response.data;
  },
};

export default api;
