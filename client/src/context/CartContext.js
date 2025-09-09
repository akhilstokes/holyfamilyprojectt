import React, { createContext, useContext, useMemo, useState } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]); // items: {productId, name, type, category, price, quantity}

  const addItem = (product, qty = 1) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.productId === product._id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + qty };
        return copy;
      }
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          type: product.type,
          category: product.category,
          price: product.price,
          quantity: qty,
        },
      ];
    });
  };

  const removeItem = (productId) => setItems(prev => prev.filter(i => i.productId !== productId));

  const updateQty = (productId, qty) => {
    setItems(prev => prev.map(i => (i.productId === productId ? { ...i, quantity: Math.max(1, qty) } : i)));
  };

  const clearCart = () => setItems([]);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    return { subtotal };
  }, [items]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, totals }}>
      {children}
    </CartContext.Provider>
  );
};