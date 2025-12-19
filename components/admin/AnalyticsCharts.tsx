'use client'

import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface ChartData {
    name: string
    value: number
    [key: string]: any
}

interface AnalyticsChartsProps {
    artisanGrowth: ChartData[]
    reviewSubmissions: ChartData[]
    contactEvents: ChartData[]
    categoryBreakdown: ChartData[]
}

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6', '#f43f5e']

// Format date for display
const formatDateTick = (value: string) => {
    const date = new Date(value)
    return `${date.getMonth() + 1}/${date.getDate()}`
}

export default function AnalyticsCharts({
    artisanGrowth,
    reviewSubmissions,
    contactEvents,
    categoryBreakdown
}: AnalyticsChartsProps) {
    // Calculate tick interval based on data length
    const tickInterval = artisanGrowth.length > 14 ? Math.floor(artisanGrowth.length / 7) : 0

    return (
        <div className="space-y-6">
            {/* Artisan Growth - Line Chart */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 overflow-hidden">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Artisan Growth (Last 30 Days)</h3>
                <div className="w-full overflow-x-auto">
                    <div className="min-w-0">
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={artisanGrowth} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="name"
                                    stroke="#6b7280"
                                    tick={{ fontSize: 10 }}
                                    tickMargin={5}
                                    interval={tickInterval}
                                    tickFormatter={formatDateTick}
                                />
                                <YAxis
                                    stroke="#6b7280"
                                    tick={{ fontSize: 10 }}
                                    width={30}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        fontSize: '12px'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#f97316"
                                    strokeWidth={2}
                                    dot={{ fill: '#f97316', r: 3 }}
                                    activeDot={{ r: 5 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Review Submissions - Bar Chart */}
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 overflow-hidden">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Review Submissions</h3>
                    <div className="w-full overflow-x-auto">
                        <div className="min-w-0">
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={reviewSubmissions} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#6b7280"
                                        tick={{ fontSize: 9 }}
                                        tickMargin={5}
                                        interval={tickInterval}
                                        tickFormatter={formatDateTick}
                                    />
                                    <YAxis
                                        stroke="#6b7280"
                                        tick={{ fontSize: 10 }}
                                        width={25}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            fontSize: '12px'
                                        }}
                                    />
                                    <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Contact Events - Area Chart */}
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 overflow-hidden">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Contact Events</h3>
                    <div className="w-full overflow-x-auto">
                        <div className="min-w-0">
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={contactEvents} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#6b7280"
                                        tick={{ fontSize: 9 }}
                                        tickMargin={5}
                                        interval={tickInterval}
                                        tickFormatter={formatDateTick}
                                    />
                                    <YAxis
                                        stroke="#6b7280"
                                        tick={{ fontSize: 10 }}
                                        width={25}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            fontSize: '12px'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#8b5cf6"
                                        fill="#8b5cf6"
                                        fillOpacity={0.2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Breakdown - Pie Chart */}
            {categoryBreakdown.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 overflow-hidden">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Artisans by Category</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={categoryBreakdown}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => {
                                    if (!name || !percent || percent < 0.05) return ''
                                    const displayName = name.length > 8 ? `${name.substring(0, 8)}...` : name
                                    return `${displayName} (${(percent * 100).toFixed(0)}%)`
                                }}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                style={{ fontSize: '10px' }}
                            >
                                {categoryBreakdown.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend wrapperStyle={{ fontSize: '11px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    )
}

