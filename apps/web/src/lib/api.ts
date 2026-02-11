import { hc } from "hono/client"
import type { AppType } from "@repo/api"

const apiUrl =
  import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://localhost:3000" : "https://customersupportsystem-8qll.onrender.com")
const client = hc<AppType>(apiUrl)
export { client }

export const api = client.api