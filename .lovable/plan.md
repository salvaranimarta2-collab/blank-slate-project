## What you'll get

- **Sign up / sign in** with email + password. New users pick a role at signup: RLO, NGO, or Donor.
- **My Profile** (role-specific editor)
  - **RLO**: claim an existing org from the seed list *or* create a new one. Manage multiple projects (add/edit/delete) that appear as pins.
  - **NGO**: create a fresh org profile. Manage multiple projects.
  - **Donor**: edit interests, regions, ticket range, etc. — same fields used by the "Top donors" cards.
- **Dashboard** (role-aware)
  - Outreach you started (every "Start conversation" / "Express funding interest" SMS click is logged).
  - Outreach you received (other accounts that contacted your org/projects).
  - Threads from the optional in-app message feature (see below).
- **Optional in-app messages** — alongside the SMS button, a "Send a message in-app" option opens a thread visible in both dashboards. SMS still works for unauthenticated visitors.
- **Header**: when signed out, "Sign in" button; when signed in, an avatar menu with Profile / Dashboard / Sign out.

## Pages & routes

```text
/auth                          Sign-in + sign-up (toggle), role picker
/_authenticated/profile        My Profile (role-specific form)
/_authenticated/dashboard      Inbox / outbox / messages
/_authenticated/projects/new   Create a project (RLO/NGO only)
/_authenticated/projects/$id   Edit a project (must own it)
```

The map (`/`), donor grid, and partnerships panel stay public — anyone can browse without an account.

## Data model (Lovable Cloud)

```text
profiles          id (=auth.users.id), role, display_name, contact_email,
                  contact_phone, claimed_org_id?, created_at
user_orgs         id, owner_id, name, country, region, lat, lng,
                  entity_kind (RLO|NGO), org_type, year_founded,
                  description, brings[], phone   -- new orgs created by users
user_projects     id, owner_id, org_id (FK user_orgs OR seed org id text),
                  title, category, type, target_date, location_label,
                  lat, lng, description, beneficiaries, status,
                  needs (jsonb), partner_org_ids[], photos[]
donor_profiles    id (=profiles.id), organisation_name, interests[],
                  regions[], focus_areas[], website, blurb, etc.
outreach_log      id, from_user_id, to_org_id, to_project_id?,
                  channel (sms|in_app), message?, created_at
messages          id, thread_id, from_user_id, to_user_id, body, created_at
threads           id, project_id?, participant_a, participant_b, created_at
```

RLS: users can only read/write their own profile, their own orgs, their own projects, their own outreach_log rows, and threads/messages where they're a participant. The map reads merge seed data + public user_orgs/user_projects.

## Out of scope (flag now)

- No admin moderation queue (you picked self-serve).
- No email notifications for new messages.
- No file uploads for org logos/project photos in this pass — uses category illustrations and initials avatars like today.
- No "verified" badges.

## Build order

1. Enable Lovable Cloud + migrations for the tables above with RLS.
2. `/auth` page + `_authenticated` gate + header avatar menu.
3. Profile editor (3 forms keyed by role).
4. Project create/edit forms for RLO/NGO; map shows seed + user projects together.
5. Outreach logging on the existing SMS button + new in-app message button.
6. Dashboard with inbox / outbox / message threads.

If that all looks right, approve and I'll start with step 1.
