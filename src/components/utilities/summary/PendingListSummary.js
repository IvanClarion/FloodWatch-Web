import GeneralCard from "@/components/cards/GeneralCard"
import { Package } from "lucide-react"
import CardSubHeader from "@/components/cards/CardSubHeader"
import CardBasedText from "@/components/cards/CardBasedText"
export default function PendingListSummary() {
  return (
    <GeneralCard className="max-h-52 px-0 py-0 overflow-y-auto relative">
        <div className="bg-white sticky top-0 p-4 z-10 border-b border-gray-100">
            <div className="flex justify-between items-center">
                <CardSubHeader>Pending Request</CardSubHeader>
                <div className="summary-data-icon-amber">
                    <Package className="size-5"/>
                </div>
            </div>
        </div>
        <div className="p-1 grid gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div key={item} className="p-3 border border-gray-100 rounded-lg flex flex-col gap-1">
                    <CardBasedText className="font-semibold text-gray-800">Pending Request #{item}</CardBasedText>
                    <CardBasedText className="text-gray-500 text-xs">Awaiting approval and deployment</CardBasedText>
                </div>
            ))}
        </div>
    </GeneralCard>
  )
}
