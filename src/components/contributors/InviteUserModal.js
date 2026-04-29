"use client"

import { useState } from "react"
import FloatingModal from "../Modal/FloatingModal"
import GeneralCard from "../cards/GeneralCard"
import CardHeader from "../cards/CardHeader"
import CardBasedText from "../cards/CardBasedText"
import GeneralInput from "../forms/GeneralInput"
import PrimaryButton from "../button/PrimaryButton"
import { X, Mail, MapPin, ShieldCheck, Send, Landmark, Check, Loader2 } from "lucide-react"
import { supabase } from "@/supabase/util/supabase"

const ROLES = [
  {
    value: "LGU Headmaster",
    icon: ShieldCheck,
    description: "Manages local flood monitoring and alerts",
  },
  {
    value: "Provincial Admin",
    icon: Landmark,
    description: "Oversees province-wide disaster operations",
  },
]

export default function InviteUserModal({ onClose }) {
  const [selectedRole, setSelectedRole] = useState("")
  const [email, setEmail] = useState("")
  const [lguName, setLguName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedRole) {
      setError("Please select an account role.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Check existing invitations
      const { data: existingInvites, error: fetchError } = await supabase
        .from('invitations')
        .select('status')
        .eq('official_email', email)

      if (fetchError) throw fetchError

      if (existingInvites && existingInvites.length > 0) {
        const hasActiveInvite = existingInvites.some(
          (inv) => inv.status === 'pending' || inv.status === 'accepted'
        )
        if (hasActiveInvite) {
          setError("An active or accepted invitation already exists for this email.")
          setLoading(false)
          return
        }
      }

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      // Expiration must be in 24 hours
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      const inviteCode = crypto.randomUUID()

      // Insert into invitations table
      const { data: invite, error: insertError } = await supabase
        .from('invitations')
        .insert([
          {
            lgu_name: lguName,
            official_email: email,
            account_role: selectedRole,
            status: 'pending',
            invited_by: user.id,
            expires_at: expiresAt,
            invite_code: inviteCode
          }
        ])
        .select()
        .single()

      if (insertError) throw insertError

      // Try sending the email via an API route (stub for now, needs real implementation later)
      try {
        await fetch('/api/send-invite-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            lguName,
            role: selectedRole,
            inviteCode
          })
        })
      } catch (emailErr) {
        console.error("Failed to send email API:", emailErr)
      }

      setSuccess(true)
      setTimeout(() => {
        onClose()
      }, 2000)

    } catch (err) {
      setError(err.message || "An error occurred while sending the invitation.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <FloatingModal>
        <GeneralCard className="w-full max-w-md grid gap-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center size-10 rounded-full bg-primary/10">
                        <Send className="size-5 text-primary" />
                    </span>
                    <div>
                        <CardHeader>Invite Contributor</CardHeader>
                        <CardBasedText className="text-gray-400 text-xs">Send an invitation to join the platform</CardBasedText>
                    </div>
                </div>
                <button 
                    type="button"
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                >
                    <X className="size-5 text-gray-400" />
                </button>
            </div>

            {/* Notifications */}
            {error && (
                <div className="bg-red-50 border text-center font-semibold border-red-200 text-red-500 p-3 rounded-md text-sm">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green-50 border text-center font-semibold border-green-200 text-green-600 p-3 rounded-md text-sm">
                    Invitation sent successfully!
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="grid gap-4">
                {/* Email */}
                <div className="grid gap-1.5">
                    <CardBasedText className="text-sm font-semibold">Official Email</CardBasedText>
                    <GeneralInput 
                        type="email" 
                        placeholder="e.g. admin@lgu.gov.ph"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    >
                        <Mail className="size-5 text-gray-400" />
                    </GeneralInput>
                </div>

                {/* LGU / Province */}
                <div className="grid gap-1.5">
                    <CardBasedText className="text-sm font-semibold">LGU / Province Name</CardBasedText>
                    <GeneralInput 
                        type="text" 
                        placeholder="e.g. Cebu City"
                        required
                        value={lguName}
                        onChange={(e) => setLguName(e.target.value)}
                    >
                        <MapPin className="size-5 text-gray-400" />
                    </GeneralInput>
                </div>

                {/* Role Picker */}
                <div className="grid gap-1.5">
                    <CardBasedText className="text-sm font-semibold">Account Role</CardBasedText>
                    <div className="grid grid-cols-2 gap-2">
                        {ROLES.map((role) => {
                            const Icon = role.icon
                            const isSelected = selectedRole === role.value
                            return (
                                <button
                                    key={role.value}
                                    type="button"
                                    onClick={() => setSelectedRole(role.value)}
                                    className={`
                                        relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer
                                        transition-all duration-200
                                        ${isSelected
                                            ? "border-primary bg-primary/5"
                                            : "border-gray-100 bg-gray-50/50 hover:border-gray-200 hover:bg-gray-50"
                                        }
                                    `}
                                >
                                    {isSelected && (
                                        <span className="absolute top-2 right-2 inline-flex items-center justify-center size-5 rounded-full bg-primary">
                                            <Check className="size-3 text-white" />
                                        </span>
                                    )}
                                    <span className={`
                                        inline-flex items-center justify-center size-10 rounded-full transition-colors
                                        ${isSelected ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-400"}
                                    `}>
                                        <Icon className="size-5" />
                                    </span>
                                    <span className={`text-sm font-semibold ${isSelected ? "text-primary" : "text-gray-700"}`}>
                                        {role.value}
                                    </span>
                                    <span className="text-[11px] text-gray-400 text-center leading-tight">
                                        {role.description}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                    {/* Hidden input for form validation */}
                    <input type="hidden" name="role" value={selectedRole} required />
                </div>

                {/* Submit */}
                <PrimaryButton type="submit" disabled={loading} className="flex items-center justify-center gap-2 mt-2">
                    {loading ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <Send className="size-4" />
                    )}
                    {loading ? "Sending Invitation..." : "Submit Invitation"}
                </PrimaryButton>
            </form>
        </GeneralCard>
    </FloatingModal>
  )
}
