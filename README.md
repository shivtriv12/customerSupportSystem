# AI Customer Support System

An AI-powered customer support system with a multi-agent architecture. A router agent classifies incoming queries and delegates to specialized sub-agents (Support, Order, Billing), each with tools that query the database. Conversations are persisted and context is maintained across messages.

## Setup

**Prerequisites:** Node 18+, pnpm

1. Clone and install:

```bash
git clone <repo-url>
cd customerSupportSystem
pnpm install
```

2. Create `apps/api/.env`:

```
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
OPENROUTER_API_KEY=your_openrouter_api_key
```

3. Create a Postgres database, then run migrations and seed:

```bash
cd apps/api
pnpm exec prisma migrate dev
pnpm exec prisma db seed
```

4. For the frontend, create `apps/web/.env` if needed (optional for local dev):

```
VITE_API_URL=http://localhost:3000
```

5. Run both apps:

```bash
pnpm dev
```

API runs at http://localhost:3000, web at http://localhost:5173. Select a user from the dropdown to start a conversation.

## Architecture

**Monorepo.** Turborepo with pnpm workspaces. `apps/api` (Hono backend), `apps/web` (React + Vite frontend), `packages/shared` (shared types). The frontend uses Hono RPC with `hc()` and `AppType` from `@repo/api` for end-to-end type safety.

**Controller-service pattern.** Controllers (`chat`, `agents`) handle HTTP, validate input with Zod, and call services. Services (`chats`, `getAllUsers`, `summary`) contain business logic and database access. A global error handler middleware catches thrown errors and returns 500 JSON.

**Multi-agent system.** The router (`router.ts`) uses an LLM to classify each message into SUPPORT, ORDER, or BILLING. On failure it falls back to SUPPORT. The orchestrator loads conversation history, runs the router, persists the user message, then delegates to the matching agent handler. Each sub-agent has tools that hit the database:

- **Support:** `getConversationHistory`, `getConversationMessages` – past conversations for context
- **Order:** `getOrderDetails`, `checkDeliveryStatus` – orders and delivery state
- **Billing:** `getInvoice`, `checkRefundStatus` – invoices and refunds

**Context compaction.** When a conversation exceeds 20 messages, older messages are summarized by an LLM and stored in `conversation.summary`. The last 8 messages stay as-is. New turns get the summary plus recent messages, so context is preserved without blowing up token usage.

**Streaming and UX.** Chat responses stream as NDJSON: `metadata` (conversationId, agentType, routing), `typing` heartbeat every 1.5s, `text` chunks, then `done`. The frontend parses this and shows a "Thinking..." state plus the router’s reasoning when available. Messages and conversations are stored in Postgres.

**Rate limiting.** In-memory sliding window: 10 requests per minute per user. User identified by `x-user-id` header, `userId` query param, or `x-forwarded-for` fallback.

**Database.** PostgreSQL with Prisma. The seed creates 5 users, sample orders, invoices, refunds, and a conversation with messages. Prisma is configured with the pg adapter for connection pooling.
