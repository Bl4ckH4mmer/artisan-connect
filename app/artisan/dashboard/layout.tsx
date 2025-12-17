import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import FirstContactCelebration from '@/components/dashboard/FirstContactCelebration';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        redirect('/login');
    }

    // Fetch artisan profile to get ID
    const { data: artisanProfile } = await supabase
        .from('artisan_profiles')
        .select('id, city')
        .eq('user_id', user.id)
        .single();

    return (
        <>
            {artisanProfile?.id && (
                <FirstContactCelebration artisanId={artisanProfile.id} />
            )}
            {children}
        </>
    );
}
