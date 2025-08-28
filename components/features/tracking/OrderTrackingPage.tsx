import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../../../lib/authStore';
import { useRouterStore } from '../../../lib/routerStore';
import { useNotificationStore } from '../../../lib/notificationStore';
import { Order, OrderStatus } from '../../../types';
import Button from '../../ui/Button';
import Icon from '../../ui/Icon';
import TrackingMap from './TrackingMap';
import { cn } from '../../../lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

const orderStatuses: OrderStatus[] = ['processing', 'shipped', 'delivered']; // Simplified to match DB enum more closely

const OrderTrackingPage: React.FC = () => {
    const { orderId, setView } = useRouterStore();
    const { orders } = useAuthStore();
    const { addNotification } = useNotificationStore();
    
    const initialOrder = useMemo(() => orders.find(o => o.id === orderId), [orders, orderId]);
    const [order, setOrder] = useState<Order | null | undefined>(initialOrder);

    useEffect(() => {
      setOrder(initialOrder);
    }, [initialOrder]);

    // This useEffect simulates a real-time update
    useEffect(() => {
        if (order && order.status !== 'delivered') {
            const interval = setInterval(() => {
                setOrder(prevOrder => {
                    if (!prevOrder || prevOrder.status === 'delivered') {
                        clearInterval(interval);
                        return prevOrder;
                    }
                    const currentIndex = orderStatuses.indexOf(prevOrder.status);
                    const nextStatus = orderStatuses[currentIndex + 1] as OrderStatus;

                    if (nextStatus) {
                        const newEvent = {
                            status: nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1), // Capitalize
                            location: nextStatus === 'shipped' ? 'Transit Hub, AZ' : 'Local Hub, CA',
                            timestamp: new Date().toISOString()
                        };
                        const updatedOrder: Order = { ...prevOrder, status: nextStatus, trackingHistory: [...prevOrder.trackingHistory, newEvent]};

                        addNotification({
                            message: `Your order ${updatedOrder.id.substring(0,8)}... is now ${nextStatus}.`,
                            type: 'order',
                            metadata: { view: 'tracking', orderId: updatedOrder.id }
                        });
                        
                        return updatedOrder;
                    } else {
                        clearInterval(interval);
                        return prevOrder;
                    }
                });
            }, 8000); // Update every 8 seconds

            return () => clearInterval(interval);
        }
    }, [order, addNotification]);
    
    if (order === undefined) return <div>Loading...</div>;
    if (order === null) return <div>Order not found.</div>;

    const currentStatusIndex = orderStatuses.indexOf(order.status);
    const displayStatuses = ['Processing', 'Shipped', 'Delivered'];

    return (
        <div>
            <Button variant="secondary" onClick={() => setView('profile')} className="mb-8">
                &larr; Back to Order History
            </Button>

            <div className="bg-[hsl(var(--card))] p-6 sm:p-8 rounded-xl shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Track Order</h1>
                        <p className="text-[hsl(var(--muted-foreground))]">Order ID: {order.id.substring(0,8)}...</p>
                    </div>
                    <div className="text-lg font-semibold mt-4 sm:mt-0">
                        Status: <span className="text-[hsl(var(--primary))] capitalize">{order.status}</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full mb-12">
                    <div className="flex justify-between items-center relative">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-[hsl(var(--border))] -translate-y-1/2"></div>
                        <div
                            className="absolute top-1/2 left-0 h-1 bg-[hsl(var(--primary))] -translate-y-1/2 transition-all duration-500"
                            style={{ width: `${(currentStatusIndex / (orderStatuses.length - 1)) * 100}%` }}
                        ></div>
                        {displayStatuses.map((status, index) => (
                            <div key={status} className="z-10 text-center">
                                <div className={cn(
                                    "h-6 w-6 rounded-full mx-auto transition-colors duration-500 flex items-center justify-center",
                                    index <= currentStatusIndex ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--muted))]'
                                )}>
                                    {index < currentStatusIndex && <span className="text-white font-bold text-sm">✓</span>}
                                </div>
                                <p className="text-xs sm:text-sm mt-2">{status}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Tracking History */}
                    <div>
                        <h2 className="text-xl font-bold mb-4">Tracking History</h2>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
                            <AnimatePresence initial={false}>
                                {order.trackingHistory.slice().reverse().map((event, index) => (
                                    <motion.div
                                        key={event.timestamp}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="flex space-x-4"
                                    >
                                        <div className="flex flex-col items-center">
                                            <div className={cn(
                                                "w-4 h-4 rounded-full border-2",
                                                index === 0 ? "bg-[hsl(var(--primary))] border-[hsl(var(--primary))]" : "border-[hsl(var(--muted))]"
                                            )}></div>
                                            <div className="w-0.5 flex-grow bg-[hsl(var(--border))]"></div>
                                        </div>
                                        <div>
                                            <p className="font-semibold">{event.status}</p>
                                            <p className="text-sm text-[hsl(var(--muted-foreground))]">{event.location}</p>
                                            <p className="text-xs text-[hsl(var(--muted-foreground))]">{new Date(event.timestamp).toLocaleString()}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                    
                    {/* Map */}
                    <div>
                        <h2 className="text-xl font-bold mb-4">Live Location</h2>
                        <div className="aspect-video bg-[hsl(var(--muted))] rounded-lg overflow-hidden">
                            <TrackingMap progress={(currentStatusIndex / (orderStatuses.length - 1))} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTrackingPage;