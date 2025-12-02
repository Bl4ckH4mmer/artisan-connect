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

export default function AnalyticsCharts({
    artisanGrowth,
    reviewSubmissions,
    contactEvents,
    categoryBreakdown
}: AnalyticsChartsProps) {
    return (
        <div className="space-y-6">
            {/* Artisan Growth - Line Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Artisan Growth (Last 30 Days)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={artisanGrowth}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="name"
                            stroke="#6b7280"
                            style={{ fontSize: '12px' }}
                        />
                        <YAxis
                            stroke="#6b7280"
                            style={{ fontSize: '12px' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#f97316"
                            strokeWidth={2}
                            dot={{ fill: '#f97316', r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Review Submissions - Bar Chart */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Review Submissions</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={reviewSubmissions}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="name"
                                stroke="#6b7280"
                                style={{ fontSize: '12px' }}
                            />
                            <YAxis
                                stroke="#6b7280"
                                style={{ fontSize: '12px' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px'
                                }}
                            />
                            <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Contact Events - Area Chart */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Events</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={contactEvents}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="name"
                                stroke="#6b7280"
                                style={{ fontSize: '12px' }}
                            />
                            <YAxis
                                stroke="#6b7280"
                                style={{ fontSize: '12px' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px'
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

            {/* Category Breakdown - Pie Chart */}
            {categoryBreakdown.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Artisans by Category</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={categoryBreakdown}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => percent ? `${name} (${(percent * 100).toFixed(0)}%)` : name}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {categoryBreakdown.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    )
}
