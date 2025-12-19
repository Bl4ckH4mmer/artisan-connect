"use client"

import { useState } from 'react'
import { Check, Zap, Crown, Shield, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SubscriptionPage() {
    const [loading, setLoading] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const tiers = [
        {
            name: 'Free',
            price: '₦0',
            duration: '/ forever',
            description: 'Basic visibility for starters',
            icon: Shield,
            color: 'blue',
            features: [
                'Basic Profile Listing',
                'Standard Search Ranking',
                'Receive Messages',
                'Upload up to 3 Portfolio Images'
            ],
            action: 'Current Plan',
            current: true // We'll need to fetch real status later
        },
        {
            name: 'Boost',
            price: '₦2,500',
            duration: '/ month',
            description: 'Get seen by more customers',
            icon: Zap,
            color: 'purple',
            popular: true,
            features: [
                'Prioritized Search Ranking',
                'Featured on Homepage',
                ' verified badge',
                'Upload up to 10 Portfolio Images',
                'See who viewed your profile'
            ],
            action: 'Upgrade to Boost',
            current: false
        },
        {
            name: 'Pro',
            price: '₦10,000',
            duration: '/ month',
            description: 'Maximum exposure & trust',
            icon: Crown,
            color: 'orange',
            features: [
                'Top Search Ranking (Guaranteed)',
                'Premium "Verified Pro" Badge',
                'Unlimited Portfolio Images',
                'Priority Support',
                'Business Analytics Dashboard',
                'SMS Notifications for leads'
            ],
            action: 'Upgrade to Pro',
            current: false
        }
    ]

    const handleUpgrade = async (tierName: string) => {
        setLoading(tierName)
        // Todo: Integrate payment gateway (Paystack/Flutterwave)
        // For now, simulate upgrade
        setTimeout(() => {
            alert(`Upgrade to ${tierName} coming soon! integration with payment gateway required.`)
            setLoading(null)
        }, 1000)
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-(--blue-bg-light) via-white to-(--blue-light) py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </button>
                </div>

                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
                        Upgrade Your Business
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Choose the perfect plan to grow your client base and increase your earnings.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {tiers.map((tier) => {
                        const Icon = tier.icon
                        const isPopular = tier.popular

                        return (
                            <div
                                key={tier.name}
                                className={`relative bg-white rounded-2xl shadow-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${isPopular ? 'border-purple-500 ring-2 ring-purple-500 ring-opacity-50' : 'border-gray-200'
                                    }`}
                            >
                                {isPopular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                <div className="p-8">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${tier.name === 'Free' ? 'bg-blue-100 text-blue-600' :
                                        tier.name === 'Boost' ? 'bg-purple-100 text-purple-600' :
                                            'bg-orange-100 text-orange-600'
                                        }`}>
                                        <Icon className="w-6 h-6" />
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                                    <p className="text-gray-500 text-sm mb-6">{tier.description}</p>

                                    <div className="flex items-baseline mb-8">
                                        <span className="text-4xl font-extrabold text-gray-900">{tier.price}</span>
                                        <span className="text-gray-500 ml-1">{tier.duration}</span>
                                    </div>

                                    <ul className="space-y-4 mb-8">
                                        {tier.features.map((feature) => (
                                            <li key={feature} className="flex items-start">
                                                <Check className="w-5 h-5 text-green-500 mr-2 shrink-0" />
                                                <span className="text-gray-600 text-sm">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        onClick={() => !tier.current && handleUpgrade(tier.name)}
                                        disabled={tier.current || loading === tier.name}
                                        className={`w-full py-3 px-4 rounded-xl font-semibold transition-all ${tier.current
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : isPopular
                                                ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-purple-500/30'
                                                : 'bg-gray-900 text-white hover:bg-gray-800'
                                            }`}
                                    >
                                        {loading === tier.name ? 'Processing...' : tier.action}
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
