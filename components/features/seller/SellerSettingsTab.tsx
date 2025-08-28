
import React, { useState } from 'react';
import { useAuthStore } from '../../../lib/authStore';
import Input from '../../ui/Input';
import Button from '../../ui/Button';

const SellerSettingsTab: React.FC = () => {
    const { user, updateStoreSettings } = useAuthStore();
    const [storeName, setStoreName] = useState(user?.storeName || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (storeName) {
            setIsLoading(true);
            await updateStoreSettings(storeName);
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Store Settings</h2>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                <div>
                    <label htmlFor="storeName" className="block text-sm font-medium mb-1">Store Name</label>
                    <Input id="storeName" value={storeName} onChange={(e) => setStoreName(e.target.value)} required />
                </div>
                <div>
                    <label htmlFor="sellerEmail" className="block text-sm font-medium mb-1">Account Email</label>
                    <Input id="sellerEmail" value={user?.email || ''} disabled className="bg-[hsl(var(--muted))] cursor-not-allowed" />
                </div>
                 <div>
                    <label className="block text-sm font-medium mb-1">Commission Rate</label>
                    <Input value={`${(user?.commissionRate || 0) * 100}%`} disabled className="bg-[hsl(var(--muted))] cursor-not-allowed" />
                </div>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
            </form>
        </div>
    );
};

export default SellerSettingsTab;