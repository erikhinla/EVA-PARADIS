-- 
-- Eva Paradis Content Engine - Full Database Schema
-- Run this in Supabase SQL Editor (supabase.com → project → SQL Editor)
--

-- ═══════════════════════════════════════════════════════════════════════════
-- AUTO-UPDATE TRIGGER FUNCTION
-- ═══════════════════════════════════════════════════════════════════════════
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE 1: leads (Email/SMS captures from the Brand Bridge landing page)
-- ═══════════════════════════════════════════════════════════════════════════
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  phone text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referrer text,
  ip_address text,
  user_agent text,
  converted boolean not null default false,
  converted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Prevent duplicate emails
create unique index if not exists idx_leads_email on leads(lower(email));

-- Query indexes
create index if not exists idx_leads_created_at on leads(created_at desc);
create index if not exists idx_leads_utm_source on leads(utm_source);
create index if not exists idx_leads_converted on leads(converted);

create trigger set_leads_updated_at
  before update on leads
  for each row execute function update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE 2: queue_jobs (Content queue from compose runs)
-- ═══════════════════════════════════════════════════════════════════════════
create table if not exists queue_jobs (
  id uuid primary key default gen_random_uuid(),
  compose_run uuid not null,
  platform text not null check (platform in ('x', 'reddit', 'ig', 'tj', 'tiktok', 'redgifs')),
  pillar text not null check (pillar in ('HARDCORE_GROUP', 'DOMINANCE_WORSHIP', 'ANATOMY_SOLO')),
  variant_data jsonb not null,
  master_caption text not null,
  status text not null default 'queued'
    check (status in ('queued', 'scheduled', 'dispatched', 'published', 'failed', 'manual_only')),
  scheduled_at timestamptz,
  published_at timestamptz,
  postiz_post_id text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_queue_jobs_status on queue_jobs(status);
create index if not exists idx_queue_jobs_platform on queue_jobs(platform);
create index if not exists idx_queue_jobs_compose_run on queue_jobs(compose_run);
create index if not exists idx_queue_jobs_created_at on queue_jobs(created_at desc);

create trigger set_updated_at
  before update on queue_jobs
  for each row execute function update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE 3: bridge_events (Lightweight analytics for funnel tracking)
-- Tracks: page views, OF clicks, email captures (mirror), conversions
-- ═══════════════════════════════════════════════════════════════════════════
create table if not exists bridge_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('pageview', 'of_click', 'email_capture', 'conversion')),
  utm_source text,
  utm_medium text,
  utm_campaign text,
  layout_variant text check (layout_variant in ('fast', 'narrative')),
  ip_address text,
  user_agent text,
  referrer text,
  created_at timestamptz not null default now()
);

create index if not exists idx_bridge_events_type on bridge_events(event_type);
create index if not exists idx_bridge_events_created_at on bridge_events(created_at desc);
create index if not exists idx_bridge_events_utm_source on bridge_events(utm_source);

-- ═══════════════════════════════════════════════════════════════════════════
-- VIEWS (Pre-built queries for the dashboard)
-- ═══════════════════════════════════════════════════════════════════════════

-- Funnel summary for the last 24 hours
create or replace view funnel_24h as
select
  count(*) filter (where event_type = 'pageview') as total_visits,
  count(*) filter (where event_type = 'of_click') as of_clicks,
  count(*) filter (where event_type = 'email_capture') as email_captures,
  count(*) filter (where event_type = 'conversion') as conversions,
  case when count(*) filter (where event_type = 'pageview') > 0
    then round(
      (count(*) filter (where event_type = 'of_click')::numeric /
       count(*) filter (where event_type = 'pageview')::numeric), 4
    )
    else 0
  end as bridge_ctr
from bridge_events
where created_at >= now() - interval '24 hours';

-- Traffic sources breakdown
create or replace view traffic_sources_24h as
select
  coalesce(utm_source, 'direct') as source,
  count(*) as visits,
  count(*) filter (where event_type = 'of_click') as clicks,
  count(*) filter (where event_type = 'email_capture') as captures
from bridge_events
where created_at >= now() - interval '24 hours'
  and event_type = 'pageview'
group by coalesce(utm_source, 'direct')
order by visits desc;

-- Lead count summary
create or replace view leads_summary as
select
  count(*) as total_leads,
  count(*) filter (where created_at >= now() - interval '24 hours') as leads_24h,
  count(*) filter (where created_at >= now() - interval '7 days') as leads_7d,
  count(*) filter (where converted = true) as converted_leads
from leads;

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW-LEVEL SECURITY (enable after testing)
-- ═══════════════════════════════════════════════════════════════════════════
-- alter table leads enable row level security;
-- alter table queue_jobs enable row level security;
-- alter table bridge_events enable row level security;
-- create policy "Service role full access" on leads for all using (true) with check (true);
-- create policy "Service role full access" on queue_jobs for all using (true) with check (true);
-- create policy "Service role full access" on bridge_events for all using (true) with check (true);
