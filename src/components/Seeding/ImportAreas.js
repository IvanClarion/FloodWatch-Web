import GeneralCard from "../cards/GeneralCard"
import CardHeader from "../cards/CardHeader"
import CardSubHeader from "../cards/CardSubHeader"
import CardBasedText from "../cards/CardBasedText"
import PrimaryButton from "../button/PrimaryButton"
import SecondaryButton from "../button/SecondaryButton"
import { MapPinned } from "lucide-react"
import Link from "next/link"
export default function ImportAreas() {
  return (
    <section >
    <GeneralCard className="grid gap-5">
        <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
            {/* Left: text + buttons */}
            <div className="flex flex-col gap-4">
                <div>
                    <CardHeader>Geographic Map</CardHeader>
                    <CardBasedText className='text-gray-500 max-w-xs'>Refresh your local database by importing regional CSV files.</CardBasedText>
                </div>
                <div className="flex gap-2 items-center">
                    <Link href="/national-admin/map" className='btn-primary'>View Map</Link>
                    <Link href="?history=true">
                        <SecondaryButton>View History</SecondaryButton>
                    </Link>
                </div>
            </div>

            {/* Right: icon */}
            <div className="summary-data-icon self-center p-5">
                <MapPinned size={30} />
            </div>
        </div>
    </GeneralCard>
    </section>
  )
}
