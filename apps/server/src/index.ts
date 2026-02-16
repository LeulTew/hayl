import { Elysia, t } from 'elysia';
import { telebirrWebhook } from './webhooks/telebirr';

export const app = new Elysia();

app.get('/', () => 'Hayl Backend Active 🇪🇹');

app.use(telebirrWebhook);

function isAddrInUseError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.message.includes('EADDRINUSE') || error.message.includes('port');
}

function resolveBasePort(): number {
  const rawPort = Number(process.env.PORT);
  if (Number.isFinite(rawPort) && rawPort > 0) {
    return rawPort;
  }

  return 3000;
}

function startServerWithFallback(appInstance: Elysia, basePort: number): number {
  try {
    appInstance.listen(basePort);
    return basePort;
  } catch (error) {
    if (!isAddrInUseError(error)) {
      throw error;
    }

    const fallbackPort = basePort + 1;
    appInstance.listen(fallbackPort);
    console.warn(
      `Port ${basePort} is in use. Hayl Elysia server started on fallback port ${fallbackPort}.`,
    );
    return fallbackPort;
  }
}


if (import.meta.main) {
  const activePort = startServerWithFallback(app, resolveBasePort());
  console.log(`Hayl Elysia server running on port ${activePort}`);
}
