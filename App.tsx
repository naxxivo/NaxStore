


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


function App() {
  const { view } = useRouterStore();
  const { fetchProducts } = useProductStore();
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);

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
           {renderView()}
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