'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Download, Calendar, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { generateMonthlySummaryPDF } from '@/lib/admin/export'
import { logAdminAction } from '@/lib/admin/audit'
import AdminNav from '@/components/admin/AdminNav'
import { useToast } from '@/components/ui/Toast'

export default function ReportsPage() {
    const router = useRouter()
    const supabase = createClient()
    const { showToast } = useToast()

    const [generating, setGenerating] = useState(false)
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

    const months = [
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' }
    ]

    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

    const handleGenerateReport = async () => {
        setGenerating(true)
        try {
            const monthStr = selectedMonth.toString().padStart(2, '0')
            const yearStr = selectedYear.toString()

            await generateMonthlySummaryPDF(monthStr, yearStr)

            // Log the action
            await logAdminAction({
                action: 'generate_report',
                targetType: 'report',
                targetId: `${yearStr}-${monthStr}`,
                details: {
                    report_type: 'monthly_summary',
                    month: monthStr,
                    year: yearStr
                }
            })

            showToast('Report generated successfully!', 'success')
        } catch (error) {
            console.error('Error generating report:', error)
            showToast('Failed to generate report', 'error')
        } finally {
            setGenerating(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminNav />

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
                    <p className="text-gray-600">Generate and download PDF reports for analysis</p>
                </div>

                {/* Report Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Monthly Summary Report */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="p-3 bg-orange-100 rounded-lg">
                                <FileText className="w-6 h-6 text-orange-600" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-gray-900 mb-1">
                                    Monthly Summary Report
                                </h2>
                                <p className="text-sm text-gray-600">
                                    Comprehensive overview of platform activity for a specific month
                                </p>
                            </div>
                        </div>

                        {/* Report Contents */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Report Includes:</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                    New artisan registrations
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                    Review submissions and ratings
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                    Contact events and engagement
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                    Category breakdown analysis
                                </li>
                            </ul>
                        </div>

                        {/* Date Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                <Calendar className="w-4 h-4 inline mr-2" />
                                Select Period
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">Month</label>
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    >
                                        {months.map(month => (
                                            <option key={month.value} value={month.value}>
                                                {month.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">Year</label>
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    >
                                        {years.map(year => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={handleGenerateReport}
                            disabled={generating}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {generating ? (
                                <>
                                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                                    Generating Report...
                                </>
                            ) : (
                                <>
                                    <Download className="w-5 h-5" />
                                    Generate PDF Report
                                </>
                            )}
                        </button>
                    </div>

                    {/* Artisan Performance Report - Coming Soon */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 opacity-60">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-gray-900 mb-1">
                                    Artisan Performance Report
                                </h2>
                                <p className="text-sm text-gray-600">
                                    Detailed performance metrics for individual artisans
                                </p>
                            </div>
                        </div>

                        {/* Report Contents */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Report Will Include:</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                    Rating trends over time
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                    Review analysis and feedback
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                    Contact conversion rates
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                    Performance benchmarks
                                </li>
                            </ul>
                        </div>

                        {/* Coming Soon Badge */}
                        <div className="text-center py-8">
                            <span className="inline-block px-4 py-2 bg-gray-200 text-gray-600 rounded-full text-sm font-medium">
                                Coming Soon
                            </span>
                        </div>
                    </div>
                </div>

                {/* Info Section */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                        📊 About Reports
                    </h3>
                    <div className="text-sm text-blue-800 space-y-2">
                        <p>
                            <strong>Monthly Summary Reports</strong> provide a comprehensive overview of platform activity,
                            including new registrations, review submissions, contact events, and category breakdowns.
                        </p>
                        <p>
                            Reports are generated as PDF files and automatically downloaded to your device.
                            All report generation actions are logged in the audit trail for compliance.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
