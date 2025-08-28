
import React, { useState } from 'react';
import ThemeToggle from '../features/ThemeToggle';
import { useCartStore, useCartTotals } from '../../lib/store';
import { useShopperStore } from '../../lib/shopperStore';
import { useAuthStore } from '../../lib/authStore';
import { useModalStore } from '../../lib/modalStore';
import { useWishlistStore } from '../../lib/wishlistStore';
import { useRouterStore } from '../../lib/routerStore';
import { useNotificationStore } from '../../lib/notificationStore';
import NotificationCenter from '../features/notifications/NotificationCenter';
import Icon from '../ui/Icon';
import Button from '../ui/Button';
import { AnimatePresence, motion } from 'framer-motion';

const Header: React.FC = () => {
  const { toggleCart } = useCartStore();
  const { totalItems } = useCartTotals();
  const { toggleShopper } = useShopperStore();
  const { toggleWishlist } = useWishlistStore();
  const { isLoggedIn, user, logout } = useAuthStore();
  const { openModal } = useModalStore();
  const { setView } = useRouterStore();
  const { notifications } = useNotificationStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/0.8)] backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <button onClick={() => setView('list')} className="flex items-center space-x-2">
          <span className="font-bold text-2xl text-[hsl(var(--primary))]">NaxStore</span>
        </button>
        <div className="flex items-center space-x-1 sm:space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleShopper}
            aria-label="Open AI personal shopper"
          >
            <Icon name="sparkles" className="h-6 w-6 text-[hsl(var(--primary))]" />
          </Button>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleWishlist}
            aria-label="Open wishlist"
          >
            <Icon name="heart" className="h-6 w-6" />
          </Button>
          
          {isLoggedIn && (
            <div className="relative">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsNotificationsOpen(true)}
                    aria-label="Open notifications"
                >
                    <Icon name="bell" className="h-6 w-6"/>
                    {unreadCount > 0 && (
                         <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                            {unreadCount}
                         </span>
                    )}
                </Button>
                <NotificationCenter isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCart}
            className="relative"
            aria-label="Open shopping cart"
          >
            <Icon name="cart" className="h-6 w-6" />
            {totalItems > 0 && (
              <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {totalItems}
              </span>
            )}
          </Button>
          
          {isLoggedIn && user ? (
            <div className="relative">
              <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <div className="h-8 w-8 rounded-full bg-[hsl(var(--secondary))] flex items-center justify-center font-bold overflow-hidden">
                    {user.profilePicture ? (
                        <img src={user.profilePicture} alt="User" className="h-full w-full object-cover"/>
                    ) : (
                        user.name.charAt(0)
                    )}
                </div>
              </Button>
              <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-[hsl(var(--card))] rounded-md shadow-lg z-50 border border-[hsl(var(--border))]"
                  onMouseLeave={() => setIsMenuOpen(false)}
                >
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-[hsl(var(--muted-foreground))] border-b border-[hsl(var(--border))]">
                        Signed in as <br/> <span className="font-medium text-[hsl(var(--foreground))]">{user?.email}</span>
                    </div>
                    <button
                      onClick={() => { setView('profile'); setIsMenuOpen(false); }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-[hsl(var(--accent))]"
                    >
                      My Profile
                    </button>
                    {user.role === 'admin' && (
                       <button
                        onClick={() => { setView('admin'); setIsMenuOpen(false); }}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-[hsl(var(--accent))]"
                      >
                        Admin Dashboard
                      </button>
                    )}
                    {user.role === 'seller' && (
                       <button
                        onClick={() => { setView('seller'); setIsMenuOpen(false); }}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-[hsl(var(--accent))]"
                      >
                        Seller Portal
                      </button>
                    )}
                    <button
                      onClick={() => { logout(); setIsMenuOpen(false); setView('list'); }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-[hsl(var(--accent))]"
                    >
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden sm:flex items-center space-x-2">
              <Button variant="ghost" onClick={() => openModal('login')}>Login</Button>
              <Button onClick={() => openModal('signup')}>Sign Up</Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
