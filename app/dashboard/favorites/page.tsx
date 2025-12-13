'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArtisanProfile } from '@/types/artisan'
import ArtisanCard from '@/components/search/ArtisanCard'
import { Heart } from 'lucide-react'
import Link from 'next/link'

export default function SavedArtisansPage() {
    const [favorites, setFavorites] = useState<ArtisanProfile[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchFavorites()
    }, [])

    const fetchFavorites = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Step 1: Get favorite IDs
            const { data: favoriteIds, error: favError } = await supabase
                .from('favorite_artisans')
                .select('artisan_id')
                .eq('buyer_id', user.id)

            if (favError) throw favError

            if (!favoriteIds || favoriteIds.length === 0) {
                setFavorites([])
                return
            }

            const artisanIds = favoriteIds.map(f => f.artisan_id)

            // Step 2: Fetch profiles for these IDs
            const { data: profiles, error: profileError } = await supabase
                .from('artisan_profiles')
                .select('*')
                .in('id', artisanIds)

            if (profileError) throw profileError

            setFavorites(profiles || [])
        } catch (error) {
            console.error('Error fetching favorites:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FAF7F2] p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Saved Artisans</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-96 bg-gray-200 rounded-xl animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#FAF7F2] p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-pink-100 rounded-lg">
                        <Heart className="w-6 h-6 text-pink-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Saved Artisans</h1>
                        <p className="text-gray-600">Your collection of favorite artisans</p>
                    </div>
                </div>



                {favorites.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No saved artisans yet</h3>
                        <p className="text-gray-600 mb-6">
                            Browse artisans and click the heart icon to save them for later.
                        </p>
                        <Link
                            href="/search"
                            className="inline-flex items-center px-6 py-3 bg-[#C75B39] text-white rounded-xl hover:bg-[#D97642] transition-colors font-medium"
                        >
                            Browse Artisans
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favorites.map((artisan) => (
                            <ArtisanCard key={artisan.id} artisan={artisan} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
