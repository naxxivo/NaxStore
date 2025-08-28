
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../lib/authStore';
import Button from '../../ui/Button';
import { useProductStore } from '../../../lib/productStore';
import AddProductModal from './AddProductModal';

const SellerProductsTab: React.FC = () => {
    const { user } = useAuthStore();
    const { products, fetchProducts } = useProductStore();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const sellerProducts = products.filter(p => p.sellerId === user?.id);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">My Products</h2>
                <Button onClick={() => setIsAddModalOpen(true)}>Add New Product</Button>
            </div>
            <div className="overflow-x-auto bg-[hsl(var(--background))] rounded-lg shadow">
                <table className="w-full text-sm text-left">
                    <thead className="border-b border-[hsl(var(--border))]">
                        <tr>
                            <th scope="col" className="px-6 py-3 font-medium">Product Name</th>
                            <th scope="col" className="px-6 py-3 font-medium">Price</th>
                            <th scope="col" className="px-6 py-3 font-medium">Stock</th>
                            <th scope="col" className="px-6 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sellerProducts.map((product) => (
                            <tr key={product.id} className="border-b border-[hsl(var(--border))] last:border-b-0 hover:bg-[hsl(var(--accent))]">
                                <td className="px-6 py-4 font-medium flex items-center space-x-3">
                                    <img src={product.image} alt={product.name} className="h-10 w-10 rounded-md object-cover"/>
                                    <span>{product.name}</span>
                                </td>
                                <td className="px-6 py-4">${product.price.toFixed(2)}</td>
                                <td className="px-6 py-4">{product.stock}</td>
                                <td className="px-6 py-4 text-right">
                                    <Button variant="ghost" size="sm" className="mr-2">Edit</Button>
                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">Delete</Button>
                                </td>
                            </tr>
                        ))}
                         {sellerProducts.length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-center py-8 text-[hsl(var(--muted-foreground))]">
                                    You haven't added any products yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <AddProductModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
        </div>
    );
};

export default SellerProductsTab;
