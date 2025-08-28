
import React, { useState } from 'react';
import { useAuthStore } from '../../../lib/authStore';
import { useRouterStore } from '../../../lib/routerStore';
import { cn } from '../../../lib/utils';
import Icon from '../../ui/Icon';
import SellerDashboardTab from './SellerDashboardTab';
import SellerProductsTab from './SellerProductsTab';
import SellerOrdersTab from './SellerOrdersTab';
import SellerSettingsTab from './SellerSettingsTab';
import SellerCommissionsTab from './SellerCommissionsTab';

type SellerTab = 'dashboard' | 'products' | 'orders' | 'commissions' | 'settings';

const tabs: { id: SellerTab; label: string; icon: React.ComponentProps<typeof Icon>['name'] }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'products', label: 'My Products', icon: 'package' },
    { id: 'orders', label: 'Orders', icon: 'cart' },
    { id: 'commissions', label: 'Commissions', icon: 'dollar-sign' },
    { id: 'settings', label: 'Store Settings', icon: 'store' },
];

const SellerPortalPage: React.FC = () => {
    const { user } = useAuthStore();
    const { setView } = useRouterStore();
    const [activeTab, setActiveTab] = useState<SellerTab>('dashboard');

    React.useEffect(() => {
        if (user?.role !== 'seller') {
            setView('list'); // Redirect if not a seller
        }
    }, [user, setView]);

    if (user?.role !== 'seller') return null;

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <SellerDashboardTab />;
            case 'products': return <SellerProductsTab />;
            case 'orders': return <SellerOrdersTab />;
            case 'commissions': return <SellerCommissionsTab />;
            case 'settings': return <SellerSettingsTab />;
            default: return null;
        }
    };

    return (
        <div className="lg:grid lg:grid-cols-5 lg:gap-8">
            <aside className="lg:col-span-1 mb-8 lg:mb-0">
                <h1 className="text-2xl font-bold mb-1">Seller Portal</h1>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">{user.storeName}</p>
                <nav className="flex flex-col space-y-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center space-x-3 p-3 rounded-lg text-left transition-colors",
                                activeTab === tab.id 
                                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold' 
                                    : 'hover:bg-[hsl(var(--accent))]'
                            )}
                        >
                            <Icon name={tab.icon} className="h-5 w-5" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </aside>
            <main className="lg:col-span-4 bg-[hsl(var(--card))] p-6 sm:p-8 rounded-xl shadow-inner">
                 {!user.isVerified && (
                    <div className="bg-yellow-500/20 text-yellow-800 dark:text-yellow-200 p-4 rounded-lg mb-6 text-center">
                        <p className="font-semibold">Your seller account is pending verification. Some features may be limited.</p>
                    </div>
                )}
                {renderContent()}
            </main>
        </div>
    );
};

export default SellerPortalPage;
