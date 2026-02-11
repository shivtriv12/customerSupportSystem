const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;
const store = new Map();
export async function rateLimit(c, next) {
    const userId = c.req.header("x-user-id") ?? c.req.query("userId") ?? c.req.header("x-forwarded-for") ?? "anonymous";
    const now = Date.now();
    const entry = store.get(userId);
    if (!entry || now > entry.resetAt) {
        store.set(userId, { count: 1, resetAt: now + WINDOW_MS });
        return next();
    }
    if (entry.count >= MAX_REQUESTS) {
        const retryIn = Math.max(0, entry.resetAt - now);
        return c.json({ error: "Rate limit exceeded", retryInMs: retryIn }, 429);
    }
    entry.count += 1;
    return next();
}
