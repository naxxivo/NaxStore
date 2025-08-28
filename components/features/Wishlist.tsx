
import React, { Fragment, useRef, useEffect, useMemo } from 'react';
import { useWishlistStore } from '../../lib/wishlistStore';
import { useCartStore } from '../../lib/store';
import { AnimatePresence, motion } from 'framer-motion';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { WishlistItem } from '../../types';
import { backdropAnimation, cartPanelAnimation } from '../../lib/animations';

const Wishlist: React.FC = () => {
  const { isOpen, toggleWishlist, items, toggleItem } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Simulate a price drop for one item to showcase "smart" features
  const itemWithPriceDrop = useMemo(() => {
    if (items.length > 0) {
      return items[items.length - 1].id;
    }
    return null;
  }, [items]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => closeButtonRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleMoveToCart = (item: WishlistItem) => {
    addToCart(item);
    toggleItem(item);
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
            onClick={toggleWishlist}
            aria-hidden="true"
          />
          <motion.div
            variants={cartPanelAnimation}
            initial="initial"
            animate="animate"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wishlist-title"
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-[hsl(var(--border))]">
              <h2 id="wishlist-title" className="text-2xl font-bold flex items-center">
                <Icon name="heart" className="h-6 w-6 mr-2" /> Your Wishlist
              </h2>
              <Button ref={closeButtonRef} variant="ghost" size="icon" onClick={toggleWishlist} aria-label="Close wishlist">
                <Icon name="close" className="h-6 w-6" />
              </Button>
            </div>

            {items.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
                <Icon name="heart" className="h-20 w-20 text-[hsl(var(--muted-foreground))] mb-4" />
                <h3 className="text-xl font-semibold">Your wishlist is empty</h3>
                <p className="text-[hsl(var(--muted-foreground))] mt-2">Save your favorite items here!</p>
              </div>
            ) : (
              <div className="flex-grow overflow-y-auto p-6 space-y-4">
                {items.map((item) => (
                  <WishlistItemRow 
                    key={item.id} 
                    item={item} 
                    onMoveToCart={() => handleMoveToCart(item)}
                    onRemove={() => toggleItem(item)}
                    hasPriceDrop={item.id === itemWithPriceDrop}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

interface WishlistItemRowProps {
  item: WishlistItem;
  onMoveToCart: () => void;
  onRemove: () => void;
  hasPriceDrop: boolean;
}

const WishlistItemRow: React.FC<WishlistItemRowProps> = ({ item, onMoveToCart, onRemove, hasPriceDrop }) => {
  return (
    <div className="flex items-center space-x-4 p-2 rounded-lg hover:bg-[hsl(var(--accent))] transition-colors">
      <img src={item.image} alt={item.name} className="h-20 w-20 rounded-md object-cover border border-[hsl(var(--border))]" />
      <div className="flex-grow">
        <p className="font-semibold">{item.name}</p>
        <div className="flex items-baseline space-x-2">
            <p className={`text-sm font-bold ${hasPriceDrop ? 'text-red-500 line-through' : 'text-[hsl(var(--primary))]'}`}>
                ${item.price.toFixed(2)}
            </p>
            {hasPriceDrop && (
                <p className="text-sm font-bold text-[hsl(var(--primary))]">${(item.price * 0.9).toFixed(2)}</p>
            )}
        </div>
        {hasPriceDrop && <p className="text-xs text-red-500 font-semibold">Price Drop!</p>}
      </div>
      <div className="flex flex-col space-y-2">
        <Button size="sm" onClick={onMoveToCart}>To Cart</Button>
        <Button size="sm" variant="ghost" onClick={onRemove} className="text-red-500/80 hover:text-red-500">
          Remove
        </Button>
      </div>
    </div>
  )
}

export default Wishlist;