
import React, { useState, useEffect } from 'react';
import { useCheckoutStore } from '../../../lib/checkoutStore';
import { useCartStore, useCartTotals } from '../../../lib/store';
import { useRouterStore } from '../../../lib/routerStore';
import { useAuthStore } from '../../../lib/authStore';
import { useRewardsStore } from '../../../lib/rewardsStore';
import { supabase } from '../../../integrations/supabase/client';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { useToastStore } from '../../../lib/toastStore';
import { ShippingAddress } from '../../../types';
import { Json } from '../../../integrations/supabase/types';
import { useNotificationStore } from '../../../lib/notificationStore';
import { trackEvent } from '../../../lib/analytics';

const steps = ['Shipping', 'Payment', 'Confirmation'];

const CheckoutPage = () => {
    const { step } = useCheckoutStore();
    const { isLoggedIn } = useAuthStore();
    const { setView } = useRouterStore();

    useEffect(() => {
        if (!isLoggedIn) {
            setView('list'); 
        }
    }, [isLoggedIn, setView]);
    
    if (!isLoggedIn) return null;

    return (
        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
            <div className="mb-12 lg:mb-0">
                <h1 className="text-4xl font-bold mb-8">Checkout</h1>
                <CheckoutProgress />
                <div className="mt-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                        >
                            {step === 1 && <ShippingForm />}
                            {step === 2 && <PaymentForm />}
                            {step === 3 && <Confirmation />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
            <OrderSummary />
        </div>
    );
};

const CheckoutProgress = () => {
    const { step } = useCheckoutStore();
    return (
        <div className="flex items-center space-x-4">
            {steps.map((s, index) => (
                <React.Fragment key={s}>
                    <div className="flex items-center space-x-2">
                        <div className={cn("h-8 w-8 rounded-full flex items-center justify-center font-bold",
                            step > index + 1 ? "bg-green-500 text-white" : "",
                            step === index + 1 ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]" : "",
                            step < index + 1 ? "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]" : ""
                        )}>
                            {step > index + 1 ? '✓' : index + 1}
                        </div>
                        <span className={cn("font-medium", step >= index + 1 ? "text-[hsl(var(--foreground))]" : "text-[hsl(var(--muted-foreground))]")}>{s}</span>
                    </div>
                    {index < steps.length - 1 && <div className="flex-grow h-0.5 bg-[hsl(var(--border))]"></div>}
                </React.Fragment>
            ))}
        </div>
    );
};

const ShippingForm = () => {
    const { shippingAddress, setShippingAddress, nextStep } = useCheckoutStore();
    const { addresses } = useAuthStore();
    const [formData, setFormData] = useState(shippingAddress);
    const [useNewAddress, setUseNewAddress] = useState(true);

    useEffect(() => {
        const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];
        if (defaultAddress) {
            setFormData({ ...defaultAddress, country: 'USA' });
            setUseNewAddress(false);
        }
    }, [addresses]);

    const handleSelectAddress = (address: ShippingAddress) => {
        setFormData({ ...address, country: 'USA' });
        setUseNewAddress(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShippingAddress(formData);
        nextStep();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {addresses.length > 0 && (
                <div className="space-y-2">
                    <h3 className="font-medium">Select a saved address:</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {addresses.map(addr => (
                            <button
                                type="button"
                                key={addr.id}
                                onClick={() => handleSelectAddress(addr)}
                                className={cn("border p-2 rounded-md text-left text-sm",
                                    !useNewAddress && formData.id === addr.id ? "border-[hsl(var(--primary))] ring-2 ring-[hsl(var(--primary))]" : "border-[hsl(var(--border))]"
                                )}
                            >
                                <p className="font-semibold">{addr.fullName}</p>
                                <p>{addr.addressLine1}</p>
                            </button>
                        ))}
                    </div>
                     <button type="button" onClick={() => setUseNewAddress(true)} className={cn("w-full border p-2 rounded-md text-center text-sm mt-2", useNewAddress ? "border-[hsl(var(--primary))] ring-2 ring-[hsl(var(--primary))]" : "border-[hsl(var(--border))]")}>
                        + Add New Address
                    </button>
                </div>
            )}

            {(useNewAddress || addresses.length === 0) && (
                <>
                    <div><label htmlFor="fullName">Full Name</label><Input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} required /></div>
                    <div><label htmlFor="addressLine1">Address</label><Input type="text" name="addressLine1" id="addressLine1" value={formData.addressLine1} onChange={handleChange} required /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label htmlFor="city">City</label><Input type="text" name="city" id="city" value={formData.city} onChange={handleChange} required /></div>
                        <div><label htmlFor="state">State</label><Input type="text" name="state" id="state" value={formData.state} onChange={handleChange} required /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label htmlFor="zipCode">ZIP Code</label><Input type="text" name="zipCode" id="zipCode" value={formData.zipCode} onChange={handleChange} required /></div>
                        <div><label htmlFor="country">Country</label><Input type="text" name="country" id="country" value={formData.country} onChange={handleChange} required disabled /></div>
                    </div>
                </>
            )}

            <Button type="submit" size="lg" className="w-full mt-4">Continue to Payment</Button>
        </form>
    );
};

const PaymentForm = () => {
    const { paymentDetails, setPaymentDetails, nextStep, prevStep } = useCheckoutStore();
    const [formData, setFormData] = useState(paymentDetails);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPaymentDetails(formData);
        nextStep();
    };

    return (
         <form onSubmit={handleSubmit} className="space-y-4">
             <div><label htmlFor="cardholderName">Cardholder Name</label><Input type="text" name="cardholderName" id="cardholderName" value={formData.cardholderName} onChange={handleChange} required /></div>
             <div><label htmlFor="cardNumber">Card Number</label><Input type="text" name="cardNumber" id="cardNumber" placeholder="XXXX XXXX XXXX XXXX" value={formData.cardNumber} onChange={handleChange} required /></div>
            <div className="grid grid-cols-2 gap-4">
                 <div><label htmlFor="expiryDate">Expiry Date</label><Input type="text" name="expiryDate" id="expiryDate" placeholder="MM/YY" value={formData.expiryDate} onChange={handleChange} required /></div>
                 <div><label htmlFor="cvv">CVV</label><Input type="text" name="cvv" id="cvv" placeholder="123" value={formData.cvv} onChange={handleChange} required /></div>
            </div>
            <div className="flex space-x-4 mt-4">
                <Button type="button" variant="secondary" size="lg" className="w-full" onClick={prevStep}>Back to Shipping</Button>
                <Button type="submit" size="lg" className="w-full">Review Order</Button>
            </div>
        </form>
    )
}

const Confirmation = () => {
    const { clearCartAndPersistedState } = useCartStore();
    const { reset: resetCheckout, shippingAddress } = useCheckoutStore();
    const { setView } = useRouterStore();
    const { total, discount } = useCartTotals();
    const { activeCoupon } = useRewardsStore();
    const { addPoints, fetchOrders } = useAuthStore();
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    const handlePlaceOrder = async () => {
        setIsPlacingOrder(true);
        const { addToast } = useToastStore.getState();
        const { addNotification } = useNotificationStore.getState();

        const { data: newOrderId, error } = await supabase.rpc('create_order_from_cart', {
            shipping_address_payload: shippingAddress as unknown as Json,
            coupon_discount: discount,
            coupon_code: activeCoupon?.code || null,
        });

        if (error) {
            console.error("Error creating order:", error);
            addToast({ message: 'There was an error placing your order. Please try again.', type: 'error' });
            setIsPlacingOrder(false);
            return;
        }

        trackEvent('purchase', { orderId: newOrderId, total: total });
        addNotification({
            message: `Order #${newOrderId} placed successfully! We'll keep you updated on its status.`,
            type: 'order'
        });
        addToast({ message: 'Order placed successfully!', type: 'success' });
        addPoints(Math.floor(total));
        await fetchOrders();
        
        // The RPC creates a new cart, so we just need to clear the local state
        clearCartAndPersistedState(); 
        
        resetCheckout();
        setView('success');
        setIsPlacingOrder(false);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Review Your Order</h2>
            <div className="bg-[hsl(var(--accent))] p-4 rounded-lg mb-6 text-sm">
                <h3 className="font-semibold mb-2">Shipping To:</h3>
                <p>{shippingAddress.fullName}</p>
                <p>{shippingAddress.addressLine1}</p>
                <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
            </div>
            <p className="text-[hsl(var(--muted-foreground))] mb-6">Please check your details below and confirm your order.</p>
            <Button size="lg" className="w-full" onClick={handlePlaceOrder} disabled={isPlacingOrder}>
                {isPlacingOrder ? 'Placing Order...' : `Place Order & Pay $${total.toFixed(2)}`}
            </Button>
        </div>
    )
}

const OrderSummary = () => {
    const { items, subtotal, shipping, tax, discount, total } = useCartTotals();
    
    return (
        <div className="bg-[hsl(var(--card))] p-6 rounded-lg h-fit sticky top-24">
            <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-4">
                {items.map(item => (
                    <div key={item.id} className="flex items-center space-x-4">
                        <img src={item.image} alt={item.name} className="h-16 w-16 rounded-md object-cover" />
                        <div className="flex-grow">
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                ))}
            </div>
            <div className="mt-6 pt-6 border-t border-[hsl(var(--border))] space-y-2 text-sm">
                 <div className="flex justify-between">
                    <span className="text-[hsl(var(--muted-foreground))]">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                </div>
                 {discount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Discount</span>
                      <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                    <span className="text-[hsl(var(--muted-foreground))]">Shipping</span>
                    <span>{shipping > 0 ? `$${shipping.toFixed(2)}` : 'Free'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-[hsl(var(--muted-foreground))]">Taxes (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[hsl(var(--border))] flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
            </div>
        </div>
    )
}

export default CheckoutPage;