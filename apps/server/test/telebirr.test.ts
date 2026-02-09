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

  it("should accept valid completed payload (Signed)", async () => {
    // Valid payload
    const payload = {
      out_trade_no: "123",
      transaction_id: "tx_valid_1",
      state: "COMPLETED",
      amount: "100",
      currency: "ETB"
    };

    // Sign it (logic moved down)
    
    // Sort and sign (duplicating logic for test verification)
    // Assuming the app reads process.env.TELEBIRR_SECRET or we can mock it
    // For this test, we might need to mock verifyTelebirrSignature or ensure env var is set
    
    // Sort and sign (duplicating logic for test verification)
    const sortedKeys = (Object.keys(payload) as Array<keyof typeof payload>).sort();
    const stringToSign = sortedKeys.map(k => `${k}=${payload[k]}`).join('&');

    const signedPayload = { ...payload };
    // @ts-ignore - Bun test env
    // Mocking the secret check inside the app is tricky without dependency injection
    // But we can try setting the verified behavior if possible
    // Actually, verification logic in `telebirr.ts` reads `secret` arg.
    // Import the signer dynamically
    // Note: In bun test environment, we might need relative path from test file
    const { signTelebirrPayload } = await import("../src/webhooks/telebirr");

    const secret = "test-secret"; // Moved declaration here
    process.env.TELEBIRR_SECRET = secret; // Moved declaration here
    const validSig = signTelebirrPayload(payload, secret);
    
    const response = await app.handle(
      new Request(`${BASE_URL}/webhooks/telebirr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, sign: validSig }),
      })
    );
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual({ ok: true });
  });
});
