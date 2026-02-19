# Nutrition Source Notes (2026)

Accessed in 2026 while expanding Phase 4 Ethiopian food coverage.

## Primary references

- USDA FoodData Central API Guide: https://fdc.nal.usda.gov/api-guide
  - Public-domain nutrient data (CC0), current API endpoints, and data documentation links.
  - Used as the main reference for per-100g values and equivalent-food matching.
- FAO INFOODS Africa tables and databases index: https://www.fao.org/infoods/infoods/tables-and-databases/africa/en/
  - FAO index page listing African food composition resources.
  - Page includes update metadata (Last update: 20-10-2022; FAO site copyright 2026).
- FAO Food Composition Data handbook: https://www.fao.org/4/y4705e/y4705e00.htm
  - Method guidance for recipe-based composition and dish calculation.

## Dataset policy applied in code

- Core ingredient equivalents use USDA FDC-style per-100g values.
- Ethiopian mixed dishes use recipe-derived estimates from ingredient equivalents.
- Added `sourceRefs` per ingredient to indicate provenance in `packages/shared/nutrition.ts`.
- Fasting and non-fasting Ethiopian tags were expanded using `localeTags` for filtering and planning.
