import CardBasedText from "@/components/cards/CardBasedText"
import CardHeader from "@/components/cards/CardHeader"
export default function RequestDetails() {
  return (
    <section className="grid gap-5">
        <div className="flex items-center justify-between">
        <CardBasedText className="text-gray-500 font-semibold">Item Details</CardBasedText>
        <div className="flex items-center gap-1 font-semibold">
            <CardBasedText className='text-gray-500 text-xs'>Request Id#:</CardBasedText>
            <CardBasedText className="text-gray-500 text-xs">FW-REQ-2026-001</CardBasedText>
        </div>
        </div>
        <div className="grid grid-cols-2 gap-5">
            <div className="grid gap-1">
            <CardBasedText className='text-gray-500 font-semibold'>Requested Items:</CardBasedText>
            <CardBasedText className='tag-default w-fit'>Honda Civic</CardBasedText>
            </div>
            <div className="grid gap-1">
            <CardBasedText className='text-gray-500 font-semibold'>Quantity:</CardBasedText>
            <CardBasedText className='tag-default w-fit'>200</CardBasedText>
            </div>
            <div className="grid gap-1">
            <CardBasedText className='text-gray-500 font-semibold'>Drop Off Address:</CardBasedText>
            <CardBasedText className='tag-default w-fit'>Liong, Dumanjug, Cebu</CardBasedText>
            </div>
            <div className="grid gap-1">
            <CardBasedText className='text-gray-500 font-semibold'>Expected Returned Date:</CardBasedText>
            <CardBasedText className='tag-default w-fit'>September 27, 2004</CardBasedText>
            </div>
        </div>
    </section>
  )
}
