import { useEffect, useState } from 'react'
import { client } from '../lib/api'
import { MessageSquarePlus, MessageSquare } from 'lucide-react'
import { clsx } from 'clsx'

type Conversation = { id: string, title: string, updatedAt: string }

export function Sidebar({ 
  userId, 
  onSelect, 
  onNew, 
  selectedId 
}: { 
  userId: string, 
  onSelect: (id: string) => void, 
  onNew: () => void,
  selectedId?: string
}) {
  const [conversations, setConversations] = useState<Conversation[]>([])

  // Fetch history on mount
  useEffect(() => {
    client.api.chat.conversations.$get({ query: { userId } })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json()
          setConversations(data as any)
        }
      })
  }, [userId, selectedId]) // Refresh when selection changes (assuming new chat created)

  return (
    <div className="w-64 border-r bg-gray-50 h-screen flex flex-col">
      <div className="p-4 border-b bg-white">
        <button 
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <MessageSquarePlus size={16} />
          New Conversation
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {conversations.map(conv => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={clsx(
              "w-full text-left px-3 py-3 rounded-lg text-sm flex items-start gap-3 transition-colors",
              selectedId === conv.id ? "bg-white shadow-sm border" : "hover:bg-gray-100 text-gray-600"
            )}
          >
            <MessageSquare size={16} className="mt-0.5 opacity-50" />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{conv.title || "New Chat"}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(conv.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}