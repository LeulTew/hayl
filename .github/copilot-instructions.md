# Antigravity Skills & Instructions

This file contains the core development guidelines and skills for the project. These should be followed when generating code.

---

## 1. Expert Frontend Design

# Role: Expert Sr. Frontend Engineer & UI/UX Designer

# Objective

Create production-grade, highly polished SaaS interfaces. You strictly avoid "AI Slop" (generic, sparse, or low-effort designs). Your goal is not to simplify by removing functionality, but to manage complexity through intelligent layout, collapsing, and progressive disclosure.

# Core Design Philosophy

1. **Density over sparsity:** Do not create "sparse" layouts with wasted whitespace. If a page feels empty, do not fill it with large generic icons or emojis. Fill it with relevant data, micro-charts, or helpful context.
2. **Hide, Don't Remove:** Never remove important capabilities to "clean up" a UI. Instead:
   - **Collapse:** Use accordions for "Advanced Options" in forms.
   - **Tuck:** Move secondary actions (Edit, Delete, Settings) into "..." (triple dot) dropdown menus.
   - **Popovers:** Use popovers for menus that don't need to be always visible (e.g., specific filter sets).
   - **Modals:** Use modals for creation flows rather than navigating to a sparse full-page form.
3. **No Emojis:** Never use emojis for UI icons. Use professional SVG icon sets (Lucide React or Phosphor).
4. **Professional Color:** Do not generate bright, clashing color palettes. Use neutral, professional backgrounds (slate, gray, or subtle dark tones). Allow data visualizations (charts, status badges) to provide the color accents.

# Layout & Component Rules

- **Navigation:** Use left-aligned, tightly spaced sidebars. Avoid gradient circles for user avatars; use proper "Account Cards" with name/email details tucked into a popover.
- **Data Display:**
  - Avoid repetitive labels.
  - Use "Micro-charts" (sparklines, small bar charts) inside cards instead of static icons.
  - For geographic data, use shaded maps, not basic bar charts.
- **Forms:**
  - Default to "Smart Defaults."
  - Collapse non-essential fields.
  - Use high-quality input components (Radix UI/Shadcn primitives).
- **Landing Pages:**
  - Use skewed app screenshots or "bento grid" style graphics.
  - Do not use generic abstract icons features.

# Technical Stack & Libraries

- **Framework:** React (Next.js preferred)
- **Styling:** Tailwind CSS (Focus on `flex`, `grid`, `gap-2`, `p-4` for tight, consistent spacing).
- **Icons:** `lucide-react` (Stroke width: 1.5px or 2px for consistency).
- **Components:** `shadcn/ui` (Radix UI) for accessible, unstyled primitives.
- **Charts:** `recharts` for data visualization.

# "Anti-Slop" Checklist (Verify before outputting code)

- [ ] Did I use an emoji? (If yes -> Replace with Lucide icon).
- [ ] Is the page too empty? (If yes -> Add a relevant chart or collapse the form into a modal).
- [ ] Am I showing the same KPI 3 times? (If yes -> Consolidate).
- [ ] Did I pick a random bright color? (If yes -> Revert to Slate/Zinc/Neutral).

---

## 2. Convex Development

# Convex Development Guidelines

This skill defines the standards for writing code within the `convex/` directory, updated for **Convex 2026**.

## 1. Core Principles

- **Type Safety is Paramount**: Never use `any`. Rely on Convex's automatic type inference from `schema.ts`.
- **File Structure**: Organize functions by domain (e.g., `conversations.ts`, `users.ts`).
- **Strict Schema**: All data validation happens at the schema level. Run `npx convex dev` to sync schema changes.

## 2. Schema Definition (`convex/schema.ts`)

- **Always** define tables in `schema.ts` using `defineSchema` and `defineTable`.
- **Validators**: Use the `v` object for runtime validation.
- **Relationships**: Use `v.id("tableName")` for foreign keys. Do not use plain strings for IDs.
- **New 2026**: Use `v.nullable()` for optional fields instead of explicit unions where possible.

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    // Updated 2026 pattern: simplified nullable
    bio: v.optional(v.string()),
  }).index("by_email", ["email"]),

  tasks: defineTable({
    userId: v.id("users"), // STRICT foreign key typing
    text: v.string(),
    isCompleted: v.boolean(),
  }).index("by_user", ["userId"]),
});
```

## 3. Writing Functions

### 3.1 Queries (Read-Only)

- Use `query` from `convex/_generated/server`.
- **NEVER** modify data in a query.
- **Pagination**: Use `paginationOpts` for lists that might grow large (>100 items).
- **Performance**: Prefer `.withIndex()` over `.filter()`. `.filter()` performs a full table scan which is O(N) and slow.
- **Async Indexes**: Remember that index backfills are async; large table changes won't block deployment.

**BAD (Full Scan):**

```typescript
// ❌ Scans entire DB
const tasks = await ctx.db
  .query("tasks")
  .filter((q) => q.eq(q.field("userId"), args.userId))
  .collect();
```

**GOOD (Indexed):**

```typescript
// ✅ Uses database index
const tasks = await ctx.db
  .query("tasks")
  .withIndex("by_user", (q) => q.eq("userId", args.userId))
  .collect();
```

### 3.2 Mutations (Writes)

- Use `mutation` from `convex/_generated/server`.
- **Auth Checks**: Always check authentication at the very start of a public mutation using `ctx.auth.getUserIdentity()`.
- **Atomic**: Mutations are transactional.
- **Strict Table Names**: Calls to `db.get`, `db.insert`, etc., require explicit table name strings.

```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createTask = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Insert returns the new ID
    const newId = await ctx.db.insert("tasks", {
      userId: identity.subject as Id<"users">,
      text: args.text,
      isCompleted: false,
    });
    return newId;
  },
});
```

### 3.3 Internal Functions

- Use `internalMutation` or `internalQuery` for functions that should NOT be callable from the frontend (e.g., called by cron jobs or explicit backend actions).
- In `convex/_generated/api.d.ts`, these are accessible via `internal.filename.func`.

## 4. Authentication Patterns

- **Context Auth**: Use `ctx.auth.getUserIdentity()` to get the current user.
- **User Mapping**: Often you need to map the identity subject (from Clerk/Auth0) to your own `users` table \_id.
- **Helper Pattern**: Create a helper like `getCurrentUser` to avoid repeating lookup logic.

```typescript
// Helper example
async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return await ctx.db
    .query("users")
    .withIndex("by_id", (q) => q.eq("externalId", identity.subject))
    .unique();
}
```

## 5. Anti-Patterns to Avoid

- **Directly throwing generic errors**: Throw specific, readable errors.
- **Filtering in memory**: Don't fetch 1000 records and filter in JS using `Array.filter`.
- **Ignoring `Id` types**: Don't cast IDs to strings. Keep them as `Id<"tableName">`.
- **N+1 Queries**: Don't iterate over a list of items and run a `db.get()` for each.

## 6. HTTP Actions

- Use `httpAction` for webhooks (Stripe, etc.) if specific header control isn't needed, BUT prefer the Elysia/Bun gateway pattern for complex signatures (as established in project `hayl`).

---

## 3. ElysiaJS Development

# ElysiaJS Development Guidelines (2026 Edition)

This skill defines the standards for writing code related to the ElysiaJS backend in `apps/server`.

## 1. Core Principles

- **Type Safety**: Leverage Elysia's "Standard Schema" support. Use strict types for all bodies, query params, and headers.
- **Performance**: Elysia on Bun is extremely fast. Don't ruin it with synchronous blocking code.
- **Separation**: The Elysia server is an **Edge Gateway**. It validates, sanitizes, and then hands off to Convex (via `convex-client` or HTTP). It does NOT own business logic or state.

## 2. Basic Server Structure

- Keep `index.ts` minimal. It should just register plugins/controllers.
- Use `app.group` to organize routes.

```typescript
import { Elysia } from "elysia";
import { telebirrWebhook } from "./webhooks/telebirr";

const app = new Elysia()
  .get("/", () => "Health Check 200")
  .group("/webhooks", (app) => app.use(telebirrWebhook))
  .listen(3000);
```

## 3. Validation (Standard Schema / TypeBox)

- Elysia uses a standardized schema approach.
- **ALWAYS** validate inbound data. Never trust `body` or `query` without a schema.

```typescript
import { Elysia, t } from "elysia";

new Elysia().post("/user/sign-in", ({ body }) => body, {
  body: t.Object({
    username: t.String(),
    password: t.String(),
  }),
});
```

## 4. Webhook Handling (The "Blast Shield" Pattern)

This is the primary use case for Elysia in this project.

1.  **Raw Streams**: For payment gateways (Stripe, Telebirr), you often need the raw request body for signature verification.
2.  **Verification**: Perform signature verification **immediately**. If it fails, return 400/401 and do not proceed.
3.  **Handoff**: Once verified, extract the payload and trigger a Convex function.

```typescript
// webhooks/telebirr.ts
import { Elysia, t } from "elysia";

export const webhook = new Elysia().post(
  "/",
  async ({ body, set }) => {
    const signatureValid = verifySignature(body);
    if (!signatureValid) {
      set.status = 401;
      return "Invalid Signature";
    }

    // Push to Convex only AFTER validation
    // await convex.mutation(...)

    return { success: true };
  },
  {
    body: t.Object({
      /* shape */
    }),
  },
);
```

## 5. Error Handling

- Use Elysia's `error` lifecycle hook or local `error` handling.
- Return standardized JSON error responses.
- Do not leak stack traces to the public.

## 6. Testing

- Use `bun test`.
- Use Elysia's `.handle(request)` to test endpoints without spinning up a full server.

```typescript
import { describe, expect, it } from "bun:test";
import { app } from "../src/index";

describe("Elysia", () => {
  it("return a response", async () => {
    const response = await app
      .handle(new Request("http://localhost/"))
      .then((res) => res.text());

    expect(response).toBe("Health Check 200");
  });
});
```
