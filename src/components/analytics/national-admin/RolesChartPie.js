"use client"

import GeneralCard from "@/components/cards/GeneralCard"
import { Label, Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from "recharts"
import { useMemo } from "react"
import RolesChartPieHeader from "./RolesChartPieHeader"
import CardBasedText from "@/components/cards/CardBasedText"
import { UserRound, HatGlasses,BinocularsIcon, ShieldUser } from "lucide-react"
import CardHeader from "@/components/cards/CardHeader"

const RoleData = [
  { role: "Provincial Admin", total: 10, fill: "#3b82f6" },
  { role: "Citizens", total: 100, fill: "#10b981" },
  { role: "Headmaster", total: 25, fill: "#f59e0b" },
  { role: "Frontliners", total: 50, fill: "#6366f1" }
]

export default function RolesChartPie() {
  const totalUsers = useMemo(() => {
    return RoleData.reduce((acc, curr) => acc + curr.total, 0)
  }, [])

  return (
    <GeneralCard>
      <div className="flex flex-col h-full w-full">
        <RolesChartPieHeader/>
        <div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-4">
          {RoleData.map((item) => (
            <div key={item.role} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.fill }}
              ></div>
              <span className="text-sm text-gray-300 font-medium">{item.role}</span>
            </div>
          ))}
        </div>
        </div>
        <div className="h-[250px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#111827', 
                  borderColor: '#374151', 
                  borderRadius: '8px', 
                  color: '#f9fafb',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
                itemStyle={{ color: '#f9fafb', fontWeight: 500 }}
              />
              <Pie
                data={RoleData}
                dataKey="total"
                nameKey="role"
                innerRadius={65}
                outerRadius={100}
                
              >
                {RoleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy - 5}
                            className=" text-3xl font-bold"
                          >
                            {totalUsers.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 22}
                            className="fill-gray-400 text-sm font-medium"
                          >
                            Total Users
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Custom Legend */}
        <section className="grid gap-5">
        
        <div className="grid justify-center grid-cols-2 gap-x-2 gap-y-5">
            <div>
                <div className="flex items-start gap-2">
                    <span className="summary-data-icon">
                    <HatGlasses className="size-5"/>
                    </span>
                    <div className="flex-col flex items-center">
                    <CardBasedText className='font-semibold'>Provincial Admin</CardBasedText>
                    <CardHeader className='text-primary'>{RoleData[0].total}</CardHeader>
                    </div>
                </div>
            </div>
            <div>
                <div className="flex items-start gap-2">
                    <span className="summary-data-icon-green">
                    <UserRound className="size-5"/>
                    </span>
                    <div className="flex-col flex items-center">
                    <CardBasedText className='font-semibold'>Citizens</CardBasedText>
                    <CardHeader className='text-green-500'>{RoleData[1].total}</CardHeader>
                    </div>
                </div>
            </div>
             <div>
                <div className="flex items-start gap-2">
                    <span className="summary-data-icon-amber">
                    <ShieldUser className="size-5"/>
                    </span>
                    <div className="flex-col flex items-center">
                    <CardBasedText className='font-semibold'>LGU Headmaster</CardBasedText>
                    <CardHeader className='text-amber-500'>{RoleData[2].total}</CardHeader>
                    </div>
                </div>
            </div>
             <div>
                <div className="flex items-start gap-2">
                    <span className="summary-data-icon-purple">
                    <BinocularsIcon className="size-5"/>
                    </span>
                    <div className="flex-col flex items-center">
                    <CardBasedText className='font-semibold'>LGU Frontliners</CardBasedText>
                    <CardHeader className='text-purple-500'>{RoleData[3].total}</CardHeader>
                    </div>
                </div>
            </div>
        </div>
        </section>
      </div>
      
    </GeneralCard>
  )
}
