export type Agent = {
  type: "SUPPORT" | "ORDER" | "BILLING";
  name: string;
  description?: string;
};

export type ConversationListItem = {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: string;
};

export type Message = {
  id?: string;
  role: "USER" | "AGENT" | "SYSTEM";
  content: string;
  agentType?: "SUPPORT" | "ORDER" | "BILLING";
  createdAt?: string;
};

export type User = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};