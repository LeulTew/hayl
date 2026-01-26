# Hayl

Hayl is a fitness web application built with a modern stack focusing on performance and simplicity.

## Stack

- **Runtime:** Bun
- **Backend:** ElysiaJS
- **Database:** Convex
- **Frontend:** React + Tailwind (Vite)
- **Deployment:** Cloudflare Pages (Frontend), Fly.io/Render (Backend)

## Directory Structure

- `apps/web`: Frontend application (Vite + React)
- `apps/server`: Backend application (ElysiaJS)
- `apps/admin`: Internal admin UI
- `packages/shared-types`: Shared TypeScript definitions
- `convex`: Convex API functions and schema
- `scripts`: Maintenance and seeding scripts
- `assets`: Static assets (Note: `reference-docs` are ignored and strictly for internal use)

## Setup

1. Install dependencies:

   ```bash
   bun install
   ```

2. Environment Setup:
   - Configure `.env` with `CONVEX_URL`, `CONVEX_KEY`, `TELEBIRR_SECRET` etc. (See `env.example` if available)

## Development

- **Server:** `cd apps/server && bun dev`
- **Web:** `cd apps/web && bun dev`
- **Convex:** `npx convex dev`

## Deployment

CI/CD is configured via GitHub Actions.

- Frontend deploys to Cloudflare Pages.
- Backend deploys via Dockerfile (target TBD).

## Licensing & Safety

- **Reference Docs:** PDFs in `assets/reference-docs` are for developer reference only and must never be published verbatim or accessible via the public web server.
- **Content:** Derived plans must go through human review.
