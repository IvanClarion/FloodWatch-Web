import GeneralCard from "../cards/GeneralCard"
import CardBasedText from "../cards/CardBasedText"
import CardSubHeader from "../cards/CardSubHeader"
import CardHeader from "../cards/CardHeader"
import { FileText, FileClock, BadgeCheck, BadgeAlert } from "lucide-react"
export default function SummaryData() {
  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-1 lg:gap-3">
        <GeneralCard className='grid gap-3 p-5'>
            <div className="flex justify-between items-center">
                <div className="summary-data-icon">
                    <FileText className="size-5"/>
                </div>
                <CardBasedText className='summary-data-icon text-xs px-3 font-semibold'>Total</CardBasedText>
            </div>
            <div>
                <CardBasedText className="font-semibold text-gray-500">Total Submitted</CardBasedText>
                <CardHeader>2000</CardHeader>
            </div>
            
        </GeneralCard>
         <GeneralCard className='grid gap-3 p-5'>
            <div className="flex justify-between items-center">
                <div className="summary-data-icon-amber">
                    <FileClock className="size-5"/>
                </div>
                <CardBasedText className='summary-data-icon-amber text-xs px-3 font-semibold'>Pending</CardBasedText>
            </div>
            <div>
                <CardBasedText className="font-semibold text-gray-500">Pending Verification</CardBasedText>
                <CardHeader>200</CardHeader>
            </div>
            
        </GeneralCard>
         <GeneralCard className='grid gap-3 p-5'>
            <div className="flex justify-between items-center">
                <div className="summary-data-icon-green">
                    <BadgeCheck className="size-5"/>
                </div>
                <CardBasedText className='summary-data-icon-green text-xs px-3 font-semibold'>Accepted</CardBasedText>
            </div>
            <div>
                <CardBasedText className="font-semibold text-gray-500">Total Accepted</CardBasedText>
                <CardHeader>200</CardHeader>
            </div>
            
        </GeneralCard>
         <GeneralCard className='grid gap-3 p-5'>
            <div className="flex justify-between items-center">
                <div className="summary-data-icon-red">
                    <BadgeAlert className="size-5"/>
                </div>
                <CardBasedText className='summary-data-icon-red text-xs px-3 font-semibold'>Rejected</CardBasedText>
            </div>
            <div>
                <CardBasedText className="font-semibold text-gray-500">Total Rejected</CardBasedText>
                <CardHeader>10</CardHeader>
            </div>
            
        </GeneralCard>
      
    </section>
  )
}
