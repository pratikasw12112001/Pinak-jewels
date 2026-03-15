'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('pinak-wishlist');
    if (saved) {
      try {
        setWishlistItems(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('pinak-wishlist');
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('pinak-wishlist', JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, isLoaded]);

  const addToWishlist = useCallback((product) => {
    setWishlistItems(prev => {
      if (prev.find(item => item.id === product.id)) return prev;
      return [...prev, product];
    });
  }, []);

  const removeFromWishlist = useCallback((productId) => {
    setWishlistItems(prev => prev.filter(item => item.id !== productId));
  }, []);

  const toggleWishlist = useCallback((product) => {
    setWishlistItems(prev => {
      if (prev.find(item => item.id === product.id)) {
        return prev.filter(item => item.id !== product.id);
      }
      return [...prev, product];
    });
  }, []);

  const isInWishlist = useCallback((productId) => {
    return wishlistItems.some(item => item.id === productId);
  }, [wishlistItems]);

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isInWishlist,
      wishlistCount: wishlistItems.length,
      isLoaded
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
}
