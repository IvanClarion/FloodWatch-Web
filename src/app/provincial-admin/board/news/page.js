import ToolBar from "@/components/board/news/ToolBar"
import NewsContentCard from "@/components/board/news/NewsContentCard"
export default function page() {
  return (
    <div className="grid gap-5">
      <ToolBar/>
      <NewsContentCard/>
    </div>
  )
}
