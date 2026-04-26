import clsx from 'clsx';

export default function GeneralInput({className, children, iconRight, ...props}) {
  return (
    <fieldset className={clsx(className,'input-layout')}>
      {children}
      <input {...props} className='outline-0 bg-transparent text-sm border-0 w-full flex-1'/>
      {iconRight}
    </fieldset>
  )
}
