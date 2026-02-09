import { Elysia, t } from 'elysia';
import { telebirrWebhook } from './webhooks/telebirr';

export const app = new Elysia();

app.get('/', () => 'Hayl Backend Active 🇪🇹');

app.use(telebirrWebhook);


if (import.meta.main) {
  app.listen(3000);
  console.log('Hayl Elysia server running on port 3000');
}
