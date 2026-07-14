import GeneralCard from "@/components/cards/GeneralCard"
import CardSubHeader from "@/components/cards/CardSubHeader"
import RequestStatus from "./components/RequestStatus"
import StatusBar from "./components/StatusBar"
import CardBasedText from "@/components/cards/CardBasedText"
import LogisticsLocationMap from "./components/LogisticsLocationMap"
import RequestDetails from "./components/RequestDetails"
import WorkFlowTool from "./components/WorkFlowTool"
export default function ViewRequesDetails() {
  return (
    <GeneralCard className='grid gap-5'>
        <div className="flex justify-between items-center">
            <CardSubHeader className='text-gray-600'>Request Details</CardSubHeader>
            <RequestStatus/>
        </div>
        <div>
            <CardBasedText className='font-semibold text-gray-500'>Logistics Details</CardBasedText>
            <StatusBar/>
            <LogisticsLocationMap/>
        </div>
        <div>
            <RequestDetails/>
        </div>
        <div>
            <WorkFlowTool/>
        </div>
    </GeneralCard>
  )
}
