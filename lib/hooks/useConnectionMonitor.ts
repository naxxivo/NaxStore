import { useEffect, useState } from 'react';
import { supabase } from '../../integrations/supabase/client';

export const useConnectionMonitor = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());

  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => setIsConnected(true);
    const handleOffline = () => setIsConnected(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Monitor Supabase connection
    const channel = supabase.channel('connection-monitor');
    
    channel
      .on('presence', { event: 'sync' }, () => {
        setLastActivity(Date.now());
        setIsConnected(true);
      })
      .subscribe();

    // Heartbeat check every 30 seconds
    const heartbeat = setInterval(async () => {
      try {
        // A lightweight query to check connection
        const { error } = await supabase.from('profiles').select('id').limit(1);
        if (error) throw error;
        
        setLastActivity(Date.now());
        setIsConnected(true);
      } catch (error) {
        console.error('Connection check failed:', error);
        setIsConnected(false);
      }
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(heartbeat);
      supabase.removeChannel(channel);
    };
  }, []);

  return { isConnected, lastActivity };
};
