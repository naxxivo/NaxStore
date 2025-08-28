
import React, { useState, useEffect } from 'react';
import Modal from '../../ui/Modal';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import { supabase } from '../../../integrations/supabase/client';
import { Database } from '../../../integrations/supabase/types';
import { useToastStore } from '../../../lib/toastStore';

type Profile = Database['public']['Tables']['profiles']['Row'];
type UserRole = Database['public']['Enums']['user_role'];
const roles: UserRole[] = ['user', 'seller', 'admin'];

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: Profile;
  onSave: () => void;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ isOpen, onClose, user, onSave }) => {
    const [formData, setFormData] = useState({ full_name: '', role: 'user' as UserRole });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || '',
                role: user.role,
            });
        }
    }, [user, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: formData.full_name,
                role: formData.role
            })
            .eq('id', user.id);

        if (error) {
            useToastStore.getState().addToast({ message: `Error: ${error.message}`, type: 'error' });
        } else {
            useToastStore.getState().addToast({ message: 'User updated successfully!', type: 'success' });
            onSave();
            onClose();
        }
        setIsLoading(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit User: ${user.full_name || user.id.substring(0,8)}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="full_name" className="text-sm font-medium">Full Name</label>
                    <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} required className="mt-1" />
                </div>
                <div>
                    <label htmlFor="role" className="text-sm font-medium">Role</label>
                    <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="mt-1 w-full h-10 px-3 py-2 rounded-md bg-[hsl(var(--card))] border border-[hsl(var(--border))] focus:ring-2 focus:ring-[hsl(var(--ring))] focus:outline-none transition"
                    >
                        {roles.map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
                    </select>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
            </form>
        </Modal>
    );
};

export default UserEditModal;
