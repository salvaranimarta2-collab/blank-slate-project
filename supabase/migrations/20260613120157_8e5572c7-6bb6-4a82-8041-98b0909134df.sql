
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

CREATE POLICY "sms_submissions readable by anyone"
  ON public.sms_submissions FOR SELECT USING (true);

CREATE POLICY "sms_submissions claim by authenticated"
  ON public.sms_submissions FOR UPDATE TO authenticated
  USING (claimed_by_user_id IS NULL OR claimed_by_user_id = auth.uid())
  WITH CHECK (claimed_by_user_id = auth.uid());

INSERT INTO public.sms_submissions
  (title, category, project_type, location_label, lat, lng, description, beneficiaries, contact_phone, needs, suggested_seed_org_id)
VALUES
  ('Repair classroom roof damaged by storm', 'shelter', 'time-bound',
   'Kakuma Refugee Camp, Turkana County, Kenya', 3.7167, 34.8667,
   'Heavy rains last week tore the iron-sheet roof off two classrooms at our vocational centre. Students are sitting outside. We need roofing sheets, timber and labour for a one-week repair.',
   '120 youth', '+254712345010',
   '{"funding":{"amount":2400,"currency":"USD"},"equipment":"roofing sheets, timber, nails"}'::jsonb,
   'org-ki4bli'),
  ('Weekly peer mental-health circles for new arrivals', 'protection', 'ongoing',
   'Kakuma Refugee Camp, Turkana County, Kenya', 3.7180, 34.8650,
   'Starting weekly peer-support circles for newly arrived South Sudanese youth at the vocational centre. Need a small stipend for two trained facilitators and printed materials.',
   '40 youth / month', '+254712345010',
   '{"funding":{"amount":1800,"currency":"USD"},"expertise":["psychosocial training"]}'::jsonb,
   'org-ki4bli'),
  ('Solar lanterns for night-shift study sessions', 'energy', 'time-bound',
   'Kalobeyei Settlement, Turkana County, Kenya', 3.7300, 34.8500,
   'Students who work during the day are studying after dark with phone torches. Requesting 60 solar lanterns so youth can study safely at night in the centre.',
   '60 youth', '+254712345010',
   '{"funding":{"amount":1200,"currency":"USD"},"equipment":"60 solar lanterns"}'::jsonb,
   NULL);
