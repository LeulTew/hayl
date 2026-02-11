---
name: ElysiaJS Development
description: Best practices for high-performance, type-safe API development with ElysiaJS.
---

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
