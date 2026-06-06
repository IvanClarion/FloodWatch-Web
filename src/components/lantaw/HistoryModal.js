"use client"
import { useState, useEffect } from "react"
import { X, MessageSquare } from "lucide-react"
import { supabase } from "@/supabase/util/supabase"
import WaveLoader from "../loader/WaveLoader"
export default function HistoryModal({ onClose, onSelectConversation }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Fetch interactions for this user ordered by newest
        const { data, error } = await supabase
          .from('ai_chatbot_conversation')
          .select('conversation_id, conversation_title, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error

        // Filter to only show unique conversations based on conversation_id
        const uniqueConversations = []
        const seenIds = new Set()
        
        data?.forEach(item => {
            if (!seenIds.has(item.conversation_id)) {
                seenIds.add(item.conversation_id)
                uniqueConversations.push(item)
            }
        })

        setHistory(uniqueConversations)
      } catch (err) {
        console.error("Error fetching history:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  return (
    <section className="bg-gray-50 h-full absolute w-full top-0 right-0 z-50 p-4 lg:w-1/4 rounded-lg border-l border-gray-100 flex flex-col">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-800">Conversation History</h2>
            <button onClick={onClose} className="modal-icon-button transition-colors">
                <X className="size-4" />
            </button>
        </div>
        
        <div className="flex-1 overflow-y-auto flex flex-col gap-2">
            {loading ? (
                <div className="flex items-center justify-center h-full">
                    <WaveLoader/>
                </div>
            ) : history.length > 0 ? (
                history.map((conv) => (
                    <div 
                        key={conv.conversation_id} 
                        onClick={() => {
                            onSelectConversation(conv.conversation_id)
                            onClose()
                        }}
                        className="flex items-start gap-3 p-3 bg-white rounded-md border border-gray-100 hover:border-primary/50 cursor-pointer transition-colors"
                    >
                        <MessageSquare className="size-4 text-gray-400 mt-0.5 min-w-[16px]" />
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-700 line-clamp-1">{conv.conversation_title || "New Conversation"}</span>
                            <span className="text-xs text-gray-400">{new Date(conv.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))
            ) : (
                <div className="flex items-center justify-center h-full">
                    <span className="text-xs text-gray-400">No history yet</span>
                </div>
            )}
        </div>
    </section>
  )
}
