
import React, { useState } from 'react';
import { useAuthStore } from '../../../lib/authStore';
import { useRouterStore } from '../../../lib/routerStore';
import { cn } from '../../../lib/utils';
import Icon from '../../ui/Icon';
import DashboardTab from './DashboardTab';
import ProductsTab from './ProductsTab';
import OrdersTab from './OrdersTab';
import UsersTab from './UsersTab';

type AdminTab = 'dashboard' | 'products' | 'orders' | 'users';

const tabs: { id: AdminTab; label: string; icon: React.ComponentProps<typeof Icon>['name'] }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'products', label: 'Products', icon: 'package' },
    { id: 'orders', label: 'Orders', icon: 'cart' },
    { id: 'users', label: 'Users', icon: 'users' },
];

const AdminPage: React.FC = () => {
    const { user } = useAuthStore();
    const { setView } = useRouterStore();
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

    React.useEffect(() => {
        if (user?.role !== 'admin') {
            setView('list'); // Redirect if not admin
        }
    }, [user, setView]);

    if (user?.role !== 'admin') return null;

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <DashboardTab />;
            case 'products': return <ProductsTab />;
            case 'orders': return <OrdersTab />;
            case 'users': return <UsersTab />;
            default: return null;
        }
    };

    return (
        <div className="lg:grid lg:grid-cols-5 lg:gap-8">
            <aside className="lg:col-span-1 mb-8 lg:mb-0">
                <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
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
                {renderContent()}
            </main>
        </div>
    );
};

export default AdminPage;