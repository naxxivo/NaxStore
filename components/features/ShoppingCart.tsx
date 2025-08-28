
import React, { Fragment, useRef, useEffect, useCallback, useState } from 'react';
import { useCartStore, useCartTotals } from '../../lib/store';
import { AnimatePresence, motion } from 'framer-motion';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import Input from '../ui/Input';
import { CartItem } from '../../types';
import { backdropAnimation, cartPanelAnimation } from '../../lib/animations';
import { debounce } from '../../lib/utils';
import { useAuthStore } from '../../lib/authStore';
import { useModalStore } from '../../lib/modalStore';
import { useRouterStore } from '../../lib/routerStore';
import { useRewardsStore } from '../../lib/rewardsStore';

const ShoppingCart: React.FC = () => {
  const { isOpen, toggleCart, clearCart } = useCartStore();
  const { items, subtotal, shipping, tax, discount, total } = useCartTotals();
  const { isLoggedIn } = useAuthStore();
  const { openModal } = useModalStore();
  const { setView } = useRouterStore();
  const { activeCoupon, error: couponError, applyCoupon, removeCoupon } = useRewardsStore();
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => closeButtonRef.current?.focus(), 100);
    }
  }, [isOpen]);
  
  const handleCheckout = () => {
    if (isLoggedIn) {
        setView('checkout');
    } else {
        openModal('login');
    }
    toggleCart();
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode) {
      setIsApplyingCoupon(true);
      await applyCoupon(couponCode);
      setIsApplyingCoupon(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={backdropAnimation}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 bg-black/50 z-40"
            onClick={toggleCart}
            aria-hidden="true"
          />
          <motion.div
            variants={cartPanelAnimation}
            initial="initial"
            animate="animate"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-[hsl(var(--border))]">
              <h2 id="cart-title" className="text-2xl font-bold">Your Cart</h2>
              <Button ref={closeButtonRef} variant="ghost" size="icon" onClick={toggleCart} aria-label="Close cart">
                <Icon name="close" className="h-6 w-6" />
              </Button>
            </div>

            {items.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
                <Icon name="cart" className="h-20 w-20 text-[hsl(var(--muted-foreground))] mb-4" />
                <h3 className="text-xl font-semibold">Your cart is empty</h3>
                <p className="text-[hsl(var(--muted-foreground))] mt-2">Looks like you haven't added anything yet.</p>
              </div>
            ) : (
              <Fragment>
                <div className="flex-grow overflow-y-auto p-6 space-y-4">
                  {items.map((item) => (
                    <CartItemRow key={item.id} item={item} />
                  ))}
                </div>

                <div className="p-6 border-t border-[hsl(var(--border))] space-y-4 bg-[hsl(var(--card))]">
                  {!activeCoupon ? (
                    <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                      <Input
                        type="text"
                        placeholder="Coupon Code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="flex-grow"
                        disabled={isApplyingCoupon}
                      />
                      <Button type="submit" variant="secondary" disabled={isApplyingCoupon}>
                        {isApplyingCoupon ? '...' : 'Apply'}
                      </Button>
                    </form>
                  ) : null }
                  {couponError && <p className="text-red-500 text-sm">{couponError}</p>}
                  
                   <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-[hsl(var(--muted-foreground))]">Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        {activeCoupon && (
                          <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                              <span>
                                Discount ({activeCoupon.code})
                                <button onClick={removeCoupon} className="ml-2 text-red-500 hover:underline text-xs">(Remove)</button>
                              </span>
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
                   <div className="flex justify-between font-bold text-lg border-t border-[hsl(var(--border))] pt-4">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                   </div>
                   <Button size="lg" className="w-full" onClick={handleCheckout}>
                     Proceed to Checkout
                   </Button>
                   <Button variant="secondary" size="lg" className="w-full" onClick={clearCart}>
                     Clear Cart
                   </Button>
                </div>
              </Fragment>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const CartItemRow: React.FC<{ item: CartItem }> = ({ item }) => {
  const { updateQuantity, removeItem } = useCartStore();
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdateQuantity = useCallback(
    debounce((quantity: number) => {
      updateQuantity(item.id, quantity);
    }, 300),
    [item.id, updateQuantity]
  );
  
  const handleQuantityChange = (newQuantity: number) => {
      if (newQuantity > 0) {
          debouncedUpdateQuantity(newQuantity);
      } else {
          removeItem(item.id);
      }
  };

  return (
    <div className="flex items-center space-x-4">
      <img src={item.image} alt={item.name} className="h-20 w-20 rounded-md object-cover border border-[hsl(var(--border))]" />
      <div className="flex-grow">
        <p className="font-semibold">{item.name}</p>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">${item.price.toFixed(2)}</p>
        <div className="flex items-center mt-2">
          <button onClick={() => handleQuantityChange(item.quantity - 1)} className="px-2 py-0.5 border border-[hsl(var(--border))] rounded-l-md hover:bg-[hsl(var(--accent))]">-</button>
          <span className="px-3 py-0.5 border-t border-b border-[hsl(var(--border))]">{item.quantity}</span>
          <button onClick={() => handleQuantityChange(item.quantity + 1)} className="px-2 py-0.5 border border-[hsl(var(--border))] rounded-r-md hover:bg-[hsl(var(--accent))]">+</button>
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`}>
        <Icon name="trash" className="h-5 w-5 text-red-500/80 hover:text-red-500" />
      </Button>
    </div>
  )
}

export default ShoppingCart;