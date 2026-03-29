import React, { createContext, useContext, useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';

export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: string;
    image?: string | null;
    inventory: number;
  };
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  addItem: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getCart = trpc.cart.getCart.useQuery(undefined, {
    enabled: false,
  });

  const addItemMutation = trpc.cart.addItem.useMutation();
  const removeItemMutation = trpc.cart.removeItem.useMutation();
  const updateQuantityMutation = trpc.cart.updateQuantity.useMutation();
  const clearCartMutation = trpc.cart.clear.useMutation();

  // Initial load
  useEffect(() => {
    refreshCart();
  }, []);

  const refreshCart = async () => {
    try {
      setIsLoading(true);
      const result = await getCart.refetch();
      if (result.data) {
        setCart(result.data);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async (productId: number, quantity: number) => {
    try {
      await addItemMutation.mutateAsync({ productId, quantity });
      await refreshCart();
    } catch (error) {
      console.error('Failed to add item:', error);
      throw error;
    }
  };

  const removeItem = async (productId: number) => {
    try {
      await removeItemMutation.mutateAsync({ productId });
      await refreshCart();
    } catch (error) {
      console.error('Failed to remove item:', error);
      throw error;
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    try {
      await updateQuantityMutation.mutateAsync({ productId, quantity });
      await refreshCart();
    } catch (error) {
      console.error('Failed to update quantity:', error);
      throw error;
    }
  };

  const clearCartFn = async () => {
    try {
      await clearCartMutation.mutateAsync();
      setCart({ items: [], subtotal: 0, itemCount: 0 });
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart: clearCartFn,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
