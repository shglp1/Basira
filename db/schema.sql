-- Baseera v1.3 schema aligned with Supabase Auth
create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now()
);

create table if not exists assessment_versions (
  id text primary key,
  title text not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  version_id text not null references assessment_versions(id),
  status text not null check (status in ('started','completed')),
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  version_id text not null references assessment_versions(id),
  text_ar text not null,
  trait_key text not null check (trait_key in ('BF_O','BF_C','BF_E','BF_A','BF_N','RI_R','RI_I','RI_A','RI_S','RI_E','RI_C')),
  facet_key text not null,
  reverse_scored boolean not null default false,
  weight numeric not null default 1.0,
  created_at timestamptz not null default now()
);

create table if not exists responses (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments(id) on delete cascade,
  item_id uuid not null references items(id),
  value int not null check (value between 1 and 7),
  response_time_ms int not null,
  created_at timestamptz not null default now(),
  unique(assessment_id, item_id)
);

create table if not exists scores (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null unique references assessments(id) on delete cascade,
  bf_o numeric not null,
  bf_c numeric not null,
  bf_e numeric not null,
  bf_a numeric not null,
  bf_n numeric not null,
  ri_r numeric not null,
  ri_i numeric not null,
  ri_a numeric not null,
  ri_s numeric not null,
  ri_e numeric not null,
  ri_c numeric not null,
  confidence_score numeric not null,
  confidence_band text not null check (confidence_band in ('High','Medium','Low')),
  profile_json jsonb not null
);

create table if not exists occupations (
  id uuid primary key default gen_random_uuid(),
  title_ar text not null,
  sector_tags text[] not null default '{}',
  riasec_vector numeric[] not null,
  stress_level text not null check (stress_level in ('Low', 'Medium', 'High')),
  structure_level text not null,
  social_level text not null,
  created_at timestamptz not null default now()
);

create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments(id) on delete cascade,
  occupation_id uuid not null references occupations(id),
  similarity_score numeric not null,
  adjusted_score numeric not null,
  reasons_json jsonb not null
);

alter table profiles enable row level security;
alter table assessments enable row level security;
alter table responses enable row level security;
alter table scores enable row level security;
alter table matches enable row level security;
alter table items enable row level security;
alter table occupations enable row level security;
alter table assessment_versions enable row level security;

create policy "profiles_own_rw" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "assessments_own_rw" on assessments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "responses_own_rw" on responses for all using (
  exists (select 1 from assessments a where a.id = responses.assessment_id and a.user_id = auth.uid())
) with check (
  exists (select 1 from assessments a where a.id = responses.assessment_id and a.user_id = auth.uid())
);
create policy "scores_own_read" on scores for select using (
  exists (select 1 from assessments a where a.id = scores.assessment_id and a.user_id = auth.uid())
);
create policy "matches_own_read" on matches for select using (
  exists (select 1 from assessments a where a.id = matches.assessment_id and a.user_id = auth.uid())
);
create policy "items_read_all" on items for select using (true);
create policy "occupations_read_all" on occupations for select using (true);
create policy "versions_read_all" on assessment_versions for select using (true);

create policy "admin_mutation_items" on items for insert with check (
  exists(select 1 from profiles p where p.id = auth.uid() and p.role='admin')
);
create policy "admin_update_items" on items for update using (
  exists(select 1 from profiles p where p.id = auth.uid() and p.role='admin')
);
create policy "admin_delete_items" on items for delete using (
  exists(select 1 from profiles p where p.id = auth.uid() and p.role='admin')
);


create policy "admin_insert_occupations" on occupations for insert with check (
  exists(select 1 from profiles p where p.id = auth.uid() and p.role='admin')
);
create policy "admin_update_occupations" on occupations for update using (
  exists(select 1 from profiles p where p.id = auth.uid() and p.role='admin')
);
create policy "admin_delete_occupations" on occupations for delete using (
  exists(select 1 from profiles p where p.id = auth.uid() and p.role='admin')
);

create policy "admin_insert_versions" on assessment_versions for insert with check (
  exists(select 1 from profiles p where p.id = auth.uid() and p.role='admin')
);
create policy "admin_update_versions" on assessment_versions for update using (
  exists(select 1 from profiles p where p.id = auth.uid() and p.role='admin')
);
create policy "admin_delete_versions" on assessment_versions for delete using (
  exists(select 1 from profiles p where p.id = auth.uid() and p.role='admin')
);

create or replace function prevent_changes_on_published_versions()
returns trigger as $$
begin
  if exists(select 1 from assessment_versions v where v.id = coalesce(new.version_id, old.version_id) and v.is_published = true) then
    raise exception 'Published versions are immutable';
  end if;
  return coalesce(new, old);
end;
$$ language plpgsql;

create trigger items_immutable_when_published
before update or delete on items
for each row execute function prevent_changes_on_published_versions();
