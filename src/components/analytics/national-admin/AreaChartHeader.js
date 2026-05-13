import CardBasedText from "@/components/cards/CardBasedText"
import CardHeader from "@/components/cards/CardHeader"
import CardSubHeader from "@/components/cards/CardSubHeader"
import PrimaryButton from "@/components/button/PrimaryButton"
import { ChartLine, ChartNoAxesColumn } from "lucide-react"
export default function AreaChartHeader() {
  return (
    <section className="grid gap-3">
      <div className="flex justify-between">
      <div className="flex items-center gap-2">
        <span className="summary-data-icon">
        <ChartLine className="size-5"/>
        </span>
        <CardSubHeader>Citizen's Growth </CardSubHeader>
      </div>
      <div>
        
          <PrimaryButton className="flex gap-2 text-xs items-center"> <ChartNoAxesColumn className="size-5"/> History</PrimaryButton>
      </div>
      </div>
      <div className="text-gray-500">
        <CardBasedText>This chart shows trend on every citizens registered in every year</CardBasedText>
      </div>
    </section>
  )
}
