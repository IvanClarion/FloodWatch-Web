import GeneralCard from "@/components/cards/GeneralCard";
import CardBasedText from "@/components/cards/CardBasedText";
import CardHeader from "@/components/cards/CardHeader";
import { CheckCheck } from "lucide-react";
export default function TotalCompletedRequest() {
  return (
    <GeneralCard className='grid gap-5'>
            <div className="flex justify-between items-center">
                <div className=" text-gray-500 font-semibold">
                    <CardBasedText>Total Completed Request</CardBasedText>
                </div>
                <div className="summary-data-icon-green">
                    <CheckCheck className="size-5"/>
                </div>
            </div>
            <div className="grid gap-1">
                <CardHeader>10</CardHeader>
                <CardBasedText className='text-green-500 font-semibold text-xs'>Completed Today</CardBasedText>
            </div>
         </GeneralCard>
  )
}
