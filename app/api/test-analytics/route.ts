import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { canShowUpsell, trackUpsellImpression } from '@/lib/analytics';

export async function POST(request: Request) {
    const supabase = await createClient();
    const body = await request.json();
    const { action, userId, triggerType } = body;

    if (action === 'check') {
        const canShow = await canShowUpsell(userId, triggerType, supabase);
        return NextResponse.json({ canShow });
    }

    if (action === 'track') {
        await trackUpsellImpression({ user_id: userId, trigger_type: triggerType }, supabase);
        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
