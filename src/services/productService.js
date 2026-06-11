import axios from "axios";
import { BASE_URL } from "../constants/api";

// GET ALL PRODUCTS — used by ProductsScreen (full catalog, filters, search)
export const getProducts = async (params = {}) => {
  try {
    const response = await axios.get(`${BASE_URL}/products`, {
      params,
      timeout: 10000,
    });

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

// GET FEATURED / NEW ARRIVALS — used by HomeScreen (latest products, limited)
// Keeps Home lightweight; doesn't expose full catalog logic to the Home tab.
export const getFeaturedProducts = async (params = {}) => {
  try {
    const mergedParams = {
      sortBy: "newest",
      limit: 8,
      ...params, // caller can override limit or sortBy
    };

    const response = await axios.get(`${BASE_URL}/products`, {
      params: mergedParams,
      timeout: 10000,
    });

    return {
      success: true,
      products: response.data.products || response.data.data || [],
    };
  } catch (error) {
    console.error(
      "Featured Products API Error:",
      error.response?.data || error.message
    );
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to load featured products",
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