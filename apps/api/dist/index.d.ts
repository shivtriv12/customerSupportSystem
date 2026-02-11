import "dotenv/config";
declare const app: import("hono/hono-base").HonoBase<import("hono/types").BlankEnv, import("hono/types").BlankSchema, "/api", "/api">;
export type AppType = typeof app;
export default app;
//# sourceMappingURL=index.d.ts.map