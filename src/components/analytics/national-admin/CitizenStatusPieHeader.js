
import PrimaryButton from "@/components/button/PrimaryButton"
import CardSubHeader from "@/components/cards/CardSubHeader"
import { ChartPie } from "lucide-react"
export default function CitizenStatusPieHeader() {
  return (
    <section className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <span className="summary-data-icon">
            <ChartPie className="size-5"/>
            </span>
            <CardSubHeader>Identification Status</CardSubHeader>
        </div>
        <PrimaryButton className='text-xs py-2 px-3'>View Request</PrimaryButton>
    </section>
  )
}
