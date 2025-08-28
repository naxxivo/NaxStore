
import React, { useState } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { useToastStore } from '../../lib/toastStore';
import Input from '../ui/Input';
import Button from '../ui/Button';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToastStore();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.rpc('subscribe_to_newsletter', { p_email: email });

    if (error) {
      console.error('Newsletter subscription error:', error);
      addToast({ message: 'Something went wrong. Please try again.', type: 'error' });
    } else {
      addToast({ message: 'Thanks for subscribing!', type: 'success' });
      setEmail('');
    }
    setLoading(false);
  };

  return (
    <footer className="border-t border-[hsl(var(--border))]">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <h3 className="font-bold text-lg">NaxStore</h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">
              The finest products in the universe, delivered to your doorstep.
            </p>
          </div>
          <div className="md:col-span-2">
            <h3 className="font-semibold">Stay in the Loop</h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2 mb-4">
              Subscribe to our newsletter for the latest updates and exclusive deals.
            </p>
            <form onSubmit={handleSubscribe} className="flex space-x-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="max-w-xs"
                disabled={loading}
              />
              <Button type="submit" disabled={loading}>
                {loading ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
          </div>
        </div>
        <div className="mt-12 border-t border-[hsl(var(--border))] pt-6">
            <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
              © {new Date().getFullYear()} NaxStore. All Rights Reserved.
            </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
