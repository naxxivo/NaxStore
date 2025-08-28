import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Coupon } from '../types';
import { useToastStore } from './toastStore';
import { supabase } from '../integrations/supabase/client';

interface RewardsState {
    activeCoupon: Coupon | null;
    error: string | null;
    applyCoupon: (code: string) => Promise<void>;
    removeCoupon: () => void;
}

// FIX: Updated Zustand store creation syntax for better type inference with middleware.
export const useRewardsStore = create<RewardsState>()(
    persist(
        (set) => ({
            activeCoupon: null,
            error: null,
            applyCoupon: async (code) => {
                const { data, error: rpcError } = await supabase.rpc('validate_coupon', { p_code: code });

                if (rpcError) {
                    console.error("Coupon validation RPC error:", rpcError);
                    set({ error: 'Could not validate coupon. Please try again.' });
                } else if (data) {
                    const couponData = data as any; // Cast to access properties
                    const coupon: Coupon = {
                        code: couponData.code,
                        type: couponData.type,
                        value: couponData.value,
                    };
                    set({ activeCoupon: coupon, error: null });
                    useToastStore.getState().addToast({ message: `Coupon "${code}" applied!`, type: 'success' });
                } else {
                    set({ error: 'Invalid or expired coupon code.' });
                }
                
                if (rpcError || !data) {
                    setTimeout(() => set({ error: null }), 3000); // Clear error after 3s
                }
            },
            removeCoupon: () => {
                set({ activeCoupon: null, error: null });
                useToastStore.getState().addToast({ message: 'Coupon removed.', type: 'info' });
            },
        }),
        {
            name: 'naxstore-rewards-storage',
            partialize: (state) => ({ activeCoupon: state.activeCoupon }),
        }
    )
);