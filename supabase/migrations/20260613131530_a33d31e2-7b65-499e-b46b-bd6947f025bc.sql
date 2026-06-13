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

revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated, service_role;
revoke execute on function public.get_user_role(uuid) from public, anon;
grant execute on function public.get_user_role(uuid) to authenticated, service_role;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.handle_new_user() to service_role;

CREATE TABLE public.sms_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  project_type text NOT NULL DEFAULT 'ongoing' CHECK (project_type IN ('time-bound','ongoing')),
  target_date date,
  location_label text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  description text,
  beneficiaries text,
  contact_phone text,
  needs jsonb NOT NULL DEFAULT '{}'::jsonb,
  suggested_seed_org_id text,
  claimed_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  claimed_project_id uuid REFERENCES public.user_projects(id) ON DELETE SET NULL,
  claimed_at timestamptz,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.sms_submissions TO anon;
GRANT SELECT, UPDATE ON public.sms_submissions TO authenticated;
GRANT ALL ON public.sms_submissions TO service_role;
ALTER TABLE public.sms_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sms_submissions readable by anyone" ON public.sms_submissions FOR SELECT USING (true);
CREATE POLICY "sms_submissions claim by authenticated" ON public.sms_submissions FOR UPDATE TO authenticated
  USING (claimed_by_user_id IS NULL OR claimed_by_user_id = auth.uid())
  WITH CHECK (claimed_by_user_id = auth.uid());

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  title text not null,
  body text not null,
  link text,
  related_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_unread_idx on public.notifications (user_id, read_at, created_at desc);
grant select, insert, update, delete on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "Users read own notifications" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "Users update own notifications" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function public.notify_orgs_of_new_donor()
returns trigger language plpgsql security definer set search_path = public as $$
declare donor_name text; region_text text; interest_text text;
begin
  donor_name := coalesce(nullif(new.organisation_name, ''), 'A new donor');
  region_text := case when new.regions is null or array_length(new.regions, 1) is null then 'multiple regions' else array_to_string(new.regions, ', ') end;
  interest_text := case when new.interests is null or array_length(new.interests, 1) is null then '' else ' interested in ' || array_to_string(new.interests, ', ') end;
  insert into public.notifications (user_id, kind, title, body, link, related_id)
  select distinct o.owner_id, 'new_donor_match',
         'A new donor just joined matching your interests',
         donor_name || ' (' || coalesce(new.donor_kind, 'donor') || ')' || interest_text
           || ' just joined FieldMap and funds in ' || region_text || '.',
         '/?view=donors', new.id
  from public.user_orgs o
  where o.owner_id is not null and o.owner_id <> new.id
    and (new.regions is null or array_length(new.regions, 1) is null or 'Global' = any(new.regions)
      or exists (select 1 from unnest(new.regions) r where
           (o.region is not null and o.region <> '' and o.region ilike '%' || r || '%')
        or (o.country is not null and o.country <> '' and o.country ilike '%' || r || '%')
        or (o.region is not null and o.region <> '' and r ilike '%' || o.region || '%')
        or (o.country is not null and o.country <> '' and r ilike '%' || o.country || '%')));
  return new;
end; $$;

create or replace function public.notify_donors_of_new_org()
returns trigger language plpgsql security definer set search_path = public as $$
declare org_label text;
begin
  org_label := coalesce(nullif(new.name, ''), 'A new organisation');
  insert into public.notifications (user_id, kind, title, body, link, related_id)
  select distinct d.id, 'new_org_match',
         'A new organisation matching your interests just joined',
         org_label || ' (' || coalesce(new.entity_kind, 'organisation') || ')'
           || case when new.region is not null and new.region <> '' then ' in ' || new.region else '' end
           || case when new.country is not null and new.country <> '' then ', ' || new.country else '' end
           || ' just joined FieldMap.',
         '/?view=map', new.id
  from public.donor_profiles d
  where d.id <> new.owner_id
    and (d.regions is null or array_length(d.regions, 1) is null or 'Global' = any(d.regions)
      or exists (select 1 from unnest(d.regions) r where
           (new.region is not null and new.region <> '' and new.region ilike '%' || r || '%')
        or (new.country is not null and new.country <> '' and new.country ilike '%' || r || '%')
        or (new.region is not null and new.region <> '' and r ilike '%' || new.region || '%')
        or (new.country is not null and new.country <> '' and r ilike '%' || new.country || '%')));
  return new;
end; $$;

create trigger trg_notify_orgs_of_new_donor after insert on public.donor_profiles
for each row execute function public.notify_orgs_of_new_donor();
create trigger trg_notify_donors_of_new_org after insert on public.user_orgs
for each row execute function public.notify_donors_of_new_org();