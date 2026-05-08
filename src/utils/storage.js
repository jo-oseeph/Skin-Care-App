import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'skincare_token';
const USER_KEY  = 'skincare_user';
const CART_KEY  = 'skincare_cart';

// ── Token (SecureStore — encrypted) ───────────────────────
export const saveToken = async (token) => {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
};
export const getToken = async () => {
  return await SecureStore.getItemAsync(TOKEN_KEY);
};
export const removeToken = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
};

// ── User (SecureStore — encrypted) ────────────────────────
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

// ── Cart (AsyncStorage — persists for guests too) ─────────
// We use AsyncStorage here instead of SecureStore because
// cart data isn't sensitive — it just needs to persist across sessions
export const saveCartToStorage = async (items) => {
  await AsyncStorage.setItem(CART_KEY, JSON.stringify(items));
};
export const getCartFromStorage = async () => {
  const cart = await AsyncStorage.getItem(CART_KEY);
  return cart ? JSON.parse(cart) : [];
};
export const removeCartFromStorage = async () => {
  await AsyncStorage.removeItem(CART_KEY);
};

// ── Clear everything on logout ─────────────────────────────
export const clearAll = async () => {
  await removeToken();
  await removeUser();
  // Note: we intentionally do NOT clear cart on logout
  // Cart clears only when user explicitly checks out or we merge with backend
};