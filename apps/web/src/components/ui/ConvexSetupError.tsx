export function ConvexSetupError() {
  return (
    <div className="min-h-screen bg-hayl-bg text-hayl-text flex items-center justify-center p-6">
      <div className="w-full max-w-2xl border border-hayl-border rounded-2xl bg-hayl-surface p-6 space-y-4">
        <h1 className="font-heading text-2xl font-bold uppercase">Convex Setup Required</h1>
        <p className="text-sm text-hayl-muted">
          Set <strong>VITE_CONVEX_URL</strong> in <strong>apps/web/.env.local</strong> or set <strong>CONVEX_URL</strong> in the project root <strong>.env.local</strong>.
        </p>
        <pre className="text-xs overflow-x-auto bg-hayl-bg border border-hayl-border rounded-xl p-4">{`# apps/web/.env.local\nVITE_CONVEX_URL=https://your-deployment.convex.cloud\n\n# project root .env.local\nCONVEX_URL=https://your-deployment.convex.cloud`}</pre>
        <p className="text-xs text-hayl-muted">
          If you use local dev, run <strong>npx convex dev</strong> and copy the generated URL.
        </p>
      </div>
    </div>
  );
}
