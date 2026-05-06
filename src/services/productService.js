import axios from 'axios';
import { BASE_URL } from '../constants/api';

// ── GET ALL PRODUCTS ─────────────────────────────────────
// Backend returns: { success, products: [], pagination: {} }
export const getProducts = async (params = {}) => {
  try {
    const response = await axios.get(`${BASE_URL}/products`, {
      params,
      timeout: 10000,
    });

    return {
      success: true,
      products: response.data.products,
      pagination: response.data.pagination,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to load products',
    };
  }
};

// ── GET SINGLE PRODUCT ────────────────────────────────────
// Backend returns: { success, data: { ...product } }
export const getProduct = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/products/${id}`, {
      timeout: 10000,
    });

    return {
      success: true,
      product: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to load product',
    };
  }
};