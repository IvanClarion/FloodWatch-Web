"use client"
import { useState, useEffect } from "react"
import { supabase } from "@/supabase/util/supabase"
import GeneralCard from "@/components/cards/GeneralCard"
import { SquareArrowDownRight } from "lucide-react"
import CardSubHeader from "@/components/cards/CardSubHeader"
import CardBasedText from "@/components/cards/CardBasedText"

export default function LowStockListSummary() {
  const [lowStocks, setLowStocks] = useState([])

  useEffect(() => {
    const fetchLowStocks = async () => {
      const { data } = await supabase
        .from('utilities')
        .select('*')
        .lte('quantity', 3)
        .order('quantity', { ascending: true })
        .limit(20) // Limit to 20 for the summary
      
      if (data) setLowStocks(data)
    }
    fetchLowStocks()
  }, [])

  return (
     <GeneralCard className="max-h-56 py-0 px-0 overflow-y-auto relative">
        <div className="bg-white sticky top-0 p-4 z-10 border-b border-gray-100">
            <div className="flex justify-between items-center">
                <CardSubHeader>Low Stocks Alert</CardSubHeader>
                <div className="summary-data-icon-red">
                    <SquareArrowDownRight className="size-5"/>
                </div>
            </div>
        </div>
        <div className="p-1 grid gap-1">
            {lowStocks.length > 0 ? (
                lowStocks.map((item) => (
                    <div key={item.id} className="p-3 border border-gray-100 rounded-lg flex flex-col gap-1">
                        <CardBasedText className="font-semibold text-gray-800">{item.name}</CardBasedText>
                        <CardBasedText className="text-red-500 text-xs">Stock is below minimum threshold! ({item.quantity} remaining)</CardBasedText>
                    </div>
                ))
            ) : (
                <div className="p-6 text-center text-sm text-gray-400">
                    No low stock utilities.
                </div>
            )}
        </div>
    </GeneralCard>
  )
}
