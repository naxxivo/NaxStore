

import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../../../lib/authStore';
import { supabase } from '../../../integrations/supabase/client';
import { Database } from '../../../integrations/supabase/types';
import Button from '../../ui/Button';
import Icon from '../../ui/Icon';
import UserEditModal from './UserEditModal';

type Profile = Database['public']['Tables']['profiles']['Row'] & {
    sellers: (Database['public']['Tables']['sellers']['Row'])[];
    reward_points: (Database['public']['Tables']['reward_points']['Row'])[] | null;
};

type SortKey = 'full_name' | 'role' | 'updated_at' | 'tier' | 'points_balance';

interface SortConfig {
  key: SortKey;
  direction: 'ascending' | 'descending';
}

const UsersTab: React.FC = () => {
    const { verifySeller } = useAuthStore();
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'updated_at', direction: 'descending' });

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('profiles').select('*, sellers(*), reward_points(*)');
        if (data) {
            setUsers(data as Profile[]);
        }
        if (error) {
            console.error("Error fetching users:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);
    
    const sortedUsers = useMemo(() => {
        const sortableItems = [...users];
        sortableItems.sort((a, b) => {
            let aValue: string | number | null;
            let bValue: string | number | null;

            switch(sortConfig.key) {
                case 'tier':
                    aValue = a.reward_points?.[0]?.tier ?? 'Bronze';
                    bValue = b.reward_points?.[0]?.tier ?? 'Bronze';
                    break;
                case 'points_balance':
                    aValue = a.reward_points?.[0]?.points_balance ?? 0;
                    bValue = b.reward_points?.[0]?.points_balance ?? 0;
                    break;
                default:
                    aValue = a[sortConfig.key];
                    bValue = b[sortConfig.key];
            }
            
            if (aValue === null) return 1;
            if (bValue === null) return -1;
            if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
        return sortableItems;
    }, [users, sortConfig]);

    const requestSort = (key: SortKey) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key: SortKey) => {
        if (sortConfig.key !== key) return <span className="opacity-30 ml-1">↕</span>;
        return sortConfig.direction === 'ascending' ? '↑' : '↓';
    };

    const handleVerify = async (sellerId: string) => {
        await verifySeller(sellerId);
        fetchUsers();
    }

    const handleEdit = (user: Profile) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    if (loading) return <div>Loading users...</div>

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Manage Users</h2>
            <div className="overflow-x-auto bg-[hsl(var(--background))] rounded-lg shadow">
                <table className="w-full text-sm text-left">
                    <thead className="border-b border-[hsl(var(--border))]">
                        <tr>
                            <th scope="col" className="px-6 py-3 font-medium">
                                <button onClick={() => requestSort('full_name')} className="flex items-center">User {getSortIndicator('full_name')}</button>
                            </th>
                            <th scope="col" className="px-6 py-3 font-medium">
                                <button onClick={() => requestSort('role')} className="flex items-center">Role {getSortIndicator('role')}</button>
                            </th>
                             <th scope="col" className="px-6 py-3 font-medium">
                                <button onClick={() => requestSort('tier')} className="flex items-center">Tier {getSortIndicator('tier')}</button>
                            </th>
                            <th scope="col" className="px-6 py-3 font-medium">
                                <button onClick={() => requestSort('points_balance')} className="flex items-center">Points {getSortIndicator('points_balance')}</button>
                            </th>
                            <th scope="col" className="px-6 py-3 font-medium">
                                <button onClick={() => requestSort('updated_at')} className="flex items-center">Last Active {getSortIndicator('updated_at')}</button>
                            </th>
                            <th scope="col" className="px-6 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedUsers.map((user) => (
                            <tr key={user.id} className="border-b border-[hsl(var(--border))] last:border-b-0 hover:bg-[hsl(var(--accent))]">
                                <td className="px-6 py-4 font-medium flex items-center space-x-2">
                                    <span>{user.full_name || 'N/A'}</span>
                                    {user.role === 'seller' && user.sellers?.[0]?.is_verified && (
                                        <Icon name="check-circle" className="h-4 w-4 text-green-500" />
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${
                                        user.role === 'admin' ? 'bg-green-500/20 text-green-700 dark:text-green-300' :
                                        user.role === 'seller' ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300' :
                                        'bg-blue-500/20 text-blue-700 dark:text-blue-300'
                                    }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{user.reward_points?.[0]?.tier ?? 'N/A'}</td>
                                <td className="px-6 py-4">{user.reward_points?.[0]?.points_balance ?? 0}</td>
                                <td className="px-6 py-4 text-[hsl(var(--muted-foreground))]">{user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'}</td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    {user.role === 'seller' && !user.sellers?.[0]?.is_verified && (
                                         <Button variant="secondary" size="sm" onClick={() => handleVerify(user.id)}>Verify</Button>
                                    )}
                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(user)}>Edit</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {selectedUser && (
                 <UserEditModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    user={selectedUser}
                    onSave={fetchUsers}
                />
            )}
        </div>
    );
};

export default UsersTab;