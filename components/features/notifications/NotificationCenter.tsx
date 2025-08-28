import React from 'react';
import { useNotificationStore } from '../../../lib/notificationStore';
import { useRouterStore } from '../../../lib/routerStore';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import Icon from '../../ui/Icon';
import Button from '../../ui/Button';
import { Notification } from '../../../types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();
  const { setView } = useRouterStore();

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.metadata && typeof notification.metadata === 'object' && !Array.isArray(notification.metadata)) {
        const metadata = notification.metadata as { view?: 'tracking' | 'seller'; orderId?: string };
        if(metadata.view) {
           setView(metadata.view, metadata.orderId);
        }
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-[hsl(var(--card))] rounded-md shadow-lg z-50 border border-[hsl(var(--border))]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="notification-center-title"
        >
          <div className="flex justify-between items-center p-4 border-b border-[hsl(var(--border))]">
            <h3 id="notification-center-title" className="font-semibold">Notifications</h3>
            <Button variant="ghost" size="sm" onClick={markAllAsRead} disabled={notifications.every(n => n.isRead)}>
              Mark all as read
            </Button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
                <Icon name="bell" className="h-12 w-12 mx-auto mb-2" />
                <p>No new notifications</p>
              </div>
            ) : (
              <ul>
                {notifications.map((notification) => (
                  <li key={notification.id} className="border-b border-[hsl(var(--border))] last:border-b-0">
                    <button
                      onClick={() => handleNotificationClick(notification)}
                      className="w-full text-left p-4 hover:bg-[hsl(var(--accent))] transition-colors flex items-start space-x-3"
                    >
                      {!notification.isRead && (
                        <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                      )}
                      <div className={cn("flex-grow", notification.isRead && 'pl-5')}>
                        <p className={cn("text-sm", !notification.isRead && "font-semibold")}>{notification.message}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationCenter;