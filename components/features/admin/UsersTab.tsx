
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../../lib/authStore';
import { supabase } from '../../../integrations/supabase/client';
import { Database } from '../../../integrations/supabase/types';
import Button from '../../ui/Button';
import Icon from '../../ui/Icon';

// FIX: Updated the Profile type to match the data structure returned by Supabase.
// For list queries, one-to-one relationships like 'sellers' are returned as an array.
type Profile = Database['public']['Tables']['profiles']['Row'] & {
    sellers: (Database['public']['Tables']['sellers']['Row'])[] 
};

const UsersTab: React.FC = () => {
    const { verifySeller } = useAuthStore();
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('profiles').select('*, sellers(*)');
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

    const handleVerify = async (sellerId: string) => {
        await verifySeller(sellerId);
        fetchUsers(); // Re-fetch to show updated status
    }

    if (loading) return <div>Loading users...</div>

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Manage Users</h2>
            <div className="overflow-x-auto bg-[hsl(var(--background))] rounded-lg shadow">
                <table className="w-full text-sm text-left">
                    <thead className="border-b border-[hsl(var(--border))]">
                        <tr>
                            <th scope="col" className="px-6 py-3 font-medium">User</th>
                            <th scope="col" className="px-6 py-3 font-medium">User ID</th>
                            <th scope="col" className="px-6 py-3 font-medium">Role</th>
                            <th scope="col" className="px-6 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="border-b border-[hsl(var(--border))] last:border-b-0 hover:bg-[hsl(var(--accent))]">
                                <td className="px-6 py-4 font-medium flex items-center space-x-2">
                                    <span>{user.full_name || 'N/A'}</span>
                                    {/* FIX: Access the first element of the 'sellers' array to check verification status. */}
                                    {user.role === 'seller' && user.sellers?.[0]?.is_verified && (
                                        <Icon name="check-circle" className="h-4 w-4 text-green-500" />
                                    )}
                                </td>
                                <td className="px-6 py-4 text-[hsl(var(--muted-foreground))]">{user.id}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${
                                        user.role === 'admin' ? 'bg-green-500/20 text-green-700 dark:text-green-300' :
                                        user.role === 'seller' ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300' :
                                        'bg-blue-500/20 text-blue-700 dark:text-blue-300'
                                    }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    {/* FIX: Access the first element of the 'sellers' array to check verification status. */}
                                    {user.role === 'seller' && !user.sellers?.[0]?.is_verified && (
                                         <Button variant="secondary" size="sm" onClick={() => handleVerify(user.id)}>Verify</Button>
                                    )}
                                    <Button variant="ghost" size="sm">Edit</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsersTab;