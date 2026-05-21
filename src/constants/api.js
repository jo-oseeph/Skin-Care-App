
export const BASE_URL = 'http://10.199.54.73:5000/api';

export const ENDPOINTS = {
  login:      '/auth/login',
  register:   '/auth/register',
  products:   '/products',
  product:    (id) => `/products/${id}`,
  cart:       '/cart',
  orders:     '/orders',
  mpesaPay:   '/mpesa/pay',
};