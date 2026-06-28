import SearchInput from "@/components/forms/SearchInput"
import SecondaryButton from "@/components/button/SecondaryButton"
import PrimaryButton from "@/components/button/PrimaryButton"
import Link from "next/link"
import { Plus, Trash } from "lucide-react"
export default function ToolBar() {
  return (
    <section className="">
        <section className="flex gap-2 items-stretch justify-between">
            <SearchInput placeholder="Search news" className="h-full"/>
        <div className="flex gap-2">
            <SecondaryButton className='p-3'>
                <p className="lg:block hidden text-red-500">Delete News</p>
                <Trash className="size-5 text-red-500"/>
            </SecondaryButton>
            <PrimaryButton className='p-3 flex items-center gap-2'>
                <p className="lg:block hidden">Add News</p>
                <Plus/>
            </PrimaryButton>
        </div>
        </section>
    </section>
  )
}
