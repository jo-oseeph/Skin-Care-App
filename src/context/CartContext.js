import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useAuth } from './AuthContext';
import { saveCartToStorage, getCartFromStorage } from '../utils/storage';
import {
  fetchBackendCart,
  addItemToBackend,
  updateItemOnBackend,
  removeItemFromBackend,
  clearBackendCart,
} from '../services/cartService';

const CartContext = createContext();

const initialState = {
  items:     [],
  isLoading: false,
  isSynced:  false,
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'SET_ITEMS':
      return {
        ...state,
        items:     action.payload,
        isLoading: false,
        isSynced:  true,
      };
    case 'ADD_ITEM': {
      const exists = state.items.find(
        (i) => i.productId === action.payload.productId
      );
      if (exists) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.productId === action.payload.productId
              ? { ...i, quantity: i.quantity + action.payload.quantity }
              : i
          ),
        };
      }
      return { ...state, items: [...state.items, action.payload] };
    }
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map((i) =>
          i.productId === action.payload.productId
            ? { ...i, quantity: action.payload.quantity }
            : i
        ),
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((i) => i.productId !== action.payload),
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

const mergeCarts = (localItems, backendItems) => {
  const merged = [...localItems];

  backendItems.forEach((backendItem) => {
    const productId = backendItem.productId?._id || backendItem.productId;
    const localItem = merged.find((i) => i.productId === productId);

    if (localItem) {
      // Take higher quantity but never exceed stock
      const stock = backendItem.productId?.stock || localItem.stock || 0;
      localItem.quantity = Math.min(
        Math.max(localItem.quantity, backendItem.quantity),
        stock
      );
    } else {
      merged.push({
        productId,
        name:     backendItem.productId?.name        || '',
        price:    backendItem.productId?.price       || 0,
        image:    backendItem.productId?.images?.[0] || null,
        stock:    backendItem.productId?.stock       || 0,
        quantity: backendItem.quantity,
      });
    }
  });

  return merged;
};

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Ref so we can read current items inside callbacks
  // without causing infinite re-render loops
  const itemsRef = useRef(state.items);
  useEffect(() => {
    itemsRef.current = state.items;
  }, [state.items]);

  // ── Step 1: Restore cart from AsyncStorage on boot ────────
  useEffect(() => {
    (async () => {
      const saved = await getCartFromStorage();
      if (saved.length > 0) {
        dispatch({ type: 'SET_ITEMS', payload: saved });
      }
    })();
  }, []);

  // ── Step 2: Save to AsyncStorage on every cart change ─────
  useEffect(() => {
    saveCartToStorage(state.items);
  }, [state.items]);

  // ── Backend sync ───────────────────────────────────────────
  const syncWithBackend = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });

    const result = await fetchBackendCart();

    if (!result.success) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    const backendItems = result.data?.items || [];
    const localItems   = itemsRef.current;

    if (localItems.length > 0 && backendItems.length > 0) {
      const merged = mergeCarts(localItems, backendItems);
      dispatch({ type: 'SET_ITEMS', payload: merged });
      for (const item of localItems) {
        await addItemToBackend(item.productId, item.quantity);
      }
    } else if (backendItems.length > 0) {
      const normalized = backendItems.map((item) => ({
        productId: item.productId?._id          || item.productId,
        name:      item.productId?.name         || '',
        price:     item.productId?.price        || 0,
        image:     item.productId?.images?.[0]  || null,
        stock:     item.productId?.stock        || 0,
        quantity:  item.quantity,
      }));
      dispatch({ type: 'SET_ITEMS', payload: normalized });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // ── Step 3: React to login/logout ─────────────────────────
  useEffect(() => {
    if (isAuthenticated) {
      syncWithBackend();
    }
  }, [isAuthenticated, syncWithBackend]);

  // ── ADD TO CART ────────────────────────────────────────────
  const addToCart = useCallback(async (product, quantity = 1) => {
    // How many of this product are already in the cart
    const existing = itemsRef.current.find(
      (i) => i.productId === product._id
    );
    const currentQty = existing ? existing.quantity : 0;

    // Block if adding would exceed available stock
    if (currentQty + quantity > product.stock) {
      return {
        success: false,
        message: `Only ${product.stock} available in stock`,
      };
    }

    const item = {
      productId: product._id,
      name:      product.name,
      price:     product.price,
      image:     product.images?.[0] || null,
      stock:     product.stock,
      quantity,
    };

    dispatch({ type: 'ADD_ITEM', payload: item });

    if (isAuthenticated) {
      await addItemToBackend(product._id, quantity);
    }

    return { success: true };
  }, [isAuthenticated]);

  // ── UPDATE QUANTITY ────────────────────────────────────────
  const updateQuantity = useCallback(async (productId, quantity) => {
    if (quantity < 1) return;

    // Find the item to check its stock limit
    const item = itemsRef.current.find((i) => i.productId === productId);

    // Block if new quantity exceeds stock
    if (item && quantity > item.stock) {
      return;
    }

    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });

    if (isAuthenticated) {
      await updateItemOnBackend(productId, quantity);
    }
  }, [isAuthenticated]);

  // ── REMOVE FROM CART ───────────────────────────────────────
  const removeFromCart = useCallback(async (productId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });

    if (isAuthenticated) {
      await removeItemFromBackend(productId);
    }
  }, [isAuthenticated]);

  // ── CLEAR CART ─────────────────────────────────────────────
  const clearCart = useCallback(async () => {
    dispatch({ type: 'CLEAR_CART' });

    if (isAuthenticated) {
      await clearBackendCart();
    }
  }, [isAuthenticated]);

  // ── Derived values ─────────────────────────────────────────
  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items:          state.items,
        isLoading:      state.isLoading,
        totalItems,
        totalPrice,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
};