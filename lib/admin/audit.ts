import { createClient } from '@/lib/supabase/client'

export interface AuditLogEntry {
    action: string
    targetType?: string
    targetId?: string
    details?: Record<string, any>
    ipAddress?: string
    userAgent?: string
}

export interface AuditLog {
    id: string
    admin_user_id: string
    action_type: string
    target_type: string | null
    target_id: string | null
    details: Record<string, any>
    ip_address: string | null
    user_agent: string | null
    created_at: string
}

/**
 * Log an admin action to the audit trail
 */
export async function logAdminAction(entry: AuditLogEntry): Promise<void> {
    const supabase = createClient()

    // Get current admin user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        console.error('Cannot log action: No authenticated user')
        return
    }

    // Get IP address and user agent from browser (if available)
    const ipAddress = entry.ipAddress || null
    const userAgent = entry.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : null)

    const { error } = await supabase
        .from('admin_audit_logs')
        .insert({
            admin_user_id: user.id,
            action_type: entry.action,
            target_type: entry.targetType || null,
            target_id: entry.targetId || null,
            details: entry.details || {},
            ip_address: ipAddress,
            user_agent: userAgent
        })

    if (error) {
        console.error('Failed to log admin action:', error)
    }
}

/**
 * Get recent activity feed (last N actions)
 */
export async function getRecentActivity(limit: number = 20): Promise<AuditLog[]> {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Failed to fetch recent activity:', error)
        return []
    }

    return data as AuditLog[]
}

/**
 * Search audit logs with filters
 */
export interface AuditLogFilters {
    adminUserId?: string
    actionType?: string
    targetType?: string
    startDate?: string
    endDate?: string
    page?: number
    pageSize?: number
}

export async function searchAuditLogs(filters: AuditLogFilters = {}) {
    const supabase = createClient()
    const pageSize = filters.pageSize || 50
    const page = filters.page || 1
    const offset = (page - 1) * pageSize

    let query = supabase
        .from('admin_audit_logs')
        .select('*', { count: 'exact' })

    // Apply filters
    if (filters.adminUserId) {
        query = query.eq('admin_user_id', filters.adminUserId)
    }
    if (filters.actionType) {
        query = query.eq('action_type', filters.actionType)
    }
    if (filters.targetType) {
        query = query.eq('target_type', filters.targetType)
    }
    if (filters.startDate) {
        query = query.gte('created_at', filters.startDate)
    }
    if (filters.endDate) {
        query = query.lte('created_at', filters.endDate)
    }

    // Apply pagination and ordering
    query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1)

    const { data, error, count } = await query

    if (error) {
        console.error('Failed to search audit logs:', error)
        return { data: [], count: 0, page, pageSize }
    }

    return {
        data: data as AuditLog[],
        count: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
    }
}

/**
 * Format audit log action for display
 */
export function formatAuditAction(log: AuditLog): string {
    const actions: Record<string, string> = {
        approve_artisan: 'approved artisan',
        reject_artisan: 'rejected artisan',
        suspend_artisan: 'suspended artisan',
        activate_artisan: 'activated artisan',
        edit_artisan: 'edited artisan',
        create_artisan: 'manually onboarded artisan',
        approve_review: 'approved review',
        reject_review: 'rejected review',
        delete_review: 'deleted review',
        feature_artisan: 'featured artisan',
        unfeature_artisan: 'removed featured artisan'
    }

    const actionText = actions[log.action_type] || log.action_type.replace(/_/g, ' ')
    return `Admin ${actionText}`
}

/**
 * Get relative time string (e.g., "2 minutes ago")
 */
export function getRelativeTime(timestamp: string): string {
    const now = new Date()
    const then = new Date(timestamp)
    const diffMs = now.getTime() - then.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSecs < 60) return 'just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`

    return then.toLocaleDateString()
}
