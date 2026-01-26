import { Elysia } from 'elysia';

const app = new Elysia();

app.get('/', () => 'Hayl Backend Active 🇪🇹');

app.post('/webhooks/telebirr', async ({ body }) => {
  // Body validation + Telebirr signature verification MUST be implemented
  const payload = body as any;
  // TODO: Add strict type checking and signature verification
  // const signature = headers['x-telebirr-signature'];
  
  if (payload?.state !== 'COMPLETED') return { status: 'ignored' };
  
  // TODO: call Convex function to upgrade user / record payment
  // await convexClient.mutation('internal:upgradeUser', { orderId: payload.orderNo, transactionId: payload.transactionId });
  
  return { ok: true };
});

app.listen(3000);
console.log('Hayl Elysia server running on port 3000');
