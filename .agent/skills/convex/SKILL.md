---
name: Convex Development
description: Best practices for writing robust, type-safe, and performant Convex functions.
---

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
