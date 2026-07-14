import PrimaryButton from "@/components/button/PrimaryButton"
import CardBasedText from "@/components/cards/CardBasedText"
export default function WorkFlowTool() {
  return (
    <section className="bg-gray-100 p-5 flex justify-between rounded-lg">
        <div>
            <CardBasedText>WorkFlow Tool</CardBasedText>
            <CardBasedText className="text-gray-500 text-xs">Choose an action to proceed</CardBasedText>
        </div>
        <div className="flex justify-end items-center gap-2">
            <button className="px-5 py-2 text-red-500 font-semibold text-xs hover:bg-red-500/10">Reject</button>
            <PrimaryButton className='text-xs '>Accept & Proceed</PrimaryButton>
        </div>
    </section>
  )
}
