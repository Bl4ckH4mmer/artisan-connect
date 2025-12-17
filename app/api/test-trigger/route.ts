
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const artisanId = searchParams.get('artisanId')

    if (!artisanId) return NextResponse.json({ error: 'artisanId required' }, { status: 400 })

    if (action === 'reset') {
        // Clear contacts
        await supabaseAdmin.from('contact_events').delete().eq('artisan_id', artisanId)
        // Clear upsell logs to allow showing again
        await supabaseAdmin.from('upsell_impressions').delete().eq('artisan_id', artisanId).eq('trigger_type', 'boost_after_contact')

        return NextResponse.json({ message: 'Reset complete' })
    }

    if (action === 'contact') {
        // Fetch the user_id of the artisan to use as buyer_id (self-contact for testing)
        // This ensures the buyer_id exists in auth.users
        const { data: profile } = await supabaseAdmin
            .from('artisan_profiles')
            .select('user_id')
            .eq('id', artisanId)
            .single()

        if (!profile) {
            return NextResponse.json({ error: 'Artisan profile not found' }, { status: 404 })
        }

        const buyerId = profile.user_id
        console.log('Inserting contact event. Artisan:', artisanId, 'Buyer (Self):', buyerId)

        const { error } = await supabaseAdmin.from('contact_events').insert({
            artisan_id: artisanId,
            buyer_id: buyerId,
            contact_type: 'whatsapp'
        })

        if (error) {
            console.error('Insert Contact Error:', error)
            return NextResponse.json({ error: error.message, details: error }, { status: 500 })
        }
        return NextResponse.json({ message: 'Contact added' })
    }

    return NextResponse.json({ message: 'Use ?action=reset or ?action=contact' })
}
