# 🏗️ Hayl Project Plan

> **Mission**: Create a premium Gym & Nutrition Webapp tailored for Ethiopia (Addis Ababa), featuring scientific workout plans (derived from expert sources), advanced timers, and myth-busting nutrition guides, powered by Bun, Elysia, Convex, and Telebirr.

## 📊 Project Status Overview

| Phase                  | Focus                                         | Status           |
| :--------------------- | :-------------------------------------------- | :--------------- |
| **I. Foundation**      | Repo, Stack, CI/CD, Safety                    | ✅ **COMPLETED** |
| **II. The Engine**     | Data Schema, Content Seeding, Quote Bank      | ✅ **COMPLETED** |
| **III. Workout UI**    | Evaluation, Active Timer, Asset Lazy-loading  | ✅ **COMPLETED** |
| **IV. Nutrition (ET)** | Addis-specific Foods, CICO Calc, Myth Busting | ✅ **COMPLETED** |
| **V. Monetization**    | Telebirr Integration, Premium Locking         | 🚧 **NEXT**      |

---

## 📅 detailed Implementation Phases

### ✅ PHASE I: Foundation & Infrastructure

**Goal**: Establish a safe, type-safe, and deployable codebase.

- [x] **Repo Setup**: Monorepo with Bun workspaces (`apps/web`, `apps/server`).
- [x] **Tech Stack**: ElysiaJS (Backend), React+Tailwind (Frontend), Convex (DB).
- [x] **Safety Gates**:
  - [x] `ANTIGRAVITY_RULES.md` established.
  - [x] Asset ingestion audit logging (`scripts/ingest-assets.ts`).
  - [x] Telebirr signature stub & failing tests.
- [x] **CI/CD**: GitHub Actions for Frontend (Pages) and Backend (Fly/Docker).

---

### 🚀 PHASE II: Data Modeling & Content Engine

**Goal**: Structure complex workout splits and create the "Quote Bank".
_Decision: Hybrid Data Approach. Static content (Plans/Quotes) in Convex (cached), User Progress in LocalStorage + Sync._

#### 2.1 Data Engine & Schema (Type-Safe)

- [x] **Refine `convex/schema.ts`**:
  - **Programs**: `slug`, `title` (e.g., "The HTLT Guide").
  - **DerivedPlans**: The CORE complexity engine. Add `variant` metadata.
  - **Workouts**: Nested arrays `days` -> `phases` -> `items`.
  - **Assets**: Strict asset pipeline.
- [x] **Quote Bank System**:
  - Create `quotes` table with tags: `motivational`, `funny`, `coach-greg`, `exercis-specific` (e.g., curls).
- [x] **Asset Pipeline**:
  - Finalize `scripts/ingest-assets.ts` to map exercises to lazy-loaded GIFs/Video URLs. `.gif` (10x smaller).
  - **Ingest Enforcement**: Script must record `robots.txt` check result and TOS URL.

#### 2.2 Seed "The Hayl Standard" Content

- [x] **Digitize "Sister/Mom" Guide**:
  - Convert PDF logic into JSON seed script.
- [x] **Digitize "Coach Greg" (Derived)**:
  - _Constraint_: No verbatim text. Re-write instructions.
  - Create "Hard" & "Medium" variations.
  - Set `requires_human_review: true`.

#### 2.3 Payment Infrastructure (Moved to Phase V)

- _Refactored to Phase V for better separation of concerns._

---

### ⏱️ PHASE III: The Active Workout Experience

**Goal**: A best-in-class "Active Mode" tailored for the gym floor.

#### 3.1 Architecture & Navigation

- [x] **Split Selector**: UI to choose frequency (2-day, 3-day, 4-day) and duration.
- [x] **Tabs System**:
  - _Top Level_: Split Days (Day 1, Day 2...).
  - _Sub Level_: Phases (Warmup, Workout, Stretch).

#### 3.2 The "Hyper-Timer"

- [x] **Wake Lock**: Implement `Screen Wake Lock API` to prevent phone sleeping during workouts.
- [x] **Global Timer**: Tracks total session duration.
- [x] **Set Timer (Smart)**:
  - Interactive "Done" button for sets.
  - Auto-starts rest timer based on intensity (e.g., 90s for compounds, 60s for iso).
  - "Too fast/Too slow" feedback toasts based on user input time.

### UI/UX Micro-Interactions

- **Athletic Clean**: Fluid transitions, large touch targets.
- **Haptics**: Vibrate on timer completion.
- **Lazy Loading**: `IntersectionObserver` for all Videos/GIFs.

#### 3.3 Interactive Cards

- [x] **Exercise Card**:
  - Lazy-loaded GIF cover.
  - Collapsible "Pro Tips" (Video embed/Text).
  - **Quote Injection**: Display a random context-aware quote (e.g., "Cheat on your curls...").
  - Input fields for Weight/Reps (Human readable: "10kg", "Plate + 5").

---

### ✅ PHASE IV: Nutrition (Ethiopia Edition)

**Goal**: Science-based nutrition adapted for Addis Ababa markets.

#### 4.1 "The Truth" Knowledge Base

- [x] **Myth Buster UI**:
  - Interactive "Fact vs. Cap" section.
  - Topics: "Fasted Cardio", "Dirty Bulk", "Spot Reduction".
  - Explanation: "It's just CICO (Calories In/Calories Out)".
- [x] **Calculator**:
  - TDEE Calculator adjusted for activity level.
  - Goals: Cut, Bulk (Clean), Maingain.
  - **Unit Converter**: "Sinig/Unit" guesstimator for local Addis measurements.

#### 4.2 Meal Plans (Addis Context)

- [x] **Ingredient Database**:
  - Teff, Shiro, Injera, local beef, eggs (price/macro estimates).
- [ ] **Budget Toggles**:
  - Low Cost (Lentils/Shiro focus) vs. Premium (Chicken breast/Imported whey).

---

### 💎 PHASE V: Monetization & Accounts

**Goal**: Premium features for sustainability.

#### 5.1 Telebirr Integration

- [x] **Implement Webhook**:
  - Replace `verifyTelebirrSignature` stub with real crypto logic.
  - Handle `COMPLETED` state to flip `isPremium` flag.
- [ ] **Payment Flow**:
  - "Buy Plan" button -> Telebirr H5/App Switch.

#### 5.2 Access Control

- [ ] **Guest vs. User**:
  - _Guest_: Access to "Foundations" & General Nutrition.
  - _Premium_: Access to "Coach Greg Derived" & Advanced Timers.

---

## 🛠️ Technical Decisions & Standards

### Technical Strategy: Offline & Sync

- **Primary Store**: `IndexedDB` (via **Dexie.js**) for active sessions.
- **Sync Protocol**:
  1. `sessionId` + `lastModifiedTs` per record.
  2. **Conflict Resolution**: `RemotelastModifiedTs` > `Local` ? Pull : Push. **Fallback**: If simultaneous edits on same set, create BOTH entries with metadata and surface conflict resolution UI. (Never silently lose data).
  3. **Audit**: Persist `changeLog[]` for session replays.

### UI/UX Design System: "Modern Athletic"

- **Style**: Clean, Editorial, High-Performance (Nike/Gymshark vibes).
- **Structure**: High whitespace, distinct content blocks, "Airy" layouts.
- **Typography**: **Inter** (Body/UI) + **Barlow Condensed** (Headings/Stats).
- **Theme**: Global **Light/Dark Mode** toggle.
- **Visuals**: No shadow spam. Subtle dividers. High-contrast data display.

### Safety Checks (Antigravity Rules)

- **Copyright**: All "Derived" plans must link to `source_refs` and pass human review.
- **CICO**: Nutrition advice must strictly adhere to thermodynamic laws (CICO). No fad diets.
- **Asset Compliance**: Every asset record MUST have `licenseType` and `robotsChecked` boolean.
