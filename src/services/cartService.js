import axios from 'axios';
import { BASE_URL } from '../constants/api';
import { getToken } from '../utils/storage';

const authRequest = async () => {
  const token = await getToken();
  return axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: { Authorization: `Bearer ${token}` },
  });
};

//GET cart from backend 
export const fetchBackendCart = async () => {
  try {
    const api = await authRequest();
    const res = await api.get('/cart');
    return { success: true, data: res.data.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch cart',
    };
  }
};

// ADD item to backend cart 
export const addItemToBackend = async (productId, quantity) => {
  try {
    const api = await authRequest();
    const res = await api.post('/cart', { productId, quantity });
    return { success: true, data: res.data.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to add item',
    };
  }
};

//UPDATE item quantity on backend 
export const updateItemOnBackend = async (productId, quantity) => {
  try {
    const api = await authRequest();
    const res = await api.patch('/cart', { productId, quantity });
    return { success: true, data: res.data.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update item',
    };
  }
};

//REMOVE item from backend 
export const removeItemFromBackend = async (productId) => {
  try {
    const api = await authRequest();
    const res = await api.delete(`/cart/${productId}`);
    return { success: true, data: res.data.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to remove item',
    };
  }
};

//CLEAR entire cart on backend
export const clearBackendCart = async () => {
  try {
    const api = await authRequest();
    await api.delete('/cart');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to clear cart',
    };
  }
};