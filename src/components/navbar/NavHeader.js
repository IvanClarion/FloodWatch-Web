import GlassCard from "../cards/GlassCard"
import RouteHeader from "./RouteHeader"
import CardBasedText from "../cards/CardBasedText"
import {User,Bell, IdCard} from "lucide-react"
import Link from "next/link"
export default function NavHeader() {
  return (
    <section className="flex w-full justify-between items-center gap-2 sticky top-2 z-20">
       <RouteHeader/>
        <div className="flex items-stretch gap-2">
           <Link href="/national-admin/id_verification" className="navheader-button relative">
                <div className="text-xs"><span className="notif-banner"/><IdCard/></div>
            </Link>
            <div className="navheader-button lg:hidden">
                <Link href='/national-admin/account'>
                <User className="size-5"/> 
                </Link>  
            </div>
           
            <Link href="#" className="navheader-button relative">
                <div className="text-xs">
                <Bell className=""/> 
                <span className="notif-banner"></span>
                </div>
            </Link>
          
        </div>
    </section>
  )
}
