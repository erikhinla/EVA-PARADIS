-- ==========================================================================
-- Eva Paradis Content Engine — Queue Jobs Table
-- Run this in Supabase SQL Editor (supabase.com → project → SQL Editor)
-- ==========================================================================

-- Queue jobs: one row per platform variant from a compose run
create table if not exists queue_jobs (
  id              uuid primary key default gen_random_uuid(),
  compose_run     uuid not null,
  platform        text not null check (platform in ('x', 'reddit', 'ig', 'tj', 'tiktok', 'redgifs')),
  pillar          text not null check (pillar in ('HARDCORE_GROUP', 'DOMINANCE_WORSHIP', 'ANATOMY_SOLO')),
  variant_data    jsonb not null,
  master_caption  text not null,
  status          text not null default 'queued'
                    check (status in ('queued', 'scheduled', 'dispatched', 'published', 'failed', 'manual_only')),
  scheduled_at    timestamptz,
  published_at    timestamptz,
  postiz_post_id  text,
  error_message   text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Indexes for common queries
create index if not exists idx_queue_jobs_status on queue_jobs(status);
create index if not exists idx_queue_jobs_platform on queue_jobs(platform);
create index if not exists idx_queue_jobs_compose_run on queue_jobs(compose_run);
create index if not exists idx_queue_jobs_created_at on queue_jobs(created_at desc);

-- Auto-update updated_at on row changes
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on queue_jobs
  for each row
  execute function update_updated_at_column();

-- Row-level security (enable after connecting from Next.js with service role key)
-- alter table queue_jobs enable row level security;
-- create policy "Service role full access" on queue_jobs
--   for all using (true) with check (true);
