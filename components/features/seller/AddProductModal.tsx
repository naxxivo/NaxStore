
import React, { useState } from 'react';
import { useProductStore } from '../../../lib/productStore';
import Modal from '../../ui/Modal';
import Input from '../../ui/Input';
import Button from '../../ui/Button';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose }) => {
  const { addProduct } = useProductStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '1', // Default to 'Apparel' category
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const productData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
        categoryId: parseInt(formData.categoryId, 10),
        images: [`https://picsum.photos/seed/${formData.title}/600/600`], // Placeholder image
    };

    const newProduct = await addProduct(productData);
    
    if (newProduct) {
        onClose();
        // Reset form for next time
        setFormData({ title: '', description: '', price: '', stock: '', categoryId: '1' });
    }
    
    setIsLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Product">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="text-sm font-medium">Product Name</label>
          <Input id="title" name="title" type="text" value={formData.title} onChange={handleChange} required className="mt-1" />
        </div>
        
        <div>
          <label htmlFor="description" className="text-sm font-medium">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="mt-1 w-full p-2 rounded-md bg-[hsl(var(--card))] border border-[hsl(var(--border))] focus:ring-2 focus:ring-[hsl(var(--ring))] focus:outline-none transition"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="price" className="text-sm font-medium">Price</label>
                <Input id="price" name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} required className="mt-1" />
            </div>
            <div>
                <label htmlFor="stock" className="text-sm font-medium">Stock Quantity</label>
                <Input id="stock" name="stock" type="number" value={formData.stock} onChange={handleChange} required className="mt-1" />
            </div>
        </div>
        
        <div>
            <label htmlFor="categoryId" className="text-sm font-medium">Category</label>
            <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="mt-1 w-full h-10 px-3 py-2 rounded-md bg-[hsl(var(--card))] border border-[hsl(var(--border))] focus:ring-2 focus:ring-[hsl(var(--ring))] focus:outline-none transition"
            >
                <option value="1">Apparel</option>
                <option value="2">Accessories</option>
                <option value="3">Home & Decor</option>
            </select>
        </div>


        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Adding Product...' : 'Add Product'}
        </Button>
      </form>
    </Modal>
  );
};

export default AddProductModal;
