
import { create } from 'zustand';
import { supabase } from '../integrations/supabase/client';
import { Banner } from '../types';

interface MarketingState {
  activeBanner: Banner | null;
  loading: boolean;
  error: string | null;
  fetchActiveBanner: () => Promise<void>;
}

export const useMarketingStore = create<MarketingState>((set, get) => ({
  activeBanner: null,
  loading: false,
  error: null,
  fetchActiveBanner: async () => {
    if (get().loading || get().activeBanner) return; // Don't refetch if already loading or exists

    set({ loading: true, error: null });
    try {
      // RLS policy on the 'banners' table handles filtering for active banners
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') { // Ignore 'PGRST116' (No rows found)
        throw error;
      }
      
      if (data) {
        const banner: Banner = {
          id: data.id,
          title: data.title,
          subtitle: data.subtitle,
          imageUrl: data.image_url,
          linkUrl: data.link_url,
        };
        set({ activeBanner: banner, loading: false });
      } else {
        set({ activeBanner: null, loading: false });
      }
    } catch (err: any) {
      console.error("Error fetching active banner:", err);
      set({ error: 'Could not load promotion.', loading: false });
    }
  },
}));
