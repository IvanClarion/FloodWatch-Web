"use client"
import { useState } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import GeneralCard from "@/components/cards/GeneralCard"
import CardHeader from "@/components/cards/CardHeader"
import CardBasedText from "@/components/cards/CardBasedText"
import DropwDown from '@/components/button/DropwDown'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

// Static data for "this month"
const data = [
  { date: 'Jul 1', utilities: 120, request: 40 },
  { date: 'Jul 5', utilities: 132, request: 35 },
  { date: 'Jul 10', utilities: 155, request: 55 },
  { date: 'Jul 15', utilities: 143, request: 48 },
  { date: 'Jul 20', utilities: 190, request: 70 },
  { date: 'Jul 25', utilities: 180, request: 60 },
  { date: 'Jul 31', utilities: 210, request: 50 },
]

export default function UtilitiesAreaChartTracker() {
  const [selectedMonth, setSelectedMonth] = useState('July')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <GeneralCard className="w-full h-[450px] flex flex-col gap-5 p-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <CardHeader>Utilities & Requests Tracker</CardHeader>
          <CardBasedText className="text-gray-500">Overview of total utilities and pending requests for this month</CardBasedText>
        </div>
        <div className="relative">
          <DropwDown type="button" onClick={() => setDropdownOpen((o) => !o)}>
            {selectedMonth}
          </DropwDown>
          {dropdownOpen && (
            <div className="absolute right-0 z-10 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-md max-h-48 overflow-y-auto">
              {MONTHS.map((month) => (
                <button
                  key={month}
                  type="button"
                  onClick={() => { setSelectedMonth(month); setDropdownOpen(false) }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors"
                >
                  {month}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 w-full h-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorUtilities" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0035A9" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#0035A9" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorRequest" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#6b7280', fontSize: 12}} 
                dy={10} 
            />
            <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#6b7280', fontSize: 12}} 
            />
            <Tooltip 
                contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontWeight: 600 }}
                labelStyle={{ color: '#374151', fontWeight: 700, marginBottom: '4px' }}
            />
            <Legend 
                verticalAlign="top" 
                height={36} 
                wrapperStyle={{ fontSize: '14px', paddingBottom: '20px' }} 
                iconType="circle" 
            />
            <Area 
                type="monotone" 
                dataKey="utilities" 
                stroke="#0035A9" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorUtilities)" 
                name="Total Utilities"
                activeDot={{ r: 6, fill: '#0035A9', stroke: '#fff', strokeWidth: 2 }}
            />
            <Area 
                type="monotone" 
                dataKey="request" 
                stroke="#f59e0b" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRequest)" 
                name="Pending Requests"
                activeDot={{ r: 6, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GeneralCard>
  )
}
