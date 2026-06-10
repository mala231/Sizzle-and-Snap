import React, { createContext, useState, useMemo } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  // Add menu item to cart
  const addItem = (menuItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === menuItem.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...menuItem, quantity: 1 }];
    });
  };

  // Remove menu item from cart
  const removeItem = (menuItemId) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== menuItemId));
  };

  // Update item quantity in cart
  const updateQuantity = (menuItemId, quantity) => {
    if (quantity <= 0) {
      removeItem(menuItemId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === menuItemId ? { ...item, quantity } : item
      )
    );
  };

  // Clear cart completely
  const clearCart = () => {
    setItems([]);
  };

  // Calculate cart subtotal (without discounts applied)
  const total = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      return sum + price * item.quantity;
    }, 0);
  }, [items]);

  // Calculate total count of items in cart
  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
