import { describe, expect, it } from "bun:test";
import { app } from "../src/index"; // We need to export app from index.ts or create a factory

describe("Telebirr Webhook Integration", () => {
  const BASE_URL = "http://localhost:3000";

  it("should reject invalid schema (missing required fields)", async () => {
    const response = await app.handle(
      new Request(`${BASE_URL}/webhooks/telebirr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Missing orderNo, etc.
          foo: "bar"
        }),
      })
    );
    
    // Elysia default validation error is 422
    expect(response.status).toBe(422);
  });

  it("should accept valid completed payload", async () => {
    const response = await app.handle(
      new Request(`${BASE_URL}/webhooks/telebirr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNo: "123",
          out_trade_no: "123",
          transaction_id: "tx_123",
          state: "COMPLETED",
          amount: "100",
          currency: "ETB"
        }),
      })
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual({ ok: true });
  });

  it("should ignore non-completed payments", async () => {
    const response = await app.handle(
      new Request(`${BASE_URL}/webhooks/telebirr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNo: "123",
          out_trade_no: "123",
          transaction_id: "tx_123",
          state: "PENDING",
          amount: "100",
          currency: "ETB"
        }),
      })
    );

    expect(response.status).toBe(200);
    const json = await response.json() as any;
    expect(json.status).toBe("ignored");
  });
});
