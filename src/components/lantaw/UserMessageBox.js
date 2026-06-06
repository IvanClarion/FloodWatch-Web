import { memo } from "react"

function UserMessageBox({ children }) {
  return (
    <section className="flex justify-end w-full">
        <div className="bg-primary/10 p-3 rounded-2xl rounded-tr-sm max-w-[85%] lg:max-w-2xl text-sm text-start whitespace-pre-wrap">
          {children}
        </div>
    </section>
  )
}

export default memo(UserMessageBox)

