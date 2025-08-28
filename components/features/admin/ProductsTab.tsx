
import React, { useEffect } from 'react';
import Button from '../../ui/Button';
import { useProductStore } from '../../../lib/productStore';

const ProductsTab: React.FC = () => {
    const { products, fetchProducts } = useProductStore();

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Manage Products</h2>
                <Button>Add New Product</Button>
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
                                    <Button variant="ghost" size="sm" className="mr-2">Edit</Button>
                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">Delete</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductsTab;