
import React, { useEffect } from 'react';
import { useSellerStore } from '../../../lib/sellerStore';

const SellerCommissionsTab: React.FC = () => {
    const { commissions, loading, error, fetchCommissions } = useSellerStore();

    useEffect(() => {
        fetchCommissions();
    }, [fetchCommissions]);

    if (loading) return <div>Loading commissions...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    const totalEarned = commissions.reduce((acc, c) => acc + c.amount, 0);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Commissions Earned</h2>
                <div className="text-right">
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Total Net Earnings</p>
                    <p className="text-2xl font-bold text-green-500">${totalEarned.toFixed(2)}</p>
                </div>
            </div>
            <div className="overflow-x-auto bg-[hsl(var(--background))] rounded-lg shadow">
                <table className="w-full text-sm text-left">
                    <thead className="border-b border-[hsl(var(--border))]">
                        <tr>
                            <th scope="col" className="px-6 py-3 font-medium">Date</th>
                            <th scope="col" className="px-6 py-3 font-medium">Product</th>
                            <th scope="col" className="px-6 py-3 font-medium">Order ID</th>
                            <th scope="col" className="px-6 py-3 font-medium">Rate</th>
                            <th scope="col" className="px-6 py-3 font-medium">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {commissions.map((c) => (
                            <tr key={c.id} className="border-b border-[hsl(var(--border))] last:border-b-0 hover:bg-[hsl(var(--accent))]">
                                <td className="px-6 py-4">{c.date}</td>
                                <td className="px-6 py-4 font-medium">{c.productName}</td>
                                <td className="px-6 py-4 text-xs text-[hsl(var(--muted-foreground))]">{c.orderId.substring(0,8)}...</td>
                                <td className="px-6 py-4">{ (c.rate * 100).toFixed(1) }%</td>
                                <td className="px-6 py-4 font-semibold text-green-600 dark:text-green-400">${c.amount.toFixed(2)}</td>
                            </tr>
                        ))}
                         {commissions.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-[hsl(var(--muted-foreground))]">
                                    No commissions earned yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SellerCommissionsTab;
