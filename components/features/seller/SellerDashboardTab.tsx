
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Icon from '../../ui/Icon';
import { useAuthStore } from '../../../lib/authStore';
import { supabase } from '../../../integrations/supabase/client';
import { Database } from '../../../integrations/supabase/types';

type OrderRow = Database['public']['Tables']['orders']['Row'];

const SellerDashboardTab: React.FC = () => {
    const { user } = useAuthStore();
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
                setOrders(uniqueOrders);
            }
            
            if (error) {
                console.error("Error fetching seller orders:", error);
            }
            setLoading(false);
        };
        fetchSellerOrders();
    }, []);

    const totalSales = orders.reduce((acc, order) => acc + order.total_price, 0);
    const pendingOrdersCount = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;
    const netEarnings = totalSales * (1 - (user?.commissionRate || 0.15));

    const stats = [
        { name: 'Total Sales', value: `$${totalSales.toFixed(2)}`, icon: 'dollar-sign' as const },
        { name: 'Total Orders', value: orders.length.toString(), icon: 'package' as const },
        { name: 'Pending Orders', value: pendingOrdersCount.toString(), icon: 'truck' as const },
        { name: 'Net Earnings', value: `$${netEarnings.toFixed(2)}`, icon: 'bar-chart-2' as const },
    ];
    
    if (loading) return <div>Loading dashboard...</div>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Sales Overview</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {stats.map((stat, i) => (
                     <motion.div 
                        key={stat.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-[hsl(var(--background))] p-6 rounded-lg shadow-md flex items-center space-x-4"
                    >
                        <div className="bg-[hsl(var(--primary))] p-3 rounded-lg">
                             <Icon name={stat.icon} className="h-6 w-6 text-[hsl(var(--primary-foreground))]" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">{stat.name}</p>
                            <p className="mt-1 text-2xl font-semibold tracking-tight">{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
             <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Recent Orders</h3>
                <div className="bg-[hsl(var(--background))] p-4 rounded-lg shadow-md">
                    <p className="text-center text-[hsl(var(--muted-foreground))]">A list of recent orders will appear here.</p>
                </div>
            </div>
        </div>
    );
};

export default SellerDashboardTab;
