'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Pause, Play } from 'lucide-react'

interface AvailabilityToggleProps {
    artisanId: string | undefined
    initialStatus: 'pending' | 'active' | 'suspended' | 'paused'
}

export default function AvailabilityToggle({ artisanId, initialStatus }: AvailabilityToggleProps) {
    const [status, setStatus] = useState(initialStatus)
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const isAvailable = status === 'active'

    const toggleAvailability = async () => {
        if (!artisanId) return

        setLoading(true)
        const newStatus = isAvailable ? 'paused' : 'active'

        const { error } = await supabase
            .from('artisan_profiles')
            .update({ status: newStatus })
            .eq('id', artisanId)

        if (!error) {
            setStatus(newStatus)
        } else {
            console.error('Failed to update status:', error)
        }

        setLoading(false)
    }

    // Don't show toggle for pending/suspended artisans
    if (status === 'pending' || status === 'suspended') {
        return (
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg">
                <span className="text-sm font-medium">
                    {status === 'pending' ? 'Verification Pending' : 'Account Suspended'}
                </span>
            </div>
        )
    }

    return (
        <button
            onClick={toggleAvailability}
            disabled={loading}
            className={`flex items-center gap-3 px-5 py-3 rounded-xl font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-50 ${isAvailable
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-500 text-white hover:bg-gray-600'
                }`}
        >
            {isAvailable ? (
                <>
                    <Play className="w-5 h-5" />
                    <div className="text-left">
                        <p className="text-sm font-semibold">Available</p>
                        <p className="text-xs opacity-80">Click to pause</p>
                    </div>
                </>
            ) : (
                <>
                    <Pause className="w-5 h-5" />
                    <div className="text-left">
                        <p className="text-sm font-semibold">Paused</p>
                        <p className="text-xs opacity-80">Click to go live</p>
                    </div>
                </>
            )}
        </button>
    )
}
