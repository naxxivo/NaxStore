
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../integrations/supabase/client';
import { Database } from '../../../integrations/supabase/types';
import { OrderStatus } from '../../../types';
import Button from '../../ui/Button';
import { cn } from '../../../lib/utils';

type OrderRow = Database['public']['Tables']['orders']['Row'];

const SellerOrdersTab: React.FC = () => {
    const [orders, setOrders] = useState<OrderRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSellerOrders = async () => {
            setLoading(true);
            
            // FIX: Query via `order_items` to avoid recursive RLS policy on `orders`.
            // RLS for sellers on `order_items` is assumed to be non-recursive.
            const { data: orderItems, error } = await supabase
                .from('order_items')
                .select('orders(*)');

            if (orderItems) {
                // Deduplicate orders since we get one entry per order item.
                const ordersMap = new Map<number, OrderRow>();
                orderItems.forEach(item => {
                    if (item.orders) {
                        const order = item.orders as unknown as OrderRow;
                        ordersMap.set(order.id, order);
                    }
                });
                const uniqueOrders = Array.from(ordersMap.values());
                uniqueOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setOrders(uniqueOrders);
            }

            if (error) {
                console.error("Error fetching seller orders:", error);
            }
            setLoading(false);
        };
        fetchSellerOrders();
    }, []);

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case 'delivered': return 'bg-green-500/20 text-green-700 dark:text-green-300';
            case 'shipped': return 'bg-blue-500/20 text-blue-700 dark:text-blue-300';
            case 'processing': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300';
            case 'cancelled': return 'bg-red-500/20 text-red-700 dark:text-red-300';
            default: return 'bg-gray-500/20 text-gray-700 dark:text-gray-300';
        }
    };
    
    if(loading) return <div>Loading your orders...</div>

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">My Orders</h2>
            <div className="overflow-x-auto bg-[hsl(var(--background))] rounded-lg shadow">
                <table className="w-full text-sm text-left">
                    <thead className="border-b border-[hsl(var(--border))]">
                        <tr>
                            <th scope="col" className="px-6 py-3 font-medium">Order ID</th>
                            <th scope="col" className="px-6 py-3 font-medium">Date</th>
                            <th scope="col" className="px-6 py-3 font-medium">Total</th>
                            <th scope="col" className="px-6 py-3 font-medium">Status</th>
                            <th scope="col" className="px-6 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id} className="border-b border-[hsl(var(--border))] last:border-b-0 hover:bg-[hsl(var(--accent))]">
                                <td className="px-6 py-4 font-medium text-[hsl(var(--primary))]">{order.public_id.substring(0,8)}...</td>
                                <td className="px-6 py-4">{new Date(order.created_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4">${order.total_price.toFixed(2)}</td>
                                <td className="px-6 py-4">
                                     <span className={cn('px-2 py-1 text-xs font-semibold rounded-full capitalize', getStatusColor(order.status))}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Button variant="ghost" size="sm">View Details</Button>
                                </td>
                            </tr>
                        ))}
                         {orders.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-[hsl(var(--muted-foreground))]">
                                    You have no orders yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SellerOrdersTab;
