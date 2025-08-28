
import React, { useEffect } from 'react';
import { useMarketingStore } from '../../lib/marketingStore';
import { motion } from 'framer-motion';

const PromotionalBanner: React.FC = () => {
  const { activeBanner, loading, fetchActiveBanner } = useMarketingStore();

  useEffect(() => {
    fetchActiveBanner();
  }, [fetchActiveBanner]);

  if (loading) {
    return (
      <div className="mb-8 p-4 rounded-lg bg-[hsl(var(--muted))] animate-pulse">
        <div className="h-6 w-3/4 mx-auto rounded bg-[hsl(var(--muted-foreground)/0.2)]"></div>
      </div>
    );
  }

  if (!activeBanner) {
    return null; // Don't render anything if there's no active banner
  }
  
  const content = (
    <p className="font-semibold">
      {activeBanner.subtitle && <span className="mr-2 opacity-80">{activeBanner.subtitle}</span>}
      <span className="font-bold text-[hsl(var(--primary))]">{activeBanner.title}</span>
    </p>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mb-8 bg-[hsl(var(--primary)/0.2)] text-[hsl(var(--primary-foreground))] p-4 rounded-lg text-center"
    >
      {activeBanner.linkUrl ? (
        <a href={activeBanner.linkUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
          {content}
        </a>
      ) : (
        content
      )}
    </motion.div>
  );
};

export default PromotionalBanner;
