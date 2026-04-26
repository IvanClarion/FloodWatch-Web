import GlassCard from "../cards/GlassCard"
import RouteHeader from "./RouteHeader"
import CardBasedText from "../cards/CardBasedText"
import {User,Bell} from "lucide-react"
export default function NavHeader() {
  return (
    <section className="flex w-full justify-between items-center gap-2 sticky top-2 z-10">
       <RouteHeader/>
        <div className="flex gap-2">
            <div className="navheader-button lg:hidden">
                
                <User className="size-5"/>   
            </div>
            <div className="navheader-button">
                
                <Bell className="size-5"/>   
            </div>
        </div>
    </section>
  )
}
