
import React, { useEffect, useState } from 'react';
import Button from '../../ui/Button';
import { useProductStore } from '../../../lib/productStore';
import { Product } from '../../../types';
import { supabase } from '../../../integrations/supabase/client';
import { useToastStore } from '../../../lib/toastStore';
import ProductEditModal from './ProductEditModal';

const ProductsTab: React.FC = () => {
    const { products, fetchProducts } = useProductStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);
    
    const handleAddNew = () => {
        setSelectedProduct(null);
        setIsModalOpen(true);
    };

    const handleEdit = (product: Product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleDelete = async (productId: number) => {
        if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            // First, delete related order_items because of foreign key constraint
            const { error: orderItemError } = await supabase.from('order_items').delete().eq('product_id', productId);
            if(orderItemError) {
                 useToastStore.getState().addToast({ message: `Could not delete related orders: ${orderItemError.message}`, type: 'error' });
                 return;
            }

            const { error } = await supabase.from('products').delete().eq('id', productId);
            if (error) {
                useToastStore.getState().addToast({ message: `Error deleting product: ${error.message}`, type: 'error' });
            } else {
                useToastStore.getState().addToast({ message: 'Product deleted successfully', type: 'success' });
                fetchProducts(); // Refresh list
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Manage Products</h2>
                <Button onClick={handleAddNew}>Add New Product</Button>
            </div>
            <div className="overflow-x-auto bg-[hsl(var(--background))] rounded-lg shadow">
                <table className="w-full text-sm text-left">
                    <thead className="border-b border-[hsl(var(--border))]">
                        <tr>
                            <th scope="col" className="px-6 py-3 font-medium">Product Name</th>
                            <th scope="col" className="px-6 py-3 font-medium">Price</th>
                            <th scope="col" className="px-6 py-3 font-medium">ID</th>
                            <th scope="col" className="px-6 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.id} className="border-b border-[hsl(var(--border))] last:border-b-0 hover:bg-[hsl(var(--accent))]">
                                <td className="px-6 py-4 font-medium flex items-center space-x-3">
                                    <img src={product.image} alt={product.name} className="h-10 w-10 rounded-md object-cover"/>
                                    <span>{product.name}</span>
                                </td>
                                <td className="px-6 py-4">${product.price.toFixed(2)}</td>
                                <td className="px-6 py-4 text-[hsl(var(--muted-foreground))]">{product.id}</td>
                                <td className="px-6 py-4 text-right">
                                    <Button variant="ghost" size="sm" className="mr-2" onClick={() => handleEdit(product)}>Edit</Button>
                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(product.id)}>Delete</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             <ProductEditModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={selectedProduct}
                onSave={fetchProducts}
            />
        </div>
    );
};

export default ProductsTab;
