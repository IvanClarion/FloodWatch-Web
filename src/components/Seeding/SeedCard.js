

import CardSubHeader from '../cards/CardSubHeader'
import GeneralCard from '../cards/GeneralCard'
import { Map } from 'lucide-react'
import CardHeader from '../cards/CardHeader'
import CardBasedText from '../cards/CardBasedText'
import { createClient } from '@supabase/supabase-js'

export default async function SeedCard() {
  // Use the service role key to bypass RLS on the server and get the exact count
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_SERVICE_ROLE_KEY
  );

  const { count: provinceCount } = await supabase
    .from('province')
    .select('*', { count: 'exact', head: true });

  const { count: municipalityCount } = await supabase
    .from('municipality_or_city')
    .select('*', { count: 'exact', head: true });

  return (
    <section className='grid grid-cols-2 gap-2'>
    <GeneralCard>
      <div className='summary-data-layout'>
        <span className='summary-data-icon'>
        <Map/>
        </span>
        
        <CardBasedText className='text-gray-500 '>Total Registered Provinces</CardBasedText>
        <CardHeader className='text-center'>{provinceCount || 0}</CardHeader>
        
      </div>
    </GeneralCard>
    <GeneralCard>
      <div className='summary-data-layout'>
        <span className='summary-data-icon'>
        <Map/>
        </span>
        <CardBasedText className='text-gray-500 '>Total Registered Municipalities</CardBasedText>
        <CardHeader className='text-center'>{municipalityCount || 0}</CardHeader>
      </div>
    </GeneralCard>
    </section>
  )
}
