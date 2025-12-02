'use client'

import { useState } from 'react'
import { Phone, Mail } from 'lucide-react'

interface PhoneInputProps {
    value: string
    onChange: (value: string) => void
    onSubmit: () => void
    loading?: boolean
    error?: string
    allowEmail?: boolean
}

export default function PhoneInput({
    value,
    onChange,
    onSubmit,
    loading = false,
    error,
    allowEmail = true
}: PhoneInputProps) {
    const [focused, setFocused] = useState(false)
    const isEmail = value.includes('@')

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && value.length >= 5) {
            onSubmit()
        }
    }

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {allowEmail ? 'Phone Number or Email' : 'Phone Number'}
                </label>
                <div className={`relative ${focused ? 'ring-2 ring-orange-500' : ''} rounded-xl transition-all`}>
                    {isEmail ? (
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    ) : (
                        <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    )}
                    <input
                        type={isEmail ? 'email' : 'tel'}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        onKeyPress={handleKeyPress}
                        placeholder={allowEmail ? '+234 803 456 7890 or email@example.com' : '+234 803 456 7890'}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none text-lg"
                        style={{ color: '#111827', WebkitTextFillColor: '#111827' }}
                        disabled={loading}
                    />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    {allowEmail
                        ? 'Enter your phone number or email to receive a verification code'
                        : 'Enter your phone number to receive a verification code'
                    }
                </p>
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            <button
                onClick={onSubmit}
                disabled={loading || value.length < 5}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                {loading ? (
                    <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                        <span>Sending code...</span>
                    </div>
                ) : (
                    'Send Verification Code'
                )}
            </button>
        </div>
    )
}
