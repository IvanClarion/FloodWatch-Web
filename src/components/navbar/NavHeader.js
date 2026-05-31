"use client"
import { useState, useEffect } from "react"
import GlassCard from "../cards/GlassCard"
import RouteHeader from "./RouteHeader"
import CardBasedText from "../cards/CardBasedText"
import {User,Bell, IdCard} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/supabase/util/supabase"

export default function NavHeader() {
  const [hasUnread, setHasUnread] = useState(false)
  const [hasUnreadNotifs, setHasUnreadNotifs] = useState(false)

  const fetchUnreadStatus = async () => {
    const { count, error } = await supabase
      .from('id_verification')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)

    if (!error) {
      setHasUnread(count > 0)
    }
  }

  const fetchUnreadNotifsStatus = async () => {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .in('target_role', ['all', 'national_admin'])
      .eq('is_read', false)

    if (!error) {
      setHasUnreadNotifs(count > 0)
    }
  }

  useEffect(() => {
    fetchUnreadStatus()
    fetchUnreadNotifsStatus()

    // Listen to our custom event for immediate UI updates when processing
    const handleLocalUpdate = () => fetchUnreadStatus()
    window.addEventListener('verification_status_updated', handleLocalUpdate)

    // Listen to Supabase Realtime for external changes
    const channel = supabase
      .channel('navheader_id_verification')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'id_verification' }, (payload) => {
        fetchUnreadStatus()
      })
      .subscribe()

    const notifChannel = supabase
      .channel('navheader_notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, (payload) => {
        fetchUnreadNotifsStatus()
      })
      .subscribe()

    return () => {
      window.removeEventListener('verification_status_updated', handleLocalUpdate)
      supabase.removeChannel(channel)
      supabase.removeChannel(notifChannel)
    }
  }, [])

  return (
    <section className="flex w-full justify-between items-center gap-2 sticky top-2 z-20">
       <RouteHeader/>
        <div className="flex items-stretch gap-2">
           <Link href="/national-admin/id_verification" className="navheader-button relative">
                <div className="text-xs">
                  {hasUnread && <span className="notif-banner"/>}
                  <IdCard/>
                </div>
            </Link>
            <div className="navheader-button lg:hidden">
                <Link href='/national-admin/account'>
                    <div className="text-xs">
                        <User/> 
                    </div>
                </Link>  
            </div>
           
            <Link href="/national-admin/notification" className="navheader-button relative">
                <div className="text-xs">
                <Bell className=""/> 
                {hasUnreadNotifs && <span className="notif-banner"></span>}
                </div>
            </Link>
          
        </div>
    </section>
  )
}
