'use client'

import { useState, useEffect } from 'react'
import { Phone } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface PhoneDisplayProps {
    phoneNumber: string
}

export default function PhoneDisplay({ phoneNumber }: PhoneDisplayProps) {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function checkAuth() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            setIsLoggedIn(!!user)
            setIsLoading(false)
        }
        checkAuth()
    }, [])

    const displayPhoneNumber = isLoggedIn
        ? phoneNumber
        : phoneNumber.replace(/\d(?=\d{4})/g, '*')

    if (isLoading) {
        return (
            <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-start gap-2">
            <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
                <p className="text-sm text-gray-600">Phone</p>
                {isLoggedIn ? (
                    <a
                        href={`tel:${phoneNumber}`}
                        className="font-medium text-[#C75B39] hover:text-[#D97642]"
                    >
                        {displayPhoneNumber}
                    </a>
                ) : (
                    <div>
                        <p className="font-medium text-gray-900">{displayPhoneNumber}</p>
                        <p className="text-xs text-[#C75B39] mt-1">Login to view full number</p>
                    </div>
                )}
            </div>
        </div>
    )
}
