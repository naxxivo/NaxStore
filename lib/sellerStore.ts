
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
        // FIX: Reworked the query to be sequential to avoid RLS recursion issues.
        
        // 1. Fetch commissions. RLS on this table is assumed to be safe (`seller_id = auth.uid()`).
        const { data: commissionsData, error: commissionsError } = await supabase
            .from('commissions')
            .select('*')
            .order('created_at', { ascending: false });

        if (commissionsError) throw commissionsError;
        
        if (!commissionsData || commissionsData.length === 0) {
            set({ commissions: [], loading: false });
            return;
        }

        // 2. Fetch related order_items and products, avoiding a join to `orders` which may cause recursion.
        const orderItemIds = commissionsData.map(c => c.order_item_id);
        const { data: orderItemsData, error: itemsError } = await supabase
            .from('order_items')
            .select('id, order_id, products(title)')
            .in('id', orderItemIds);
            
        if (itemsError) throw itemsError;

        // 3. Fetch related orders in a separate query.
        const orderIds = [...new Set(orderItemsData.map(item => item.order_id))];
        const { data: ordersData, error: ordersError } = await supabase
            .from('orders')
            .select('id, public_id')
            .in('id', orderIds);

        if (ordersError) throw ordersError;
        
        // 4. Join the data on the client side.
        const orderItemsMap = new Map(orderItemsData.map(item => [item.id, { ...item }]));
        const ordersMap = new Map(ordersData.map(order => [order.id, order]));

        const mappedCommissions: Commission[] = commissionsData
            .map(c => {
                const orderItem = orderItemsMap.get(c.order_item_id);
                if (!orderItem || !orderItem.products) return null;

                const order = ordersMap.get(orderItem.order_id);
                if (!order) return null;
                
                return {
                    id: c.id,
                    amount: c.amount,
                    rate: c.commission_rate,
                    date: new Date(c.created_at).toLocaleDateString(),
                    orderItemId: c.order_item_id,
                    orderId: order.public_id,
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
