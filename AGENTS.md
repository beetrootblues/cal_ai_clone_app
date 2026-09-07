# Cal AI (PWA) — Agent Quick Reference

> **Active app:** the iPhone-installable PWA at the **repo root** (Vite + React 18 + Convex + Tailwind 4).
> The legacy Next.js/PHP app in `web/` is **frozen** — do not extend it; `.agents/AGENT.md` describes that legacy app only.

---

## TL;DR
- **Type:** PWA (Add to Home Screen on iPhone), device-scoped accounts (no passwords)
- **Stack:** Vite + React 18 + TypeScript (strict) + Tailwind CSS 4 (`@tailwindcss/vite`) + Convex + framer-motion + lucide-react
- **Backend:** Convex functions in `src/convex/` (schema, queries, mutations, AI actions)
- **AI:** OpenAI `gpt-4o-mini` vision via Convex actions (`src/convex/ai.ts`) — needs `OPENAI_API_KEY` (server-side env, set in the Freebuff keys panel)
- **Auth:** device-scoped — email stored in `localStorage`, auto-provisioned user via `api.users.startIfNeeded`
- **PWA:** `public/manifest.webmanifest`, `public/sw.js` (app-shell cache, stale-while-revalidate), icons in `public/`
- **Package manager:** Bun
- **Dev:** `bun run dev` (Vite, binds 0.0.0.0, port from `$PORT` else 5173)
- **Build:** `bun run build` → `dist/`
- **Type check:** `bun tsc -b --noEmit`
- **Convex codegen:** `bun convex dev --once` (generates `src/convex/_generated/`)

---

## Screens (state-based routing in `src/App.tsx`, no react-router)
| Screen | File | Purpose |
|--------|------|---------|
| Landing | `src/screens/Landing.tsx` | Marketing + email start (first run) |
| Onboarding | `src/screens/Onboarding.tsx` | Body stats → auto calorie/macro targets |
| Home | `src/screens/Home.tsx` | Cal ring, macros, water, today's meals |
| Scan | `src/screens/Scan.tsx` | AI photo scan + text/manual logging |
| History | `src/screens/History.tsx` | Past meals by date |
| Progress | `src/screens/Progress.tsx` | 14-day bars, streaks, weight, achievements |
| Profile | `src/screens/Profile.tsx` | Targets editing, install guide, sign out |
| InstallGuide | `src/screens/InstallGuide.tsx` | iPhone Add-to-Home-Screen steps |

Shared components: `src/components/` (CalRing, MacroBars, BottomNav).
Lib: `src/lib/` (health math, image compress/upload, scan types, user context).

## Convex Backend (`src/convex/`)
Tables: `users` · `meals` · `waterLogs` · `weightLogs`

| File | Exports |
|------|---------|
| `users.ts` | startIfNeeded, getByEmail, get, create, completeOnboarding, updateGoals, updateManualTargets |
| `meals.ts` | byDate, recent, log, remove, generateUploadUrl, attachPhoto, getImageUrl |
| `tracking.ts` | getWater, logWater, getWeights, logWeight |
| `ai.ts` | analyzeMealPhoto, analyzeText (both `"use node"` actions, OpenAI) |
| `http.ts` | GET `/getImageUrl?id=` storage redirect |
| `schema.ts` | tables + indexes (by_email, by_user, by_user_date) |

**Rules:** only function exports are allowed in `src/convex/` (a plain-const export fails the push). Never edit `src/convex/_generated/`.

## Env vars
- `VITE_CONVEX_URL` — client Convex deployment URL (injected by the platform)
- `OPENAI_API_KEY` — server-side, used by Convex AI actions

## Conventions
- Tailwind 4 only; custom utilities live in `src/index.css` (`.card`, `.btn-primary`, `.btn-ghost`, `.safe-top`, `.pb-tab`, `.no-scrollbar`, `.scanline`).
- iOS safe areas via `env(safe-area-inset-*)`; tab bar in `BottomNav.tsx`.
- Meals are keyed by device-local `dateKey` (YYYY-MM-DD, `dateKeyLocal()`).
- Keep the app dark-themed (`#09090b` bg, `#d3fd50` lime accent).
