
import { LogOut } from "lucide-react"
export default function SignOutBtn() {
    const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }
  return (
    <button onClick={handleSignOut} className="flex cursor-pointer items-center gap-3 w-full p-2 rounded-lg text-red-600 hover:bg-red-500/10 transition-colors">
        <LogOut className="w-5 h-5 text-red-500" />
        <span className="text-sm font-semibold">Sign Out</span>
    </button>
  )
}
