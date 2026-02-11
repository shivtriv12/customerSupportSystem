// apps/web/src/lib/api.ts
import { hc } from "hono/client"
import type { AppType } from "@repo/api"

const client = hc<AppType>(import.meta.env.VITE_API_URL as string)
export { client }

export const api = client.api