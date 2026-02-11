import { type AgentContext } from "@repo/shared";
type AgentStream = {
    textStream: AsyncIterable<string>;
};
export declare function handleOrderQuery(context: AgentContext): Promise<AgentStream>;
export {};
//# sourceMappingURL=order.d.ts.map