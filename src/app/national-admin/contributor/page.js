import { Suspense } from "react"
import SummaryData from "@/components/contributors/SummaryData"
import SummaryDataSkeleton from "@/components/contributors/SummaryDataSkeleton"
import ContributorTable from "@/components/table/national-admin/ContributorTable"

export default function page() {
  return (
    <main className="grid gap-5">
      <Suspense fallback={<SummaryDataSkeleton />}>
        <SummaryData />
      </Suspense>
      <ContributorTable />
    </main>
  )
}