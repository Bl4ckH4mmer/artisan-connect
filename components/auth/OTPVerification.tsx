'use client'

import { useState, useRef, useEffect } from 'react'
import { Shield } from 'lucide-react'

interface OTPVerificationProps {
    phoneNumber: string
    onVerify: (code: string) => void
    onResend: () => void
    loading?: boolean
    error?: string
}

export default function OTPVerification({
    phoneNumber,
    onVerify,
    onResend,
    loading = false,
    error
}: OTPVerificationProps) {
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [resendTimer, setResendTimer] = useState(60)
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    useEffect(() => {
        // Focus first input on mount
        inputRefs.current[0]?.focus()

        // Start resend timer
        const timer = setInterval(() => {
            setResendTimer((prev) => (prev > 0 ? prev - 1 : 0))
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    const handleChange = (index: number, value: string) => {
        // Only allow numbers
        if (value && !/^\d$/.test(value)) return

        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }

        // Auto-submit when all filled
        if (newOtp.every(digit => digit !== '') && index === 5) {
            onVerify(newOtp.join(''))
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData('text').slice(0, 6)
        if (!/^\d+$/.test(pastedData)) return

        const newOtp = [...otp]
        pastedData.split('').forEach((digit, i) => {
            if (i < 6) newOtp[i] = digit
        })
        setOtp(newOtp)

        // Focus last filled input
        const lastIndex = Math.min(pastedData.length - 1, 5)
        inputRefs.current[lastIndex]?.focus()

        // Auto-submit if complete
        if (pastedData.length === 6) {
            onVerify(pastedData)
        }
    }

    const handleResend = () => {
        setResendTimer(60)
        setOtp(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
        onResend()
    }

    // Helper to get className for each OTP input
    const getInputClassName = (index: number, digit: string) => {
        const isActive = focusedIndex === index && digit.length > 0
        const baseClasses = 'w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl focus:outline-none transition-all'

        if (isActive) {
            return `${baseClasses} bg-gradient-to-r from-[#C75B39] to-[#D97642] text-white border-[#C75B39]`
        }
        return `${baseClasses} border-gray-200 focus:border-blue-500`
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Verify Your Phone
                </h2>
                <p className="text-gray-600">
                    We sent a 6-digit code to<br />
                    <span className="font-semibold text-gray-900">{phoneNumber}</span>
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                    Enter Verification Code
                </label>
                <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => { inputRefs.current[index] = el }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onFocus={() => setFocusedIndex(index)}
                            onBlur={() => setFocusedIndex(null)}
                            className={getInputClassName(index, digit)}
                            disabled={loading}
                        />
                    ))}
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 text-center">{error}</p>
                </div>
            )}

            <button
                onClick={() => onVerify(otp.join(''))}
                disabled={loading || otp.some(digit => digit === '')}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                {loading ? (
                    <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                        <span>Verifying...</span>
                    </div>
                ) : (
                    'Verify Code'
                )}
            </button>

            <div className="text-center">
                {resendTimer > 0 ? (
                    <p className="text-sm text-gray-600">
                        Resend code in <span className="font-semibold text-blue-600">{resendTimer}s</span>
                    </p>
                ) : (
                    <button
                        onClick={handleResend}
                        className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                    >
                        Resend Code
                    </button>
                )}
            </div>
        </div>
    )
}
