"use client"
import AreaChartHeader from "./AreaChartHeader"
import GeneralCard from "@/components/cards/GeneralCard"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

const monthlyData = [
  { month: "Jan", accounts: 120 },
  { month: "Feb", accounts: 150 },
  { month: "Mar", accounts: 210 },
  { month: "Apr", accounts: 180 },
  { month: "May", accounts: 320 }, 
  { month: "Jun", accounts: 250 },
  { month: "Jul", accounts: 280 },
  { month: "Aug", accounts: 390 },
  { month: "Sep", accounts: 410 },
  { month: "Oct", accounts: 350 },
  { month: "Nov", accounts: 290 },
  { month: "Dec", accounts: 190 },
]

export default function AreaCharts() {
  return (
    <GeneralCard>
        <div className="flex flex-col h-full w-full">
            <AreaChartHeader/>
            <div className="h-[300px] w-full mt-6">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={monthlyData}
                        margin={{
                            top: 10,
                            right: 10,
                            left: -20,
                            bottom: 0,
                        }}
                    >
                        <defs>
                            <linearGradient id="colorAccounts" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" strokeOpacity={0.5} />
                        <XAxis 
                            dataKey="month" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                        />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: '#111827', 
                                borderColor: '#374151', 
                                borderRadius: '8px', 
                                color: '#f9fafb',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                            }}
                            itemStyle={{ color: '#3b82f6', fontWeight: 600 }}
                            cursor={{ stroke: '#374151', strokeWidth: 1, strokeDasharray: '3 3' }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="accounts" 
                            stroke="#3b82f6" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorAccounts)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    </GeneralCard>
  )
}
