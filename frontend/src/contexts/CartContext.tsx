import React, { createContext, useContext, ReactNode } from 'react';
import toast from 'react-hot-toast';
import { Book, CartItem } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';

interface Cart {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

interface CartContextType {
  cart: Cart;
  addToCart: (book: Book, quantity: number) => void;
  removeFromCart: (bookId: string) => void;
  updateQuantity: (bookId: string, newQuantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (bookId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useLocalStorage<CartItem[]>('cart_items', []);

  const addToCart = (book: Book, quantity: number) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item._id === book._id);
      
      const availableStock = book.quantity - (existingItem?.quantity || 0);
      if (quantity > availableStock) {
        toast.error(`Rất tiếc, chỉ còn ${book.quantity} sản phẩm có sẵn.`);
        return prevItems;
      }
      
      if (existingItem) {
        return prevItems.map(item =>
          item._id === book._id ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        const newItem: CartItem = {
          _id: book._id,
          title: book.title,
          price: book.price,
          image: book.images[0],
          quantity,
          stock: book.quantity
        };
        return [...prevItems, newItem];
      }
    });
    toast.success(`Đã thêm "${book.title}" vào giỏ hàng.`);
  };

  const removeFromCart = (bookId: string) => {
    setItems(prevItems => prevItems.filter(item => item._id !== bookId));
    toast.success("Đã xóa sản phẩm khỏi giỏ hàng.");
  };

  const updateQuantity = (bookId: string, newQuantity: number) => {
    setItems(prevItems => {
      const itemToUpdate = prevItems.find(item => item._id === bookId);
      if (!itemToUpdate) return prevItems;

      if (newQuantity <= 0) {
        return prevItems.filter(item => item._id !== bookId);
      }
      
      if (newQuantity > itemToUpdate.stock) {
        toast.error(`Số lượng tồn kho không đủ. Chỉ còn ${itemToUpdate.stock} sản phẩm.`);
        return prevItems.map(item =>
          item._id === bookId ? { ...item, quantity: itemToUpdate.stock } : item
        );
      }
      
      return prevItems.map(item =>
        item._id === bookId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemQuantity = (bookId: string): number => {
    const item = items.find(i => i._id === bookId);
    return item?.quantity || 0;
  };
  
  const cart = React.useMemo<Cart>(() => {
    const totalItems = items.reduce((count, item) => count + item.quantity, 0);
    const totalAmount = items.reduce((total, item) => total + item.price * item.quantity, 0);
    return { items, totalItems, totalAmount };
  }, [items]);

  const value: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemQuantity
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 