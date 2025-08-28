import React, { Fragment, useRef, useEffect } from 'react';
import { useShopperStore } from '../../lib/shopperStore';
import { useCartStore } from '../../lib/store';
import { AnimatePresence, motion } from 'framer-motion';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { Product } from '../../types';
import { backdropAnimation, shopperPanelAnimation } from '../../lib/animations';

const PersonalShopper: React.FC = () => {
  const { isOpen, toggleShopper, query, setQuery, findSuggestions, isLoading, suggestions, error } = useShopperStore();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => closeButtonRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    findSuggestions();
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
            onClick={toggleShopper}
            aria-hidden="true"
          />
          <motion.div
            variants={shopperPanelAnimation}
            initial="initial"
            animate="animate"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-labelledby="shopper-title"
            className="fixed top-0 left-0 h-full w-full max-w-md bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-[hsl(var(--border))]">
              <h2 id="shopper-title" className="text-2xl font-bold flex items-center">
                <Icon name="sparkles" className="h-7 w-7 mr-2 text-[hsl(var(--primary))]" />
                Personal Shopper
              </h2>
              <Button ref={closeButtonRef} variant="ghost" size="icon" onClick={toggleShopper} aria-label="Close personal shopper">
                <Icon name="close" className="h-6 w-6" />
              </Button>
            </div>

            <div className="flex-grow overflow-y-auto p-6">
              {isLoading ? (
                <LoadingState />
              ) : error ? (
                <ErrorState message={error} />
              ) : suggestions.length > 0 ? (
                <SuggestionsDisplay suggestions={suggestions} />
              ) : (
                <InitialState />
              )}
            </div>

            <div className="p-6 border-t border-[hsl(var(--border))] bg-[hsl(var(--background))]">
              <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., 'I need a cool gift for a space enthusiast'"
                  className="w-full p-3 rounded-md bg-[hsl(var(--card))] border border-[hsl(var(--border))] focus:ring-2 focus:ring-[hsl(var(--ring))] focus:outline-none transition"
                  rows={3}
                  disabled={isLoading}
                />
                <Button type="submit" size="lg" className="w-full" disabled={isLoading || !query.trim()}>
                  {isLoading ? 'Thinking...' : 'Find My Style'}
                </Button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const InitialState = () => (
  <div className="text-center h-full flex flex-col justify-center items-center">
    <Icon name="sparkles" className="h-20 w-20 text-[hsl(var(--muted-foreground))] mb-4 opacity-50" />
    <h3 className="text-xl font-semibold">How can I help you today?</h3>
    <p className="text-[hsl(var(--muted-foreground))] mt-2 max-w-sm">
      Describe what you're looking for, and I'll find the perfect items from our collection.
    </p>
  </div>
);

const LoadingState = () => (
  <div className="space-y-4 animate-pulse">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex items-center space-x-4">
        <div className="h-20 w-20 rounded-md bg-[hsl(var(--muted))]"></div>
        <div className="flex-grow space-y-2">
          <div className="h-4 w-3/4 rounded bg-[hsl(var(--muted))]"></div>
          <div className="h-4 w-1/4 rounded bg-[hsl(var(--muted))]"></div>
        </div>
      </div>
    ))}
  </div>
);

const ErrorState: React.FC<{ message: string }> = ({ message }) => (
  <div className="text-center h-full flex flex-col justify-center items-center text-red-500">
    <h3 className="text-xl font-semibold">Oops!</h3>
    <p className="mt-2">{message}</p>
  </div>
);

const SuggestionsDisplay: React.FC<{ suggestions: Product[] }> = ({ suggestions }) => (
  <div className="space-y-4">
    <h3 className="font-semibold text-lg">Here's what I found for you:</h3>
    {suggestions.map(item => (
      <SuggestionCard key={item.id} item={item} />
    ))}
  </div>
);

const SuggestionCard: React.FC<{ item: Product }> = ({ item }) => {
  const { addItem } = useCartStore();
  return (
    <div className="flex items-center space-x-4 p-2 rounded-lg hover:bg-[hsl(var(--accent))] transition-colors">
      <img src={item.image} alt={item.name} className="h-20 w-20 rounded-md object-cover border border-[hsl(var(--border))]" />
      <div className="flex-grow">
        <p className="font-semibold">{item.name}</p>
        <p className="text-sm text-[hsl(var(--primary))] font-bold">${item.price.toFixed(2)}</p>
      </div>
      <Button size="sm" onClick={() => addItem(item)}>Add</Button>
    </div>
  );
};

export default PersonalShopper;