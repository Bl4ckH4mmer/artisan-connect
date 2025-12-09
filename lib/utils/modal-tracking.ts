import { createClient } from '@/lib/supabase/client'

type ModalEventType = 'modal_shown' | 'modal_converted' | 'modal_dismissed'
type ConversionAction = 'login' | 'signup'

/**
 * Get or create a session ID for tracking anonymous users
 */
function getSessionId(): string {
    if (typeof window === 'undefined') return ''

    let sessionId = sessionStorage.getItem('modal_session_id')
    if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        sessionStorage.setItem('modal_session_id', sessionId)
    }
    return sessionId
}

/**
 * Track when the AuthModal is shown to a user
 */
export async function trackModalShown(artisanId?: string): Promise<void> {
    try {
        const supabase = createClient()
        const sessionId = getSessionId()

        await supabase
            .from('auth_modal_events')
            .insert({
                event_type: 'modal_shown',
                artisan_id: artisanId || null,
                session_id: sessionId
            })
    } catch (error) {
        console.error('Error tracking modal shown:', error)
    }
}

/**
 * Track when a user clicks login or signup from the modal
 */
export async function trackModalConverted(
    action: ConversionAction,
    artisanId?: string
): Promise<void> {
    try {
        const supabase = createClient()
        const sessionId = getSessionId()
        const { data: { user } } = await supabase.auth.getUser()

        await supabase
            .from('auth_modal_events')
            .insert({
                event_type: 'modal_converted',
                artisan_id: artisanId || null,
                conversion_action: action,
                session_id: sessionId,
                user_id: user?.id || null
            })
    } catch (error) {
        console.error('Error tracking modal conversion:', error)
    }
}

/**
 * Track when a user dismisses the modal without action
 */
export async function trackModalDismissed(artisanId?: string): Promise<void> {
    try {
        const supabase = createClient()
        const sessionId = getSessionId()

        await supabase
            .from('auth_modal_events')
            .insert({
                event_type: 'modal_dismissed',
                artisan_id: artisanId || null,
                session_id: sessionId
            })
    } catch (error) {
        console.error('Error tracking modal dismissed:', error)
    }
}
