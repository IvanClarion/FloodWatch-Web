import SideModal from "@/components/Modal/SideModal"
import CardBasedText from "@/components/cards/CardBasedText"
import CardSubHeader from "@/components/cards/CardSubHeader"
import { X } from "lucide-react"
import GeneralInput from "@/components/forms/GeneralInput"
export default function ApprovedandDispatchSideModal() {
  return (
    <SideModal>
        <div className="grid gap-5">
        <div className="p-4 bg-white sticky top-0 flex justify-between items-center border-b border-gray-100 z-10">
            <CardSubHeader className='text-gray-600'>Approved and Dispatch</CardSubHeader>
            <button className="modal-icon-button">
                <X className="size-5"/>
            </button>
        </div>
        <div className="grid gap-5 p-2">
            <div className="grid gap-2">
            <CardBasedText> This will be delivered by Batch?</CardBasedText>
            <div className="flex items-stretch gap-2">
            <button className="bg-gray-100 cursor-pointer hover:text-primary hover:bg-primary/10 text-gray-500 text-sm px-6 py-2 rounded-lg">No</button>
            <button className="bg-gray-100 cursor-pointer hover:text-primary hover:bg-primary/10 text-gray-500 text-sm px-6 py-2 rounded-lg">Yes</button>
            </div>
           
            </div>
            <div className="grid gap-2">
                <CardBasedText>How many batches?</CardBasedText>
                <GeneralInput placeholder='eg. 100'/>
            </div>
            <div className="grid gap-3">
                <div className="grid gap-3">
                    <CardBasedText>Batches Resource Allocations</CardBasedText>
                    <div className="grid gap-2">
                        <CardBasedText className='text-gray-500 font-semibold'>Batch 1</CardBasedText>
                        <fieldset>
                            <CardBasedText>Quantity</CardBasedText>
                            <GeneralInput placeholder='example 100'/>
                        </fieldset>
                    </div>
                </div>
                
            </div>
        </div>
        </div>
    </SideModal>
  )
}
