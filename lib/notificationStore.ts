import { create } from 'zustand';
import { Notification } from '../types';
import { supabase } from '../integrations/supabase/client';
import { useAuthStore } from './authStore';
import { Json, Database } from '../integrations/supabase/types';

type NotificationType = Database['public']['Enums']['notification_type'];

interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  addNotification: (notification: { message: string; type: NotificationType; metadata?: Json }) => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotificationsOnLogout: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  loading: false,
  error: null,
  
  fetchNotifications: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;
    
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const mappedNotifications: Notification[] = data.map(n => ({
        id: n.id,
        message: n.message,
        type: n.type,
        isRead: n.is_read,
        timestamp: n.created_at,
        metadata: n.metadata,
      }));
      
      set({ notifications: mappedNotifications, loading: false });
    } catch (e: any) {
      console.error("Error fetching notifications:", e);
      set({ error: 'Failed to load notifications.', loading: false });
    }
  },
  
  addNotification: async ({ message, type, metadata }) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return; // Don't create notifications for guests
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({ user_id: userId, message, type, metadata })
        .select()
        .single();
        
      if (error) throw error;

      if (data) {
        const newNotification: Notification = {
            id: data.id,
            message: data.message,
            type: data.type,
            isRead: data.is_read,
            timestamp: data.created_at,
            metadata: data.metadata,
        };
        set(state => ({ notifications: [newNotification, ...state.notifications] }));
      }
    } catch (e: any) {
      console.error("Error adding notification:", e);
      // Don't show a toast for this, as it's a background process
    }
  },
  
  markAsRead: async (id) => {
    // Optimistic update
    set(state => ({
      notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n),
    }));
    
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
      
    if (error) {
      console.error("Error marking notification as read:", error);
      // Revert optimistic update on failure
      set(state => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: false } : n),
      }));
    }
  },
  
  markAllAsRead: async () => {
    const unreadIds = get().notifications.filter(n => !n.isRead).map(n => n.id);
    if (unreadIds.length === 0) return;

    // Optimistic update
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, isRead: true })),
    }));
    
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds);
      
    if (error) {
      console.error("Error marking all as read:", error);
      // Revert on failure
       set(state => ({
        notifications: state.notifications.map(n => unreadIds.includes(n.id) ? { ...n, isRead: false } : n),
      }));
    }
  },
  
  clearNotificationsOnLogout: () => {
    set({ notifications: [], loading: false, error: null });
  },
}));