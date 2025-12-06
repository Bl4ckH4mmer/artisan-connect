'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, ShoppingBag, ArrowRight } from 'lucide-react'
import PhoneInput from '@/components/auth/PhoneInput'
import OTPVerification from '@/components/auth/OTPVerification'
import { sendOTP, verifyOTP, updateUserRole } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/client'

type Step = 'role' | 'contact' | 'otp';
type UserRole = 'artisan' | 'buyer';

export default function SignUpPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState<Step>('role')
  const [userType, setUserType] = useState<UserRole | ''>('')
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRoleSelect = (role: UserRole) => {
    setUserType(role)
    setStep('contact')
  }

  const handleGoogleAuth = async (role: UserRole) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          role: role
        }
      }
    })

    if (error) {
      console.error('Error with Google auth:', error)
      setError('Failed to connect with Google')
    }
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

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <button
                onClick={() => handleGoogleAuth('buyer')}
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

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
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