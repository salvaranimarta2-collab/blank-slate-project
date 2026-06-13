ALTER TABLE public.user_projects ADD COLUMN IF NOT EXISTS seed_project_ref text;
CREATE INDEX IF NOT EXISTS user_projects_seed_project_ref_idx ON public.user_projects (seed_project_ref);