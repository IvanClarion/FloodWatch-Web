import React from 'react'
import clsx from 'clsx'
export default function ToogleButton({children, className, ...props}) {
  return (
    <button type="button" className={clsx(className,'button-toogle')} {...props}>{children}</button>
  )
}
