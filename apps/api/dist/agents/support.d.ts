import { type AgentContext } from "@repo/shared";
type AgentStream = {
    textStream: AsyncIterable<string>;
};
export declare function handleSupportQuery(context: AgentContext): Promise<AgentStream>;
export {};
//# sourceMappingURL=support.d.ts.map