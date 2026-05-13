import GlassCard from "../cards/GlassCard"
import RouteHeader from "./RouteHeader"
import CardBasedText from "../cards/CardBasedText"
import {User,Bell, IdCard} from "lucide-react"
import Link from "next/link"
export default function NavHeader() {
  return (
    <section className="flex w-full justify-between items-center gap-2 sticky top-2 z-10">
       <RouteHeader/>
        <div className="flex items-stretch gap-2">
           <Link href="#" className="navheader-button">
                <CardBasedText className="text-xs font-semibold">ID Verification</CardBasedText>
            </Link>
            <div className="navheader-button lg:hidden">
                <Link href='/national-admin/account'>
                <User className="size-5"/> 
                </Link>  
            </div>
           
            <div className="navheader-button">
                
                <Bell className="size-5 text-primary"/>   
            </div>
          
        </div>
    </section>
  )
}
