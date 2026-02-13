-- Leads table: captures email signups from the bridge deferred-capture flow.
-- Run this manually in the Supabase SQL Editor (Dashboard > SQL Editor > New query).
-- The app does NOT have automated Supabase migration tooling.

CREATE TABLE IF NOT EXISTS leads (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  email         text        NOT NULL,
  phone         text,
  source        text        DEFAULT 'bridge_return',
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  referrer      text,
  captured_at   timestamptz DEFAULT now(),
  converted     boolean     DEFAULT false
);

-- Unique constraint on email so upserts work without duplicates
CREATE UNIQUE INDEX IF NOT EXISTS leads_email_unique ON leads (email);

-- Bridge events table (if it doesn't already exist)
CREATE TABLE IF NOT EXISTS bridge_events (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type    text        NOT NULL DEFAULT 'visit',
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
