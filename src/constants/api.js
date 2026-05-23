
export const BASE_URL = 'http://192.168.100.11:5000/api';

export const ENDPOINTS = {
  login:      '/auth/login',
  register:   '/auth/register',
  products:   '/products',
  product:    (id) => `/products/${id}`,
  cart:       '/cart',
  orders:     '/orders',
  mpesaPay:   '/mpesa/pay',
};