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

// POST /api/orders/checkout
// Backend reads cart from DB using the user's token
// We just send the phone number
export const createOrder = async (phoneNumber) => {
  try {
    const api = await authRequest();
    const res = await api.post('/orders/checkout', { phoneNumber });
    return { success: true, data: res.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to create order',
    };
  }
};

// GET /api/orders/my
export const getMyOrders = async () => {
  try {
    const api = await authRequest();
    const res = await api.get('/orders/my');
    return { success: true, data: res.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch orders',
    };
  }
};

// GET /api/orders/:id
export const getOrderById = async (id) => {
  try {
    const api = await authRequest();
    const res = await api.get(`/orders/${id}`);
    return { success: true, data: res.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch order',
    };
  }
};