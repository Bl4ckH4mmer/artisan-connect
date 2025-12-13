'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleFavorite(artisanId: string, isFavorite: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        if (isFavorite) {
            // Remove favorite
            const { error } = await supabase
                .from('favorite_artisans')
                .delete()
                .eq('buyer_id', user.id)
                .eq('artisan_id', artisanId)

            if (error) throw error
        } else {
            // Add favorite
            const { error } = await supabase
                .from('favorite_artisans')
                .insert({
                    buyer_id: user.id,
                    artisan_id: artisanId
                })

            if (error) throw error
        }

        revalidatePath('/dashboard/favorites')
        revalidatePath(`/artisan/${artisanId}`)
        return { success: true }
    } catch (error) {
        console.error('Error toggling favorite:', error)
        return { success: false, error: 'Failed to update favorite' }
    }
}

export async function checkIsFavorite(artisanId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return false

    const { data } = await supabase
        .from('favorite_artisans')
        .select('id')
        .eq('buyer_id', user.id)
        .eq('artisan_id', artisanId)
        .single()

    return !!data
}
