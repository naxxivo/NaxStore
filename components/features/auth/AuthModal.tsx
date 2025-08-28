import React, { useState } from 'react';
import { useModalStore } from '../../../lib/modalStore';
import { useAuthStore } from '../../../lib/authStore';
import Modal from '../../ui/Modal';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import { AuthError } from '@supabase/supabase-js';

const AuthModal: React.FC = () => {
  const { modal, closeModal, openModal } = useModalStore();
  const { login, signup } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLogin = modal === 'login';
  const title = isLogin ? 'Login to NaxStore' : 'Create an Account';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    let result: { error: AuthError | null };
    if (isLogin) {
      result = await login(email, password);
    } else {
      result = await signup(name, email, password);
    }
    
    if (result.error) {
        setError(result.error.message);
    } else {
        closeModal();
    }
    
    setIsLoading(false);
  };

  return (
    <Modal isOpen={!!modal} onClose={closeModal} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500 text-sm">{error}</p>}
        
        {!isLogin && (
          <div>
            <label htmlFor="name" className="text-sm font-medium">Name</label>
            <Input id="name" name="name" type="text" required className="mt-1" />
          </div>
        )}
        
        <div>
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <Input id="email" name="email" type="email" placeholder="test@nax.com" required className="mt-1" />
        </div>
        
        <div>
          <label htmlFor="password"className="text-sm font-medium">Password</label>
          <Input id="password" name="password" type="password" placeholder="password" required className="mt-1" />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
        </Button>
      </form>
      <div className="mt-4 text-center text-sm">
        {isLogin ? (
          <p>
            Don't have an account?{' '}
            <button onClick={() => openModal('signup')} className="font-medium text-[hsl(var(--primary))] hover:underline">
              Sign Up
            </button>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <button onClick={() => openModal('login')} className="font-medium text-[hsl(var(--primary))] hover:underline">
              Login
            </button>
          </p>
        )}
      </div>
    </Modal>
  );
};

export default AuthModal;
