import { Zap, Shield, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SubscriptionTier } from '@/types/subscription';

interface BoostBadgeProps {
    tier: SubscriptionTier;
    isVerified?: boolean;
    location?: string;
    className?: string;
    showLabel?: boolean;
}

export function BoostBadge({
    tier,
    isVerified,
    location,
    className,
    showLabel = true
}: BoostBadgeProps) {
    // Don't show anything for free tier
    if (!tier || tier === 'free') return null;

    const badges = {
        boost: {
            icon: Zap,
            label: location ? `Top in ${location}` : 'Boosted',
            bgColor: 'bg-gradient-to-r from-amber-500 to-orange-500',
            textColor: 'text-white',
            borderColor: 'border-amber-400'
        },
        pro: {
            icon: Award,
            label: 'Pro Artisan',
            bgColor: 'bg-gradient-to-r from-purple-600 to-indigo-600',
            textColor: 'text-white',
            borderColor: 'border-purple-400'
        },
        guarantee: {
            icon: Shield,
            label: 'Guarantee Protected',
            bgColor: 'bg-gradient-to-r from-emerald-600 to-teal-600',
            textColor: 'text-white',
            borderColor: 'border-emerald-400'
        },
        free: { icon: Zap, label: '', bgColor: '', textColor: '', borderColor: '' } // Fallback
    };

    const badge = badges[tier] || badges.boost;
    const Icon = badge.icon;

    return (
        <div
            className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
                'border shadow-sm shadow-amber-500/10',
                badge.bgColor,
                badge.textColor,
                badge.borderColor,
                className
            )}
        >
            <Icon className="w-3.5 h-3.5" />
            {showLabel && <span>{badge.label}</span>}
        </div>
    );
}

// Quick access variant for search results to overlay on image
export function QuickBoostIndicator({ tier }: { tier: SubscriptionTier }) {
    if (!tier || tier === 'free') return null;

    return (
        <div className="absolute top-2 left-2 z-10">
            <BoostBadge tier={tier} showLabel={false} className="px-1.5 py-1.5" />
        </div>
    );
}
