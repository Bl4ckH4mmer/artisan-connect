'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'

interface AnalyticsWidgetProps {
    title: string
    value: number | string
    icon: React.ReactNode
    trend?: {
        value: number
        isPositive: boolean
    }
    color: 'blue' | 'orange' | 'green' | 'red' | 'purple' | 'indigo' | 'cyan'
}

const colorClasses = {
    blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
        border: 'border-blue-500'
    },
    orange: {
        bg: 'bg-orange-100',
        text: 'text-orange-600',
        border: 'border-orange-500'
    },
    green: {
        bg: 'bg-green-100',
        text: 'text-green-600',
        border: 'border-green-500'
    },
    red: {
        bg: 'bg-red-100',
        text: 'text-red-600',
        border: 'border-red-500'
    },
    purple: {
        bg: 'bg-purple-100',
        text: 'text-purple-600',
        border: 'border-purple-500'
    },
    indigo: {
        bg: 'bg-indigo-100',
        text: 'text-indigo-600',
        border: 'border-indigo-500'
    },
    cyan: {
        bg: 'bg-cyan-100',
        text: 'text-cyan-600',
        border: 'border-cyan-500'
    }
}

export default function AnalyticsWidget({ title, value, icon, trend, color }: AnalyticsWidgetProps) {
    const colors = colorClasses[color]

    return (
        <div className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${colors.border}`}>
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 ${colors.bg} rounded-lg`}>
                    <div className={colors.text}>
                        {icon}
                    </div>
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {trend.isPositive ? (
                            <TrendingUp className="w-4 h-4" />
                        ) : (
                            <TrendingDown className="w-4 h-4" />
                        )}
                        {Math.abs(trend.value)}%
                    </div>
                )}
            </div>
            <p className="text-gray-600 text-sm mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
    )
}
