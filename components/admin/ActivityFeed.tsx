'use client'

import { useEffect, useState } from 'react'
import { getRecentActivity, formatAuditAction, getRelativeTime, type AuditLog } from '@/lib/admin/audit'
import { Clock, User, FileEdit, CheckCircle, XCircle, Star } from 'lucide-react'

export default function ActivityFeed({ limit = 20 }: { limit?: number }) {
    const [activities, setActivities] = useState<AuditLog[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchActivities()

        // Refresh every 30 seconds
        const interval = setInterval(fetchActivities, 30000)
        return () => clearInterval(interval)
    }, [limit])

    const fetchActivities = async () => {
        try {
            const data = await getRecentActivity(limit)
            setActivities(data)
        } catch (error) {
            // Gracefully handle error if audit_logs table doesn't exist yet
            console.log('Audit logs not available yet. Please apply database migrations.')
            setActivities([])
        } finally {
            setLoading(false)
        }
    }

    const getActionIcon = (actionType: string) => {
        if (actionType.includes('approve')) return <CheckCircle className="w-4 h-4 text-green-600" />
        if (actionType.includes('reject') || actionType.includes('suspend')) return <XCircle className="w-4 h-4 text-red-600" />
        if (actionType.includes('edit')) return <FileEdit className="w-4 h-4 text-blue-600" />
        if (actionType.includes('feature')) return <Star className="w-4 h-4 text-yellow-600" />
        return <User className="w-4 h-4 text-gray-600" />
    }

    const getActionColor = (actionType: string) => {
        if (actionType.includes('approve')) return 'bg-green-50 border-green-200'
        if (actionType.includes('reject') || actionType.includes('suspend')) return 'bg-red-50 border-red-200'
        if (actionType.includes('edit')) return 'bg-blue-50 border-blue-200'
        if (actionType.includes('feature')) return 'bg-yellow-50 border-yellow-200'
        return 'bg-gray-50 border-gray-200'
    }

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                </div>
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse flex items-start gap-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                <div className="h-3 bg-gray-200 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                </div>
                <span className="text-sm text-gray-500">Last {limit} actions</span>
            </div>

            {activities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="font-medium">No recent activity</p>
                    <p className="text-sm mt-1">Activity tracking will appear here after database migrations are applied</p>
                </div>
            ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {activities.map((activity) => (
                        <div
                            key={activity.id}
                            className={`flex items-start gap-3 p-3 rounded-lg border ${getActionColor(activity.action_type)}`}
                        >
                            <div className="mt-0.5">
                                {getActionIcon(activity.action_type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                    {formatAuditAction(activity)}
                                </p>
                                {activity.details && Object.keys(activity.details).length > 0 && (
                                    <p className="text-xs text-gray-600 mt-1">
                                        {activity.details.artisan_name && `Artisan: ${activity.details.artisan_name}`}
                                        {activity.details.verification_method && ` • Method: ${activity.details.verification_method}`}
                                    </p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                    {getRelativeTime(activity.created_at)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
