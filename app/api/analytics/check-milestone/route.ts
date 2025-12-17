
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { canShowUpsell } from '@/lib/analytics';

export async function POST(request: Request) {
    const { artisanId, milestoneType } = await request.json();

    if (!artisanId || !milestoneType) {
        return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
        );
    }

    const supabase = await createClient();

    // Check if this is the first contact
    if (milestoneType === 'first_contact') {
        const { count, error } = await supabase
            .from('contact_events')
            .select('*', { count: 'exact', head: true })
            .eq('artisan_id', artisanId);

        if (error) {
            console.error('Error checking contact count:', error);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        // Check cooldown (don't spam if already shown)
        const canShow = await canShowUpsell(artisanId, 'boost_after_contact', supabase);

        return NextResponse.json({
            isFirstContact: count === 1,
            shouldShowUpsell: count === 1 && canShow,
            contactCount: count
        });
    }

    return NextResponse.json({ error: 'Invalid milestone type' }, { status: 400 });
}
