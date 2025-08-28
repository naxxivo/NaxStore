
import React from 'react';
import { motion } from 'framer-motion';

const stats = [
    { name: 'Total Revenue', value: '$405,091.00', change: '+4.75%', changeType: 'positive' },
    { name: 'New Users', value: '1,204', change: '+12.2%', changeType: 'positive' },
    { name: 'Total Orders', value: '12,787', change: '+5.4%', changeType: 'positive' },
    { name: 'Pending Orders', value: '276', change: '-2.1%', changeType: 'negative' },
]

const DashboardTab: React.FC = () => {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                     <motion.div 
                        key={stat.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-[hsl(var(--background))] p-6 rounded-lg shadow"
                    >
                        <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">{stat.name}</p>
                        <p className="mt-1 text-3xl font-semibold tracking-tight">{stat.value}</p>
                        <p className={`mt-1 text-sm ${stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`}>{stat.change}</p>
                    </motion.div>
                ))}
            </div>
             <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
                <div className="bg-[hsl(var(--background))] p-4 rounded-lg shadow">
                    <p className="text-center text-[hsl(var(--muted-foreground))]">Activity feed coming soon.</p>
                </div>
            </div>
        </div>
    );
};

export default DashboardTab;