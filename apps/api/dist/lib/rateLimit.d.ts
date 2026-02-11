import type { Context, Next } from "hono";
export declare function rateLimit(c: Context, next: Next): Promise<void | (Response & import("hono").TypedResponse<{
    error: string;
    retryInMs: number;
}, 429, "json">)>;
//# sourceMappingURL=rateLimit.d.ts.map