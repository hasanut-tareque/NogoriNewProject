import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { CartItemWithProduct } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

interface CartContextValue {
  items: CartItemWithProduct[];
  itemCount: number;
  total: number;
  loading: boolean;
  addItem: (productId: string, size: string, color: string) => Promise<{ error: string | null }>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setItems([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from('cart_items')
      .select('*, product:products(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setItems((data as CartItemWithProduct[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addItem = async (productId: string, size: string, color: string) => {
    if (!user) return { error: 'login_required' };

    const existing = items.find(
      i => i.product_id === productId && i.size === size && i.color === color
    );

    if (existing) {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + 1 })
        .eq('id', existing.id);
      if (error) return { error: error.message };
    } else {
      const { error } = await supabase
        .from('cart_items')
        .insert({ product_id: productId, size, color, quantity: 1 });
      if (error) return { error: error.message };
    }

    await fetchCart();
    return { error: null };
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) { await removeItem(cartItemId); return; }
    await supabase.from('cart_items').update({ quantity }).eq('id', cartItemId);
    await fetchCart();
  };

  const removeItem = async (cartItemId: string) => {
    await supabase.from('cart_items').delete().eq('id', cartItemId);
    await fetchCart();
  };

  const clearCart = async () => {
    if (!user) return;
    await supabase.from('cart_items').delete().eq('user_id', user.id);
    setItems([]);
  };

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => {
    const price = i.product?.sale_price ?? i.product?.price ?? 0;
    return sum + price * i.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{ items, itemCount, total, loading, addItem, updateQuantity, removeItem, clearCart, refresh: fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
