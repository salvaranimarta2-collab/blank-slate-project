
-- =========================================================
-- Roles enum + user_roles + has_role (recommended pattern)
-- =========================================================
create type public.app_role as enum ('rlo','ngo','donor');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  contact_email text,
  contact_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles readable by anyone" on public.profiles for select using (true);
create policy "users update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique(user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "users read own role" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.get_user_role(_user_id uuid)
returns public.app_role language sql stable security definer set search_path = public as $$
  select role from public.user_roles where user_id = _user_id limit 1
$$;

-- =========================================================
-- user_orgs (RLO/NGO accounts create these)
-- =========================================================
create table public.user_orgs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  entity_kind text not null check (entity_kind in ('RLO','NGO')),
  org_type text,
  country text,
  region text,
  lat double precision,
  lng double precision,
  year_founded int,
  description text,
  brings text[] not null default '{}',
  phone text,
  claimed_seed_org_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.user_orgs to anon, authenticated;
grant insert, update, delete on public.user_orgs to authenticated;
grant all on public.user_orgs to service_role;
alter table public.user_orgs enable row level security;
create policy "user_orgs readable by anyone" on public.user_orgs for select using (true);
create policy "user_orgs insert by owner" on public.user_orgs for insert to authenticated with check (auth.uid() = owner_id);
create policy "user_orgs update by owner" on public.user_orgs for update to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "user_orgs delete by owner" on public.user_orgs for delete to authenticated using (auth.uid() = owner_id);

-- =========================================================
-- user_projects
-- =========================================================
create table public.user_projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  org_id uuid references public.user_orgs(id) on delete cascade,
  seed_org_id text,
  title text not null,
  category text not null,
  project_type text not null default 'ongoing' check (project_type in ('time-bound','ongoing')),
  target_date date,
  location_label text not null,
  lat double precision not null,
  lng double precision not null,
  description text,
  beneficiaries text,
  status text not null default 'seeking support',
  needs jsonb not null default '{}'::jsonb,
  partner_org_refs text[] not null default '{}',
  photos text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.user_projects to anon, authenticated;
grant insert, update, delete on public.user_projects to authenticated;
grant all on public.user_projects to service_role;
alter table public.user_projects enable row level security;
create policy "user_projects readable by anyone" on public.user_projects for select using (true);
create policy "user_projects insert by owner" on public.user_projects for insert to authenticated with check (auth.uid() = owner_id);
create policy "user_projects update by owner" on public.user_projects for update to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "user_projects delete by owner" on public.user_projects for delete to authenticated using (auth.uid() = owner_id);

-- =========================================================
-- donor_profiles
-- =========================================================
create table public.donor_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organisation_name text,
  donor_kind text,
  hq_country text,
  website text,
  blurb text,
  interests text[] not null default '{}',
  regions text[] not null default '{}',
  focus_areas text[] not null default '{}',
  recently_funded int not null default 0,
  updated_at timestamptz not null default now()
);
grant select on public.donor_profiles to anon, authenticated;
grant insert, update on public.donor_profiles to authenticated;
grant all on public.donor_profiles to service_role;
alter table public.donor_profiles enable row level security;
create policy "donor_profiles readable by anyone" on public.donor_profiles for select using (true);
create policy "donor_profiles update own" on public.donor_profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "donor_profiles insert own" on public.donor_profiles for insert to authenticated with check (auth.uid() = id);

-- =========================================================
-- outreach_log
-- =========================================================
create table public.outreach_log (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references auth.users(id) on delete cascade,
  to_user_id uuid references auth.users(id) on delete set null,
  to_org_ref text not null,
  to_project_ref text,
  channel text not null check (channel in ('sms','in_app')),
  message text,
  created_at timestamptz not null default now()
);
grant select, insert on public.outreach_log to authenticated;
grant all on public.outreach_log to service_role;
alter table public.outreach_log enable row level security;
create policy "outreach visible to sender or recipient" on public.outreach_log for select to authenticated using (auth.uid() = from_user_id or auth.uid() = to_user_id);
create policy "outreach insert by sender" on public.outreach_log for insert to authenticated with check (auth.uid() = from_user_id);

-- =========================================================
-- threads + messages
-- =========================================================
create table public.threads (
  id uuid primary key default gen_random_uuid(),
  participant_a uuid not null references auth.users(id) on delete cascade,
  participant_b uuid not null references auth.users(id) on delete cascade,
  project_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (participant_a <> participant_b)
);
grant select, insert, update on public.threads to authenticated;
grant all on public.threads to service_role;
alter table public.threads enable row level security;
create policy "threads visible to participants" on public.threads for select to authenticated using (auth.uid() in (participant_a, participant_b));
create policy "threads insert by participant" on public.threads for insert to authenticated with check (auth.uid() in (participant_a, participant_b));
create policy "threads update by participant" on public.threads for update to authenticated using (auth.uid() in (participant_a, participant_b));
create index threads_participant_a_idx on public.threads(participant_a);
create index threads_participant_b_idx on public.threads(participant_b);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads(id) on delete cascade,
  from_user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
grant select, insert on public.messages to authenticated;
grant all on public.messages to service_role;
alter table public.messages enable row level security;
create policy "messages visible to thread participants" on public.messages for select to authenticated using (
  exists (select 1 from public.threads t where t.id = thread_id and auth.uid() in (t.participant_a, t.participant_b))
);
create policy "messages insert by thread participant" on public.messages for insert to authenticated with check (
  auth.uid() = from_user_id and exists (
    select 1 from public.threads t where t.id = thread_id and auth.uid() in (t.participant_a, t.participant_b)
  )
);
create index messages_thread_idx on public.messages(thread_id, created_at);

-- =========================================================
-- new user trigger: create profile + role + (optional donor)
-- =========================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_role public.app_role;
  v_display text;
begin
  v_display := coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1));
  insert into public.profiles (id, display_name, contact_email)
    values (new.id, v_display, new.email)
    on conflict (id) do nothing;
  begin
    v_role := (new.raw_user_meta_data ->> 'role')::public.app_role;
  exception when others then
    v_role := 'donor';
  end;
  if v_role is null then v_role := 'donor'; end if;
  insert into public.user_roles (user_id, role) values (new.id, v_role)
    on conflict do nothing;
  if v_role = 'donor' then
    insert into public.donor_profiles (id, organisation_name)
      values (new.id, v_display) on conflict do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
