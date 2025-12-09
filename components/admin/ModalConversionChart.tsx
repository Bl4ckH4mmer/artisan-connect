'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface ModalConversionChartProps {
    data: {
        date: string
        shown: number
        converted: number
        dismissed: number
    }[]
}

export default function ModalConversionChart({ data }: ModalConversionChartProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Auth Modal Conversion Funnel</h3>

            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey="date"
                        stroke="#9ca3af"
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        style={{ fontSize: '12px' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px'
                        }}
                    />
                    <Legend />
                    <Area
                        type="monotone"
                        dataKey="shown"
                        stackId="1"
                        stroke="#3b82f6"
                        fill="#93c5fd"
                        name="Modal Shown"
                    />
                    <Area
                        type="monotone"
                        dataKey="converted"
                        stackId="2"
                        stroke="#10b981"
                        fill="#34d399"
                        name="Converted"
                    />
                    <Area
                        type="monotone"
                        dataKey="dismissed"
                        stackId="3"
                        stroke="#ef4444"
                        fill="#f87171"
                        name="Dismissed"
                    />
                </AreaChart>
            </ResponsiveContainer>

            <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                        {data.reduce((sum, d) => sum + d.shown, 0)}
                    </div>
                    <div className="text-xs text-gray-600">Total Shown</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                        {data.reduce((sum, d) => sum + d.converted, 0)}
                    </div>
                    <div className="text-xs text-gray-600">Converted</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                        {data.reduce((sum, d) => sum + d.dismissed, 0)}
                    </div>
                    <div className="text-xs text-gray-600">Dismissed</div>
                </div>
            </div>
        </div>
    )
}
