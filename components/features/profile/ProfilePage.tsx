
import React, { useState } from 'react';
import { useAuthStore } from '../../../lib/authStore';
import { useRouterStore } from '../../../lib/routerStore';
import { cn } from '../../../lib/utils';
import Icon from '../../ui/Icon';
import ProfileSettings from './ProfileSettings';
import OrderHistory from './OrderHistory';
import AddressManager from './AddressManager';
import RewardsTab from './RewardsTab';

type ProfileTab = 'profile' | 'orders' | 'addresses' | 'rewards';

const tabs: { id: ProfileTab; label: string; icon: React.ComponentProps<typeof Icon>['name'] }[] = [
    { id: 'profile', label: 'Profile Settings', icon: 'user' },
    { id: 'orders', label: 'Order History', icon: 'package' },
    { id: 'addresses', label: 'Saved Addresses', icon: 'map-pin' },
    { id: 'rewards', label: 'My Rewards', icon: 'rewards' },
];

const ProfilePage: React.FC = () => {
    const { isLoggedIn } = useAuthStore();
    const { setView } = useRouterStore();
    const [activeTab, setActiveTab] = useState<ProfileTab>('profile');

    React.useEffect(() => {
        if (!isLoggedIn) {
            setView('list'); // Redirect if not logged in
        }
    }, [isLoggedIn, setView]);

    if (!isLoggedIn) return null;

    const renderContent = () => {
        switch (activeTab) {
            case 'profile': return <ProfileSettings />;
            case 'orders': return <OrderHistory />;
            case 'addresses': return <AddressManager />;
            case 'rewards': return <RewardsTab />;
            default: return null;
        }
    };

    return (
        <div className="lg:grid lg:grid-cols-4 lg:gap-12">
            <aside className="lg:col-span-1 mb-8 lg:mb-0">
                <h1 className="text-3xl font-bold mb-6">My Account</h1>
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
            <main className="lg:col-span-3 bg-[hsl(var(--card))] p-6 sm:p-8 rounded-xl shadow-inner">
                {renderContent()}
            </main>
        </div>
    );
};

export default ProfilePage;