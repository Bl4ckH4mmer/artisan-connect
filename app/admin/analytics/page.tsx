'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import AdminNav from '@/components/admin/AdminNav'
import ArtisanPerformanceTable from '@/components/admin/ArtisanPerformanceTable'
import MarketGrowthDashboard from '@/components/admin/MarketGrowthDashboard'
import {
    getArtisanPerformanceMetrics,
    getUserEngagementMetrics,
    getEngagementFunnel,
    getMarketGapMetrics,
    getTierROIMetrics,
    getRecruitmentAlerts,
    getSearchSuccessRate,
    getChurnRiskArtisans,
    ArtisanPerformanceMetrics,
    UserEngagementMetrics,
    EngagementFunnel,
    MarketGapMetric,
    TierROIMetric,
    RecruitmentAlert,
    ChurnRiskArtisan
} from '@/lib/admin/analytics-queries'

export default function AnalyticsPage() {
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'market' | 'performance' | 'engagement'>('market')

    const [artisanMetrics, setArtisanMetrics] = useState<ArtisanPerformanceMetrics[]>([])
    const [userMetrics, setUserMetrics] = useState<UserEngagementMetrics>({
        totalUsers: 0,
        avgTimeToFirstContact: 0,
        medianTimeToFirstContact: 0,
        repeatContactRate: 0,
        day1Retention: 0,
        day7Retention: 0,
        day30Retention: 0
    })
    const [funnelMetrics, setFunnelMetrics] = useState<EngagementFunnel>({
        signups: 0,
        firstContact: 0,
        reviewSubmission: 0,
        contactRate: 0,
        reviewRate: 0
    })
    const [marketGap, setMarketGap] = useState<MarketGapMetric[]>([])
    const [tierROI, setTierROI] = useState<TierROIMetric[]>([])
    const [alerts, setAlerts] = useState<RecruitmentAlert[]>([])
    const [successRate, setSuccessRate] = useState<number>(0)
    const [churnRisks, setChurnRisks] = useState<ChurnRiskArtisan[]>([])

    useEffect(() => {
        checkAdminAccess()
        fetchAnalytics()
    }, [])

    async function checkAdminAccess() {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user || user.user_metadata?.role !== 'admin') {
            router.push('/')
            return
        }
    }

    async function fetchAnalytics() {
        try {
            setLoading(true)

            // Fetch all analytics data
            const [artisans, engagement, funnel, gap, roi, alertData, rateData, riskData] = await Promise.all([
                getArtisanPerformanceMetrics(),
                getUserEngagementMetrics(),
                getEngagementFunnel(),
                getMarketGapMetrics(),
                getTierROIMetrics(),
                getRecruitmentAlerts(),
                getSearchSuccessRate(),
                getChurnRiskArtisans()
            ])

            setArtisanMetrics(artisans)
            setUserMetrics(engagement)
            setFunnelMetrics(funnel)
            setMarketGap(gap)
            setTierROI(roi)
            setAlerts(alertData)
            setSuccessRate(rateData)
            setChurnRisks(riskData)
        } catch (error) {
            console.error('Error fetching analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <AdminNav />
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-gray-500">Loading analytics...</div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminNav />

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Strategic Growth Analytics</h1>
                    <p className="text-gray-600">Deep insights into market demand, artisan performance, and user engagement</p>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-4 mb-8 border-b border-gray-200 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('market')}
                        className={`px-6 py-3 font-semibold transition-colors relative whitespace-nowrap ${activeTab === 'market'
                            ? 'text-orange-600'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Market & Growth
                        </div>
                        {activeTab === 'market' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600"></div>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('performance')}
                        className={`px-6 py-3 font-semibold transition-colors relative whitespace-nowrap ${activeTab === 'performance'
                            ? 'text-orange-600'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Artisan Performance
                        </div>
                        {activeTab === 'performance' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600"></div>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('engagement')}
                        className={`px-6 py-3 font-semibold transition-colors relative whitespace-nowrap ${activeTab === 'engagement'
                            ? 'text-orange-600'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            User Engagement
                        </div>
                        {activeTab === 'engagement' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600"></div>
                        )}
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'market' && (
                    <MarketGrowthDashboard
                        marketGap={marketGap}
                        tierROI={tierROI}
                        alerts={alerts}
                        successRate={successRate}
                        churnRisks={churnRisks}
                    />
                )}

                {activeTab === 'performance' && (
                    <ArtisanPerformanceTable artisans={artisanMetrics} />
                )}

                {activeTab === 'engagement' && (
                    <UserEngagementDashboard metrics={userMetrics} funnel={funnelMetrics} />
                )}
            </div>
        </div>
    )
}
