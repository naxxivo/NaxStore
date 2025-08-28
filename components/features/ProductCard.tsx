
import React from 'react';
import { Product } from '../../types';
import { useCartStore } from '../../lib/store';
import { useWishlistStore } from '../../lib/wishlistStore';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { motion } from 'framer-motion';
import { fadeInItem } from '../../lib/animations';
import { useRouterStore } from '../../lib/routerStore';
import { cn } from '../../lib/utils';
import { trackEvent } from '../../lib/analytics';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCartStore();
  const { setView } = useRouterStore();
  const { items: wishlistItems, toggleItem: toggleWishlistItem } = useWishlistStore();

  const isInWishlist = wishlistItems.some(item => item.id === product.id);
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click from firing
    if (isOutOfStock) return;
    addItem(product);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlistItem(product);
  }

  const handleCardClick = () => {
    trackEvent('product_click', { productId: product.id, productName: product.name });
    setView('detail', product.id);
    window.scrollTo(0, 0);
  }

  return (
    <motion.div
      variants={fadeInItem}
      className="bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] rounded-xl overflow-hidden shadow-lg flex flex-col transition-transform duration-300 hover:scale-105 group"
    >
      <div className="relative overflow-hidden cursor-pointer" onClick={handleCardClick}>
        <img className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500" src={product.image} alt={product.name} />
        {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-bold text-lg bg-red-500 px-3 py-1 rounded">Out of Stock</span>
            </div>
        )}
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 bg-black/30 hover:bg-black/50 rounded-full h-10 w-10 text-white"
          onClick={handleWishlistClick}
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Icon name="heart" className={cn("h-6 w-6 transition-colors", isInWishlist ? "fill-red-500 text-red-500" : "text-white")}/>
        </Button>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-semibold mb-2 cursor-pointer" onClick={handleCardClick}>{product.name}</h3>
        <p className="text-[hsl(var(--muted-foreground))] text-sm mb-4 flex-grow cursor-pointer" onClick={handleCardClick}>{product.description.substring(0, 100)}...</p>
        <div className="flex justify-between items-center mt-auto">
          <p className="text-2xl font-bold text-[hsl(var(--primary))]">${product.price}</p>
          <Button onClick={handleAddToCart} size="sm" disabled={isOutOfStock}>
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;