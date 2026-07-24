'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { products } from '@/data/products';

const CartContext = createContext();

const MAX_QTY = 20;

/**
 * Rebuild a saved cart against current product data.
 *
 * A cart persisted in localStorage keeps whatever price it was saved with, so
 * an old cart would display a stale price while the server charges the current
 * one. Re-reading name/price/image from the product table keeps the displayed
 * total identical to what the customer is actually charged.
 */
function reconcileCart(saved) {
  if (!Array.isArray(saved)) return [];
  return saved.reduce((acc, item) => {
    const product = products.find(p => p.id === Number(item?.id));
    // Drop items that no longer exist rather than showing a phantom line.
    if (!product) return acc;

    const quantity = Math.min(MAX_QTY, Math.max(1, Math.floor(Number(item?.quantity) || 1)));
    acc.push({ ...product, quantity });
    return acc;
  }, []);
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('pinak-cart');
    if (saved) {
      try {
        setCartItems(reconcileCart(JSON.parse(saved)));
      } catch (e) {
        localStorage.removeItem('pinak-cart');
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('pinak-cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

  const addToCart = useCallback((product, quantity = 1) => {
    const qty = Math.max(1, Math.floor(Number(quantity) || 1));
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            // Cap the running total so repeated adds cannot exceed the limit
            // the server enforces at payment time.
            ? { ...item, quantity: Math.min(MAX_QTY, item.quantity + qty) }
            : item
        );
      }
      return [...prev, { ...product, quantity: Math.min(MAX_QTY, qty) }];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    const qty = Math.floor(Number(quantity) || 0);
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity: Math.min(MAX_QTY, qty) } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      cartTotal,
      isLoaded
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
