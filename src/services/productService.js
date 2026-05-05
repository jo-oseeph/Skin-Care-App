import { create } from 'axios';
import { BASE_URL } from '../constants/api';

// We create a simple axios instance pointed at your backend
const api = create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Fetch all products — supports optional filters
// Example: getProducts({ category: 'moisturizer', search: 'glow' })
export const getProducts = async (params = {}) => {
  try {
    const response = await api.get('/products', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to load products',
    };
  }
};

// Fetch a single product by its ID
export const getProduct = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to load product',
    };
  }
};