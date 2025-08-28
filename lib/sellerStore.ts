
import { create } from 'zustand';
import { supabase } from '../integrations/supabase/client';
import { useAuthStore } from './authStore';

// Type for commission data joined with product and order info
export interface Commission {
    id: number;
    amount: number;
    rate: number;
    date: string;
    orderItemId: number;
    orderId: string; // public_id of the order
    productName: string;
}

interface SellerState {
  commissions: Commission[];
  loading: boolean;
  error: string | null;
  fetchCommissions: () => Promise<void>;
}

export const useSellerStore = create<SellerState>((set, get) => ({
  commissions: [],
  loading: false,
  error: null,
  
  fetchCommissions: async () => {
    const user = useAuthStore.getState().user;
    if (!user || user.role !== 'seller') return;
    
    set({ loading: true, error: null });
    
    try {
        // RLS ensures sellers only get their own commissions.
        const { data, error } = await supabase
            .from('commissions')
            .select(`
                *,
                order_items (
                    *,
                    products (title),
                    orders (public_id)
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        const mappedCommissions: Commission[] = data
            .map(c => {
                // Check for nested data existence
                const orderItem = c.order_items;
                if (!orderItem || !orderItem.orders || !orderItem.products) {
                    return null;
                }
                
                return {
                    id: c.id,
                    amount: c.amount,
                    rate: c.commission_rate,
                    date: new Date(c.created_at).toLocaleDateString(),
                    orderItemId: c.order_item_id,
                    orderId: orderItem.orders.public_id,
                    productName: orderItem.products.title,
                };
            })
            .filter((c): c is Commission => c !== null);

        set({ commissions: mappedCommissions, loading: false });

    } catch (e: any) {
      console.error("Error fetching commissions:", e);
      set({ error: 'Failed to load commission data.', loading: false });
    }
  },
}));
