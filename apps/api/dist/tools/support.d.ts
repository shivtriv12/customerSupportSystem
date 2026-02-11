export declare function getConversationHistoryService(userId: string): Promise<{
    id: string;
    topic: string;
    lastMessage: string;
    messageCount: number;
    lastUpdated: Date;
}[]>;
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
//# sourceMappingURL=support.d.ts.map