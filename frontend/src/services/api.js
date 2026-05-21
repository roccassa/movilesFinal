
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.68.1:3000/api';


const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});


api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export const registerUser = (data) => api.post('/users/register', data);
export const loginUser    = (data) => api.post('/users/login', data);
export const getProfile   = (id)   => api.get(`/users/${id}`);
export const updateUser   = (id, data) => api.put(`/users/${id}`, data);


export const getProducts      = ()       => api.get('/products');
export const getProduct       = (id)     => api.get(`/products/${id}`);
export const createProduct    = (data)   => api.post('/products', data);
export const updateProduct    = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct    = (id)     => api.delete(`/products/${id}`);


export const createOrder      = (data)   => api.post('/orders', data);
export const getMyOrders      = ()       => api.get('/orders/my');
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}/status`, { status });
export const deleteOrder      = (id)     => api.delete(`/orders/${id}`);

export default api;
