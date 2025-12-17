
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') // 'boost', 'expire', 'reset'
    const location = searchParams.get('location') || 'Nairobi'
    const category = searchParams.get('category') || 'Plumber'

    // 1. Get or Create a Test User/Artisan
    // We'll try to find a consistent test user or create one
    const TEST_EMAIL = 'test-boost-artisan@example.com'

    // Find User
    let { data: users } = await supabaseAdmin.auth.admin.listUsers()
    let user = users?.users.find(u => u.email === TEST_EMAIL)

    if (!user) {
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: TEST_EMAIL,
            password: 'password123',
            email_confirm: true
        })
        if (createError) return NextResponse.json({ error: createError.message }, { status: 500 })
        user = newUser.user
    }

    if (!user) return NextResponse.json({ error: 'Failed to find/create user' }, { status: 500 })

    // Find/Create Profile
    const { data: profile } = await supabaseAdmin
        .from('artisan_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

    let artisanId = profile?.id

    if (!profile) {
        const { data: newProfile, error: profileError } = await supabaseAdmin
            .from('artisan_profiles')
            .insert({
                user_id: user.id,
                business_name: 'Bob Plumbers Deluxe',
                artisan_name: 'Bob Builder',
                category: category,
                city: location,
                estate_zone: 'Central',
                state: 'Nairobi County',
                phone_number: '+254700000000',
                experience_years: 5,
                bio: 'Best plumber in town',
                status: 'active',
                rating: 4.8,
                total_reviews: 12,
                is_verified: true
            })
            .select()
            .single()

        if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })
        artisanId = newProfile.id
    }

    // Perform Action
    if (action === 'boost') {
        // 1. Update Subscription
        await supabaseAdmin
            .from('artisan_subscriptions')
            .upsert({
                artisan_id: artisanId,
                tier: 'boost',
                status: 'active',
                started_at: new Date().toISOString(),
                expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 days
                auto_renew: true
            }, { onConflict: 'artisan_id' })

        // 2. Update Zone
        await supabaseAdmin
            .from('boost_zones')
            .upsert({
                artisan_id: artisanId,
                zone: location,
                active: true,
                expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            }) // Note: Table might not have unique constraint on artisan_id + zone if not careful, but upsert helps if ID is key. 
        // Actually boost_zones usually has an ID. We should check if one exists for this artisan/zone combo.
        // For simplicity in this test script, we delete old zones for this artisan first.

        /* Ideally we clean up old zones */
        await supabaseAdmin.from('boost_zones').delete().eq('artisan_id', artisanId)

        await supabaseAdmin.from('boost_zones').insert({
            artisan_id: artisanId,
            zone: location,
            active: true,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })

        return NextResponse.json({ message: 'Boosted successfully', artisanId, location })

    } else if (action === 'expire') {
        // Expire Subscription
        await supabaseAdmin
            .from('artisan_subscriptions')
            .update({
                expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // -1 day
                status: 'expired'
            })
            .eq('artisan_id', artisanId)

        // Expire Zones
        await supabaseAdmin
            .from('boost_zones')
            .update({
                active: false,
                expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            })
            .eq('artisan_id', artisanId)

        return NextResponse.json({ message: 'Expired successfully', artisanId })
    }

    return NextResponse.json({ message: 'No action taken. Use ?action=boost or ?action=expire', artisanId })
}
