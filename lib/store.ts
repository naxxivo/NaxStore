
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, Product } from '../types';
import { useToastStore } from './toastStore';
import { useRewardsStore } from './rewardsStore';
import { supabase } from '../integrations/supabase/client';
import { useAuthStore } from './authStore';
import { useProductStore } from './productStore';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  cartId: string | null;
  lastRemovedItem: CartItem | null;
  addItem: (product: Product) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  restoreLastRemoved: () => void;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  clearCartAndPersistedState: () => Promise<void>;
  toggleCart: () => void;
  mergeAndLoadUserCart: (userId: string) => Promise<void>;
  resetCartOnLogout: () => void;
}

const getProductDetails = async (productIds: number[]): Promise<Product[]> => {
    let allProducts = useProductStore.getState().products;
    if (allProducts.length === 0) {
        await useProductStore.getState().fetchProducts();
        allProducts = useProductStore.getState().products;
    }
    return allProducts.filter(p => productIds.includes(p.id));
};

// Fix: Updated `create` syntax for better type inference with middleware.
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isLoading: false,
      cartId: null,
      lastRemovedItem: null,

      mergeAndLoadUserCart: async (userId: string) => {
        set({ isLoading: true });
        const guestItems = get().items; // Items from localStorage

        try {
            // 1. Get user's active cart ID
            let { data: cart, error: cartError } = await supabase
                .from('carts')
                .select('id')
                .eq('user_id', userId)
                .eq('status', 'active')
                .single();
            
            if (cartError || !cart) { // This handles if cart doesn't exist yet
                console.error("Cart fetch error or no cart, will try to create:", cartError);
                 // The trigger should have created one, but as a fallback:
                const { data: newCart, error: newCartError } = await supabase.from('carts').insert({ user_id: userId }).select('id').single();
                if (newCartError) throw newCartError;
                cart = newCart;
            }

            const cartId = cart.id;
            set({ cartId });

            // 2. Merge guest items into DB cart
            if (guestItems.length > 0) {
                const { data: existingCartItems } = await supabase.from('cart_items').select('*').eq('cart_id', cartId);
                const itemsToUpsert = guestItems.map(item => {
                    const existing = existingCartItems?.find(ci => ci.product_id === item.id);
                    return {
                        cart_id: cartId,
                        product_id: item.id,
                        quantity: item.quantity + (existing?.quantity || 0)
                    };
                });
                const { error: upsertError } = await supabase.from('cart_items').upsert(itemsToUpsert, { onConflict: 'cart_id, product_id, variant_id' });
                if (upsertError) throw upsertError;
            }

            // 3. Fetch final cart state from DB
            const { data: finalItemsData, error: finalItemsError } = await supabase.from('cart_items').select('*').eq('cart_id', cartId);
            if (finalItemsError) throw finalItemsError;
            
            const productIds = finalItemsData.map(i => i.product_id);
            const products = await getProductDetails(productIds);
            
            const finalCartItems: CartItem[] = finalItemsData.map(item => {
                const product = products.find(p => p.id === item.product_id);
                return { ...product!, quantity: item.quantity };
            }).filter(item => item.id);

            set({ items: finalCartItems, isLoading: false, lastRemovedItem: null });

        } catch (error) {
            console.error("Error merging cart:", error);
            set({ isLoading: false });
        }
      },

      resetCartOnLogout: () => {
        set({ cartId: null, items: [], lastRemovedItem: null });
      },

      addItem: async (product) => {
        const { cartId, items } = get();
        const isLoggedIn = useAuthStore.getState().isLoggedIn;

        if (isLoggedIn && cartId) {
          // Logged-in user logic
          try {
            const existingItem = items.find(item => item.id === product.id);
            const { error } = await supabase.from('cart_items').upsert({
              cart_id: cartId,
              product_id: product.id,
              quantity: (existingItem?.quantity || 0) + 1,
            });
            if (error) throw error;

            if (existingItem) {
              set({ items: items.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) });
            } else {
              set({ items: [...items, { ...product, quantity: 1 }] });
            }
            useToastStore.getState().addToast({ message: `${product.name} added to cart`, type: 'success' });

          } catch (error) {
            console.error("Error adding item to DB cart:", error);
            useToastStore.getState().addToast({ message: 'Failed to add item.', type: 'error' });
          }
        } else {
          // Guest user logic (original)
          const existingItem = items.find((item) => item.id === product.id);
          if (existingItem) {
            set({ items: items.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) });
          } else {
            set({ items: [...items, { ...product, quantity: 1 }] });
          }
          useToastStore.getState().addToast({ message: `${product.name} added to cart`, type: 'success' });
        }
      },
      
      removeItem: async (productId) => {
        const { cartId, items } = get();
        const isLoggedIn = useAuthStore.getState().isLoggedIn;
        const itemToRemove = items.find((item) => item.id === productId);
        if (!itemToRemove) return;

        if (isLoggedIn && cartId) {
            try {
                const { error } = await supabase.from('cart_items').delete().match({ cart_id: cartId, product_id: productId });
                if (error) throw error;
            } catch (error) {
                 console.error("Error removing item from DB cart:", error);
                 useToastStore.getState().addToast({ message: 'Failed to remove item.', type: 'error' });
                 return;
            }
        }

        set({
          items: items.filter((item) => item.id !== productId),
          lastRemovedItem: itemToRemove,
        });
        
        const toast = useToastStore.getState().addToast({
            message: `${itemToRemove.name} removed`,
            type: 'info',
            action: { label: 'Undo', onClick: () => get().restoreLastRemoved() }
        });
        setTimeout(() => { if (get().lastRemovedItem?.id === itemToRemove.id) { set({ lastRemovedItem: null }); } }, 5200);
      },
      
      restoreLastRemoved: () => {
        // This is tricky with DB sync. For simplicity, we'll keep this as a client-side only feature.
        // It will re-sync with DB on the next full action.
        const { lastRemovedItem } = get();
        if (lastRemovedItem) {
          get().addItem(lastRemovedItem); // This will handle DB update if logged in
          set({ lastRemovedItem: null });
          useToastStore.getState().addToast({ message: 'Item restored', type: 'success'});
        }
      },

      updateQuantity: async (productId, quantity) => {
        const { cartId, items } = get();
        const isLoggedIn = useAuthStore.getState().isLoggedIn;
        
        if (quantity <= 0) {
            get().removeItem(productId);
            return;
        }

        if (isLoggedIn && cartId) {
             try {
                const { error } = await supabase.from('cart_items').update({ quantity }).match({ cart_id: cartId, product_id: productId });
                if (error) throw error;
            } catch (error) {
                 console.error("Error updating quantity in DB:", error);
                 useToastStore.getState().addToast({ message: 'Failed to update quantity.', type: 'error' });
                 return;
            }
        }
        
        set({ items: items.map((item) => item.id === productId ? { ...item, quantity } : item) });
      },

      clearCart: async () => {
         const { cartId } = get();
         const isLoggedIn = useAuthStore.getState().isLoggedIn;
         if (isLoggedIn && cartId) {
             try {
                const { error } = await supabase.from('cart_items').delete().eq('cart_id', cartId);
                if (error) throw error;
            } catch (error) {
                 console.error("Error clearing DB cart:", error);
                 useToastStore.getState().addToast({ message: 'Failed to clear cart.', type: 'error' });
                 return;
            }
         }
        set({ items: [] });
      },

      clearCartAndPersistedState: async () => {
        await get().clearCart();
        set({ lastRemovedItem: null });
        useRewardsStore.getState().removeCoupon();
        const storage = createJSONStorage(() => localStorage);
        storage.removeItem('naxstore-cart-storage');
        storage.removeItem('naxstore-rewards-storage');
      },
      
      toggleCart: () => {
        set({ isOpen: !get().isOpen });
      },
    }),
    {
      name: 'naxstore-cart-storage',
      partialize: (state) => ({ items: state.items }), // Only persist guest cart items
    }
  )
);

export const useCartTotals = () => {
  const items = useCartStore((state) => state.items);
  const activeCoupon = useRewardsStore((state) => state.activeCoupon);

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  
  let discount = 0;
  if (activeCoupon) {
      if (activeCoupon.type === 'percentage') {
          discount = subtotal * (activeCoupon.value / 100);
      } else {
          discount = activeCoupon.value;
      }
  }

  const shipping = subtotal > 0 && subtotal < 500 ? 10 : 0; // Free shipping over $500
  const tax = (subtotal - discount) * 0.08; // 8% tax on discounted price
  
  const total = subtotal - discount + shipping + tax;

  return {
    items,
    subtotal,
    totalItems,
    shipping,
    tax,
    discount,
    total: Math.max(0, total),
  };
};
