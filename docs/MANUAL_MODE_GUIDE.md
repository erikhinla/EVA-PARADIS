# Manual Mode Implementation Guide

## Overview

This document describes the manual mode implementation added to the EVA-PARADIS publishing pipeline. Manual mode allows the dashboard to be used TODAY with zero API credentials, while preserving the ability to activate auto-mode by simply adding environment variables later.

## What Was Built

### 1. Mode Detection System

**File:** `server/mode.ts`

Detects at runtime whether RedGifs and Reddit credentials are present:
- RedGifs: Checks for `REDGIFS_API_KEY` or `REDGIFS_ACCESS_TOKEN`
- Reddit: Checks for all four credentials (`CLIENT_ID`, `CLIENT_SECRET`, `USERNAME`, `PASSWORD`)
- Returns `{redgifs: 'auto'|'manual', reddit: 'auto'|'manual'}`

### 2. Database Schema Updates

**File:** `drizzle/schema.ts`

Added new status values to posts table:
- `awaiting_redgifs_url` - Waiting for user to paste RedGifs URL
- `uploading_redgifs` - Auto mode: uploading to RedGifs
- `awaiting_reddit_post` - Waiting for user to paste Reddit permalink
- `posting_reddit` - Auto mode: posting to Reddit
- Existing: `queued`, `posted`, `failed`

### 3. Backend API Endpoints

**File:** `server/queueRouter.ts`

#### New Query Endpoint
- `getPublishingMode()` - Returns current mode configuration

#### New Mutation Endpoints
- `saveRedGifsUrl(postId, redgifsUrl)` - Saves RedGifs URL and advances to Reddit step
- `saveRedditPermalink(postId, redditUrl)` - Saves Reddit permalink and marks as posted

#### Updated Publish Logic
- Checks mode on publish
- If manual: Creates post with `awaiting_redgifs_url` status
- If auto: Starts async processing (unchanged from Phase 2)

### 4. Dashboard UI

**File:** `client/src/components/DashboardContent.tsx`

#### Mode Indicator Badge
- Shows **⚡ Auto Mode** (green) when both APIs have credentials
- Shows **✋ Manual Mode** (blue) when any credentials missing
- Polls every 60 seconds for mode changes

#### Manual Wizard: Step 1 (RedGifs Upload)
Shows when status is `awaiting_redgifs_url`:
- Instructions to upload video to RedGifs
- "Open RedGifs Upload" button → opens redgifs.com/upload in new tab
- Input field for pasting RedGifs URL
- "Save RedGifs URL" button
- URL validation (must contain "redgifs.com")
- Status indicator: "⏳ Waiting for RedGifs URL"

#### Manual Wizard: Step 2 (Reddit Posting)
Shows when status is `awaiting_reddit_post`:
- Displays generated title with copy button
- Displays RedGifs URL with copy button
- Shows target subreddit
- "Open Subreddit" button → opens reddit.com/r/{subreddit}/submit
- "Copy All" button → copies title + URL in ready-to-paste format
- Input field for pasting Reddit permalink
- "Save Reddit Permalink" button
- URL validation (must contain "reddit.com")
- Status indicator: "⏳ Waiting for Reddit permalink"

#### Status Display Updates
- Added status labels for all new states
- Updated status icons (clock, spinner, checkmark, X)
- Updated status colors (blue for manual steps, green for success, etc.)

## Usage Workflows

### Manual Mode (No Credentials)

1. **Upload Asset**
   - Enter concept name
   - Upload video file
   - Select target subreddit (optional)
   - Click "Queue for Distribution"

2. **RedGifs Upload** (awaiting_redgifs_url)
   - Manual wizard appears
   - Click "Open RedGifs Upload" → new tab opens
   - Upload video to RedGifs manually
   - Copy RedGifs URL from browser
   - Paste URL in wizard input field
   - Click "Save RedGifs URL"
   - Wizard advances to Step 2

3. **Reddit Posting** (awaiting_reddit_post)
   - Manual wizard shows title and URL
   - Click "Copy All" to copy title + URL
   - Click "Open Subreddit" → new tab opens
   - Create link post on Reddit
   - Paste title and URL
   - Mark as NSFW
   - Submit post
   - Copy Reddit permalink from browser
   - Paste permalink in wizard input field
   - Click "Save Reddit Permalink"
   - Post marked as "Posted" with clickable link

### Auto Mode (With Credentials)

Add these environment variables:
```bash
REDGIFS_API_KEY=your_key
REDDIT_CLIENT_ID=your_id
REDDIT_CLIENT_SECRET=your_secret
REDDIT_USERNAME=your_username
REDDIT_PASSWORD=your_password
```

Workflow:
1. Upload asset and queue for distribution (same as manual)
2. **Automatic processing:**
   - Backend uploads to RedGifs
   - Backend posts to Reddit
   - Status updates automatically
3. Final status shows Reddit permalink (same as manual)

**No code changes needed** - mode detection happens automatically!

## Status State Machine

```
Queue Button Clicked
      │
┌─────▼─────┐
│  queued   │
└─────┬─────┘
      │
┌─────┴─────┐
│ AUTO      │ MANUAL
│           │
┌─────▼─────────────┐    ┌─────▼─────────────────┐
│ uploading_redgifs │    │ awaiting_redgifs_url   │
└─────┬─────────────┘    └─────┬─────────────────┘
      │                        │ (Eva pastes URL)
      │             ┌──────────▼──────────────┐
      │             │ awaiting_reddit_post    │
      │             └──────────┬──────────────┘
┌─────▼─────────┐             │ (Eva pastes permalink)
│ posting_reddit│             │
└─────┬─────────┘             │
      │                       │
      └───────────┬───────────┘
           ┌──────▼──────┐
           │   posted    │
           └─────────────┘
           
     (any step can → failed)
```

## Key Features

### Runtime Mode Detection
- No build-time configuration
- Checks environment variables on each request
- Allows switching modes without code changes

### URL Validation
- RedGifs URLs must contain "redgifs.com"
- Reddit URLs must contain "reddit.com"
- Invalid URLs rejected with error message

### Copy to Clipboard
- All copy buttons use `navigator.clipboard.writeText()`
- Buttons show checkmark for 2 seconds after copy
- "Copy All" formats text as: `Title: {title}\nURL: {url}`

### External Links
- All external links open in new tabs
- Use `target="_blank" rel="noopener,noreferrer"` for security

### Backwards Compatibility
- All Phase 2 auto-mode code preserved
- No breaking changes
- Manual mode added alongside, not replacing

## Testing

### Manual Mode Test
```bash
# No environment variables needed
pnpm run dev
# Navigate to http://localhost:3000/dashboard
# Login with password: eva2026
# Verify "✋ Manual Mode" badge shows
# Test upload and manual publishing workflow
```

### Auto Mode Test
```bash
# Add credentials to .env.local
echo "REDGIFS_API_KEY=test" >> .env.local
echo "REDDIT_CLIENT_ID=test" >> .env.local
echo "REDDIT_CLIENT_SECRET=test" >> .env.local
echo "REDDIT_USERNAME=test" >> .env.local
echo "REDDIT_PASSWORD=test" >> .env.local
pnpm run dev
# Verify "⚡ Auto Mode" badge shows
# Test auto publishing workflow
```

## Deployment

### Production (Vercel)

1. **For Manual Mode (immediate):**
   - No environment variables needed
   - Just deploy

2. **To Enable Auto Mode (later):**
   - Add environment variables in Vercel dashboard
   - Run migrations: `pnpm run db:push`
   - Restart server
   - Mode switches automatically

### Database Migration

When deploying, run:
```bash
pnpm run db:push
```

This updates the `posts` table status enum with new values.

## Troubleshooting

### Mode Not Switching
- Check all required credentials are set
- For Reddit: Need all 4 credentials (ID, secret, username, password)
- For RedGifs: Need at least one (API_KEY or ACCESS_TOKEN)
- Wait up to 60 seconds for UI to poll and update

### Manual Wizard Not Showing
- Check post status in database
- Should be `awaiting_redgifs_url` or `awaiting_reddit_post`
- Check browser console for errors

### URL Validation Failing
- RedGifs URL must include "redgifs.com" domain
- Reddit URL must include "reddit.com" domain
- URLs must be valid format (protocol required)

## Files Modified

1. **server/mode.ts** (created)
   - Mode detection logic
   - 52 lines

2. **drizzle/schema.ts** (modified)
   - Added 4 new status enum values
   - 1 line changed

3. **server/queueRouter.ts** (modified)
   - Added 3 new endpoints
   - Added mode branching to publish
   - Updated processPost status names
   - ~130 lines added

4. **client/src/components/DashboardContent.tsx** (modified)
   - Added mode badge
   - Added manual wizards
   - Added copy/link buttons
   - Updated status handling
   - ~290 lines added

## Future Enhancements

Potential improvements (not in scope):
- Progress indicators during manual steps
- Auto-refresh after saving URLs (currently polls every 3s)
- Validation of RedGifs URL format beyond domain check
- Prefill subreddit based on concept tag in manual mode
- Save draft state if user closes browser mid-workflow
- Bulk manual posting (multiple assets at once)
