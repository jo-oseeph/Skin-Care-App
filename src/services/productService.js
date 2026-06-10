import axios from "axios";
import { BASE_URL } from "../constants/api";

// GET ALL PRODUCTS
export const getProducts = async (params = {}) => {
  try {
    const response = await axios.get(`${BASE_URL}/products`, {
      params,
      timeout: 10000,
    });

    console.log("Products API Response:", response.data);

    return {
      success: true,
      products: response.data.products || response.data.data || [],
      pagination: response.data.pagination,
    };
  } catch (error) {
    console.error("Products API Error:", error.response?.data || error.message);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to load products",
    };
  }
};

// GET SINGLE PRODUCT
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
      message: error.response?.data?.message || "Failed to load product",
    };
  }
};
