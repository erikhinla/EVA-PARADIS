-- ============================================================
-- Eva Paradis: Full Supabase Schema Migration
-- Consolidates MySQL/Drizzle schema + existing Supabase tables
-- Run in Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ============================================================

-- =====================
-- 1. Users table
-- =====================
CREATE TABLE IF NOT EXISTS users (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  open_id     text NOT NULL UNIQUE,
  name        text,
  email       text,
  login_method text,
  role        text NOT NULL DEFAULT 'user'
                CHECK (role IN ('user', 'admin')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  last_signed_in timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookups by open_id
CREATE INDEX IF NOT EXISTS idx_users_open_id ON users (open_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- =====================
-- 2. Assets table
-- =====================
CREATE TABLE IF NOT EXISTS assets (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  file_key      text NOT NULL,
  file_url      text NOT NULL,
  file_name     text NOT NULL,
  file_type     text NOT NULL,
  file_size     bigint NOT NULL,
  concept_name  text NOT NULL,
  status        text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'processing', 'ready', 'failed')),
  redgifs_url   text,
  storage_path  text,  -- Supabase Storage path reference
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assets_status ON assets (status);
CREATE INDEX IF NOT EXISTS idx_assets_concept ON assets (concept_name);

-- =====================
-- 3. Posts table
-- =====================
CREATE TABLE IF NOT EXISTS posts (
  id                bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  asset_id          bigint NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  platform          text NOT NULL
                      CHECK (platform IN ('reddit', 'instagram', 'twitter')),
  target_subreddit  text,
  post_title        text,
  post_url          text,
  status            text NOT NULL DEFAULT 'queued'
                      CHECK (status IN (
                        'queued',
                        'awaiting_redgifs_url',
                        'uploading_redgifs',
                        'awaiting_reddit_post',
                        'posting_reddit',
                        'posted',
                        'failed'
                      )),
  scheduled_for     timestamptz,
  posted_at         timestamptz,
  error_message     text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posts_asset_id ON posts (asset_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts (status);
CREATE INDEX IF NOT EXISTS idx_posts_platform ON posts (platform);

-- =====================
-- 4. Leads table (if not already created)
-- =====================
CREATE TABLE IF NOT EXISTS leads (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email         text NOT NULL,
  phone         text,
  source        text DEFAULT 'bridge_return',
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  referrer      text,
  captured_at   timestamptz DEFAULT now(),
  converted     boolean DEFAULT false
);

CREATE UNIQUE INDEX IF NOT EXISTS leads_email_unique ON leads (email);

-- =====================
-- 5. Bridge events table (if not already created)
-- =====================
CREATE TABLE IF NOT EXISTS bridge_events (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type    text NOT NULL DEFAULT 'visit',
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  referrer      text,
  session_id    text,
  path          text,
  user_agent    text,
  ip_address    text,
  created_at    timestamptz DEFAULT now()
);

-- =====================
-- 6. Auto-update updated_at trigger
-- =====================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_users') THEN
    CREATE TRIGGER set_updated_at_users
      BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_assets') THEN
    CREATE TRIGGER set_updated_at_assets
      BEFORE UPDATE ON assets
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_posts') THEN
    CREATE TRIGGER set_updated_at_posts
      BEFORE UPDATE ON posts
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- =====================
-- 7. Row Level Security (RLS)
-- =====================
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE bridge_events ENABLE ROW LEVEL SECURITY;

-- Service role bypass policies (server-side access with service_role key)
-- These allow full access when using the service_role key
DROP POLICY IF EXISTS "Service role full access" ON users;
CREATE POLICY "Service role full access" ON users
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access" ON assets;
CREATE POLICY "Service role full access" ON assets
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access" ON posts;
CREATE POLICY "Service role full access" ON posts
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access" ON leads;
CREATE POLICY "Service role full access" ON leads
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access" ON bridge_events;
CREATE POLICY "Service role full access" ON bridge_events
  FOR ALL USING (true) WITH CHECK (true);

-- =====================
-- 8. Storage bucket for assets
-- =====================
INSERT INTO storage.buckets (id, name, public)
VALUES ('eva-assets', 'eva-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to asset files
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'eva-assets');

-- Allow service role to upload
DROP POLICY IF EXISTS "Service role upload" ON storage.objects;
CREATE POLICY "Service role upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'eva-assets');

-- Allow service role to delete
DROP POLICY IF EXISTS "Service role delete" ON storage.objects;
CREATE POLICY "Service role delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'eva-assets');
