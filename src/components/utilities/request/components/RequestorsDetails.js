import CardSubHeader from "@/components/cards/CardSubHeader"
import CardBasedText from "@/components/cards/CardBasedText"
export default function RequestorsDetails() {
  return (
    <div className="grid grid-cols-2 gap-5">
        <div>
            <CardSubHeader className='text-sm text-gray-500'>Name</CardSubHeader>
            <CardBasedText className='text-xs'>Juan Dela Cruz</CardBasedText>
        </div>
        <div>
            <CardSubHeader className='text-sm text-gray-500'>Email</CardSubHeader>
            <CardBasedText className='text-xs'>[EMAIL_ADDRESS]</CardBasedText>
        </div>
        <div>
            <CardSubHeader className='text-sm text-gray-500'>Contact Number</CardSubHeader>
            <CardBasedText className='text-xs'>09123456789</CardBasedText>
        </div>
        <div>
            <CardSubHeader className='text-sm text-gray-500'>Province</CardSubHeader>
            <CardBasedText className='text-xs'>Cebu</CardBasedText>
        </div>
        <div>
            <CardSubHeader className='text-sm text-gray-500'>Municipality</CardSubHeader>
            <CardBasedText className='text-xs'>Dumanjugs</CardBasedText>
        </div>
        <div>
            <CardSubHeader className='text-sm text-gray-500'>Organization</CardSubHeader>
            <CardBasedText className='text-xs'>CDRRMO</CardBasedText>
        </div>
    </div>
  )
}
