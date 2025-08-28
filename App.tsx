



import React, { useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ProductList from './components/features/ProductList';
import ShoppingCart from './components/features/ShoppingCart';
import PersonalShopper from './components/features/PersonalShopper';
import ProductDetail from './components/features/ProductDetail';
import { useRouterStore } from './lib/routerStore';
import Toasts from './components/ui/Toasts';
import AuthModal from './components/features/auth/AuthModal';
import CheckoutPage from './components/features/checkout/CheckoutPage';
import SuccessPage from './components/features/checkout/SuccessPage';
import ProfilePage from './components/features/profile/ProfilePage';
import Wishlist from './components/features/Wishlist';
import OrderTrackingPage from './components/features/tracking/OrderTrackingPage';
import AdminPage from './components/features/admin/AdminPage';
import SellerPortalPage from './components/features/seller/SellerPortalPage';
import { trackEvent } from './lib/analytics';
import { useProductStore } from './lib/productStore';
import { useAuthStore, refetchAllUserData } from './lib/authStore';
import { supabase } from './integrations/supabase/client';
import { useConnectionMonitor } from './lib/hooks/useConnectionMonitor';
import { ErrorBoundary } from './components/ui/ErrorBoundary';


function App() {
  const { view } = useRouterStore();
  const { fetchProducts } = useProductStore();
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);
  const { isConnected } = useConnectionMonitor();

  // --- START: Robust Global Data Fetching & Caching Strategy ---
  // This section implements a robust, app-wide data fetching strategy inspired by React Query.
  // It ensures data consistency and freshness across long-lived sessions.

  // 1. Initial and Periodic Data Fetching
  // Fetches all relevant data on initial load and then refetches periodically.
  // This keeps the app state synchronized with the database and prevents stale data issues.
  useEffect(() => {
    // FIX: Added a space between `const` and `fetchAllData` to correctly declare the function.
    const fetchAllData = () => {
      console.log('Fetching all application data...');
      fetchProducts();
      if (isLoggedIn) {
        refetchAllUserData();
      }
    };
    
    fetchAllData(); // Initial fetch

    const THREE_MINUTES_IN_MS = 3 * 60 * 1000;
    const intervalId = setInterval(() => {
      console.log('Periodically refreshing all data to ensure freshness...');
      fetchAllData();
    }, THREE_MINUTES_IN_MS);

    // Cleanup function to prevent memory leaks when the component unmounts.
    return () => clearInterval(intervalId);
  }, [fetchProducts, isLoggedIn]);

  // 2. Refetch on Window Focus
  // This hook refetches all data whenever the user returns to the browser tab. This is a crucial
  // feature for ensuring data is up-to-date after the user has been away from the page.
  useEffect(() => {
    const handleFocus = () => {
      console.log('Window focused, refetching all application data...');
      fetchProducts();
      if (useAuthStore.getState().isLoggedIn) { // Use getState to get latest value inside listener
        refetchAllUserData();
      }
    };

    window.addEventListener('focus', handleFocus);

    // Cleanup function to remove the event listener and prevent memory leaks.
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchProducts]);

  // --- END: Robust Global Data Fetching & Caching Strategy ---
  
  // --- START: Session and Connection Management ---
  // This section ensures the user's session remains active and the app
  // is resilient to network changes.

  // 1. Proactive Session Refresh
  useEffect(() => {
    const refreshSession = async () => {
      try {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) throw error;
        console.log('Session refreshed proactively:', data.session);
        return data.session;
      } catch (error) {
        console.error('Proactive session refresh failed:', error);
        // This will trigger onAuthStateChange to SIGNED_OUT
        await supabase.auth.signOut();
        return null;
      }
    };

    const interval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session && session.expires_at) {
        const expiresAt = session.expires_at * 1000;
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;
        
        // Refresh if token expires in less than 5 minutes
        if (expiresAt - now < fiveMinutes) {
          await refreshSession();
        }
      }
    }, 60 * 1000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // 2. Real-time Product Updates
  useEffect(() => {
    const unsubscribe = useProductStore.getState().subscribeToChanges();
    return unsubscribe;
  }, []);
  
  // --- END: Session and Connection Management ---
  
  // --- START: Temporary Debugging Monitor ---
  // This helps diagnose issues by logging app state periodically.
  useEffect(() => {
    const debugInterval = setInterval(() => {
      console.log('App Status:', {
        timestamp: new Date().toISOString(),
        isConnected: navigator.onLine,
        supabaseReady: !!supabase,
        authUser: useAuthStore.getState().user?.id || 'Not logged in',
        productsLoaded: useProductStore.getState().products.length,
      });
    }, 30 * 1000);

    return () => clearInterval(debugInterval);
  }, []);
  // --- END: Temporary Debugging Monitor ---

  useEffect(() => {
    trackEvent('page_view', { page: view });
  }, [view]);

  const renderView = () => {
    switch(view) {
      case 'list':
        return <ProductList />;
      case 'detail':
        return <ProductDetail />;
      case 'checkout':
        return <CheckoutPage />;
      case 'success':
        return <SuccessPage />;
      case 'profile':
        return <ProfilePage />;
      case 'tracking':
        return <OrderTrackingPage />;
      case 'admin':
        return <AdminPage />;
      case 'seller':
        return <SellerPortalPage />;
      default:
        return <ProductList />;
    }
  }

  return (
    <ThemeProvider>
      <div className="bg-[hsl(var(--background))] text-[hsl(var(--foreground))] min-h-screen flex flex-col transition-colors duration-300">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
           <ErrorBoundary>
            {!isConnected && (
              <div className="fixed top-16 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-b-lg shadow-lg z-50 text-sm font-semibold">
                Connection lost. Attempting to reconnect...
              </div>
            )}
            {renderView()}
          </ErrorBoundary>
        </main>
        <Footer />
        <ShoppingCart />
        <PersonalShopper />
        <Wishlist />
        <Toasts />
        <AuthModal />
      </div>
    </ThemeProvider>
  );
}

export default App;