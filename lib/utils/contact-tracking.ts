import { ContactType } from '@/types/contact';

/**
 * Generates a WhatsApp deep link with pre-filled message
 */
export function generateWhatsAppLink(
    phoneNumber: string,
    artisanName: string
): string {
    const message = encodeURIComponent(
        `Hi ${artisanName}, I found your profile on Artisan Connect. I need your services.`
    );

    // Remove + and spaces from phone number
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');

    return `https://wa.me/${cleanNumber}?text=${message}`;
}

/**
 * Generates a tel: link for phone calls
 */
export function generateCallLink(phoneNumber: string): string {
    return `tel:${phoneNumber}`;
}

/**
 * Tracks a contact event (WhatsApp or Call)
 */
export async function trackContactEvent(
    artisanId: string,
    contactType: ContactType,
    supabase: any
): Promise<void> {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.error('User not authenticated');
            return;
        }

        const { error } = await supabase
            .from('contact_events')
            .insert({
                buyer_id: user.id,
                artisan_id: artisanId,
                contact_type: contactType,
            });

        if (error) {
            console.error('Error tracking contact event:', error);
        }
    } catch (error) {
        console.error('Error in trackContactEvent:', error);
    }
}
