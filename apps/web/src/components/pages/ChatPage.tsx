import { useEffect, useState } from "react";
import type { Agent, ConversationListItem, User } from "../../types/ui";
import { api } from "../../lib/api";
import { AppShell } from "../layout/AppShell";
import { AgentList } from "../agents/AgentList";
import { ChatList } from "../chat/ChatList";
import { Topbar } from "../layout/Topbar";
import { ChatWindow } from "../chat/ChatWindow";
import { Sidebar } from "../layout/Sidebar";
import { UserSelect } from "../users/UserSelect";

type AgentsResponse = Agent[];
type ConversationsResponse = ConversationListItem[];
type UsersResponse = User[];

export function ChatPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>();
  const [users, setUsers] = useState<User[]>([]);
  const [userId, setUserId] = useState<string | undefined>();
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const agentsRes = await api.agents.$get();
      const agentsData = (await agentsRes.json()) as AgentsResponse;
      setAgents(agentsData);

      setUsersLoading(true);
      try {
        const usersRes = await api.users.$get();
        const usersData = (await usersRes.json()) as UsersResponse;
        setUsers(usersData);
        if (!userId && usersData.length > 0) {
          setUserId(usersData[0].id);
        }
      } finally {
        setUsersLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    if (!userId) {
      setConversations([]);
      setActiveConversationId(undefined);
      return;
    }

    const loadConversations = async () => {
      const convRes = await api.chat.conversations.$get({
        query: { userId },
      });
      const convData = (await convRes.json()) as ConversationsResponse;
      setConversations(convData);
      setActiveConversationId(undefined);
    };

    loadConversations();
  }, [userId]);

  const selectedUser = users.find((u) => u.id === userId);

  return (
    <AppShell
      sidebar={
        <Sidebar>
          <UserSelect
            users={users}
            selectedUserId={userId}
            onChange={setUserId}
            loading={usersLoading}
          />
          <AgentList agents={agents} />
          <ChatList
            conversations={conversations}
            activeId={activeConversationId}
            onSelect={setActiveConversationId}
          />
        </Sidebar>
      }
      content={
        <div className="flex h-full flex-col">
          <Topbar selectedUser={selectedUser} loadingUser={usersLoading} />
          {userId ? (
            <ChatWindow userId={userId} conversationId={activeConversationId} />
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-neutral-500">
              Select a user to start
            </div>
          )}
        </div>
      }
    />
  );
}