import { describe, expect, it } from "bun:test";
import { app } from "../src/index"; 

describe("Telebirr Webhook Integration", () => {
  const BASE_URL = "http://localhost:3000";

  it("should reject invalid schema with 400/422", async () => {
    const response = await app.handle(
      new Request(`${BASE_URL}/webhooks/telebirr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Missing required fields
          foo: "bar"
        }),
      })
    );
    
    // Elysia validation failure
    expect(response.status).toBe(422); 
  });

  it("should accept valid completed payload (Stubbed Sig)", async () => {
    const response = await app.handle(
      new Request(`${BASE_URL}/webhooks/telebirr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          out_trade_no: "123",
          transaction_id: "tx_valid_1",
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
});
