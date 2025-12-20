'use client'

import { MarketGapMetric, TierROIMetric, RecruitmentAlert, ChurnRiskArtisan } from '@/lib/admin/analytics-queries'
import { TrendingUp, AlertTriangle, Search, Activity, Zap, CheckCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface MarketGrowthDashboardProps {
    marketGap: MarketGapMetric[]
    tierROI: TierROIMetric[]
    alerts: RecruitmentAlert[]
    successRate: number
    churnRisks: ChurnRiskArtisan[]
}

export default function MarketGrowthDashboard({ marketGap, tierROI, alerts, successRate, churnRisks }: MarketGrowthDashboardProps) {
    const supabase = createClient()
    const [boostedArtisanId, setBoostedArtisanId] = useState<string | null>(null)

    const handleForceBoost = async (artisanId: string) => {
        try {
            const { error } = await supabase.rpc('force_boost_artisan', {
                p_artisan_id: artisanId,
                duration_hours: 48
            })
            if (error) throw error
            setBoostedArtisanId(artisanId)
            // Optional: Helper toast or refresh logic could go here
        } catch (error) {
            console.error('Error boosting artisan:', error)
            alert('Failed to boost artisan')
        }
    }

    return (
        <div className="space-y-6">
            {/* Top Level Alerts & Success Rate */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Search Success Rate */}
                <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-500 uppercase">Search Success Rate</h3>
                            <CheckCircle className={`w-5 h-5 ${successRate > 50 ? 'text-green-500' : 'text-yellow-500'}`} />
                        </div>
                        <div className="text-4xl font-bold text-gray-900">{successRate}%</div>
                        <p className="text-xs text-gray-500 mt-2">of searches lead to contact</p>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mt-4">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(successRate, 100)}%` }}></div>
                    </div>
                </div>

                {/* Recruitment Alerts (Hot Zones) */}
                <div className="md:col-span-2 bg-linear-to-r from-red-50 to-orange-50 border border-red-100 rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                        <h3 className="text-lg font-bold text-red-900">Hot Recruitment Zones (48h)</h3>
                    </div>
                    {alerts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {alerts.slice(0, 4).map((alert, i) => (
                                <div key={i} className="bg-white p-3 rounded-lg border border-red-100 shadow-xs flex justify-between items-center">
                                    <div>
                                        <div className="font-bold text-gray-900">{alert.zone_category}</div>
                                        <div className="text-xs text-red-600 font-semibold">{alert.search_volume} active searches</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500">Avg Results</div>
                                        <div className="font-bold text-gray-900">{alert.avg_results}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-600 italic">No critical recruitment alerts right now. Good coverage!</p>
                    )}
                </div>
            </div>

            {/* Churn Risk Watchlist */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Churn Risk Watchlist</h3>
                        <p className="text-sm text-gray-500">Pro/Boost artisans with low activity ({'<'}2 contacts in 14d)</p>
                    </div>
                    <div className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full">
                        {churnRisks.length} At Risk
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Artisan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Tier</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contacts (14d)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inactive Days</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {churnRisks.map((risk) => (
                                <tr key={risk.id}>
                                    <td className="px-6 py-4 font-medium text-gray-900">{risk.business_name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${risk.tier === 'pro' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {risk.tier}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{risk.contact_count}</td>
                                    <td className="px-6 py-4 text-gray-600">{risk.days_since_last_contact} days</td>
                                    <td className="px-6 py-4 text-right">
                                        {boostedArtisanId === risk.id ? (
                                            <span className="text-green-600 text-sm font-bold flex items-center justify-end gap-1">
                                                <CheckCircle className="w-4 h-4" /> Boosted!
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handleForceBoost(risk.id)}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ml-auto transition-colors"
                                            >
                                                <Zap className="w-3 h-3" /> Force Boost
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {churnRisks.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        All premium artisans are performing well!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Existing Market Gap & ROI */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Market Gaps (Detailed Table) */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900">Unmet Demand (30d)</h3>
                    </div>
                    {/* ... (Existing Market Gap Table Logic) ... */}
                    <div className="overflow-x-auto max-h-80">
                        <table className="w-full">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Term</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Vol</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Res</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {marketGap.map((gap, i) => (
                                    <tr key={i}>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{gap.search_term}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{gap.search_count}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <span className={`px-2 rounded-full text-xs font-bold ${gap.avg_results === 0 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {gap.avg_results}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Tier ROI Chart */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Tier ROI</h3>
                        <Activity className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={tierROI} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="tier" tickLine={false} axisLine={false} />
                                <YAxis tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="avg_views" fill="#f97316" name="Views" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="avg_contacts" fill="#3b82f6" name="Contacts" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    )
}
