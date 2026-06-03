import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getExpenses = () => API.get('/expenses');
export const addExpense = (expense) => API.post('/expenses', expense);
export const updateExpense = (id, expense) => API.put(`/expenses/${id}`, expense);
export const deleteExpense = (id) => API.delete(`/expenses/${id}`);
export const setupGooglePin = (data) => API.post('/auth/google-setup-pin', data);
export const verifyGooglePin = (data) => axios.post('http://localhost:5000/api/auth/google-verify-pin', data);