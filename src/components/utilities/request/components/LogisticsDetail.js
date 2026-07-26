import CardBasedText from "@/components/cards/CardBasedText"
export default function LogisticsDetail() {
  return (
    <section className="grid gap-5">
        <div>
            <CardBasedText className='text-sm font-semibold text-gray-500'>Logistics Details</CardBasedText>
        </div>
        <div className="grid grid-cols-2 gap-5">
            <div>
                <CardBasedText className='text-sm font-semibold text-gray-500'>Batch:</CardBasedText>
                <CardBasedText className='tag-default w-fit'>1</CardBasedText>
            </div>
            <div>
                <CardBasedText className='text-sm font-semibold text-gray-500'>Quantity Allocated:</CardBasedText>
                <CardBasedText className='tag-default w-fit'>100</CardBasedText>
            </div>
            <div>
                <CardBasedText className='text-sm font-semibold text-gray-500'>Expected Returned Date:</CardBasedText>
                <CardBasedText className='tag-default w-fit'>September 27, 2004</CardBasedText>
            </div>
            <div>
                <CardBasedText className='text-sm font-semibold text-gray-500'>Dispatch Date:</CardBasedText>
                <CardBasedText className='tag-default w-fit'>September 27, 2004</CardBasedText>
            </div>
            <div>
                <CardBasedText className='text-sm font-semibold text-gray-500'>Delivered Date:</CardBasedText>
                <CardBasedText className='tag-default w-fit'>September 27, 2004</CardBasedText>
            </div>
            <div>
                <CardBasedText className='text-sm font-semibold text-gray-500'>Received Date:</CardBasedText>
                <CardBasedText className='tag-default w-fit'>September 27, 2004</CardBasedText>
            </div>
            <div>
                <CardBasedText className='text-sm font-semibold text-gray-500'>Returned Date:</CardBasedText>
                <CardBasedText className='tag-default w-fit'>September 27, 2004</CardBasedText>
            </div>
            <div>
                <CardBasedText className='text-sm font-semibold text-gray-500'>Approved By:</CardBasedText>
                <CardBasedText className='tag-default w-fit'>Joshua Garcia</CardBasedText>
            </div>
        </div>
    </section>
  )
}
