import ViewProfilePane from "@/components/utilities/request/ViewProfilePane"
import ViewRequesDetails from "@/components/utilities/request/ViewRequesDetails"
export default function page() {
  return (
    <section className="grid gap-1 lg:grid-cols-3">
        <div className="lg:col-span-1">
            <ViewProfilePane/>
        </div>
        <div className="lg:col-span-2">
            <ViewRequesDetails/>
        </div>
    </section>
  )
}
