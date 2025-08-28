
import React, { useEffect } from 'react';
import ProductCard from './ProductCard';
import { motion } from 'framer-motion';
import { staggerContainer } from '../../lib/animations';
import { useProductStore } from '../../lib/productStore';
import PromotionalBanner from './PromotionalBanner';

const ProductList: React.FC = () => {
  const { products, loading, error, fetchProducts } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <section>
      <div className="text-center mb-12">
        <PromotionalBanner />
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Our Collection</h1>
        <p className="mt-4 text-lg text-[hsl(var(--muted-foreground))]">Discover the finest products in the universe.</p>
      </div>
      {loading && (
        <div className="text-center py-10">
            <p>Loading products from across the galaxy...</p>
        </div>
      )}
      {error && (
        <div className="text-center py-10 text-red-500">
            <p>{error}</p>
        </div>
      )}
      {!loading && !error && (
        <motion.div
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>
      )}
    </section>
  );
};

export default ProductList;
