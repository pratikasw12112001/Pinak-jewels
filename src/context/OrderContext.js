'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('pinak-orders');
    if (saved) {
      try { setOrders(JSON.parse(saved)); } catch (e) { localStorage.removeItem('pinak-orders'); }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('pinak-orders', JSON.stringify(orders));
    }
  }, [orders, isLoaded]);

  const addOrder = useCallback((orderData) => {
    const order = {
      id: orderData.orderId || `ORD-${Date.now()}`,
      items: orderData.items,
      total: orderData.total,
      subtotal: orderData.subtotal,
      shipping: orderData.shipping,
      customer: orderData.customer,
      paymentMode: orderData.paymentMode || 'Online (Razorpay)',
      paymentId: orderData.paymentId || null,
      date: new Date().toISOString(),
      status: 'Confirmed',
    };
    setOrders(prev => [order, ...prev]);
    return order;
  }, []);

  return (
    <OrderContext.Provider value={{ orders, addOrder, isLoaded }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrders must be used within OrderProvider');
  return context;
}
