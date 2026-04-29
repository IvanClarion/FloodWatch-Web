import { Suspense } from 'react'
import SeedTable from "@/components/table/national-admin/SeedTable"
import SeedCard from "@/components/Seeding/SeedCard"
import SeedCardSkeleton from "@/components/Seeding/SeedCardSkeleton"
import ImportAreas from "@/components/Seeding/ImportAreas"
import HistoryModal from "@/components/Seeding/HistoryModal"
import { createClient } from '@supabase/supabase-js'

export default async function page(props) {
  const searchParams = await props.searchParams;
  const showHistory = searchParams?.history === 'true';

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_SERVICE_ROLE_KEY
  );

  const { data: rawData } = await supabase
    .from('province')
    .select('province_id, name, municipality_or_city(name, added_on, updated_at)');

  const tableData = [];
  if (rawData) {
    rawData.forEach((prov) => {
      if (prov.municipality_or_city && prov.municipality_or_city.length > 0) {
        prov.municipality_or_city.forEach((m, idx) => {
          tableData.push({
            id: `${prov.province_id}-${idx}`, // Unique ID for each row
            province: prov.name,
            municipality: m.name,
            added_on: m.added_on ? new Date(m.added_on).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : "N/A",
            updated_at: m.updated_at ? new Date(m.updated_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : "N/A"
          });
        });
      } else {
        // If a province has no municipalities yet, show it anyway
        tableData.push({
          id: prov.province_id,
          province: prov.name,
          municipality: "No municipalities added",
          added_on: "N/A",
          updated_at: "N/A"
        });
      }
    });
  }

  return (
    <section className="grid gap-5">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4">
        <Suspense fallback={<SeedCardSkeleton />}>
          <SeedCard />
        </Suspense>
        <ImportAreas/>
      </div>
      <SeedTable data={tableData.length > 0 ? tableData : undefined} />
      {showHistory && (
        <Suspense fallback={null}>
          <HistoryModal />
        </Suspense>
      )}
    </section>
  )
}
