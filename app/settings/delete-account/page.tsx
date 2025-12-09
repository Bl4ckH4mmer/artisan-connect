'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle, Trash2, Loader2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function DeleteAccountPage() {
    const router = useRouter()
    const supabase = createClient()

    const [showModal, setShowModal] = useState(false)
    const [password, setPassword] = useState('')
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState('')

    const handleDeleteRequest = () => {
        setShowModal(true)
        setError('')
        setPassword('')
    }

    const handleConfirmDelete = async () => {
        setError('')
        setDeleting(true)

        if (!password) {
            setError('Please enter your password')
            setDeleting(false)
            return
        }

        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user || !user.email) {
                setError('User not found')
                setDeleting(false)
                return
            }

            // Verify password by attempting to sign in
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: password
            })

            if (signInError) {
                setError('Incorrect password')
                setDeleting(false)
                return
            }

            // Delete user data from database (CASCADE will handle related records)
            const { error: profileError } = await supabase
                .from('user_profiles')
                .delete()
                .eq('user_id', user.id)

            if (profileError) {
                console.error('Error deleting profile:', profileError)
                // Continue anyway as we want to delete the auth user
            }

            // Delete the auth user (this will sign them out)
            const { error: deleteError } = await supabase.rpc('delete_user')

            if (deleteError) {
                // If RPC doesn't exist, try the auth method
                console.error('RPC delete failed, trying auth method:', deleteError)

                // Sign out the user
                await supabase.auth.signOut()

                setError('Account data deleted. Please contact support to complete account deletion.')
                setDeleting(false)
                return
            }

            // Success - redirect to home
            router.push('/?deleted=true')

        } catch (err: any) {
            console.error('Error deleting account:', err)
            setError(err.message || 'Failed to delete account')
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[var(--warm-bg-light)] via-white to-[#FFF8F0] py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Delete Account</h1>
                    <p className="text-gray-600 mt-2">Permanently delete your Artisan Connect account</p>
                </div>

                {/* Warning Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Warning: This action is irreversible</h2>
                            <p className="text-gray-600">
                                Deleting your account will permanently remove all your data from our servers. This cannot be undone.
                            </p>
                        </div>
                    </div>

                    {/* What will be deleted */}
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                        <h3 className="font-semibold text-gray-900 mb-3">The following data will be permanently deleted:</h3>
                        <ul className="space-y-2 text-gray-700">
                            <li className="flex items-start gap-2">
                                <span className="text-red-500 mt-1">•</span>
                                <span>Your profile information and account settings</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-500 mt-1">•</span>
                                <span>Your artisan profile and portfolio (if applicable)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-500 mt-1">•</span>
                                <span>All reviews you've written</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-500 mt-1">•</span>
                                <span>Your contact history and messages</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-500 mt-1">•</span>
                                <span>Your saved favorites and preferences</span>
                            </li>
                        </ul>
                    </div>

                    {/* Alternative options */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                        <h3 className="font-semibold text-gray-900 mb-2">Consider these alternatives:</h3>
                        <ul className="space-y-2 text-gray-700">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500 mt-1">•</span>
                                <span>Update your privacy settings instead</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500 mt-1">•</span>
                                <span>Temporarily deactivate your artisan profile (if applicable)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500 mt-1">•</span>
                                <span>Contact support if you have concerns about your account</span>
                            </li>
                        </ul>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Delete Button */}
                    <div className="flex gap-4">
                        <Link
                            href="/dashboard"
                            className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all text-center"
                        >
                            Cancel
                        </Link>
                        <button
                            onClick={handleDeleteRequest}
                            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                        >
                            <Trash2 className="w-5 h-5" />
                            Delete My Account
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Confirm Account Deletion</h3>
                            <p className="text-gray-600">
                                Enter your password to confirm you want to permanently delete your account.
                            </p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                onKeyPress={(e) => e.key === 'Enter' && handleConfirmDelete()}
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                disabled={deleting}
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={deleting || !password}
                                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {deleting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-5 h-5" />
                                        Delete Forever
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
