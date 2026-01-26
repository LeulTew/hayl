import { Elysia, t } from 'elysia';
import { createHmac } from 'crypto';

// Setup Elysia router strictly for this webhook
export const telebirrWebhook = new Elysia()
  .post('/webhooks/telebirr', async ({ body, headers, set }) => {
    // 1. Signature Verification
    // In production, this verifies strict H5/App/Miniprogram signatures.
    // Given the lack of a real secret in this context, we use the placeholder but structure it correctly.
    if (!verifyTelebirrSignature(body, "todo-secret")) {
        set.status = 401;
        return { status: "error", message: "Invalid Signature" };
    }

    const payload = body;

    // 2. Idempotency Check (Mock - in real app, query Convex `payments` by transactionId)
    // const existing = await convex.query(api.payments.getByTransaction, { transactionId: payload.transaction_id });
    // if (existing) return { status: "idempotent_success" };
    
    // 3. Process State
    if (payload.state === 'COMPLETED') {
        // await convex.mutation(api.payments.recordSuccess, { ... })
        console.log(`[AUDIT] Payment Success: ${payload.transaction_id}`);
    }

    return { ok: true };
  }, {
    body: t.Object({
      out_trade_no: t.String(),
      transaction_id: t.String(),
      state: t.String(),
      amount: t.String(),
      currency: t.String(),
      // Add other Telebirr fields as optional
      msisdn: t.Optional(t.String()),
    })
  });

function verifyTelebirrSignature(payload: Record<string, unknown>, secret: string): boolean {
    // REAL IMPLEMENTATION (Commented out until secret available)
    // const sortedKeys = Object.keys(payload).sort().filter(k => k !== 'sign');
    // const stringToSign = sortedKeys.map(k => `${k}=${payload[k]}`).join('&');
    // const signature = createHmac('sha256', secret).update(stringToSign).digest('hex');
    // return signature === payload.sign;
    
    console.warn("Telebirr Signature Stub - Always returning TRUE for dev/test without secret");
    return true; 
}
