'use client'

import Link from 'next/link'
import { Home, Search, Construction } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-4 text-center">
            {/* Icon Container */}
            <div className="w-24 h-24 bg-[#FFF8F0] rounded-3xl flex items-center justify-center mb-6 shadow-sm border-2 border-[#C75B39]/10">
                <Construction className="w-12 h-12 text-[#C75B39]" />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                Page Not Found
            </h1>

            <p className="text-gray-600 text-lg max-w-md mb-8">
                Looks like the page you're looking for is currently under construction or has been moved to a new site.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                <Link
                    href="/"
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#C75B39] text-white rounded-xl hover:bg-[#B34B29] transition-all font-semibold shadow-lg shadow-[#C75B39]/20"
                >
                    <Home className="w-5 h-5" />
                    Go Home
                </Link>
                <Link
                    href="/search"
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-200 rounded-xl hover:border-[#C75B39] hover:text-[#C75B39] hover:bg-[#FFF8F0] transition-all font-semibold"
                >
                    <Search className="w-5 h-5" />
                    Find Artisan
                </Link>
            </div>

            <div className="mt-12 text-sm text-gray-400">
                Error 404
            </div>
        </div>
    )
}
