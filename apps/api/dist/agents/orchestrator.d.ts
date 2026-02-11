import type { AgentType } from "@prisma/client";
export declare function orchestrate(userId: string, conversationId: string | null, userMessage: string): Promise<{
    stream: {
        textStream: AsyncIterable<string>;
    };
    conversationId: string;
    agentType: import("@repo/shared").AgentType;
    routing: import("@repo/shared").RoutingResult;
}>;
export declare function saveAgentResponse(conversationId: string, content: string, agentType: AgentType): Promise<void>;
//# sourceMappingURL=orchestrator.d.ts.map