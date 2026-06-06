
"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Activity, LineChart, Users, Map } from "lucide-react"

export default function NationalNav() {
  const pathname = usePathname()
  
  const navItems = [
    { name: 'Dashboard', href: '/national-admin/dashboard', icon: LayoutDashboard },
    { name: 'Logs', href: '/national-admin/Logs/api', basePath: '/national-admin/Logs', icon: Activity },
    { name: 'Analytics', href: '/national-admin/analytics', icon: LineChart },
    { name: 'Contributors', href: '/national-admin/contributor', icon: Users },
    { name: 'Seeding', href: '/national-admin/seeding', icon: Map },
  ]

  return (
    <ul className="vertical-nav">
      {navItems.map((item) => {
        const Icon = item.icon
        const matchPath = item.basePath || item.href
        const isActive = pathname === item.href || (pathname?.startsWith(matchPath) && matchPath !== '/national-admin')
        
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
  )
}
