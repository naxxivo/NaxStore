
import { supabase } from '../integrations/supabase/client';
import { Database, Json } from '../integrations/supabase/types';

type AnalyticsEventType = Database['public']['Enums']['analytics_event_type'];

export const trackEvent = async (
  eventType: AnalyticsEventType,
  metadata?: Json
) => {
  try {
    // This is a "fire and forget" call, we don't need to wait for it.
    // The RPC is defined with the user's auth context.
    const { error } = await supabase.rpc('log_event', {
      p_event_type: eventType,
      p_metadata: metadata || {},
    });

    if (error) {
      // Silently log error to console, don't interrupt user flow
      console.error(`Analytics error for event '${eventType}':`, error);
    }
  } catch (e) {
    console.error('Failed to call analytics RPC:', e);
  }
};