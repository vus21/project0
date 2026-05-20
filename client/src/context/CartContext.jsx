import React, { createContext, useState, useEffect, useContext } from 'react';
import { axiosInstance } from '../api/axiosInstance';
import { useAuth } from './AuthContext';

export const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [cart, setCart] = useState({ items: [], summary: { itemCount: 0, subtotal: 0 } });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        mergeCartOnLogin().then(fetchCart);
      } else {
        const guestCart = JSON.parse(localStorage.getItem('guestCart')) || [];
        setCart({ items: guestCart, summary: calculateGuestSummary(guestCart) });
      }
    }
  }, [isAuthenticated, authLoading]);

  const calculateGuestSummary = (items) => {
    let itemCount = 0;
    let subtotal = 0;
    items.forEach(item => {
      itemCount += item.quantity;
      subtotal += item.price * item.quantity;
    });
    return { itemCount, subtotal };
  };

  const fetchCart = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get('/cart');
      setCart(res.data);
    } catch (error) {
      console.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const mergeCartOnLogin = async () => {
    const guestCart = JSON.parse(localStorage.getItem('guestCart')) || [];
    if (guestCart.length > 0) {
      try {
        await axiosInstance.post('/cart/merge', { items: guestCart });
        localStorage.removeItem('guestCart');
      } catch (err) {
        console.error('Merge cart failed', err);
      }
    }
  };

  const addToCart = async (productId, sku, quantity, price, extraInfo) => {
    if (isAuthenticated) {
      const res = await axiosInstance.post('/cart/add', { productId, sku, quantity });
      setCart(res.data);
    } else {
      let guestCart = JSON.parse(localStorage.getItem('guestCart')) || [];
      const index = guestCart.findIndex(i => i.productId === productId && i.sku === sku);
      if (index > -1) {
        guestCart[index].quantity += quantity;
      } else {
        guestCart.push({ productId, sku, quantity, price, ...extraInfo });
      }
      localStorage.setItem('guestCart', JSON.stringify(guestCart));
      setCart({ items: guestCart, summary: calculateGuestSummary(guestCart) });
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      await axiosInstance.delete('/cart/clear');
      await fetchCart();
    } else {
      localStorage.removeItem('guestCart');
      setCart({ items: [], summary: { itemCount: 0, subtotal: 0 } });
    }
  };

  return (
    <CartContext.Provider value={{ ...cart, isLoading, fetchCart, addToCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
