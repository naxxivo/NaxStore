import React, { useState } from 'react';
import { useAuthStore } from '../../../lib/authStore';
import { ShippingAddress } from '../../../types';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { AnimatePresence, motion } from 'framer-motion';

const AddressManager: React.FC = () => {
    const { addresses, removeAddress, setDefaultAddress } = useAuthStore();
    const [isAdding, setIsAdding] = useState(false);
    const [loadingState, setLoadingState] = useState<{ [key: number]: boolean }>({});

    const handleRemove = async (id: number) => {
        setLoadingState(prev => ({...prev, [id]: true }));
        await removeAddress(id);
        setLoadingState(prev => ({...prev, [id]: false }));
    }
    
    const handleSetDefault = async (id: number) => {
         setLoadingState(prev => ({...prev, [id]: true }));
         await setDefaultAddress(id);
         setLoadingState(prev => ({...prev, [id]: false }));
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Saved Addresses</h2>
                <Button onClick={() => setIsAdding(!isAdding)}>
                    {isAdding ? 'Cancel' : 'Add New Address'}
                </Button>
            </div>
            <AnimatePresence>
                {isAdding && (
                     <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <AddAddressForm onAdd={() => setIsAdding(false)} />
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {addresses.length === 0 && !isAdding && (
                    <p className="text-[hsl(var(--muted-foreground))] md:col-span-2">You have no saved addresses.</p>
                )}
                {addresses.map((address) => (
                    <div key={address.id} className="border border-[hsl(var(--border))] rounded-lg p-4 flex flex-col">
                        {address.isDefault && (
                             <span className="text-xs font-semibold bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-2 py-0.5 rounded-full self-start mb-2">Default</span>
                        )}
                        <p className="font-semibold">{address.fullName}</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">{address.addressLine1}</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">{address.city}, {address.state} {address.zipCode}</p>
                        <div className="mt-4 pt-4 border-t border-[hsl(var(--border))] flex space-x-2 text-sm">
                            {!address.isDefault && (
                                <button onClick={() => handleSetDefault(address.id!)} disabled={loadingState[address.id!]} className="font-medium text-[hsl(var(--primary))] hover:underline disabled:opacity-50">Set as Default</button>
                            )}
                            <button onClick={() => handleRemove(address.id!)} disabled={loadingState[address.id!]} className="font-medium text-red-500 hover:underline disabled:opacity-50">Remove</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const AddAddressForm: React.FC<{onAdd: () => void}> = ({ onAdd }) => {
    const { addAddress } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<Omit<ShippingAddress, 'id' | 'isDefault'>>({
        fullName: '', addressLine1: '', city: '', state: '', zipCode: '', country: 'USA'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await addAddress(formData);
        setIsLoading(false);
        onAdd();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-[hsl(var(--accent))] p-4 rounded-lg mb-6">
             <Input placeholder="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} required />
             <Input placeholder="Address" name="addressLine1" value={formData.addressLine1} onChange={handleChange} required />
            <div className="grid grid-cols-2 gap-4">
                <Input placeholder="City" name="city" value={formData.city} onChange={handleChange} required />
                <Input placeholder="State" name="state" value={formData.state} onChange={handleChange} required />
            </div>
             <div className="grid grid-cols-2 gap-4">
                <Input placeholder="ZIP Code" name="zipCode" value={formData.zipCode} onChange={handleChange} required />
                <Input name="country" value={formData.country} onChange={handleChange} required disabled />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Address'}
            </Button>
        </form>
    )
}


export default AddressManager;