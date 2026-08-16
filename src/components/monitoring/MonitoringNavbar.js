"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import ToogleButton from "../button/ToogleButton"
import ToogleButtonLayout from "../button/ToogleButtonLayout"

const navLinks = [
  { name: "Weather", href: "/provincial-admin/monitoring", exact: true },
  { name: "Air", href: "/provincial-admin/monitoring/air-map" },
  { name: "Hazards", href: "/provincial-admin/monitoring/hazard-map" },
  { name: "Report", href: "/provincial-admin/monitoring/report-map" },
  { name: "LGU", href: "/provincial-admin/monitoring/lgu-monitoring" }
]

export default function MonitoringNavbar() {
  const pathname = usePathname()

  return (
    <ToogleButtonLayout className='w-full lg:w-lg'>
      {navLinks.map((link) => {
        const isActive = link.exact
          ? pathname === link.href || pathname === `${link.href}/`
          : pathname?.startsWith(link.href)

        return (
          <ToogleButton key={link.name} className={isActive ? "button-toogle-active" : ""}>
            <Link href={link.href} className="w-full block text-center">
              {link.name}
            </Link>
          </ToogleButton>
        )
      })}
    </ToogleButtonLayout>
  )
}
