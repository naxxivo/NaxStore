
import React, { useState, useEffect } from 'react';
import { useRouterStore } from '../../lib/routerStore';
import { useCartStore } from '../../lib/store';
import { useWishlistStore } from '../../lib/wishlistStore';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInItem, staggerContainer } from '../../lib/animations';
import { cn } from '../../lib/utils';
import { useProductStore } from '../../lib/productStore';
import { useAuthStore } from '../../lib/authStore';

const ProductDetail: React.FC = () => {
  const { productId, setView } = useRouterStore();
  const { products, getProductById, fetchProducts } = useProductStore();
  const { addItem } = useCartStore();
  const { items: wishlistItems, toggleItem: toggleWishlistItem } = useWishlistStore();
  const [mainImage, setMainImage] = useState('');
  
  // Fetch products if the store is empty (e.g., on a direct page load)
  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [products.length, fetchProducts]);

  const product = getProductById(productId as number);

  const isInWishlist = product ? wishlistItems.some(item => item.id === product.id) : false;
  const isOutOfStock = product ? product.stock === 0 : true;
  const isLowStock = product ? product.stock > 0 && product.stock < 10 : false;

  useEffect(() => {
    if (product) {
      setMainImage(product.image);
      document.title = `${product.name} - NaxStore`;
      
      const scriptId = 'product-json-ld';
      let script: HTMLScriptElement;
      const existingScript = document.getElementById(scriptId);
      
      if (existingScript instanceof HTMLScriptElement) {
          script = existingScript;
      } else {
          if (existingScript) {
              existingScript.remove();
          }
          script = document.createElement('script');
          script.id = scriptId;
          script.type = 'application/ld+json';
          document.head.appendChild(script);
      }
      script.textContent = JSON.stringify({
          '@context': 'https://schema.org/',
          '@type': 'Product',
          name: product.name,
          image: product.image,
          description: product.description,
          offers: {
              '@type': 'Offer',
              priceCurrency: 'USD',
              price: product.price,
              availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          },
          review: product.reviews.map(r => ({
              '@type': 'Review',
              reviewRating: {
                  '@type': 'Rating',
                  ratingValue: r.rating,
                  bestRating: '5',
              },
              author: {
                  '@type': 'Person',
                  name: r.author,
              },
          })),
      });

    }
    return () => {
        document.title = 'NaxStore - Modern Shopping Experience';
    };
  }, [product]);

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <Button onClick={() => setView('list')} className="mt-4">Back to Collection</Button>
      </div>
    );
  }

  const relatedProducts = products.filter(p => p.id !== product.id).slice(0, 4);

  return (
    <motion.section 
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-12"
    >
        <Button variant="secondary" onClick={() => setView('list')} className="mb-8">
            &larr; Back to Collection
        </Button>
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <motion.div variants={fadeInItem}>
                <AnimatePresence mode="wait">
                    <motion.img
                        key={mainImage}
                        src={mainImage}
                        alt={product.name}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-auto object-cover rounded-lg shadow-lg aspect-square"
                    />
                </AnimatePresence>
                <div className="grid grid-cols-4 gap-2 mt-4">
                    {product.images.map(img => (
                        <button key={img} onClick={() => setMainImage(img)}>
                            <img 
                                src={img} 
                                alt={`${product.name} thumbnail`}
                                className={`w-full h-auto object-cover rounded-md cursor-pointer aspect-square border-2 ${mainImage === img ? 'border-[hsl(var(--primary))]' : 'border-transparent'}`}
                            />
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Product Info */}
            <motion.div variants={fadeInItem} className="flex flex-col justify-center">
                <h1 className="text-4xl lg:text-5xl font-bold mt-1">{product.name}</h1>
                <p className="text-3xl font-bold text-[hsl(var(--primary))] mt-4">${product.price.toFixed(2)}</p>
                <div className="mt-4 text-sm font-medium">
                    {isOutOfStock ? (
                        <p className="text-red-500">Currently unavailable</p>
                    ) : isLowStock ? (
                        <p className="text-orange-500">Low stock! Only {product.stock} left.</p>
                    ) : (
                        <p className="text-green-500">In Stock</p>
                    )}
                </div>
                <p className="mt-6 text-lg text-[hsl(var(--muted-foreground))]">{product.description}</p>
                <div className="flex items-center space-x-4 mt-8">
                    <Button size="lg" className="w-full sm:w-auto" onClick={() => addItem(product)} disabled={isOutOfStock}>
                        {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        className="w-12 h-12 border border-[hsl(var(--border))]"
                        onClick={() => toggleWishlistItem(product)}
                        aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                        <Icon name="heart" className={cn("h-6 w-6 transition-colors", isInWishlist ? "fill-red-500 text-red-500" : "")}/>
                    </Button>
                </div>
            </motion.div>
        </div>

        {/* Reviews */}
        <motion.div variants={fadeInItem}>
            <h2 className="text-3xl font-bold mb-6 border-b border-[hsl(var(--border))] pb-4">Customer Reviews</h2>
            <ReviewForm productId={product.id} />
            <div className="space-y-6 mt-6">
                {product.reviews.length === 0 && <p className="text-[hsl(var(--muted-foreground))]">No reviews yet. Be the first!</p>}
                {product.reviews.map(review => (
                    <div key={review.id} className="bg-[hsl(var(--card))] p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <Icon key={i} name="sparkles" className={`h-5 w-5 ${i < review.rating ? 'text-yellow-400' : 'text-[hsl(var(--muted))]'}`} />
                                ))}
                            </div>
                            <p className="ml-4 font-bold">{review.author}</p>
                            <p className="ml-auto text-xs text-[hsl(var(--muted-foreground))]">{review.date}</p>
                        </div>
                        <p className="text-[hsl(var(--muted-foreground))]">{review.comment}</p>
                    </div>
                ))}
            </div>
        </motion.div>

        {/* Related Products */}
        <motion.div variants={fadeInItem}>
             <h2 className="text-3xl font-bold mb-6 border-b border-[hsl(var(--border))] pb-4">You Might Also Like</h2>
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {relatedProducts.map(related => (
                    <div key={related.id} onClick={() => { setView('detail', related.id); window.scrollTo(0,0); }} className="cursor-pointer group">
                        <img src={related.image} alt={related.name} className="w-full h-auto object-cover rounded-lg aspect-square group-hover:opacity-80 transition-opacity" />
                        <h3 className="font-semibold mt-2">{related.name}</h3>
                        <p className="text-sm font-bold text-[hsl(var(--primary))]">${related.price.toFixed(2)}</p>
                    </div>
                ))}
             </div>
        </motion.div>
    </motion.section>
  );
};

const ReviewForm: React.FC<{ productId: number }> = ({ productId }) => {
    const { isLoggedIn } = useAuthStore();
    const { addReview } = useProductStore();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isLoggedIn) {
        return <p className="text-[hsl(var(--muted-foreground))]">You must be logged in to leave a review.</p>;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) return;
        setIsSubmitting(true);
        const success = await addReview(productId, rating, comment);
        if (success) {
            setRating(0);
            setComment('');
        }
        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-[hsl(var(--card))] p-4 rounded-lg space-y-4">
            <h3 className="font-semibold">Write a review</h3>
            <div>
                <span className="text-sm font-medium">Your Rating:</span>
                <div className="flex items-center mt-1">
                    {[1, 2, 3, 4, 5].map(star => (
                        <button type="button" key={star} onClick={() => setRating(star)}>
                            <Icon name="sparkles" className={`h-6 w-6 cursor-pointer ${rating >= star ? 'text-yellow-400' : 'text-[hsl(var(--muted))]'}`} />
                        </button>
                    ))}
                </div>
            </div>
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full p-2 rounded-md bg-[hsl(var(--background))] border border-[hsl(var(--border))] focus:ring-2 focus:ring-[hsl(var(--ring))] focus:outline-none transition"
                rows={3}
            />
            <Button type="submit" disabled={isSubmitting || rating === 0}>
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
        </form>
    );
};


export default ProductDetail;
