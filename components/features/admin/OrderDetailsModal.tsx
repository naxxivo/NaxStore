
import React, { useState, useEffect } from 'react';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import { supabase } from '../../../integrations/supabase/client';
import { Database } from '../../../integrations/supabase/types';
import { OrderStatus, ShippingAddress } from '../../../types';
import { useToastStore } from '../../../lib/toastStore';

type OrderRow = Database['public']['Tables']['orders']['Row'];
type OrderItemRow = Database['public']['Tables']['order_items']['Row'] & { products: { title: string } | null };
const statuses: OrderStatus[] = ['processing', 'shipped', 'delivered', 'cancelled'];


interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderRow;
  onStatusUpdate: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ isOpen, onClose, order, onStatusUpdate }) => {
    const [items, setItems] = useState<OrderItemRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order.status);
    const shippingAddress = order.shipping_address_json as unknown as ShippingAddress;

    useEffect(() => {
        if (!isOpen) return;
        setLoading(true);
        const fetchItems = async () => {
            const { data, error } = await supabase
                .from('order_items')
                .select('*, products(title)')
                .eq('order_id', order.id);
            if(data) setItems(data as any[]); // Cast to any to avoid TS errors on joined tables
            if(error) console.error('Error fetching order items:', error);
            setLoading(false);
        };
        fetchItems();
        setCurrentStatus(order.status);
    }, [order, isOpen]);

    const handleStatusChange = async () => {
        const { error } = await supabase
            .from('orders')
            .update({ status: currentStatus })
            .eq('id', order.id);

        if (error) {
            useToastStore.getState().addToast({ message: `Error updating status: ${error.message}`, type: 'error' });
        } else {
            useToastStore.getState().addToast({ message: 'Order status updated!', type: 'success' });
            onStatusUpdate();
            onClose();
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Order Details: ${order.public_id.substring(0,8)}...`}>
          {loading ? (
            <p>Loading details...</p>
          ) : (
            <div className="space-y-4">
                <div>
                    <h3 className="font-semibold mb-2">Items</h3>
                    <div className="space-y-2 border border-[hsl(var(--border))] rounded-md p-2 max-h-48 overflow-y-auto">
                        {items.map(item => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span>{item.quantity} x {item.products?.title || 'Unknown Product'}</span>
                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold mb-1">Shipping Address</h3>
                    <div className="text-sm text-[hsl(var(--muted-foreground))]">
                        <p>{shippingAddress.fullName}</p>
                        <p>{shippingAddress.addressLine1}</p>
                        <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
                    </div>
                </div>
                 <div>
                    <label htmlFor="status" className="font-semibold mb-1 block">Order Status</label>
                    <select
                        id="status"
                        value={currentStatus}
                        onChange={(e) => setCurrentStatus(e.target.value as OrderStatus)}
                        className="w-full h-10 px-3 py-2 rounded-md bg-[hsl(var(--card))] border border-[hsl(var(--border))] focus:ring-2 focus:ring-[hsl(var(--ring))] focus:outline-none transition"
                    >
                        {statuses.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                    </select>
                </div>

                <Button onClick={handleStatusChange} className="w-full mt-4">Update Status</Button>
            </div>
          )}
        </Modal>
    );
};

export default OrderDetailsModal;
