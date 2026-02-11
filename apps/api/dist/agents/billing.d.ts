import { type AgentContext } from "@repo/shared";
type AgentStream = {
    textStream: AsyncIterable<string>;
};
export declare function handleBillingQuery(context: AgentContext): Promise<AgentStream>;
export {};
//# sourceMappingURL=billing.d.ts.map