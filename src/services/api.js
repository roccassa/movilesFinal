import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Usuarios ────────────────────────────────────────────────────────────
export const registerUser = (data)       => api.post('/users/register', data);
export const loginUser    = (data)       => api.post('/users/login', data);
export const getAllUsers   = ()           => api.get('/users');
export const getProfile   = (id)         => api.get(`/users/${id}`);
export const updateUser   = (id, data)   => api.put(`/users/${id}`, data);
export const deleteUser   = (id)         => api.delete(`/users/${id}`);

// ── Productos ───────────────────────────────────────────────────────────
export const getProducts   = ()           => api.get('/products');
export const getProduct    = (id)         => api.get(`/products/${id}`);
export const createProduct = (data)       => api.post('/products', data);
export const updateProduct = (id, data)   => api.put(`/products/${id}`, data);
export const deleteProduct = (id)         => api.delete(`/products/${id}`);

// ── Pedidos ─────────────────────────────────────────────────────────────
export const getAllOrders       = ()             => api.get('/orders');
export const createOrder        = (data)         => api.post('/orders', data);
export const getMyOrders        = ()             => api.get('/orders/my');
export const updateOrderStatus  = (id, status)   => api.patch(`/orders/${id}/status`, { status });
export const deleteOrder        = (id)           => api.delete(`/orders/${id}`);

// ── Categorías ──────────────────────────────────────────────────────────
export const getCategories    = ()         => api.get('/categories');
export const getAllCategories  = ()         => api.get('/categories/all');
export const createCategory   = (data)     => api.post('/categories', data);
export const updateCategory   = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory   = (id)       => api.delete(`/categories/${id}`);

export default api;
