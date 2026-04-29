import GeneralCard from '../cards/GeneralCard'
import SingleLineSkeleton from '../skeleton/SingleLineSkeleton'

export default function SeedCardSkeleton() {
  return (
    <section className='grid grid-cols-2 gap-2'>
      <GeneralCard>
        <div className='summary-data-layout'>
          <div className='summary-data-icon'>
            <div className='w-6 h-6 rounded-full skeleton-base' />
          </div>
          <SingleLineSkeleton />
          <SingleLineSkeleton />
        </div>
      </GeneralCard>
      <GeneralCard>
        <div className='summary-data-layout'>
          <div className='summary-data-icon'>
            <div className='w-6 h-6 rounded-full skeleton-base' />
          </div>
          <SingleLineSkeleton />
          <SingleLineSkeleton />
        </div>
      </GeneralCard>
    </section>
  )
}
