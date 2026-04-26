import clsx from "clsx"
export default function CardHeader({children, className}) {
  return (
    <h1 className={clsx('text-lg font-bold', className)}>{children}</h1>
  )
}
