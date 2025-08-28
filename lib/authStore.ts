

import { create } from 'zustand';
import { User, ShippingAddress, Order, Product, CartItem } from '../types';
import { useToastStore } from './toastStore';
import { supabase } from '../integrations/supabase/client';
import { AuthError, User as SupabaseUser } from '@supabase/supabase-js';
import { Database } from '../integrations/supabase/types';
import { useWishlistStore } from './wishlistStore';
import { useCartStore } from './store';
import { useNotificationStore } from './notificationStore';

// Type definitions for Supabase table rows
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type AddressRow = Database['public']['Tables']['addresses']['Row'];
type OrderRow = Database['public']['Tables']['orders']['Row'];
type OrderItemRow = Database['public']['Tables']['order_items']['Row'];
type ProductRow = Database['public']['Tables']['products']['Row'];
type OrderTrackingRow = Database['public']['Tables']['order_tracking']['Row'];
type RewardPointsRow = Database['public']['Tables']['reward_points']['Row'];
type SellerRow = Database['public']['Tables']['sellers']['Row'];

// Type for the combined order data we fetch
interface FetchedOrder extends OrderRow {
  order_items: (OrderItemRow & { products: ProductRow | null })[] | null; // Can be null
  order_tracking: OrderTrackingRow[] | null; // Can be null
}

interface AuthState {
  user: User | null;
  orders: Order[];
  addresses: ShippingAddress[];
  isLoggedIn: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ error: AuthError | null }>;
  signup: (name: string, email: string, pass: string) => Promise<{ error: AuthError | null }>;
  logout: () => Promise<void>;
  
  // Data fetching
  fetchOrders: () => Promise<void>;
  fetchAddresses: () => Promise<void>;
  
  // Profile & Address management
  updateProfile: (name: string, profilePicture?: string) => Promise<void>;
  addAddress: (address: Omit<ShippingAddress, 'id' | 'isDefault'>) => Promise<void>;
  removeAddress: (addressId: number) => Promise<void>;
  setDefaultAddress: (addressId: number) => Promise<void>;

  // Rewards
  addPoints: (points: number) => Promise<void>;

  // Admin & Seller
  verifySeller: (sellerId: string) => Promise<void>;
  updateStoreSettings: (storeName: string) => Promise<void>;
  becomeSeller: () => Promise<void>;
}

export const useAuthStore = create<AuthState>(
    (set, get) => ({
      user: null,
      orders: [],
      addresses: [],
      isLoggedIn: false,
      loading: true,

      login: async (email, pass) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) {
          useToastStore.getState().addToast({ message: error.message, type: 'error' });
        }
        return { error };
      },

      signup: async (name, email, pass) => {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password: pass,
          options: {
            data: { full_name: name }
          }
        });

        if (error) {
            useToastStore.getState().addToast({ message: error.message, type: 'error' });
        } else {
             useToastStore.getState().addToast({ message: `Welcome, ${name}! Check your email to verify your account.`, type: 'success' });
        }
        return { error };
      },

      logout: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            useToastStore.getState().addToast({ message: `Logout failed: ${error.message}`, type: 'error'});
        }
      },

      fetchOrders: async () => {
        const { user } = get();
        if (!user) return;
        
        const { data, error } = await supabase
            .from('orders')
            .select(`*, order_items(*, products(*)), order_tracking(*)`)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching orders:', error);
            // Don't clear orders on a refetch error, keep stale data
            return;
        }
        
        const mappedOrders: Order[] = data.map((order: FetchedOrder) => ({
            id: order.public_id,
            internal_id: order.id,
            date: new Date(order.created_at).toLocaleDateString(),
            status: order.status,
            total: order.total_price,
            shippingAddress: order.shipping_address_json as unknown as ShippingAddress,
            // FIX: Defensively handle null relationships to prevent crashes during mapping.
            items: (order.order_items || [])
              .filter(item => item.products)
              .map(item => ({
                id: item.products!.id,
                name: item.products!.title,
                price: item.price,
                image: item.products!.images?.[0] || '',
                images: item.products!.images || [],
                description: item.products!.description || '',
                reviews: [], // Reviews are not fetched here for performance
                stock: 0,
                sellerId: item.products!.seller_id,
                quantity: item.quantity,
            })),
            trackingHistory: (order.order_tracking || []).map(track => ({
                status: track.status,
                location: track.location || 'Unknown',
                timestamp: track.timestamp,
            })),
        }));
        
        set({ orders: mappedOrders });
      },
      
      fetchAddresses: async () => {
        const { user } = get();
        if (!user) return;
        const { data, error } = await supabase.from('addresses').select('*').eq('user_id', user.id);
        if (error) {
            console.error('Error fetching addresses:', error);
            return;
        }
        const mappedAddresses: ShippingAddress[] = data.map((addr: AddressRow) => ({
            id: addr.id,
            fullName: addr.full_name,
            addressLine1: addr.address_line_1,
            city: addr.city,
            state: addr.state,
            zipCode: addr.zip_code,
            country: addr.country,
            isDefault: addr.is_default
        }));
        set({ addresses: mappedAddresses });
      },

      updateProfile: async (name, profilePicture) => {
        const { user } = get();
        if (!user) return;
        
        const { data, error } = await supabase.from('profiles').update({ full_name: name }).eq('id', user.id).select().single();
        
        if (error) {
            useToastStore.getState().addToast({ message: 'Failed to update profile.', type: 'error' });
        } else if (data) {
            set(state => ({ user: { ...state.user!, name: data.full_name || '' }}));
            useToastStore.getState().addToast({ message: 'Profile updated successfully!', type: 'success' });
        }
       },

      addAddress: async (address) => {
        const { user } = get();
        if (!user) return;
        
        const { error } = await supabase.from('addresses').insert({
            user_id: user.id,
            full_name: address.fullName,
            address_line_1: address.addressLine1,
            city: address.city,
            state: address.state,
            zip_code: address.zipCode,
            country: address.country,
        });

        if (error) {
            useToastStore.getState().addToast({ message: 'Failed to add address.', type: 'error' });
        } else {
            useToastStore.getState().addToast({ message: 'Address added!', type: 'success' });
            get().fetchAddresses();
        }
      },

      removeAddress: async (addressId: number) => {
        const { error } = await supabase.from('addresses').delete().eq('id', addressId);
        if (error) {
             useToastStore.getState().addToast({ message: 'Failed to remove address.', type: 'error' });
        } else {
             useToastStore.getState().addToast({ message: 'Address removed.', type: 'info' });
             get().fetchAddresses();
        }
      },

      setDefaultAddress: async (addressId) => {
        const { user } = get();
        if (!user) return;
        
        const { error: unsetError } = await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
        if (unsetError) {
             useToastStore.getState().addToast({ message: 'Failed to update default address.', type: 'error' });
             return;
        }
        const { error: setError } = await supabase.from('addresses').update({ is_default: true }).eq('id', addressId);
        if (setError) {
            useToastStore.getState().addToast({ message: 'Failed to set new default address.', type: 'error' });
        } else {
            useToastStore.getState().addToast({ message: 'Default address updated.', type: 'success' });
            get().fetchAddresses();
        }
      },

      updateStoreSettings: async (storeName) => {
          const { user } = get();
          if (!user || user.role !== 'seller') return;
          const { error } = await supabase.from('sellers').update({ business_name: storeName }).eq('id', user.id);
          
          if (error) {
              useToastStore.getState().addToast({ message: 'Failed to update store name.', type: 'error'});
          } else {
              set(state => ({ user: { ...state.user!, storeName: storeName }}));
              useToastStore.getState().addToast({ message: 'Store name updated!', type: 'success'});
          }
      },
      
      verifySeller: async (sellerId: string) => {
          const { error } = await supabase.rpc('verify_seller', { seller_id_to_verify: sellerId });
          if (error) {
              useToastStore.getState().addToast({ message: `Failed to verify seller: ${error.message}`, type: 'error' });
          } else {
              useToastStore.getState().addToast({ message: 'Seller verified successfully!', type: 'success' });
          }
      },

      addPoints: async (points) => {
         const { user } = get();
         if (!user) return;
         
         const { data, error } = await supabase
            .from('reward_points')
            .select('points_balance')
            .eq('user_id', user.id)
            .single();
        
         if (error || !data) {
             console.error("Could not fetch current points balance:", error);
             return;
         }
         
         const newBalance = data.points_balance + points;
         const { error: updateError } = await supabase
            .from('reward_points')
            .update({ points_balance: newBalance })
            .eq('user_id', user.id);
            
         if (updateError) {
             console.error("Could not update points balance:", updateError);
         } else {
             set(state => ({ user: { ...state.user!, points: newBalance } }));
             useToastStore.getState().addToast({ message: `${points} points earned!`, type: 'success' });
         }
      },
      
      becomeSeller: async () => {
        const { user } = get();
        if (!user || user.role !== 'user') return;

        const { error } = await supabase
            .from('profiles')
            .update({ role: 'seller' })
            .eq('id', user.id);
            
        if (error) {
            useToastStore.getState().addToast({ message: 'Failed to upgrade account. Please try again.', type: 'error' });
        } else {
            // The trigger `handle_new_user_setup` will create the seller entry. We just need to update the local state.
            const updatedUser: User = { ...user, role: 'seller' };
            set({ user: updatedUser });
            useToastStore.getState().addToast({ message: 'Congratulations! You are now a seller.', type: 'success' });
        }
      },
    }),
);

/**
 * A centralized function to refetch all user-specific data.
 * This is crucial for keeping the user's session data fresh on events
 * like window focus or periodic background refreshes.
 */
export const refetchAllUserData = () => {
    console.log('Refreshing all user-specific data...');
    const state = useAuthStore.getState();
    if (state.user) {
        state.fetchOrders();
        state.fetchAddresses();
        useWishlistStore.getState().loadWishlist(state.user.id);
        useNotificationStore.getState().fetchNotifications();
        // The cart is managed via its own mechanisms, typically no refetch needed unless inconsistent
    }
}

type FetchedProfile = ProfileRow & {
    reward_points: RewardPointsRow[] | null;
    sellers: SellerRow | null;
};

const getOrCreateUserProfile = async (user: SupabaseUser): Promise<FetchedProfile | null> => {
    const selectQuery = '*, reward_points(*), sellers(*)';
    let { data: profile, error } = await supabase.from('profiles').select(selectQuery).eq('id', user.id).maybeSingle();
    
    if (error) { console.error('Error fetching profile:', error); return null; }
    
    if (!profile) {
        const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
                id: user.id,
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                avatar_url: user.user_metadata?.avatar_url,
                role: 'user'
            })
            .select(selectQuery).single();
        if (insertError) { console.error('Error creating profile:', insertError); return null; }
        profile = newProfile;
    }
    return profile as unknown as FetchedProfile;
}

const mapSupabaseProfileToAppUser = (profile: FetchedProfile, sessionUser: SupabaseUser): User => {
    return {
        id: profile.id,
        name: profile.full_name || '',
        email: sessionUser.email || '',
        role: profile.role,
        profilePicture: profile.avatar_url || undefined,
        points: profile.reward_points?.[0]?.points_balance || 0,
        rewardTier: profile.reward_points?.[0]?.tier || 'Bronze',
        referralCode: profile.referral_code || 'N/A',
        isVerified: profile.sellers?.is_verified || false,
        commissionRate: profile.sellers?.commission_rate || 0.15,
        storeName: profile.sellers?.business_name || (profile.role === 'seller' ? `${profile.full_name}'s Store` : undefined),
    };
}

// --- START: Robust Authentication State Management ---
// The supabase.auth.onAuthStateChange listener is the single source of truth for the session.
// 1. Session Persistence: The Supabase client is configured with `autoRefreshToken: true`
//    and `persistSession: true` in `client.ts`. This handles session expiry automatically.
//    If a token refresh fails, this listener receives a 'SIGNED_OUT' event, ensuring the
//    UI state always reflects the true authentication state.
// 2. Conditional Data Fetching: All user-specific data is only fetched *after* a valid
//    'SIGNED_IN' event is received and a user profile is confirmed. This prevents
//    unauthorized requests and ensures data is loaded only when needed.
// 3. Centralized State Updates: All auth-related state changes (login, logout) are
//    handled here, providing a single, consistent state management flow.
supabase.auth.onAuthStateChange(async (event, session) => {
    if (session && session.user) {
        const profile = await getOrCreateUserProfile(session.user);
        if (profile) {
            const appUser = mapSupabaseProfileToAppUser(profile, session.user);
            useAuthStore.setState({ user: appUser, isLoggedIn: true, loading: false });
            
            // Fetch all user-specific data on initial sign-in.
            // Subsequent refreshes are handled by the global logic in App.tsx.
            if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
              refetchAllUserData();
              useCartStore.getState().mergeAndLoadUserCart(profile.id);
            }

            if (event === 'SIGNED_IN') {
                useToastStore.getState().addToast({ message: `Welcome back, ${appUser.name}!`, type: 'success' });
            }
        } else {
            // Handle edge case where profile creation fails by signing the user out.
            await supabase.auth.signOut();
            useAuthStore.setState({ user: null, isLoggedIn: false, loading: false });
        }
    } else {
        // This block handles SIGNED_OUT events or when no session is found.
        useAuthStore.setState({ user: null, isLoggedIn: false, loading: false, orders: [], addresses: [] });
        useWishlistStore.getState().clearWishlist();
        useCartStore.getState().resetCartOnLogout();
        useNotificationStore.getState().clearNotificationsOnLogout();
        if (event === 'SIGNED_OUT') {
            useToastStore.getState().addToast({ message: 'Logged out.', type: 'info' });
        }
    }
});
// --- END: Robust Authentication State Management ---


(async () => {
    // Initial check on app load
    useAuthStore.setState({ loading: true });
    await supabase.auth.getSession(); // This will trigger the onAuthStateChange listener
})();
