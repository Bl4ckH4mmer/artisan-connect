'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function deleteUser(userId: string, reason: string = 'GDPR Deletion') {
    // 1. Verify Admin
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.user_metadata?.role !== 'admin') {
        throw new Error('Unauthorized')
    }

    // 2. Admin Deletion using Service Role
    // We use a direct supabase-js client with the service role key for admin operations
    const adminSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )

    // Delete the user from Auth (this cascades to public.users usually if set up, or we might need to manual delete)
    // Assuming Supabase standard setup where Auth deletion cascades to public table triggers or foreign keys
    const { error } = await adminSupabase.auth.admin.deleteUser(userId)

    if (error) {
        console.error('Error deleting user:', error)
        throw new Error(error.message)
    }

    // 3. Log Action (Manual log since we are server-side)
    try {
        await supabase
            .from('admin_audit_logs')
            .insert({
                admin_user_id: user.id,
                action_type: 'delete_user',
                target_type: 'user',
                target_id: userId,
                details: { reason },
                // ip_address and user_agent are harder to get in server action without headers hook, skipping for now or passing from client
            })
    } catch (logError) {
        console.error('Failed to log admin action:', logError)
        // Don't fail the deletion if logging fails
    }

    return { success: true }
}
