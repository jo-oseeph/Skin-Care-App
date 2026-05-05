// Your backend base URL.
// Replace the IP with YOUR computer's local IP address.
// On Windows: open cmd and type "ipconfig" — look for IPv4 Address

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