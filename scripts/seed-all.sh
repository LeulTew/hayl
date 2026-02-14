#!/bin/bash
export ADMIN_SECRET="hayl-seed-secret-2026"

echo "🌱 Seeding Foundations..."
bun scripts/seed-foundations.ts

echo "🌱 Seeding Casual..."
bun scripts/seed-casual-1.ts
bun scripts/seed-casual-2.ts
bun scripts/seed-casual-3.ts
bun scripts/seed-casual-4.ts

echo "🌱 Seeding Moderate..."
bun scripts/seed-moderate-1.ts
bun scripts/seed-moderate-2.ts
bun scripts/seed-moderate-3.ts
bun scripts/seed-moderate-4.ts

echo "🌱 Seeding Hardcore..."
bun scripts/seed-hardcore-1.ts
bun scripts/seed-hardcore-2.ts
bun scripts/seed-hardcore-3.ts
bun scripts/seed-hardcore-4.ts

echo "🌱 Seeding Hayl Protocols..."
bun scripts/seed-hayl-efficiency.ts
bun scripts/seed-hayl-minimalist.ts
bun scripts/seed-hayl-powerbuilder.ts

echo "🌱 Seeding Nutrition..."
bun scripts/seed-nutrition.ts

echo "🌱 Seeding Quotes..."
bun scripts/seed-quotes.ts

echo "✅ All seeds completed."
