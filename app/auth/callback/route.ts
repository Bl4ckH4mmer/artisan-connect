import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const redirect = requestUrl.searchParams.get('redirect') || '/dashboard'
    const role = requestUrl.searchParams.get('role')
    const origin = requestUrl.origin

    if (code) {
        const supabase = await createClient()
        const { data } = await supabase.auth.exchangeCodeForSession(code)

        // If admin role was specified, update user
        if (role === 'admin' && data?.user) {
            await supabase.auth.updateUser({
                data: { role: 'admin' }
            })

            await supabase
                .from('user_profiles')
                .update({ is_admin: true, active_role: 'admin' })
                .eq('user_id', data.user.id)
        }
    }

    // Redirect to the specified path or default to dashboard
    return NextResponse.redirect(`${origin}${redirect}`)
}
