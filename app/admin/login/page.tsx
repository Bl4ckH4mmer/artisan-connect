'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield } from 'lucide-react'
import PhoneInput from '@/components/auth/PhoneInput'
import OTPVerification from '@/components/auth/OTPVerification'
import { sendOTP, verifyOTP, updateUserRole } from '@/lib/supabase/auth'

type Step = 'contact' | 'otp';

export default function AdminLoginPage() {
    const router = useRouter()
    const [step, setStep] = useState<Step>('contact')
    const [emailOrPhone, setEmailOrPhone] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSendOTP = async () => {
        setError('')
        setLoading(true)

        const response = await sendOTP(emailOrPhone)

        if (response.success) {
            setStep('otp')
        } else {
            setError(response.error || 'Failed to send verification code')
        }

        setLoading(false)
    }

    const handleVerifyOTP = async (code: string) => {
        setError('')
        setLoading(true)

        const response = await verifyOTP(emailOrPhone, code)

        if (response.success) {
            // Set user as admin
            await updateUserRole('admin')

            // Redirect to admin dashboard
            router.push('/admin/dashboard')
        } else {
            setError(response.error || 'Invalid verification code')
        }

        setLoading(false)
    }

    const handleResendOTP = async () => {
        setError('')
        await sendOTP(emailOrPhone)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl mb-4 shadow-lg">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Admin Login
                    </h1>
                    <p className="text-gray-600">
                        {step === 'contact' ? 'Enter your email or phone' : 'Verify your code'}
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <strong>Admin Access:</strong> This login automatically grants admin privileges.
                            Use a separate email/phone from your artisan test accounts.
                        </p>
                    </div>

                    {step === 'contact' && (
                        <PhoneInput
                            value={emailOrPhone}
                            onChange={setEmailOrPhone}
                            onSubmit={handleSendOTP}
                            loading={loading}
                            error={error}
                            allowEmail={true}
                        />
                    )}

                    {step === 'otp' && (
                        <div>
                            <button
                                onClick={() => setStep('contact')}
                                className="text-gray-600 hover:text-gray-900 text-sm mb-6"
                            >
                                ← Change contact
                            </button>
                            <OTPVerification
                                phoneNumber={emailOrPhone}
                                onVerify={handleVerifyOTP}
                                onResend={handleResendOTP}
                                loading={loading}
                                error={error}
                            />
                        </div>
                    )}
                </div>

                <div className="text-center mt-6 space-y-2">
                    <a href="/auth/signup" className="block text-sm text-gray-600 hover:text-gray-900">
                        Regular Signup (Artisan/Buyer) →
                    </a>
                    <a href="/" className="block text-sm text-gray-600 hover:text-gray-900">
                        ← Back to Home
                    </a>
                </div>
            </div>
        </div>
    )
}
