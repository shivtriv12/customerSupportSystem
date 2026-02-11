export declare function getConversationMessagesService(conversationId: string): Promise<{
    id: string;
    topic: string;
    messages: {
        id: string;
        role: import("@prisma/client").$Enums.MessageRole;
        content: string;
        agentType: import("@prisma/client").$Enums.AgentType | null;
        timestamp: Date;
    }[];
} | null>;
export declare function getConversationHistoryService(userId: string): Promise<{
    id: string;
    topic: string;
    lastMessage: string;
    messageCount: number;
    lastUpdated: Date;
}[]>;
export declare function deleteConversationById(conversationId: string): Promise<void>;
//# sourceMappingURL=chats.d.ts.map