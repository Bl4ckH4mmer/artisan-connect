import Link from 'next/link'
import { MessageSquare } from 'lucide-react'

export default function MessagesPage() {
    return (
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
            <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
                <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Messages</h1>
                <p className="text-gray-600 mb-6">
                    The messaging feature is coming soon! You will be able to chat directly with artisans here.
                </p>
                <Link
                    href="/dashboard"
                    className="inline-block px-6 py-3 bg-[#C75B39] text-white rounded-xl font-medium hover:bg-[#D97642] transition-colors"
                >
                    Back to Dashboard
                </Link>
            </div>
        </div>
    )
}
