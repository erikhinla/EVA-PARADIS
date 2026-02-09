# AVA_PARADIS Project Manifest

> Generated: 2026-02-06
> Source: `/Users/erikhowerbush/PROJECTS/AVA_PARADIS/`
> Structure: Next.js 16.1.5 app inside `bridge-pages/eva-landing/`

---

## Root & Configuration Files

---

FILE: `bridge-pages/eva-landing/package.json`
PURPOSE: Project manifest defining Next.js 16.1.5 app with Anthropic, Supabase, Resend, Framer Motion, Zod, and shadcn/ui dependencies
LAST MODIFIED: 2026-02-04
STATUS: active
DEPENDENCIES: (npm packages only)

---

FILE: `bridge-pages/eva-landing/tsconfig.json`
PURPOSE: TypeScript compiler config with strict mode and `@/*` path alias mapped to `./src/*`
LAST MODIFIED: 2026-01-31
STATUS: active
DEPENDENCIES: None

---

FILE: `bridge-pages/eva-landing/next.config.ts`
PURPOSE: Next.js configuration; sets Turbopack root directory
LAST MODIFIED: 2026-01-31
STATUS: active
DEPENDENCIES: None

---

FILE: `bridge-pages/eva-landing/.gitignore`
PURPOSE: Standard Next.js/Node gitignore rules
LAST MODIFIED: 2026-02-04
STATUS: active
DEPENDENCIES: None

---

FILE: `bridge-pages/eva-landing/README.md`
PURPOSE: Default create-next-app boilerplate README (never updated for this project)
LAST MODIFIED: 2026-01-31
STATUS: deprecated
DEPENDENCIES: None

---

FILE: `bridge-pages/eva-landing/.env.local`
PURPOSE: Environment variable definitions for secrets and API keys
LAST MODIFIED: 2026-02-04
STATUS: active
DEPENDENCIES: None

---

FILE: `bridge-pages/eva-landing/.vercel/project.json`
PURPOSE: Vercel deployment linkage (projectId, orgId, projectName: "eva-landing")
LAST MODIFIED: 2026-02-04
STATUS: active
DEPENDENCIES: None

---

FILE: `bridge-pages/eva-landing/.vercel/README.txt`
PURPOSE: Vercel boilerplate explaining the .vercel directory
LAST MODIFIED: 2026-02-04
STATUS: active
DEPENDENCIES: None

---

FILE: `bridge-pages/eva-landing/next-env.d.ts`
PURPOSE: Auto-generated Next.js TypeScript reference types
LAST MODIFIED: 2026-02-05
STATUS: active
DEPENDENCIES: None

---

FILE: `bridge-pages/eva-landing/docs/supabase-schema.sql`
PURPOSE: SQL schema for `assets` and `queue_jobs` tables with indexes, triggers, and RLS stubs
LAST MODIFIED: 2026-02-01
STATUS: active
DEPENDENCIES: None

---

## Public / Static Assets

---

FILE: `bridge-pages/eva-landing/public/eva-landing-page-final.html`
PURPOSE: Self-contained static HTML landing page -- the LIVE page served to visitors via redirect from page.tsx
LAST MODIFIED: 2026-02-05
STATUS: active
DEPENDENCIES: Google Fonts (external CDN), Meta Pixel (external script)

---

FILE: `bridge-pages/eva-landing/public/eva-red-carpet-16x9.mp4`
PURPOSE: Red carpet video asset used in the static landing page
LAST MODIFIED: 2026-02-05
STATUS: active
DEPENDENCIES: None

---

FILE: `bridge-pages/eva-landing/public/hero-video.mp4`
PURPOSE: Hero background video asset
LAST MODIFIED: 2026-02-03
STATUS: active
DEPENDENCIES: None

---

FILE: `bridge-pages/eva-landing/src/app/favicon.ico`
PURPOSE: Site favicon
LAST MODIFIED: 2026-01-31
STATUS: active
DEPENDENCIES: None

---

## App Routes -- Pages

---

FILE: `bridge-pages/eva-landing/src/app/layout.tsx`
PURPOSE: Root layout; loads Inter, Cinzel, Cormorant Garamond fonts; sets metadata for "Eva Paradis Brand Bridge"
LAST MODIFIED: 2026-02-04
STATUS: active
DEPENDENCIES: `globals.css`

---

FILE: `bridge-pages/eva-landing/src/app/page.tsx`
PURPOSE: Root page; immediately redirects ALL traffic to `/eva-landing-page-final.html` preserving query params
LAST MODIFIED: 2026-02-05
STATUS: active
DEPENDENCIES: `next/navigation`

---

FILE: `bridge-pages/eva-landing/src/app/globals.css`
PURPOSE: Tailwind v4 theme config with custom brand colors (oro, nero, bianco, navy, rosso, sabbia) and shadcn/ui CSS variables
LAST MODIFIED: 2026-02-04
STATUS: active
DEPENDENCIES: `tailwindcss`, `tw-animate.css`

---

FILE: `bridge-pages/eva-landing/src/app/tw-animate.css`
PURPOSE: TailwindCSS v4-compatible replacement for the `tailwindcss-animate` plugin
LAST MODIFIED: 2026-02-02
STATUS: active
DEPENDENCIES: None

---

FILE: `bridge-pages/eva-landing/src/app/access/page.tsx`
PURPOSE: Server component wrapper for the Access & Control Hub page (noindex)
LAST MODIFIED: 2026-01-31
STATUS: active
DEPENDENCIES: `AccessPageClient.tsx`, `@/lib/accessHub`

---

FILE: `bridge-pages/eva-landing/src/app/access/AccessPageClient.tsx`
PURPOSE: Client component rendering platform access directory table with sharing rules and revocation checklist
LAST MODIFIED: 2026-01-31
STATUS: active
DEPENDENCIES: `@/lib/accessHub`

---

FILE: `bridge-pages/eva-landing/src/app/dashboard/page.tsx`
PURPOSE: Server component wrapper for the dashboard (imports DashboardContent)
LAST MODIFIED: 2026-02-04
STATUS: active
DEPENDENCIES: `@/components/dashboard/DashboardContent`

---

FILE: `bridge-pages/eva-landing/src/app/dashboard/compose/page.tsx`
PURPOSE: Server component wrapper for the Composer tool page
LAST MODIFIED: 2026-01-31
STATUS: active
DEPENDENCIES: `@/components/dashboard/Composer`

---

FILE: `bridge-pages/eva-landing/src/app/telegram/page.tsx`
PURPOSE: Server component wrapper for the Telegram opt-in page
LAST MODIFIED: 2026-02-04
STATUS: active
DEPENDENCIES: `@/components/sections/TelegramOptin`

---

FILE: `bridge-pages/eva-landing/src/app/vip/page.tsx`
PURPOSE: Server component wrapper for the VIP preview page
LAST MODIFIED: 2026-02-04
STATUS: active
DEPENDENCIES: `@/components/sections/VipPreview`

---

## App Routes -- API Endpoints

---

FILE: `bridge-pages/eva-landing/src/app/api/analytics/funnel/route.ts`
PURPOSE: GET endpoint returning funnel stats (total traffic, leads, CTR) from Supabase
LAST MODIFIED: 2026-02-04
STATUS: active
DEPENDENCIES: `@/lib/leads`

---

FILE: `bridge-pages/eva-landing/src/app/api/assets/route.ts`
PURPOSE: POST (upload asset record) and GET (list assets) via Supabase; file storage upload is mocked
LAST MODIFIED: 2026-02-01
STATUS: active
DEPENDENCIES: `@/lib/supabase`

---

FILE: `bridge-pages/eva-landing/src/app/api/capture-lead/route.ts`
PURPOSE: POST endpoint to capture email/phone leads; logs to console, optionally emails via Resend
LAST MODIFIED: 2026-01-31
STATUS: **duplicate** (superseded by `/api/subscribe`)
DEPENDENCIES: None (standalone, no Supabase)

---

FILE: `bridge-pages/eva-landing/src/app/api/compose/route.ts`
PURPOSE: POST endpoint sending visual descriptions to Claude (Anthropic) for structured multi-platform content generation
LAST MODIFIED: 2026-01-31
STATUS: active
DEPENDENCIES: `@anthropic-ai/sdk`, `@/lib/schemas/compose`, `@/lib/prompts/source2`

---

FILE: `bridge-pages/eva-landing/src/app/api/dispatch/route.ts`
PURPOSE: POST endpoint to dispatch a queue job to Postiz for automated social posting
LAST MODIFIED: 2026-01-31
STATUS: active
DEPENDENCIES: `@/lib/supabase`, `@/lib/postiz`, `@/lib/schemas/queue`

---

FILE: `bridge-pages/eva-landing/src/app/api/dispatch/status/route.ts`
PURPOSE: POST endpoint to poll Postiz for status updates on dispatched/scheduled jobs and sync back to Supabase
LAST MODIFIED: 2026-01-31
STATUS: active
DEPENDENCIES: `@/lib/supabase`, `@/lib/postiz`

---

FILE: `bridge-pages/eva-landing/src/app/api/process-queue/route.ts`
PURPOSE: POST endpoint (Publishing Engine); picks next queued job and processes RedGifs uploads or Reddit posts
LAST MODIFIED: 2026-02-01
STATUS: active
DEPENDENCIES: `@/lib/supabase`, `@/lib/redgifs`, `@/lib/reddit`, `@/lib/schemas/queue`

---

FILE: `bridge-pages/eva-landing/src/app/api/queue/route.ts`
PURPOSE: POST (create queue jobs from compose output) and GET (list jobs with filters) via Supabase
LAST MODIFIED: 2026-02-01
STATUS: active
DEPENDENCIES: `@/lib/supabase`, `@/lib/schemas/queue`

---

FILE: `bridge-pages/eva-landing/src/app/api/subscribe/route.ts`
PURPOSE: POST endpoint to capture leads into Supabase via `captureLead()`, optionally notifies via Resend
LAST MODIFIED: 2026-02-04
STATUS: active
DEPENDENCIES: `@/lib/leads`

---

## Components -- Dashboard

---

FILE: `bridge-pages/eva-landing/src/components/dashboard/Composer.tsx`
PURPOSE: Full Composer UI with asset upload, visual description form, AI generation, platform card results, and queue-all functionality
LAST MODIFIED: 2026-02-01
STATUS: active
DEPENDENCIES: `react-hook-form`, `@hookform/resolvers/zod`, `lucide-react`, `next/link`, `@/components/ui/button`, `@/components/ui/label`, `@/components/ui/textarea`, `@/components/ui/select`, `@/lib/schemas/compose`

---

FILE: `bridge-pages/eva-landing/src/components/dashboard/ConversionAnalytics.tsx`
PURPOSE: Dashboard analytics panel with metric cards, traffic sources, DM performance, email capture stats (all mock data)
LAST MODIFIED: 2026-02-04
STATUS: active
DEPENDENCIES: `@/components/ui/card`, `lucide-react`

---

FILE: `bridge-pages/eva-landing/src/components/dashboard/Dashboard.tsx`
PURPOSE: Full Command Center dashboard with funnel health, winner feed, content inventory, queue timeline, Access Hub editor
LAST MODIFIED: 2026-02-04
STATUS: **unknown** (built but NOT wired to any page route -- appears to be the newer/more complete version that was never swapped in)
DEPENDENCIES: `react`, `next/link`, `@/lib/accessHub`

---

FILE: `bridge-pages/eva-landing/src/components/dashboard/DashboardContent.tsx`
PURPOSE: Active dashboard with manual posting workflow (ingest, create post packages, RedGifs/Reddit instructions, mark posted/failed)
LAST MODIFIED: 2026-02-04
STATUS: active
DEPENDENCIES: `@/components/ui/card`, `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/textarea`, `@/components/ui/progress`, `lucide-react`, `./ConversionAnalytics`

---

## Components -- Landing Page Sections

---

FILE: `bridge-pages/eva-landing/src/components/AnalyticsScripts.tsx`
PURPOSE: Client component that injects Meta Pixel and GA4 script tags into the page
LAST MODIFIED: 2026-01-31
STATUS: **deprecated** (orphaned -- never imported by layout.tsx; analytics scripts do not load)
DEPENDENCIES: `next/script`, `@/lib/analytics`

---

FILE: `bridge-pages/eva-landing/src/components/ExitIntentModal.tsx`
PURPOSE: Modal overlay shown on exit intent with "See Pure Paradis" CTA
LAST MODIFIED: 2026-02-03
STATUS: **deprecated** (orphaned -- not imported anywhere)
DEPENDENCIES: `framer-motion`, `lucide-react`, `@/components/ui/button`

---

FILE: `bridge-pages/eva-landing/src/components/sections/EmailCapture.tsx`
PURPOSE: Email/phone capture form with Zod validation, posts to /api/subscribe, tracks analytics, redirects to OnlyFans
LAST MODIFIED: 2026-02-04
STATUS: **deprecated** (orphaned -- page.tsx redirects to static HTML before this renders)
DEPENDENCIES: `react-hook-form`, `@hookform/resolvers/zod`, `zod`, `framer-motion`, `lucide-react`, `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`, `@/lib/analytics`, `@/hooks/useUtmParams`

---

FILE: `bridge-pages/eva-landing/src/components/sections/Footer.tsx`
PURPOSE: Minimal footer with age disclaimer and copyright
LAST MODIFIED: 2026-02-04
STATUS: **deprecated** (orphaned -- not imported by any active page)
DEPENDENCIES: None

---

FILE: `bridge-pages/eva-landing/src/components/sections/HeroSection.tsx`
PURPOSE: Full-screen hero with video background, dual-variant copy (fast/narrative), OnlyFans CTA, analytics tracking
LAST MODIFIED: 2026-02-05
STATUS: **deprecated** (orphaned -- page.tsx redirects before this renders)
DEPENDENCIES: `framer-motion`, `lucide-react`, `@/components/ui/button`, `@/lib/analytics`, `@/hooks/useUtmParams`, `clsx`

---

FILE: `bridge-pages/eva-landing/src/components/sections/PlatformLinks.tsx`
PURPOSE: Grid of secondary platform links (Fansly, X, Instagram, TikTok)
LAST MODIFIED: 2026-01-31
STATUS: **deprecated** (orphaned -- not imported by any active page)
DEPENDENCIES: `framer-motion`, `lucide-react`, `@/hooks/useUtmParams`

---

FILE: `bridge-pages/eva-landing/src/components/sections/PreviewGrid.tsx`
PURPOSE: 2x2 grid of blurred/locked content teasers linking to /vip
LAST MODIFIED: 2026-02-04
STATUS: **deprecated** (orphaned -- not imported by any active page)
DEPENDENCIES: `framer-motion`, `next/link`

---

FILE: `bridge-pages/eva-landing/src/components/sections/SocialProof.tsx`
PURPOSE: Social proof section showing 50K+ fans, 5-star rating, 100% verified badge with Eva quote
LAST MODIFIED: 2026-01-31
STATUS: **deprecated** (orphaned -- not imported by any active page)
DEPENDENCIES: `framer-motion`, `lucide-react`

---

FILE: `bridge-pages/eva-landing/src/components/sections/TelegramOptin.tsx`
PURPOSE: Standalone Telegram channel join page with benefits list and join CTA
LAST MODIFIED: 2026-02-04
STATUS: active
DEPENDENCIES: `@/components/ui/button`, `@/components/ui/card`, `lucide-react`

---

FILE: `bridge-pages/eva-landing/src/components/sections/ValueProposition.tsx`
PURPOSE: Benefits grid section (Real & Personal, Instant Access, Direct Updates, etc.)
LAST MODIFIED: 2026-02-03
STATUS: **deprecated** (orphaned -- not imported by any active page)
DEPENDENCIES: `framer-motion`, `lucide-react`

---

FILE: `bridge-pages/eva-landing/src/components/sections/VipPreview.tsx`
PURPOSE: Standalone VIP preview page with locked content grid, pricing CTAs, social proof, and footer
LAST MODIFIED: 2026-02-04
STATUS: active
DEPENDENCIES: `@/components/ui/button`, `@/components/ui/card`, `lucide-react`

---

## UI Components (shadcn/ui)

---

FILE: `bridge-pages/eva-landing/src/components/ui/button.tsx`
PURPOSE: shadcn/ui Button with CVA variants (default, destructive, outline, secondary, ghost, link)
LAST MODIFIED: 2026-01-31
STATUS: active
DEPENDENCIES: `@radix-ui/react-slot`, `class-variance-authority`, `@/lib/utils`

---

FILE: `bridge-pages/eva-landing/src/components/ui/card.tsx`
PURPOSE: shadcn/ui Card component (simplified -- root Card only)
LAST MODIFIED: 2026-02-04
STATUS: active
DEPENDENCIES: `@/lib/utils`

---

FILE: `bridge-pages/eva-landing/src/components/ui/input.tsx`
PURPOSE: shadcn/ui Input component
LAST MODIFIED: 2026-01-31
STATUS: active
DEPENDENCIES: `@/lib/utils`

---

FILE: `bridge-pages/eva-landing/src/components/ui/label.tsx`
PURPOSE: shadcn/ui Label component using Radix
LAST MODIFIED: 2026-01-31
STATUS: active
DEPENDENCIES: `@radix-ui/react-label`, `@/lib/utils`

---

FILE: `bridge-pages/eva-landing/src/components/ui/progress.tsx`
PURPOSE: shadcn/ui Progress bar component
LAST MODIFIED: 2026-02-04
STATUS: active
DEPENDENCIES: `@/lib/utils`

---

FILE: `bridge-pages/eva-landing/src/components/ui/select.tsx`
PURPOSE: shadcn/ui Select components (trigger, content, item, etc.) using Radix
LAST MODIFIED: 2026-01-31
STATUS: active
DEPENDENCIES: `@radix-ui/react-select`, `lucide-react`, `@/lib/utils`

---

FILE: `bridge-pages/eva-landing/src/components/ui/textarea.tsx`
PURPOSE: shadcn/ui Textarea component
LAST MODIFIED: 2026-01-31
STATUS: active
DEPENDENCIES: `@/lib/utils`

---

## Hooks

---

FILE: `bridge-pages/eva-landing/src/hooks/useAnimatedCounter.ts`
PURPOSE: Hook that animates a number from 0 to target using requestAnimationFrame when element enters viewport
LAST MODIFIED: 2026-01-31
STATUS: **deprecated** (orphaned -- not imported anywhere)
DEPENDENCIES: `framer-motion`

---

FILE: `bridge-pages/eva-landing/src/hooks/useExitIntent.ts`
PURPOSE: Hook that detects mouse leaving viewport and toggles a modal flag
LAST MODIFIED: 2026-01-31
STATUS: **deprecated** (orphaned -- not imported anywhere)
DEPENDENCIES: None

---

FILE: `bridge-pages/eva-landing/src/hooks/useUtmParams.ts`
PURPOSE: Parses UTM params from URL, persists to sessionStorage, determines fast/narrative bridge variant
LAST MODIFIED: 2026-02-03
STATUS: **deprecated** (only consumed by orphaned landing components)
DEPENDENCIES: None

---

## Library Files

---

FILE: `bridge-pages/eva-landing/src/lib/accessHub.ts`
PURPOSE: Type definitions and default data for the Access & Control Hub (platform credentials reference)
LAST MODIFIED: 2026-01-31
STATUS: active
DEPENDENCIES: None

---

FILE: `bridge-pages/eva-landing/src/lib/analytics.ts`
PURPOSE: Meta Pixel and GA4 tracking helpers; reads env vars for pixel/measurement IDs
LAST MODIFIED: 2026-01-31
STATUS: active
DEPENDENCIES: None

---

FILE: `bridge-pages/eva-landing/src/lib/leads.ts`
PURPOSE: Supabase operations for capturing leads, tracking visits, and computing funnel stats
LAST MODIFIED: 2026-02-04
STATUS: active
DEPENDENCIES: `./supabase`

---

FILE: `bridge-pages/eva-landing/src/lib/postiz.ts`
PURPOSE: Postiz API client for social media post scheduling (integrations, create/get/list posts, platform mapping)
LAST MODIFIED: 2026-01-31
STATUS: active
DEPENDENCIES: None (env vars only)

---

FILE: `bridge-pages/eva-landing/src/lib/prompts/source2.ts`
PURPOSE: System prompt for Claude (Module B) defining 6-platform content generation rules, persona guidelines, and validation
LAST MODIFIED: 2026-01-31
STATUS: active
DEPENDENCIES: None

---

FILE: `bridge-pages/eva-landing/src/lib/reddit.ts`
PURPOSE: Reddit OAuth2 auth and `postToSubreddit()` function for automated link posting
LAST MODIFIED: 2026-02-01
STATUS: active
DEPENDENCIES: None (env vars only)

---

FILE: `bridge-pages/eva-landing/src/lib/redgifs.ts`
PURPOSE: RedGifs API client for authentication, file upload, and task polling
LAST MODIFIED: 2026-02-04
STATUS: active
DEPENDENCIES: `stream` (Node built-in)

---

FILE: `bridge-pages/eva-landing/src/lib/schemas/compose.ts`
PURPOSE: Zod schemas for compose input (visual_description + pillar) and output (6-platform variant structure)
LAST MODIFIED: 2026-01-31
STATUS: active
DEPENDENCIES: `zod`

---

FILE: `bridge-pages/eva-landing/src/lib/schemas/queue.ts`
PURPOSE: Zod schemas for queue jobs, platforms, statuses, and API request/response validation
LAST MODIFIED: 2026-02-01
STATUS: active
DEPENDENCIES: `zod`

---

FILE: `bridge-pages/eva-landing/src/lib/supabase.ts`
PURPOSE: Creates Supabase admin client from env vars; returns null gracefully if not configured
LAST MODIFIED: 2026-01-31
STATUS: active
DEPENDENCIES: `@supabase/supabase-js`

---

FILE: `bridge-pages/eva-landing/src/lib/utils.ts`
PURPOSE: `cn()` utility combining clsx + tailwind-merge for className merging
LAST MODIFIED: 2026-01-31
STATUS: active
DEPENDENCIES: `clsx`, `tailwind-merge`

---

## Summary

---

### TOTAL FILES: 65

| Category | Count |
|---|---|
| Config / root files | 9 |
| Public / static assets | 4 |
| App pages (TSX) | 8 |
| API routes (TS) | 9 |
| Dashboard components | 4 |
| Landing section components | 10 |
| UI components (shadcn) | 7 |
| Hooks | 3 |
| Library files | 11 |

### ENTRY POINTS

| Route | File | Description |
|---|---|---|
| `/` | `src/app/page.tsx` | Redirects to static HTML landing page |
| `/dashboard` | `src/app/dashboard/page.tsx` | Content operations dashboard |
| `/dashboard/compose` | `src/app/dashboard/compose/page.tsx` | AI content composer |
| `/access` | `src/app/access/page.tsx` | Platform access directory |
| `/telegram` | `src/app/telegram/page.tsx` | Telegram channel opt-in |
| `/vip` | `src/app/vip/page.tsx` | VIP content preview |

### KEY CONFIG FILES

| File | Purpose |
|---|---|
| `package.json` | Dependencies and scripts (`dev`, `build`, `start`, `lint`) |
| `tsconfig.json` | TypeScript config with `@/*` path alias |
| `next.config.ts` | Next.js / Turbopack config |
| `.env.local` | API keys and secrets (gitignored) |
| `.vercel/project.json` | Vercel deployment binding |
| `docs/supabase-schema.sql` | Database table definitions |

### REQUIRED ENVIRONMENT VARIABLES

| Variable | Used By | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `supabase.ts` | For all DB features |
| `SUPABASE_SERVICE_ROLE_KEY` | `supabase.ts` | For all DB features |
| `ANTHROPIC_API_KEY` | `api/compose/route.ts` | For AI content generation |
| `POSTIZ_API_URL` | `postiz.ts` | For social media dispatch |
| `POSTIZ_API_KEY` | `postiz.ts` | For social media dispatch |
| `REDDIT_CLIENT_ID` | `reddit.ts` | For Reddit posting |
| `REDDIT_CLIENT_SECRET` | `reddit.ts` | For Reddit posting |
| `REDDIT_REFRESH_TOKEN` | `reddit.ts` | For Reddit posting |
| `RESEND_API_KEY` | `api/subscribe/route.ts` | Optional email notifications |
| `NEXT_PUBLIC_META_PIXEL_ID` | `analytics.ts` | Optional tracking |
| `NEXT_PUBLIC_GA4_ID` | `analytics.ts` | Optional tracking |
| `REDGIFS_API_KEY` | `redgifs.ts` | Referenced but unused in code |

### KNOWN ISSUES

**Architecture:**
1. **Dead code -- React landing page is entirely orphaned.** `page.tsx` redirects to a static HTML file (`/eva-landing-page-final.html`), making 10 React components (HeroSection, EmailCapture, PreviewGrid, SocialProof, ValueProposition, PlatformLinks, Footer, ExitIntentModal, AnalyticsScripts) and 3 hooks (useAnimatedCounter, useExitIntent, useUtmParams) unreachable dead code.
2. **Dashboard.tsx vs DashboardContent.tsx conflict.** `Dashboard.tsx` appears to be the newer, more complete Command Center, but `dashboard/page.tsx` imports the older `DashboardContent.tsx` instead. The newer version was never wired up.
3. **AnalyticsScripts.tsx is never rendered** in `layout.tsx`, so Meta Pixel and GA4 scripts are not injected into the Next.js app.

**Bugs:**
4. **`src/lib/leads.ts` -- `trackVisit()` uses `window.location.pathname`** in a server-side library; will throw `ReferenceError` if called from an API route.
5. **`src/lib/redgifs.ts` -- `apiKey`** is read from env but never passed to the API; authentication always falls back to anonymous temporary auth.
6. **`public/eva-landing-page-final.html`** has Meta Pixel ID set to `YOUR_PIXEL_ID_HERE` -- pixel tracking is non-functional on the live page.

**Incomplete / TODOs:**
7. **`api/capture-lead/route.ts`** has `TODO: Add your integrations here` and uses hardcoded `delivered@resend.dev` test address.
8. **`api/assets/route.ts`** -- Supabase Storage upload is commented out; uses mock `mock_storage/` path.
9. **`api/process-queue/route.ts`** -- uses `Buffer.from("mock video data")` instead of actual file retrieval from storage.
10. **`DashboardContent.tsx`** -- `sonner` toast import is commented out with a manual mock replacement.

**Duplicates:**
11. **`/api/capture-lead` vs `/api/subscribe`** -- both capture email leads. `capture-lead` is the older console-log version; `subscribe` is the newer Supabase-backed version. `capture-lead` should be removed.

**Missing Schema:**
12. **`docs/supabase-schema.sql`** defines `assets` and `queue_jobs` tables but is **missing** the `leads` and `bridge_visits` tables that `src/lib/leads.ts` depends on.

**Mock Data:**
13. **`ConversionAnalytics.tsx`** uses entirely hardcoded mock data for metric cards, traffic sources, and DM performance -- no real API integration.

---

### ORPHANED FILES (not imported by any active route)

| File | Originally For |
|---|---|
| `src/components/AnalyticsScripts.tsx` | Analytics script injection |
| `src/components/ExitIntentModal.tsx` | Exit intent popup |
| `src/components/sections/HeroSection.tsx` | React landing page hero |
| `src/components/sections/EmailCapture.tsx` | React landing page email form |
| `src/components/sections/PreviewGrid.tsx` | React landing page content grid |
| `src/components/sections/SocialProof.tsx` | React landing page social proof |
| `src/components/sections/ValueProposition.tsx` | React landing page benefits |
| `src/components/sections/PlatformLinks.tsx` | React landing page platform links |
| `src/components/sections/Footer.tsx` | React landing page footer |
| `src/components/dashboard/Dashboard.tsx` | Newer Command Center (never wired) |
| `src/hooks/useAnimatedCounter.ts` | Animated number counters |
| `src/hooks/useExitIntent.ts` | Exit intent detection |
| `src/hooks/useUtmParams.ts` | UTM parsing (only used by orphans) |
