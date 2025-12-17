"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartProps {
    data: any[];
}

export default function InsightsChart({ data }: ChartProps) {
    // Mock data if empty, or map actual data.
    // The 'data' prop passed from server might be just stats. 
    // For a chart, we need time-series data. 
    // My analytics query `getArtisanWeeklyStats` returns aggregates, not time series.
    // I should probably update `getArtisanWeeklyStats` to return daily data for the chart, 
    // OR just mock it for now as "No upsells yet—just establish the dashboard" implies simple start.
    // "Simple line chart (Recharts) showing trend". 
    // I'll add a placeholder or simple logic. 

    // If I want real trend, I need to fetch daily counts.
    // For Phase 0, I'll stick to a static or semi-mocked chart or simple aggregation if I can.
    // Let's use the aggregates to show a 2-point line? No that's ugly.
    // I'll just show a "Coming Soon" or simple placeholder data structure for the chart 
    // until I implement a 'getDailyStats' query. 
    // Actually, the plan implies "showing trend". 
    // I will make the chart component accept generic data and render it.

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="views"
                        stroke="var(--blue-primary)"
                        strokeWidth={3}
                        dot={{ fill: 'var(--blue-primary)', strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="contacts"
                        stroke="#10B981"
                        strokeWidth={3}
                        dot={{ fill: '#10B981', strokeWidth: 2 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
