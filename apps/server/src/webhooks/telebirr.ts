import { Elysia, t } from 'elysia';
import crypto from 'crypto';

// Setup Elysia router strictly for this webhook
export const telebirrWebhook = new Elysia()
  .post('/webhooks/telebirr', async ({ body, headers, set }) => {
    // 1. Signature Verification
    // In production, this verifies strict H5/App/Miniprogram signatures.
    const secret = process.env.TELEBIRR_SECRET;
    if (!verifyTelebirrSignature(body, secret || "")) {
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
      sign: t.String(),
      // Add other Telebirr fields as optional
      msisdn: t.Optional(t.String()),
    })
  });

export function signTelebirrPayload(payload: Record<string, unknown>, secret: string): string {
    const { sign, ...rest } = payload;
    
    // Sort keys and filter out null/undefined/empty
    const sortedKeys = Object.keys(rest).sort();
    const stringToSign = sortedKeys
        .filter(k => rest[k] !== null && rest[k] !== undefined && rest[k] !== '')
        .map(k => `${k}=${rest[k]}`)
        .join('&');

    return crypto.createHmac('sha256', secret)
        .update(stringToSign)
        .digest('hex');
}

function verifyTelebirrSignature(payload: Record<string, unknown>, secret: string): boolean {
    if (!secret || secret === "todo-secret") {
        console.warn("Telebirr Signature Validation Failed: Missing Secret (Failing Closed)");
        return false;
    }
    
    // If payload doesn't have signature, fail
    // If payload doesn't have signature, fail
    if (typeof payload.sign !== 'string') return false;

    const computed = signTelebirrPayload(payload, secret);
    
    // Constant-time comparison to prevent timing attacks
    // Constant-time comparison to prevent timing attacks
    const computedBuffer = Buffer.from(computed, 'hex');
    const payloadBuffer = Buffer.from(payload.sign, 'hex');

    if (computedBuffer.length !== payloadBuffer.length) return false;
    
    return crypto.timingSafeEqual(computedBuffer, payloadBuffer);
}
