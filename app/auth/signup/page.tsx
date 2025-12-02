'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, ShoppingBag, ArrowRight } from 'lucide-react'
import PhoneInput from '@/components/auth/PhoneInput'
import OTPVerification from '@/components/auth/OTPVerification'
import { sendOTP, verifyOTP, updateUserRole } from '@/lib/supabase/auth'

type Step = 'role' | 'contact' | 'otp';
type UserRole = 'artisan' | 'buyer';

export default function SignUpPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('role')
  const [userType, setUserType] = useState<UserRole | ''>('')
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRoleSelect = (role: UserRole) => {
    setUserType(role)
    setStep('contact')
  }

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
      // Update user role
      await updateUserRole(userType as UserRole)

      // Redirect based on role
      if (userType === 'artisan') {
        router.push('/artisan/onboard')
      } else {
        router.push('/search')
      }
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl">👤</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {step === 'role' ? 'Create Account' : step === 'contact' ? 'Enter Your Contact' : 'Verify Code'}
          </h1>
          <p className="text-gray-600">
            {step === 'role' ? 'Join Artisan Connect today' : step === 'contact' ? 'Use email or phone number' : 'Complete your registration'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 'role' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">I am a...</h2>

              <button
                onClick={() => handleRoleSelect('artisan')}
                className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🎨</span>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">Artisan</div>
                      <div className="text-sm text-gray-500">Offer your services</div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect('buyer')}
                className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-amber-500 hover:bg-amber-50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🛍️</span>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">Buyer</div>
                      <div className="text-sm text-gray-500">Find local artisans</div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </button>
            </div>
          )}

          {step === 'contact' && (
            <div>
              <button
                onClick={() => setStep('role')}
                className="text-gray-600 hover:text-gray-900 text-sm mb-6"
              >
                ← Back
              </button>
              <PhoneInput
                value={emailOrPhone}
                onChange={setEmailOrPhone}
                onSubmit={handleSendOTP}
                loading={loading}
                error={error}
                allowEmail={true}
              />
            </div>
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

        <div className="text-center mt-6">
          <a href="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}