import CardHeader from "@/components/cards/CardHeader"
import GeneralCard from "@/components/cards/GeneralCard"
import CardBasedText from "@/components/cards/CardBasedText"

import { Package } from "lucide-react"
 export default function PendingRequest() {
   return (
     <GeneralCard className='grid gap-5'>
        <div className="flex justify-between items-center">
            <div className=" text-gray-500 font-semibold">
                <CardBasedText>Pending Request</CardBasedText>
            </div>
            <div className="summary-data-icon-amber">
                <Package className="size-5"/>
            </div>
        </div>
        <div className="grid gap-1">
            <CardHeader>10</CardHeader>
            <CardBasedText className='text-amber-500 font-semibold text-xs'>Requires Attention</CardBasedText>
        </div>
     </GeneralCard>
   )
 }
 