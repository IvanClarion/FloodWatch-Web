import AuthGuard from "@/supabase/auth/AuthGuard"
import AdminNav from "@/components/navbar/AdminNav"
import ProvincialHeader from "@/components/navbar/ProvincialHeader"
export const metadata = {
  title: "Provincial Admin | FloodWatch",
  description: "Provincial Administration Dashboard for FloodWatch",
}

export default function ProvincialAdminLayout({ children }) {
  return (
    <AuthGuard allowedRole="provincial_admin">
      <main className='flex w-full min-h-screen overflow-hidden'>
        <div>
            <AdminNav/>
        </div>
        <section className="flex-1 w-full flex flex-col p-2 overflow-y-auto">
            <div className="w-full mb-5">
            <ProvincialHeader/>
            </div>
        {children}
        </section>
      </main>
        
      
    </AuthGuard>
  )
}
