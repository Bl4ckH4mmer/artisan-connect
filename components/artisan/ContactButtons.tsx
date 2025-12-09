'use client'

import { useState, useEffect } from 'react'
import { Phone, MessageCircle } from 'lucide-react'
import { generateWhatsAppLink, generateCallLink, trackContactEvent } from '@/lib/utils/contact-tracking'
import { createClient } from '@/lib/supabase/client'
import { ContactType } from '@/types/contact'
import AuthModal from '@/components/auth/AuthModal'

interface ContactButtonsProps {
    artisanId: string
    artisanName: string
    phoneNumber: string
    whatsappNumber?: string
}

export default function ContactButtons({
    artisanId,
    artisanName,
    phoneNumber,
    whatsappNumber
}: ContactButtonsProps) {
    const [tracking, setTracking] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [showAuthModal, setShowAuthModal] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        setIsLoggedIn(!!user)
    }

    const handleContact = async (type: ContactType) => {
        // Check if user is logged in
        if (!isLoggedIn) {
            setShowAuthModal(true)
            return
        }

        setTracking(true)

        // Track the contact event
        await trackContactEvent(artisanId, type, supabase)

        // Open the appropriate link
        const link = type === 'whatsapp'
            ? generateWhatsAppLink(whatsappNumber || phoneNumber, artisanName)
            : generateCallLink(phoneNumber)

        window.open(link, '_blank')
        setTracking(false)
    }

    return (
        <>
            <div className="flex gap-3">
                <button
                    onClick={() => handleContact('whatsapp')}
                    disabled={tracking}
                    className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                >
                    <MessageCircle className="w-5 h-5" />
                    Chat on WhatsApp
                </button>

                <button
                    onClick={() => handleContact('call')}
                    disabled={tracking}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                >
                    <Phone className="w-5 h-5" />
                    Call Now
                </button>
            </div>

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                artisanId={artisanId}
            />
        </>
    )
}
