'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Search, Filter, Download, Calendar, Activity, User, FileText } from 'lucide-react'
import { AuditLog, searchAuditLogs, formatAuditAction, getRelativeTime, logAdminAction } from '@/lib/admin/audit'
import { exportAuditLogsToCSV } from '@/lib/admin/export'
import AdminNav from '@/components/admin/AdminNav'

export default function ActivityLogPage() {
    const router = useRouter()
    const supabase = createClient()

    const [logs, setLogs] = useState<AuditLog[]>([])
    const [loading, setLoading] = useState(true)
    const [totalCount, setTotalCount] = useState(0)
    const [page, setPage] = useState(1)
    const [exporting, setExporting] = useState(false)

    // Filters
    const [actionFilter, setActionFilter] = useState('all')
    const [dateRange, setDateRange] = useState('7d') // 24h, 7d, 30d, 90d, all

    useEffect(() => {
        checkAdminAccess()
    }, [])

    useEffect(() => {
        fetchLogs()
    }, [page, actionFilter, dateRange])

    const checkAdminAccess = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || user.user_metadata?.role !== 'admin') {
            router.push('/')
        }
    }

    const fetchLogs = async () => {
        try {
            setLoading(true)

            // Calculate date range
            let startDate: string | undefined
            const now = new Date()
            if (dateRange === '24h') {
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
            } else if (dateRange === '7d') {
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
            } else if (dateRange === '30d') {
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
            } else if (dateRange === '90d') {
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
            }

            const result = await searchAuditLogs({
                page,
                pageSize: 20,
                actionType: actionFilter !== 'all' ? actionFilter : undefined,
                startDate
            })

            setLogs(result.data)
            setTotalCount(result.count)
        } catch (error) {
            console.error('Error fetching logs:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleExport = async () => {
        try {
            setExporting(true)

            // Calculate date range for export
            let startDate: string | undefined
            const now = new Date()
            if (dateRange === '24h') {
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
            } else if (dateRange === '7d') {
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
            } else if (dateRange === '30d') {
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
            } else if (dateRange === '90d') {
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
            }

            const filters = {
                action_type: actionFilter !== 'all' ? actionFilter : undefined,
                startDate
            }

            await exportAuditLogsToCSV(filters)

            // Log the export action itself (without triggering infinite loop ideally, but it's fine)
            await logAdminAction({
                action: 'export_audit_logs',
                targetType: 'system',
                details: { filters }
            })
        } catch (error) {
            console.error('Export failed:', error)
            alert('Failed to export audit logs')
        } finally {
            setExporting(false)
        }
    }

    const getActionIcon = (action: string) => {
        if (action.includes('approve')) return <CheckCircle className="w-4 h-4 text-green-500" />
        if (action.includes('reject')) return <XCircle className="w-4 h-4 text-red-500" />
        if (action.includes('suspend')) return <Ban className="w-4 h-4 text-red-500" />
        if (action.includes('export')) return <Download className="w-4 h-4 text-blue-500" />
        return <Activity className="w-4 h-4 text-gray-500" />
    }

    // Helper components for icons since I can't import them all from lucide-react in one line easily if I missed some
    const CheckCircle = ({ className }: { className?: string }) => (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
    )
    const XCircle = ({ className }: { className?: string }) => (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
    )
    const Ban = ({ className }: { className?: string }) => (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
    )

    const actionTypes = [
        'approve_artisan', 'reject_artisan', 'suspend_artisan', 'activate_artisan',
        'approve_review', 'reject_review', 'export_artisans', 'export_audit_logs'
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminNav />

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
                        <p className="text-sm text-gray-600">Track all administrative actions</p>
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" />
                        {exporting ? 'Exporting...' : 'Export CSV'}
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Action Type</label>
                            <select
                                value={actionFilter}
                                onChange={(e) => setActionFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                <option value="all">All Actions</option>
                                {actionTypes.map(action => (
                                    <option key={action} value={action}>{action.replace(/_/g, ' ')}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Date Range</label>
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                <option value="24h">Last 24 Hours</option>
                                <option value="7d">Last 7 Days</option>
                                <option value="30d">Last 30 Days</option>
                                <option value="90d">Last 90 Days</option>
                                <option value="all">All Time</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Logs List */}
                {loading ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
                        <p className="text-gray-600">Loading activity...</p>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No activity found</h3>
                        <p className="text-gray-600">Try adjusting your filters</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="divide-y divide-gray-200">
                            {logs.map((log) => (
                                <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1">
                                            {getActionIcon(log.action_type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {formatAuditAction(log)}
                                                </p>
                                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                                    {getRelativeTime(log.created_at)}
                                                </span>
                                            </div>

                                            {/* Details */}
                                            {log.details && Object.keys(log.details).length > 0 && (
                                                <div className="mt-1 text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                                                    {Object.entries(log.details).map(([key, value]) => (
                                                        <div key={key} className="flex gap-2">
                                                            <span className="font-medium text-gray-500 capitalize">{key.replace(/_/g, ' ')}:</span>
                                                            <span className="truncate">{String(value)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                                                <div className="flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    <span>Admin ID: {log.admin_user_id.substring(0, 8)}...</span>
                                                </div>
                                                {log.target_id && (
                                                    <div className="flex items-center gap-1">
                                                        <FileText className="w-3 h-3" />
                                                        <span>Target: {log.target_type} ({log.target_id.substring(0, 8)}...)</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{(page - 1) * 20 + 1}</span> to <span className="font-medium">{Math.min(page * 20, totalCount)}</span> of <span className="font-medium">{totalCount}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => setPage(p => p + 1)}
                                            disabled={page * 20 >= totalCount}
                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Next
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
