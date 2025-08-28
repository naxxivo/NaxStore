
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
            if (!user) return;
            setLoading(true);

            try {
                // Step 1: Get the seller's product IDs. This is safe from recursion.
                const { data: productsData, error: productsError } = await supabase
                    .from('products')
                    .select('id')
                    .eq('seller_id', user.id);
                
                if (productsError) throw productsError;
                if (!productsData || productsData.length === 0) {
                    setOrders([]);
                    setLoading(false);
                    return;
                }
                const productIds = productsData.map(p => p.id);

                // Step 2: Get order_items for those products. Also safe.
                const { data: orderItemsData, error: itemsError } = await supabase
                    .from('order_items')
                    .select('order_id')
                    .in('product_id', productIds);

                if (itemsError) throw itemsError;
                if (!orderItemsData || orderItemsData.length === 0) {
                    setOrders([]);
                    setLoading(false);
                    return;
                }
                
                // Step 3: Get unique order IDs and fetch the full order data.
                const uniqueOrderIds = [...new Set(orderItemsData.map(item => item.order_id))];
                const { data: ordersData, error: ordersError } = await supabase
                    .from('orders')
                    .select('*')
                    .in('id', uniqueOrderIds)
                    .order('created_at', { ascending: false });

                if (ordersError) throw ordersError;

                setOrders(ordersData || []);

            } catch (error) {
                console.error("Error fetching seller orders:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSellerOrders();
    }, [user]);

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
