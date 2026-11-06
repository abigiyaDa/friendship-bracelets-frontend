import PropTypes from 'prop-types';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'friendship-bracelets-cart-v1';

const CartContext = createContext(undefined);

const optionSignature = (item) =>
  JSON.stringify([item.productId, item.colorMode, [...(item.colorIds ?? [])].sort(), item.nameText ?? '']);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage full / unavailable: cart just won't persist
    }
  }, [items]);

  const addItem = useCallback((item) => {
    setItems((prev) => {
      const key = optionSignature(item);
      const index = prev.findIndex((existing) => optionSignature(existing) === key);

      if (index >= 0) {
        const next = [...prev];
        next[index] = { ...next[index], quantity: next[index].quantity + (item.quantity ?? 1) };
        return next;
      }

      return [...prev, { ...item, quantity: item.quantity ?? 1, key }];
    });
  }, []);

  const removeItem = useCallback((key) => {
    setItems((prev) => prev.filter((item) => item.key !== key));
  }, []);

  const setQuantity = useCallback((key, quantity) => {
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty < 1) return;
    setItems((prev) => prev.map((item) => (item.key === key ? { ...item, quantity: Math.min(qty, 32767) } : item)));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    return { items, count, total, addItem, removeItem, setQuantity, clearCart };
  }, [items, addItem, removeItem, setQuantity, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

CartProvider.propTypes = { children: PropTypes.node };

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }

  return context;
}
