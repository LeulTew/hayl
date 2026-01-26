import { Elysia, t } from 'elysia';

export const app = new Elysia();

app.get('/', () => 'Hayl Backend Active 🇪🇹');

app.post('/webhooks/telebirr', async ({ body, headers }) => {
  // Application Rule: Verify signature before processing
  // const signature = headers['x-telebirr-signature'];
  // if (!verifyTelebirrSignature(signature, body)) {
  //   throw new Error('Invalid Signature');
  // }
  
  if (body.state !== 'COMPLETED') {
    return { status: 'ignored', reason: 'state_not_completed' };
  }
  
  // TODO: call Convex function to upgrade user / record payment
  // await convexClient.mutation('internal:upgradeUser', { orderId: body.out_trade_no, transactionId: body.transaction_id });
  
  return { ok: true };
}, {
  body: t.Object({
    orderNo: t.String(),
    out_trade_no: t.String(),
    transaction_id: t.String(),
    state: t.String(),
    amount: t.String(), // Telebirr often sends amounts as strings
    currency: t.String(),
  }),
  // headers: t.Object({
  //   'x-telebirr-signature': t.String()
  // })
});

// Helper for type-safe validation (Placeholder)
function verifyTelebirrSignature(signature: string | undefined, payload: Record<string, unknown>): boolean {
  console.warn('[SECURITY] Telebirr signature verification NOT IMPLEMENTED');
  return false; 
}

app.listen(3000);
console.log('Hayl Elysia server running on port 3000');
