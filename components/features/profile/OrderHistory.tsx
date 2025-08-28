import React from 'react';
import { useAuthStore } from '../../../lib/authStore';
import { Order } from '../../../types';
import { cn } from '../../../lib/utils';
import { useRouterStore } from '../../../lib/routerStore';
import Button from '../../ui/Button';

const OrderHistory: React.FC = () => {
    const { orders } = useAuthStore();

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Order History</h2>
            {orders.length === 0 ? (
                <p className="text-[hsl(var(--muted-foreground))]">You haven't placed any orders yet.</p>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => (
                        <OrderDetail key={order.id} order={order} />
                    ))}
                </div>
            )}
        </div>
    );
};

const OrderDetail: React.FC<{ order: Order }> = ({ order }) => {
    const { setView } = useRouterStore();
    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'delivered': return 'bg-green-500/20 text-green-700 dark:text-green-300';
            case 'shipped': return 'bg-blue-500/20 text-blue-700 dark:text-blue-300';
            case 'processing': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300';
            case 'cancelled': return 'bg-red-500/20 text-red-700 dark:text-red-300';
            default: return 'bg-gray-500/20 text-gray-700 dark:text-gray-300';
        }
    };
    
    return (
        <div className="border border-[hsl(var(--border))] rounded-lg p-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 pb-4 border-b border-[hsl(var(--border))]">
                <div>
                    <p className="font-bold">Order ID: <span className="font-normal text-[hsl(var(--muted-foreground))]">{order.id.substring(0,8)}...</span></p>
                    <p className="font-bold">Date: <span className="font-normal text-[hsl(var(--muted-foreground))]">{order.date}</span></p>
                </div>
                <div className="mt-2 sm:mt-0 text-left sm:text-right">
                    <span className={cn('px-2 py-1 text-xs font-semibold rounded-full capitalize', getStatusColor(order.status))}>
                        {order.status}
                    </span>
                    <p className="font-bold mt-1">${order.total.toFixed(2)}</p>
                </div>
            </div>
            <div className="space-y-2">
                {order.items.map(item => (
                    <div key={item.id} className="flex items-center space-x-3 text-sm">
                        <img src={item.image} alt={item.name} className="h-10 w-10 rounded-md object-cover" />
                        <div className="flex-grow">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-[hsl(var(--muted-foreground))]">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                ))}
            </div>
            <div className="mt-4 pt-4 border-t border-[hsl(var(--border))] flex justify-end">
                <Button variant="secondary" onClick={() => setView('tracking', order.id)}>
                    Track Order
                </Button>
            </div>
        </div>
    );
};

export default OrderHistory;