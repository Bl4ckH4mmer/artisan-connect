'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useInputGradient } from '@/lib/hooks/useInputGradient'

// Helper to get input class based on focus state
const getInputClassName = (fieldName: string, value: string, focusedField: string | null) => {
    const isActive = focusedField === fieldName && value.length > 0
    const baseClasses = 'w-full px-4 py-3 border rounded-xl focus:outline-none transition-all'

    if (isActive) {
        return `${baseClasses} bg-gradient-to-r from-[#C75B39] to-[#D97642] text-white border-[#C75B39] placeholder-white/60`
    }
    return `${baseClasses} border-gray-300 focus:ring-2 focus:ring-[var(--warm-primary)] focus:border-transparent`
}

export default function SignupPage() {
    const router = useRouter()
    const supabase = createClient()
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [focusedField, setFocusedField] = useState<string | null>(null)

    const handleEmailSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            setLoading(false)
            return
        }

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
                emailRedirectTo: `${window.location.origin}/auth/callback`
            }
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            setSuccess(true)
        }
    }

    const handleGoogleSignup = async () => {
        setLoading(true)
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`
            }
        })
        if (error) {
            setError(error.message)
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[var(--warm-bg-light)] via-white to-[#FFF8F0] flex items-center justify-center p-4">
                <div className="w-full max-w-md text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                        <span className="text-4xl">✉️</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Check Your Email</h1>
                    <p className="text-gray-600 mb-6">
                        We&apos;ve sent a confirmation link to <strong>{email}</strong>.
                        Please click the link to verify your account.
                    </p>
                    <Link
                        href="/login"
                        className="inline-block px-6 py-3 bg-gradient-to-r from-[var(--warm-primary)] to-[var(--warm-secondary)] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[var(--warm-bg-light)] via-white to-[#FFF8F0] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[var(--warm-primary)] to-[var(--warm-secondary)] rounded-2xl mb-4 shadow-lg">
                        <span className="text-3xl">🎨</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Get Started</h1>
                    <p className="text-gray-600">Create your Artisan Connect account</p>
                </div>

                {/* Signup Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Google OAuth */}
                    <button
                        onClick={handleGoogleSignup}
                        disabled={loading}
                        className="w-full py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-3 mb-4 disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or sign up with email</span>
                        </div>
                    </div>

                    <form onSubmit={handleEmailSignup} className="space-y-4">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                            </label>
                            <input
                                id="fullName"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                onFocus={() => setFocusedField('fullName')}
                                onBlur={() => setFocusedField(null)}
                                required
                                className={getInputClassName('fullName', fullName, focusedField)}
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                                required
                                className={getInputClassName('email', email, focusedField)}
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                                required
                                className={getInputClassName('password', password, focusedField)}
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                onFocus={() => setFocusedField('confirmPassword')}
                                onBlur={() => setFocusedField(null)}
                                required
                                className={getInputClassName('confirmPassword', confirmPassword, focusedField)}
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-[var(--warm-primary)] to-[var(--warm-secondary)] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-gray-600 text-sm">
                        By signing up, you agree to our{' '}
                        <Link href="/terms" className="text-[var(--warm-primary)] hover:underline">Terms of Service</Link>
                        {' '}and{' '}
                        <Link href="/privacy" className="text-[var(--warm-primary)] hover:underline">Privacy Policy</Link>
                    </p>

                    <p className="mt-4 text-center text-gray-600">
                        Already have an account?{' '}
                        <Link href="/login" className="text-[var(--warm-primary)] font-semibold hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
