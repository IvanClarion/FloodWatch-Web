import TotalUtilities from "@/components/utilities/summary/TotalUtilities"
import LowUtilties from "@/components/utilities/summary/LowUtilties"
import Link from "next/link"
import SearchInput from "@/components/forms/SearchInput"
import PrimaryButton from "@/components/button/PrimaryButton"
import SecondaryButton from "@/components/button/SecondaryButton"
import UtilTable from "@/components/utilities/tables/UtilTable"
import { Plus, Origami } from "lucide-react"
export default function page() {
  return (
    <section className="grid gap-5">
      <div className="grid w-full grid-cols-2 gap-3">
        <TotalUtilities/>
        <LowUtilties/>
      </div>
      <div className="flex justify-between items-start">
      <SearchInput/>
      <div className="flex items-stretch gap-2">
      
      <SecondaryButton><Link href='/provincial-admin/utilities/inventory/aiextract' className="flex items-center gap-2"><Origami className="w-4 h-4"/><span className="hidden lg:block">Lantaw AI</span></Link></SecondaryButton>
      <PrimaryButton><Link href='/provincial-admin/utilities/inventory/add' className="flex items-center gap-2"><Plus className="w-4 h-4"/><span className="hidden lg:block">Add Utilities</span></Link></PrimaryButton>
      </div>
      
      </div>
      <div>
        <UtilTable/>
      </div>
    </section>
  )
}
