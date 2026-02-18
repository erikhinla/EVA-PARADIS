# Eva Paradis — Supabase Consolidation Migration Plan

**Created:** 2026-02-16
**Status:** IN PROGRESS

## Overview

Consolidate the Eva Paradis dashboard from a dual-database architecture (MySQL/Drizzle + Supabase) to a single Supabase backend. This also replaces the Manus storage proxy with Supabase Storage and upgrades dashboard auth.

---

## Phase 1: Supabase Schema Migration

**Goal:** Create all tables in Supabase PostgreSQL, replacing the MySQL/Drizzle schema.

### Tables to Create
| Table | Source | Notes |
|-------|--------|-------|
| `users` | `drizzle/schema.ts` | Convert from MySQL types to PostgreSQL |
| `assets` | `drizzle/schema.ts` | Convert enums, add storage_path column |
| `posts` | `drizzle/schema.ts` | Convert enums, add foreign key to assets |
| `leads` | Already exists in Supabase | No change needed |
| `bridge_events` | Already exists in Supabase | No change needed |

### Key Type Conversions
- `int().autoincrement()` → `bigint generated always as identity`
- `mysqlEnum()` → PostgreSQL `text` with check constraints
- `timestamp().defaultNow()` → `timestamptz default now()`
- `varchar(n)` → `text` (PostgreSQL best practice)
- `text()` → `text`

---

## Phase 2: Server-Side Code Migration

**Goal:** Replace Drizzle ORM + MySQL with Supabase client calls.

### Files to Modify
1. `server/db.ts` → Rewrite completely (Supabase client instead of Drizzle)
2. `server/assetsRouter.ts` → Replace `getDb()` + Drizzle with Supabase queries
3. `server/queueRouter.ts` → Replace `getDb()` + Drizzle with Supabase queries
4. `server/analyticsRouter.ts` → Already uses Supabase (no change)
5. `server/_core/context.ts` → Update User type import
6. `server/_core/oauth.ts` → Update db import
7. `server/vercel-entry.ts` → Update db import

### Files to Remove/Replace
- `drizzle/schema.ts` → Replace with `shared/types.ts` for TypeScript types
- `server/storage.ts` → Replace with Supabase Storage implementation

### Dependencies to Remove
- `drizzle-orm`
- `drizzle-kit`
- `mysql2`
- `@types/mysql2` (if present)

---

## Phase 3: Supabase Storage

**Goal:** Replace Manus storage proxy with Supabase Storage bucket.

### Implementation
1. Create `eva-assets` storage bucket in Supabase
2. Rewrite `server/storage.ts` to use `supabase.storage.from('eva-assets')`
3. Upload returns public URL from Supabase

---

## Phase 4: Dashboard Auth Upgrade

**Goal:** Replace hardcoded password with Supabase Auth.

### Approach: Supabase Auth (email + password)
1. Create admin user in Supabase Auth dashboard
2. Dashboard login form calls `supabase.auth.signInWithPassword()`
3. Session persists via Supabase's built-in session management
4. Server validates JWT on protected endpoints
5. Remove the `"eva2026"` hardcoded password

---

## Phase 5: Publishing Workflow (RedGifs/Reddit)

**Goal:** Since API access was denied, optimize the manual publishing workflow.

### Current State
- `redgifs.ts` and `reddit.ts` have full API integration code
- `mode.ts` detects missing credentials → falls back to manual
- Manual mode is functional but the UX could be smoother

### Improved Approach
- Keep the existing API code as a fallback if credentials become available
- Make manual mode the primary, first-class workflow
- Add clipboard-copy helpers for post titles and URLs
- Add a "Copy Post Package" button that formats everything for quick paste
- Track manual posting status with timestamps

---

## Env Var Changes

### Before (.env.local)
```
DATABASE_URL=mysql://user:pass@localhost:3306/eva
JWT_SECRET=dev_secret_key
OAUTH_SERVER_URL=https://example.com
VITE_APP_ID=dev_app
OWNER_OPEN_ID=dev_owner
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=
```

### After (.env.local)
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_ANON_KEY=eyJ...
DASHBOARD_ADMIN_EMAIL=eva@example.com
DASHBOARD_ADMIN_PASSWORD=<set-in-supabase-auth>
```

### Removed
- `DATABASE_URL` (no more MySQL)
- `BUILT_IN_FORGE_API_URL` (no more Manus storage)
- `BUILT_IN_FORGE_API_KEY` (no more Manus storage)
