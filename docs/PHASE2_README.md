# Phase 2: Reddit + RedGifs Publishing Pipeline

## 🎯 Overview

This phase implements a fully automated content distribution pipeline that uploads videos to RedGifs and posts them to Reddit with zero manual intervention after clicking "Queue for Distribution."

## 🚀 Quick Start

### Prerequisites

1. **Database**: MySQL database (configured via `DATABASE_URL`)
2. **RedGifs API Key**: From RedGifs developer portal
3. **Reddit App Credentials**: Create a "script" type app at https://www.reddit.com/prefs/apps
4. **Storage**: S3-compatible storage (Manus Forge API)

### Setup Steps

1. **Configure Environment Variables**

Copy `.env.local.template` to `.env.local` and fill in all values:

```bash
cp .env.local.template .env.local
# Edit .env.local with your credentials
```

2. **Install Dependencies**

```bash
pnpm install
```

3. **Run Database Migrations**

```bash
pnpm run db:push
```

4. **Start Development Server**

```bash
pnpm run dev
```

5. **Access Dashboard**

- Navigate to http://localhost:3000/dashboard
- Password: `eva2026`

## 📖 User Workflow

### Publishing Content

1. **Login** to the dashboard
2. **Enter concept name**:
   - `DOMINANCE_WORSHIP`
   - `HARDCORE_GROUP`
   - `ANATOMY_SOLO`
3. **Upload video** (drag & drop or click)
4. **Select subreddit** (optional - auto-selects based on concept)
5. **Click "Queue for Distribution"**
6. **Wait for completion**:
   - Status updates automatically (polling every 3 seconds)
   - "queued" → "posting" → "posted"
7. **Click Reddit permalink** to view live post

### Status Indicators

- 🟡 **Queued**: Waiting to start processing
- 🔵 **Posting**: Uploading to RedGifs and posting to Reddit
- 🟢 **Posted**: Successfully published (permalink available)
- 🔴 **Failed**: Error occurred (see error message)

## 🔧 Architecture

### Backend (Express + tRPC)

#### Assets Router (`server/assetsRouter.ts`)

- `assets.upload` - Upload files with base64 encoding
- `assets.list` - List all assets
- `assets.get` - Get single asset
- `assets.updateStatus` - Update processing status
- `assets.updateRedGifsUrl` - Store RedGifs URL
- `assets.delete` - Delete asset

#### Queue Router (`server/queueRouter.ts`)

- `queue.publish` - **Main orchestrator** for publishing workflow
- `queue.list` - List all posts
- `queue.get` - Get single post
- `queue.getByAsset` - Get posts for specific asset

#### Publishing Orchestration

1. Create post record with "queued" status
2. Upload video to RedGifs (if not cached)
3. Generate Reddit title from concept tag
4. Post to Reddit with RedGifs URL + NSFW flag
5. Update post record with "posted" status + permalink
6. Handle errors and update status accordingly

### Frontend (React + tRPC)

#### Dashboard (`client/src/components/DashboardContent.tsx`)

- Real-time status polling (3-5 second intervals)
- File upload with base64 encoding
- Subreddit selection dropdown
- Status badges and progress indicators
- Error message display
- Clickable Reddit permalinks

### Database Schema

#### Assets Table

```sql
CREATE TABLE assets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  fileKey VARCHAR(512) NOT NULL,
  fileUrl TEXT NOT NULL,
  fileName VARCHAR(255) NOT NULL,
  fileType VARCHAR(100) NOT NULL,
  fileSize INT NOT NULL,
  conceptName VARCHAR(255) NOT NULL,
  status ENUM('pending', 'processing', 'ready', 'failed') DEFAULT 'pending',
  redgifsUrl TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP
);
```

#### Posts Table

```sql
CREATE TABLE posts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  assetId INT NOT NULL,
  platform ENUM('reddit', 'instagram') NOT NULL,
  targetSubreddit VARCHAR(255),
  postTitle TEXT,
  postUrl TEXT,
  status ENUM('queued', 'posting', 'posted', 'failed') DEFAULT 'queued',
  scheduledFor TIMESTAMP,
  postedAt TIMESTAMP,
  errorMessage TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assetId) REFERENCES assets(id)
);
```

## 🎨 Concept Tag Mapping

### Title Generation

| Concept Tag | Generated Titles |
|------------|------------------|
| `DOMINANCE_WORSHIP` | "Think you're worthy?", "POV: admiring your queen", "Can you handle this energy?" |
| `HARDCORE_GROUP` | "Who wants to be next?", "Ready for this?", "Think you could keep up?" |
| `ANATOMY_SOLO` | "Can you handle this?", "What would you do?", "Rate this" |

### Target Subreddits

| Concept Tag | Target Subreddits (in priority order) |
|------------|--------------------------------------|
| `DOMINANCE_WORSHIP` | r/TransGoneWild, r/Tgirls, r/TransPorn |
| `HARDCORE_GROUP` | r/TransGoneWild, r/GroupSex |
| `ANATOMY_SOLO` | r/TransGoneWild, r/Tgirls, r/TransPorn |

**Rules:**
- Titles are always questions or commands
- NSFW flag is always set to `true`
- First subreddit in list is used if not manually selected

## 🔒 Security

### Credentials Management

- **Never commit** `.env.local` to git
- All API keys stored in environment variables only
- Production credentials managed via Vercel environment variables

### Content Safety

- All posts marked NSFW by default
- No VR content references anywhere
- Dashboard password protected (password: eva2026)

## 🚨 Error Handling

### Common Errors

**RedGifs Upload Failed**
- Check `REDGIFS_API_KEY` is valid
- Verify file format is supported (mp4, webm, mov)
- Check file size limits

**Reddit Post Failed**
- Verify Reddit credentials are correct
- Check subreddit exists and allows posting
- Look for rate limit errors (429)
- Verify subreddit is not banned/restricted

**Database Connection Failed**
- Check `DATABASE_URL` is correct
- Verify database is running and accessible
- Run migrations: `pnpm run db:push`

### Retry Failed Posts

1. Click "Retry" button on failed post
2. System requeues with same settings
3. New post record created (old one remains for history)

## 📊 Monitoring

### Status Dashboard

The dashboard shows:
- **Queued**: Posts waiting to be processed
- **Posted**: Successfully published posts
- **Failed**: Posts that encountered errors

### Logs

Check server logs for detailed error messages:
```bash
# Development
pnpm run dev

# Production (Vercel)
Check Vercel dashboard logs
```

## 🔄 API Integration Details

### RedGifs API

**Endpoint**: `https://api.redgifs.com/v2/auth/temporary`

**Authentication**: Token-based (cached for 23 hours)

**Upload**: POST to `/v2/gifs` with video URL

### Reddit API

**Endpoint**: `https://oauth.reddit.com/api/submit`

**Authentication**: OAuth2 "script" type (username/password grant)

**Rate Limits**: Respect Reddit's rate limits (handled by exponential backoff)

## 🧪 Testing

### Run Tests

```bash
# Type checking
pnpm run check

# Build
pnpm run build

# Unit tests
pnpm run test
```

### Manual Testing

1. Start dev server: `pnpm run dev`
2. Navigate to http://localhost:3000/dashboard
3. Upload a test video
4. Queue for distribution
5. Verify status updates
6. Check Reddit permalink works

## 📝 Development Notes

### Adding New Concept Tags

1. Add to `CONCEPT_TITLE_PATTERNS` in `server/queueRouter.ts`
2. Add to `CONCEPT_SUBREDDITS` in `server/queueRouter.ts`
3. Add to `CONCEPT_TAGS` in `client/src/components/DashboardContent.tsx`

### Adding New Subreddits

1. Add to `SUBREDDIT_OPTIONS` in `client/src/components/DashboardContent.tsx`
2. Test manually to ensure subreddit allows posting

### Modifying Polling Intervals

```typescript
// In DashboardContent.tsx
const { data: assets = [], refetch: refetchAssets } = trpc.assets.list.useQuery(undefined, {
  refetchInterval: 5000, // Assets: every 5 seconds
});

const { data: posts = [], refetch: refetchPosts } = trpc.queue.list.useQuery(undefined, {
  refetchInterval: 3000, // Posts: every 3 seconds
});
```

## 🚀 Deployment (Vercel)

### Environment Variables

Set in Vercel dashboard under Settings → Environment Variables:

```
DATABASE_URL
JWT_SECRET
OWNER_OPEN_ID
OAUTH_SERVER_URL
VITE_APP_ID
BUILT_IN_FORGE_API_URL
BUILT_IN_FORGE_API_KEY
REDGIFS_API_KEY
REDDIT_CLIENT_ID
REDDIT_CLIENT_SECRET
REDDIT_USERNAME
REDDIT_PASSWORD
```

### Build Configuration

Vercel auto-detects and uses:
- **Build Command**: `pnpm run build`
- **Output Directory**: `dist`
- **Install Command**: `pnpm install`

### Database Migrations

Run migrations after deployment:
```bash
# From local machine with DATABASE_URL set
pnpm run db:push
```

## 🎯 Phase 2 Complete

### Deliverables ✅

- [x] Full Reddit + RedGifs publishing pipeline
- [x] Zero-click automation after "Queue for Distribution"
- [x] Real-time status tracking
- [x] Error handling and retry mechanism
- [x] Concept tag to title/subreddit mapping
- [x] Dashboard UI integration
- [x] Database schema and migrations

### Next Phases (Out of Scope)

- Phase 3: Instagram integration
- Phase 4: Twitter/X integration
- Phase 5: TrafficJunky integration
- Phase 6: Analytics dashboard
- Phase 7: Scheduling/calendar UI
