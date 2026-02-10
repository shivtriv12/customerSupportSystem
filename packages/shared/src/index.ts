export type AgentRole = "USER" | "AGENT" | "SYSTEM"
export type LlmRole = "user" | "assistant" | "system"

export type AgentType = "SUPPORT" | "ORDER" | "BILLING"

export interface AgentMessage {
  role: AgentRole
  content: string
}

export interface RoutingResult {
  agentType: AgentType
  confidence: number
  reasoning: string
}

export interface AgentContext {
  userId: string
  conversationId: string
  messages: AgentMessage[]
}

export function toLlmMessages(messages: AgentMessage[]) {
  return messages.map((m) => {
    const role: LlmRole =
      m.role === "AGENT" ? "assistant" : (m.role.toLowerCase() as LlmRole)
    return { role, content: m.content }
  })
}

export function fromLlmMessage(m: { role: string; content: string }): AgentMessage {
  const role =
    m.role === "assistant" ? "AGENT" : (m.role.toUpperCase() as AgentRole)
  return { role, content: m.content }
}