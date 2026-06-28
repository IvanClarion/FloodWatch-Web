import clsx from "clsx"
export default function TextArea({ className, ...props }) {
  return (
    <textarea className={clsx("border-none outline-0 resize-none p-2 bg-transparent", className)} {...props}/>
  )
}
