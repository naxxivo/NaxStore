
import { create } from 'zustand';
import { WishlistItem, Product } from '../types';
import { useToastStore } from './toastStore';
import { supabase } from '../integrations/supabase/client';
import { useProductStore } from './productStore';

interface WishlistState {
  items: WishlistItem[];
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  wishlistId: string | null;
  loadWishlist: (userId: string) => Promise<void>;
  clearWishlist: () => void;
  toggleWishlist: () => void;
  toggleItem: (product: Product) => Promise<void>;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isOpen: false,
  isLoading: false,
  error: null,
  wishlistId: null,
  
  loadWishlist: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data: wishlist, error: wishlistError } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle(); // Use maybeSingle for robustness

      if (wishlistError) throw wishlistError;
      
      // If no wishlist exists, it's not an error. Just means it's empty.
      if (!wishlist) {
        set({ items: [], wishlistId: null, isLoading: false });
        return;
      }
      
      const { data: wishlistItemsData, error: itemsError } = await supabase
        .from('wishlist_items')
        .select('product_id')
        .eq('wishlist_id', wishlist.id);

      if (itemsError) throw itemsError;
      
      let allProducts = useProductStore.getState().products;
      if (allProducts.length === 0) {
        await useProductStore.getState().fetchProducts();
        allProducts = useProductStore.getState().products;
      }

      const productIds = wishlistItemsData.map(item => item.product_id);
      const wishlistProducts = allProducts.filter(p => productIds.includes(p.id));
      
      set({ items: wishlistProducts, wishlistId: wishlist.id, isLoading: false });
    } catch (error) {
      console.error("Error loading wishlist:", error);
      set({ isLoading: false, error: 'Failed to load wishlist.' });
    }
  },

  clearWishlist: () => {
    set({ items: [], wishlistId: null, isOpen: false });
  },

  toggleWishlist: () => set((state) => ({ isOpen: !state.isOpen })),
  
  toggleItem: async (product: Product) => {
    const { items, wishlistId } = get();
    if (!wishlistId) return;

    const isInWishlist = items.some((item) => item.id === product.id);

    try {
      if (isInWishlist) {
        // Remove item
        const { error } = await supabase
          .from('wishlist_items')
          .delete()
          .match({ wishlist_id: wishlistId, product_id: product.id });
        if (error) throw error;
        
        set({ items: items.filter((item) => item.id !== product.id) });
        useToastStore.getState().addToast({ message: `${product.name} removed from wishlist`, type: 'info' });
      } else {
        // Add item
        const { error } = await supabase
          .from('wishlist_items')
          .insert({ wishlist_id: wishlistId, product_id: product.id });
        if (error) throw error;

        set({ items: [...items, product] });
        useToastStore.getState().addToast({ message: `${product.name} added to wishlist`, type: 'success' });
      }
    } catch (error) {
       console.error("Error toggling wishlist item:", error);
       useToastStore.getState().addToast({ message: 'Could not update wishlist. Please try again.', type: 'error' });
    }
  },
}));