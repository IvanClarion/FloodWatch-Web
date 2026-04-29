import React from 'react'
import clsx from 'clsx'
export default function SecondaryButton({children, className}) {
  return (
    <button className={clsx('btn-secondary', className)}>{children}</button>
  )
}
