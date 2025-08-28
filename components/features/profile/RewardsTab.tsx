import React from 'react';
import { useAuthStore } from '../../../lib/authStore';
import { useToastStore } from '../../../lib/toastStore';
import { motion } from 'framer-motion';
import { Database } from '../../../integrations/supabase/types';

type RewardTier = Database['public']['Enums']['reward_tier'];

const tierData: Record<RewardTier, { goal: number; color: string }> = {
    Bronze: { goal: 500, color: 'bg-yellow-700' },
    Silver: { goal: 1000, color: 'bg-gray-400' },
    Gold: { goal: 5000, color: 'bg-yellow-500' },
    Platinum: { goal: Infinity, color: 'bg-blue-400' },
};

const tierOrder: RewardTier[] = ['Bronze', 'Silver', 'Gold', 'Platinum'];

const RewardsTab: React.FC = () => {
    const { user } = useAuthStore();
    const { addToast } = useToastStore();
    
    if (!user) return null;

    const { points, rewardTier, referralCode } = user;
    const tierInfo = tierData[rewardTier];
    const currentTierIndex = tierOrder.indexOf(rewardTier);
    const nextTierName = currentTierIndex < tierOrder.length - 1 ? tierOrder[currentTierIndex + 1] : null;
    
    const progress = tierInfo.goal === Infinity ? 100 : (points / tierInfo.goal) * 100;
    
    const handleCopyCode = () => {
        if (referralCode) {
            navigator.clipboard.writeText(referralCode);
            addToast({ message: 'Referral code copied!', type: 'success' });
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">My Rewards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Points & Tier */}
                <div className="bg-[hsl(var(--background))] p-6 rounded-lg shadow-md">
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Current Balance</p>
                    <p className="text-4xl font-bold">{points.toLocaleString()} <span className="text-lg font-medium">Points</span></p>
                    <div className="mt-4">
                        <div className="flex justify-between items-baseline mb-1">
                            <p className="font-semibold text-lg">{rewardTier} Tier</p>
                            {nextTierName && <p className="text-sm text-[hsl(var(--muted-foreground))]">{(tierInfo.goal - points).toLocaleString()} points to {nextTierName}</p>}
                        </div>
                        <div className="w-full bg-[hsl(var(--muted))] rounded-full h-2.5">
                            <motion.div
                                className={`h-2.5 rounded-full ${tierInfo.color}`}
                                style={{ width: `${progress}%` }}
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                            />
                        </div>
                    </div>
                </div>
                {/* Referral Program */}
                <div className="bg-[hsl(var(--background))] p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold">Refer a Friend!</h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Share your code and you both get 500 points when they make their first purchase.</p>
                    <div className="mt-4 flex items-center space-x-2">
                        <div className="flex-grow p-2 border-2 border-dashed border-[hsl(var(--border))] rounded-md text-center font-mono">
                            {referralCode || 'Generating...'}
                        </div>
                        <button
                            onClick={handleCopyCode}
                            disabled={!referralCode}
                            className="px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-md hover:bg-[hsl(var(--primary)/0.9)] disabled:opacity-50"
                        >
                            Copy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RewardsTab;