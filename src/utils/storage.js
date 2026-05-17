import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'skincare_token';
const USER_KEY  = 'skincare_user';

// ── Token ──────────────────────────────────────────────────
export const saveToken = async (token) => {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
};
export const getToken = async () => {
  return await SecureStore.getItemAsync(TOKEN_KEY);
};
export const removeToken = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
};

// ── User ───────────────────────────────────────────────────
export const saveUser = async (user) => {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
};
export const getUser = async () => {
  const user = await SecureStore.getItemAsync(USER_KEY);
  return user ? JSON.parse(user) : null;
};
export const removeUser = async () => {
  await SecureStore.deleteItemAsync(USER_KEY);
};

// ── Cart — keyed per user ID ───────────────────────────────
// Each user gets their own cart key: skincare_cart_userId
// This means two users on the same device never share a cart

const getCartKey = (userId) => `skincare_cart_${userId}`;
const GUEST_CART_KEY = 'skincare_cart_guest';

// Save cart for a specific user
export const saveCartToStorage = async (items, userId = null) => {
  const key = userId ? getCartKey(userId) : GUEST_CART_KEY;
  await AsyncStorage.setItem(key, JSON.stringify(items));
};

// Get cart for a specific user
export const getCartFromStorage = async (userId = null) => {
  const key = userId ? getCartKey(userId) : GUEST_CART_KEY;
  const cart = await AsyncStorage.getItem(key);
  return cart ? JSON.parse(cart) : [];
};

// Remove cart for a specific user
export const removeCartFromStorage = async (userId = null) => {
  const key = userId ? getCartKey(userId) : GUEST_CART_KEY;
  await AsyncStorage.removeItem(key);
};

// Clear everything on logout
export const clearAll = async () => {
  await removeToken();
  await removeUser();
  // Note: we do NOT clear the cart here
  // Cart is cleared per-user in CartContext when auth changes
};