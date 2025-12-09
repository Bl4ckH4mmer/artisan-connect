'use client'

import { Clock, Repeat, Users, TrendingUp } from 'lucide-react'
import { UserEngagementMetrics, EngagementFunnel } from '@/lib/admin/analytics-queries'

interface UserEngagementDashboardProps {
    metrics: UserEngagementMetrics
    funnel: EngagementFunnel
}

export default function UserEngagementDashboard({ metrics, funnel }: UserEngagementDashboardProps) {
    return (
        <div className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Time to First Contact */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <Clock className="w-8 h-8 text-blue-500" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                        {metrics.avgTimeToFirstContact.toFixed(1)}h
                    </div>
                    <div className="text-sm text-gray-600">Avg Time to 1st Contact</div>
                    <div className="text-xs text-gray-500 mt-2">
                        Median: {metrics.medianTimeToFirstContact.toFixed(1)}h
                    </div>
                </div>

                {/* Repeat Contact Rate */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <Repeat className="w-8 h-8 text-green-500" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                        {metrics.repeatContactRate}%
                    </div>
                    <div className="text-sm text-gray-600">Repeat Contact Rate</div>
                    <div className="text-xs text-gray-500 mt-2">
                        Users contacting multiple artisans
                    </div>
                </div>

                {/* Day 7 Retention */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <TrendingUp className="w-8 h-8 text-purple-500" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                        {metrics.day7Retention}%
                    </div>
                    <div className="text-sm text-gray-600">Day 7 Retention</div>
                    <div className="text-xs text-gray-500 mt-2">
                        Active in last 7 days
                    </div>
                </div>

                {/* Total Users */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <Users className="w-8 h-8 text-orange-500" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                        {metrics.totalUsers}
                    </div>
                    <div className="text-sm text-gray-600">Total Users</div>
                    <div className="text-xs text-gray-500 mt-2">
                        Registered accounts
                    </div>
                </div>
            </div>

            {/* Retention Breakdown */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Retention Cohorts</h3>
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                            {metrics.day1Retention}%
                        </div>
                        <div className="text-sm text-gray-600">Day 1</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                            {metrics.day7Retention}%
                        </div>
                        <div className="text-sm text-gray-600">Day 7</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 mb-1">
                            {metrics.day30Retention}%
                        </div>
                        <div className="text-sm text-gray-600">Day 30</div>
                    </div>
                </div>
            </div>

            {/* Engagement Funnel */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Engagement Funnel</h3>

                <div className="space-y-4">
                    {/* Signups */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-700">Signups</span>
                            <span className="text-sm font-bold text-gray-900">{funnel.signups}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">100%</div>
                    </div>

                    {/* First Contact */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-700">First Contact</span>
                            <span className="text-sm font-bold text-gray-900">{funnel.firstContact}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full" style={{ width: `${funnel.contactRate}%` }}></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{funnel.contactRate}% conversion</div>
                    </div>

                    {/* Review Submission */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-700">Review Submission</span>
                            <span className="text-sm font-bold text-gray-900">{funnel.reviewSubmission}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full" style={{ width: `${funnel.reviewRate}%` }}></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{funnel.reviewRate}% of contacts</div>
                    </div>
                </div>

                {/* Funnel Summary */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-700">
                        <span className="font-semibold">Overall Conversion:</span> {funnel.signups > 0 ? Math.round((funnel.reviewSubmission / funnel.signups) * 100) : 0}% of signups submit reviews
                    </div>
                </div>
            </div>
        </div>
    )
}
