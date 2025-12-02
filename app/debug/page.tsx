'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DebugPage() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            setLoading(false)
        }
        getUser()
    }, [])

    if (loading) return <div className="p-8">Loading...</div>

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
                <h1 className="text-2xl font-bold mb-4">Debug User Info</h1>

                {user ? (
                    <div className="space-y-4">
                        <div>
                            <h2 className="font-semibold text-gray-700">User ID:</h2>
                            <code className="bg-gray-100 p-1 rounded">{user.id}</code>
                        </div>

                        <div>
                            <h2 className="font-semibold text-gray-700">Email:</h2>
                            <code className="bg-gray-100 p-1 rounded">{user.email}</code>
                        </div>

                        <div>
                            <h2 className="font-semibold text-gray-700">Role (Metadata):</h2>
                            <code className="bg-gray-100 p-1 rounded text-lg font-bold text-blue-600">
                                {user.user_metadata?.role || 'No role set'}
                            </code>
                        </div>

                        <div>
                            <h2 className="font-semibold text-gray-700">Full Metadata:</h2>
                            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm mt-2">
                                {JSON.stringify(user.user_metadata, null, 2)}
                            </pre>
                        </div>

                        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h3 className="font-bold text-blue-800 mb-2">How to fix Admin Access:</h3>
                            <p className="text-sm text-blue-700 mb-2">
                                If Role is not <strong>"admin"</strong>, run this SQL in Supabase:
                            </p>
                            <pre className="bg-white p-2 rounded border border-blue-200 text-xs overflow-x-auto">
                                {`UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE id = '${user.id}';`}
                            </pre>
                        </div>
                    </div>
                ) : (
                    <div className="text-red-500 font-bold">
                        No user logged in. Please sign up or log in first.
                    </div>
                )}
            </div>
        </div>
    )
}
