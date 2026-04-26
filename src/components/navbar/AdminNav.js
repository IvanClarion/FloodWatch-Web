"use client"
import VerticalLayout from "./VerticalLayout"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/supabase/util/supabase"
import { LayoutDashboard, FileText, LineChart, Users, Map, UserCircle, LogOut } from "lucide-react"
import DrawerCard from "../cards/DrawerCard"
import { useState, useEffect } from "react"
import Image from "next/image"
import EmblemLogo from "@/assets/images/logofloodwatch.png"
export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [fullName, setFullName] = useState('Admin')
  const [userRole, setUserRole] = useState('Manage Account')

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError || !session) return

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', session.user.id)
          .single()

        if (profileError) {
          console.error('Error fetching profile:', profileError)
          return
        }

        if (profile?.full_name) {
          setFullName(profile.full_name)
        }
        
        if (profile?.role) {
          const formattedRole = profile.role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
          setUserRole(formattedRole)
        }
      } catch (error) {
        console.error('Unexpected error fetching profile:', error)
      }
    }

    fetchUserProfile()
  }, [])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const navItems = [
    { name: 'Dashboard', href: '/national-admin/dashboard', icon: LayoutDashboard },
    { name: 'Logs', href: '/national-admin/Logs', icon: FileText },
    { name: 'Analytics', href: '/national-admin/analytics', icon: LineChart },
    { name: 'Contributors', href: '/national-admin/contributor', icon: Users },
    { name: 'Seeding', href: '/national-admin/seeding', icon: Map },
  ]

  return (
    <VerticalLayout>
      <div className="flex flex-col w-full h-full justify-between">
        {/* Desktop Header */}
        <section className="hidden gap-2 md:flex items-start justify-start p-6 border-b border-gray-100">
          <Image src={EmblemLogo} alt="Emblem Logo"/>
          <h1 className="text-xl flex flex-col font-bold"><span className="text-primary">National</span><span className="text-secondary">Admin</span></h1>
        </section>

        {/* Navigation Links */}
        <nav className="flex-1 w-full flex items-center md:items-start no-scrollbar">

          <ul className="vertical-nav">
            {navItems.map((item) => {
              const Icon = item.icon
              // Active if pathname matches exactly or if we are in a subpath of it
              const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== '/national-admin')
              
              return (
                <li key={item.name} className="flex-1 md:flex-none">
                  <Link 
                    href={item.href}
                    className={`vertical-nav-link ${isActive ? 'vertical-nav-link-active' : 'vertical-nav-link-inactive'}`}
                  >
                    <Icon className="w-5 h-5 md:w-5 md:h-5" />
                    <span className="text-[10px] md:text-sm font-semibold">
                      {item.name}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Desktop Footer (Account) */}
        {isDrawerOpen && (
          <div className="absolute bottom-24 left-4 w-52 z-[60]">
            <DrawerCard className="flex flex-col gap-1 p-3">
              <Link href="/national-admin/account" className="flex cursor-pointer items-center gap-3 w-full p-2 rounded-lg text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors">
                <UserCircle className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-semibold">Go to account</span>
              </Link>
              <div className="h-px w-full bg-gray-400/20 my-1"></div>
              <button onClick={handleSignOut} className="flex cursor-pointer items-center gap-3 w-full p-2 rounded-lg text-red-600 hover:bg-red-500/10 transition-colors">
                <LogOut className="w-5 h-5 text-red-500" />
                <span className="text-sm font-semibold">Sign Out</span>
              </button>
            </DrawerCard>
          </div>
        )}
        <div className="hidden md:flex p-4 border-t border-gray-100 mt-auto relative">
          <button 
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className="flex cursor-pointer items-center gap-3 w-full p-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <UserCircle className="w-8 h-8 text-gray-400" />
            <div className="flex flex-col text-left">
              <span className="text-sm font-semibold text-gray-800">{fullName}</span>
              <span className="text-xs text-gray-400">{userRole}</span>
            </div>
          </button>
        </div>
      </div>
    </VerticalLayout>
  )
}
