# Hayl 🏋️

> A premium Gym & Nutrition Webapp for Ethiopia — Scientific workouts, myth-busting nutrition, and offline-first design.

## 🎯 Vision

Hayl is not just another fitness app. It's a **complete training system** featuring:

- **Workout Guides**: Categorized by difficulty, split type (2/3/4-day), duration (60/90 min), and level (amateur to elite).
- **Smart Timers**: Session timer, set timer with rest tracking, and "too fast/too slow" feedback.
- **Quote Bank**: Contextual motivational quotes injected during workouts.
- **Ethiopia-First Nutrition**: CICO-based advice using local ingredients (Teff, Shiro, Injera) with Addis Ababa pricing.
- **Myth Busting**: Debunking fitness influencer nonsense with science.

## 🛠️ Tech Stack

| Layer      | Technology                  |
| :--------- | :-------------------------- |
| Runtime    | Bun                         |
| Backend    | ElysiaJS                    |
| Database   | Convex                      |
| Frontend   | React + Tailwind CSS (Vite) |
| Offline    | Dexie.js (IndexedDB)        |
| Payments   | Telebirr (Ethiopia)         |
| Deployment | Cloudflare Pages + Fly.io   |

## 📂 Directory Structure

```
hayl/
├── apps/
│   ├── web/          # Frontend (Vite + React)
│   ├── server/       # Backend (ElysiaJS)
│   └── admin/        # Internal admin UI
├── packages/
│   └── shared-types/ # Shared TypeScript definitions
├── convex/           # Convex functions & schema
├── scripts/          # Seeding & maintenance scripts
└── assets/           # Static assets (Note: reference-docs are internal only)
```

## 🎨 Design System

Hayl follows a strict **"Modern Athletic"** design language:

- **Mobile-First, Desktop-Ready**: Responsive from phones to large monitors.
- **No Glassmorphism**: Clean, flat surfaces.
- **No Shadows**: Borders and contrast only.
- **5-Level Color Palette**: Semantic tokens with light/dark variants.
- **Premium Typography**: Inter (body) + Barlow Condensed (headings).

See [PROJECT_PLAN.md](./PROJECT_PLAN.md) for the full design specification.

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.0+
- [Convex CLI](https://docs.convex.dev/quickstart)

### Setup

```bash
# Install dependencies
bun install

# Start Convex (in a separate terminal)
npx convex dev

# Start development servers
bun run dev
```

### Environment Variables

Create `.env.local` in the project root:

```env
CONVEX_DEPLOYMENT=dev:your-deployment-id
CONVEX_URL=https://your-deployment.convex.cloud
```

For the web app, also create `apps/web/.env.local`:

```env
VITE_CONVEX_URL=https://your-deployment.convex.cloud
```

## 📋 Project Status

| Phase                | Status      |
| :------------------- | :---------- |
| Foundation           | ✅ Complete |
| Data Engine          | ✅ Complete |
| Workout UI           | ✅ Complete |
| Nutrition (Ethiopia) | ✅ Complete |
| **UX Overhaul**      | 🔴 Active   |
| Monetization         | 🚧 Paused   |

See [PROJECT_PLAN.md](./PROJECT_PLAN.md) for detailed phase breakdowns.

## 🔒 Safety & Licensing

- **Reference Materials**: PDFs in `assets/reference-docs/` are for internal developer reference only. They must NEVER be published or made accessible via the web.
- **Content Policy**: All workout instructions are manually drafted and reviewed. No verbatim copying.
- **CICO Only**: Nutrition advice strictly follows thermodynamic principles (Calories In vs. Calories Out).

## 🤝 Contributing

This is currently a private project. If you have access, please follow the `ANTIGRAVITY_RULES.md` for code safety standards.

---

_Built with care for Ethiopian fitness enthusiasts_ 🇪🇹
