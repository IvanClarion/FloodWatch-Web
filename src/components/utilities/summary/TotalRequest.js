import GeneralCard from "@/components/cards/GeneralCard";
import CardBasedText from "@/components/cards/CardBasedText";
import CardHeader from "@/components/cards/CardHeader";
import { Boxes } from "lucide-react";
export default function TotalRequest() {
  return (
     <GeneralCard className='grid gap-5'>
        <div className="flex justify-between items-center">
            <div className=" text-gray-500 font-semibold">
                <CardBasedText>Pending Request</CardBasedText>
            </div>
            <div className="summary-data-icon">
                <Boxes className="size-5"/>
            </div>
        </div>
        <div className="grid gap-1">
            <CardHeader>10</CardHeader>
            <CardBasedText className='text-primary font-semibold text-xs'>Total Request Today</CardBasedText>
        </div>
     </GeneralCard>
  )
}
