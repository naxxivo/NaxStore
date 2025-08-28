
import React, { useState, useEffect } from 'react';
import Modal from '../../ui/Modal';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import { Product } from '../../../types';
import { supabase } from '../../../integrations/supabase/client';
import { useToastStore } from '../../../lib/toastStore';
import { Database } from '../../../integrations/supabase/types';

type SellerProfile = Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'full_name'>;

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: () => void;
}

const ProductEditModal: React.FC<ProductEditModalProps> = ({ isOpen, onClose, product, onSave }) => {
  const [formData, setFormData] = useState({ title: '', description: '', base_price: '0', seller_id: '' });
  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!product;

  useEffect(() => {
    const fetchSellers = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('role', 'seller');
        if (data) setSellers(data);
        if(error) console.error('Failed to fetch sellers', error);
    };
    if (isOpen) {
        fetchSellers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (product) {
        setFormData({
            title: product.name,
            description: product.description,
            base_price: String(product.price),
            seller_id: product.sellerId,
        });
    } else {
        setFormData({ title: '', description: '', base_price: '0', seller_id: '' });
    }
  }, [product, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      title: formData.title,
      description: formData.description,
      base_price: parseFloat(formData.base_price),
      seller_id: formData.seller_id,
      category_id: 1, 
      images: [`https://picsum.photos/seed/${formData.title}/600/600`],
    };

    let error;
    if (isEditing) {
      const { error: updateError } = await supabase.from('products').update(payload).eq('id', product.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('products').insert(payload);
      error = insertError;
    }

    if (error) {
      useToastStore.getState().addToast({ message: `Error: ${error.message}`, type: 'error' });
    } else {
      useToastStore.getState().addToast({ message: `Product ${isEditing ? 'updated' : 'created'} successfully!`, type: 'success' });
      onSave();
      onClose();
    }
    setIsLoading(false);
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Product' : 'Add New Product'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label htmlFor="title" className="text-sm font-medium">Product Name</label>
            <Input id="title" name="title" value={formData.title} onChange={handleChange} required className="mt-1" />
        </div>
        <div>
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} className="mt-1 w-full p-2 rounded-md bg-[hsl(var(--card))] border border-[hsl(var(--border))]"/>
        </div>
        <div>
            <label htmlFor="base_price" className="text-sm font-medium">Price</label>
            <Input id="base_price" name="base_price" type="number" step="0.01" value={formData.base_price} onChange={handleChange} required className="mt-1"/>
        </div>
        <div>
            <label htmlFor="seller_id" className="text-sm font-medium">Seller</label>
            <select id="seller_id" name="seller_id" value={formData.seller_id} onChange={handleChange} required className="mt-1 w-full h-10 px-3 py-2 rounded-md bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
                <option value="" disabled>Select a seller</option>
                {sellers.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
            </select>
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Product'}
        </Button>
      </form>
    </Modal>
  );
};

export default ProductEditModal;
