import React from 'react';
import { useRouterStore } from '../../../lib/routerStore';
import Button from '../../ui/Button';
import { motion } from 'framer-motion';

const SuccessPage: React.FC = () => {
  const { setView } = useRouterStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-20 flex flex-col items-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: 360 }}
        transition={{ type: 'spring', stiffness: 200, damping: 10, delay: 0.2 }}
        className="h-24 w-24 bg-green-500 rounded-full flex items-center justify-center mb-8"
      >
        <svg className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </motion.div>
      <h1 className="text-4xl font-bold">Order Successful!</h1>
      <p className="mt-4 text-lg text-[hsl(var(--muted-foreground))] max-w-md">
        Thank you for your purchase. A confirmation email has been sent to you with your order details.
      </p>
      <Button size="lg" className="mt-8" onClick={() => setView('list')}>
        Continue Shopping
      </Button>
    </motion.div>
  );
};

export default SuccessPage;
