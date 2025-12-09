'use client'

import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { trackModalShown, trackModalConverted, trackModalDismissed } from '@/lib/utils/modal-tracking'

interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
    artisanId?: string
}

export default function AuthModal({ isOpen, onClose, artisanId }: AuthModalProps) {
    const router = useRouter()
    const supabase = createClient()

    // Track modal shown event
    useEffect(() => {
        if (isOpen) {
            trackModalShown(artisanId)
        }
    }, [isOpen, artisanId])

    if (!isOpen) return null

    const handleLogin = () => {
        trackModalConverted('login', artisanId)
        router.push('/login')
    }

    const handleSignup = () => {
        trackModalConverted('signup', artisanId)
        router.push('/signup')
    }

    const handleGoogleAuth = async () => {
        trackModalConverted('signup', artisanId)

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`
            }
        })

        if (error) {
            console.error('Error with Google auth:', error)
        }
    }

    const handleClose = () => {
        trackModalDismissed(artisanId)
        onClose()
    }

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50 z-10"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200 z-20">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Content */}
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🔒</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Login Required
                    </h2>
                    <p className="text-gray-600">
                        Create an account or log in to contact verified artisans
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    {/* Google OAuth Button */}
                    <button
                        onClick={handleGoogleAuth}
                        className="w-full py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or</span>
                        </div>
                    </div>

                    <button
                        onClick={handleSignup}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                        Create Account
                    </button>
                    <button
                        onClick={handleLogin}
                        className="w-full py-3 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                    >
                        Log In
                    </button>
                </div>

                {/* Benefits */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-3">With an account you can:</p>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                            <span className="text-green-500 mt-0.5">✓</span>
                            <span>Contact verified artisans directly</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-green-500 mt-0.5">✓</span>
                            <span>Leave reviews after hiring</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-green-500 mt-0.5">✓</span>
                            <span>Save your favorite artisans</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
