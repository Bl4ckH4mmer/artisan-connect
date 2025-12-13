'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { toggleFavorite, checkIsFavorite } from '@/app/actions/favorites'
import { useRouter } from 'next/navigation'

interface FavoriteButtonProps {
    artisanId: string
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export default function FavoriteButton({ artisanId, size = 'md', className = '' }: FavoriteButtonProps) {
    const [isFavorite, setIsFavorite] = useState(false)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const checkStatus = async () => {
            const status = await checkIsFavorite(artisanId)
            setIsFavorite(status)
            setLoading(false)
        }
        checkStatus()
    }, [artisanId])

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        // Optimistic update
        const newState = !isFavorite
        setIsFavorite(newState)

        const result = await toggleFavorite(artisanId, !newState) // Pass old state to remove, or vice versa? 
        // Logic: if it WAS favorite (true), we want to remove (so isFavorite arg should be true)
        // My action logic: if (isFavorite) delete.
        // So passing the PREVIOUS state is correct for the action if the action expects "current state".
        // Let's re-read the action.
        // Action: `if (isFavorite) { delete } else { insert }`
        // So if I pass `true`, it deletes.
        // So I should pass the OLD state `isFavorite`.

        if (!result.success) {
            // Revert on failure
            setIsFavorite(!newState)
            console.error(result.error)
            if (result.error === 'Unauthorized') {
                router.push('/login')
            }
        }
    }

    if (loading) return (
        <button className={`animate-pulse bg-gray-200 rounded-full ${size === 'lg' ? 'w-12 h-12' : 'w-8 h-8'} ${className}`} />
    )

    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    }

    const containerSizeClasses = {
        sm: 'p-1.5',
        md: 'p-2',
        lg: 'p-3'
    }

    return (
        <button
            onClick={handleToggle}
            className={`
                group rounded-full transition-all duration-300 transform hover:scale-110
                flex items-center justify-center
                ${isFavorite
                    ? 'bg-pink-50 text-pink-500 hover:bg-pink-100'
                    : 'bg-white/80 backdrop-blur-xs text-gray-400 hover:text-pink-500 hover:bg-white'}
                ${containerSizeClasses[size]}
                ${className}
            `}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
            <Heart
                className={`
                    ${sizeClasses[size]} 
                    transition-all duration-300
                    ${isFavorite ? 'fill-current' : ''}
                `}
            />
        </button>
    )
}
