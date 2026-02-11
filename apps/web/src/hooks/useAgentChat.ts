// apps/web/src/hooks/useAgentChat.ts
import { useState } from "react"
import { api } from "../lib/api"
import { readNdjsonStream } from "../lib/stream"

export type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  agentType?: "SUPPORT" | "ORDER" | "BILLING"
  timestamp: Date
}

// apps/web/src/hooks/useAgentChat.ts
type AgentType = "SUPPORT" | "ORDER" | "BILLING"

type ConversationResponse = {
  id: string
  title?: string | null
  messages: {
    id: string
    role: "USER" | "AGENT" | "SYSTEM"
    content: string
    agentType?: AgentType
    createdAt: string
  }[]
}

type StreamEvent =
  | { type: "metadata"; conversationId: string; agentType: AgentType; routing?: unknown }
  | { type: "typing" }
  | { type: "text"; content: string }
  | { type: "error"; message: string }
  | { type: "done"; conversationId?: string }

export function useAgentChat(userId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentAgent, setCurrentAgent] = useState<string | null>(null)

  const sendMessage = async (content: string, conversationId?: string) => {
    setIsLoading(true)
    setCurrentAgent(null)

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMsg])

    try {
      const res = await api.chat.messages.$post({
        json: { userId, message: content, conversationId }
      })

      if (!res.ok) throw new Error("Failed to send message")

      const aiMsgId = (Date.now() + 1).toString()
      setMessages(prev => [...prev, {
        id: aiMsgId,
        role: "assistant",
        content: "",
        timestamp: new Date()
      }])

      const body = res.body
      if (!body) return

      await readNdjsonStream<StreamEvent>(
        body,
        (data) => {
          if (data.type === "metadata") {
            setCurrentAgent(data.agentType)
            setMessages(prev => prev.map(m =>
              m.id === aiMsgId ? { ...m, agentType: data.agentType } : m
            ))
          } else if (data.type === "text") {
            setMessages(prev => prev.map(m =>
              m.id === aiMsgId ? { ...m, content: m.content + data.content } : m
            ))
          }
        },
        (err, raw) => {
          console.error("Error parsing stream line", err, raw)
        }
      )
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: "⚠️ Error: Could not connect to agent.",
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const loadConversation = async (id: string) => {
    setIsLoading(true)
    const res = await api.chat.conversations[":id"].$get({ param: { id } })
    if (res.ok) {
      const data = (await res.json()) as ConversationResponse
      const mapped: Message[] = data.messages.map((m) => ({
        id: m.id,
        role: m.role === "USER" ? "user" : "assistant",
        content: m.content,
        agentType: m.agentType,
        timestamp: new Date(m.createdAt),
      }))
      setMessages(mapped)
    }
    setIsLoading(false)
  }

  return { messages, sendMessage, isLoading, currentAgent, loadConversation, setMessages }
}