'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function deleteUser(userId: string, reason: string = 'GDPR Deletion') {
    try {
        // 1. Verify Admin
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user || user.user_metadata?.role !== 'admin') {
            return { success: false, error: 'Unauthorized: You must be an admin to perform this action.' }
        }

        // 2. Check Environment Variables
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !serviceRoleKey) {
            console.error('Missing Supabase Environment Variables for Admin Action')
            return { success: false, error: 'Server Configuration Error: Missing Service Role Key.' }
        }

        // 3. Admin Deletion using Service Role
        const adminSupabase = createClient(
            supabaseUrl,
            serviceRoleKey,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        const { error } = await adminSupabase.auth.admin.deleteUser(userId)

        if (error) {
            console.error('Error deleting user:', error)
            return { success: false, error: `Supabase Error: ${error.message}` }
        }

        // 4. Log Action
        try {
            await supabase
                .from('admin_audit_logs')
                .insert({
                    admin_user_id: user.id,
                    action_type: 'delete_user',
                    target_type: 'user',
                    target_id: userId,
                    details: { reason },
                })
        } catch (logError) {
            console.error('Failed to log admin action:', logError)
        }

        return { success: true }
    } catch (err: any) {
        console.error('Unexpected error in deleteUser:', err)
        return { success: false, error: `Unexpected Error: ${err.message || 'Unknown error'}` }
    }
}
