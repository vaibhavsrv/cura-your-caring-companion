
-- =========== PROFILES ===========
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  date_of_birth DATE,
  blood_group TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========== MEDICINES ===========
CREATE TABLE public.medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  start_date DATE,
  end_date DATE,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own medicines" ON public.medicines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own medicines" ON public.medicines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own medicines" ON public.medicines FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own medicines" ON public.medicines FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER medicines_updated_at BEFORE UPDATE ON public.medicines
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========== PRESCRIPTIONS ===========
CREATE TABLE public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_name TEXT NOT NULL,
  issue_date DATE,
  diagnosis TEXT,
  notes TEXT,
  file_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own prescriptions" ON public.prescriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own prescriptions" ON public.prescriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own prescriptions" ON public.prescriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own prescriptions" ON public.prescriptions FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER prescriptions_updated_at BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========== LAB REPORTS ===========
CREATE TABLE public.lab_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  report_date DATE,
  notes TEXT,
  file_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lab_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own lab_reports" ON public.lab_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own lab_reports" ON public.lab_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own lab_reports" ON public.lab_reports FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own lab_reports" ON public.lab_reports FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER lab_reports_updated_at BEFORE UPDATE ON public.lab_reports
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========== SHARES ===========
-- Share scope: 'medicines', 'prescriptions', 'both' (per user request: only meds + prescriptions)
CREATE TABLE public.shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  recipient_label TEXT,
  include_medicines BOOLEAN NOT NULL DEFAULT true,
  include_prescriptions BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked BOOLEAN NOT NULL DEFAULT false,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own shares" ON public.shares FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own shares" ON public.shares FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own shares" ON public.shares FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own shares" ON public.shares FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX shares_token_idx ON public.shares(token);

-- =========== SHARED VIEW FUNCTION ===========
-- SECURITY DEFINER fn that returns shared data only if token is valid + not expired/revoked.
-- Returns JSON with profile (name only), medicines, prescriptions per share scope.
CREATE OR REPLACE FUNCTION public.get_shared_records(_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_share public.shares%ROWTYPE;
  v_result JSONB;
BEGIN
  SELECT * INTO v_share FROM public.shares WHERE token = _token;
  IF NOT FOUND THEN RETURN jsonb_build_object('error', 'not_found'); END IF;
  IF v_share.revoked THEN RETURN jsonb_build_object('error', 'revoked'); END IF;
  IF v_share.expires_at < now() THEN RETURN jsonb_build_object('error', 'expired'); END IF;

  UPDATE public.shares SET view_count = view_count + 1 WHERE id = v_share.id;

  SELECT jsonb_build_object(
    'patient', (SELECT jsonb_build_object('full_name', full_name) FROM public.profiles WHERE id = v_share.user_id),
    'expires_at', v_share.expires_at,
    'recipient_label', v_share.recipient_label,
    'medicines', CASE WHEN v_share.include_medicines THEN
      COALESCE((SELECT jsonb_agg(jsonb_build_object(
        'id', id, 'name', name, 'dosage', dosage, 'frequency', frequency,
        'start_date', start_date, 'end_date', end_date, 'notes', notes, 'is_active', is_active
      ) ORDER BY is_active DESC, start_date DESC NULLS LAST) FROM public.medicines WHERE user_id = v_share.user_id), '[]'::jsonb)
      ELSE NULL END,
    'prescriptions', CASE WHEN v_share.include_prescriptions THEN
      COALESCE((SELECT jsonb_agg(jsonb_build_object(
        'id', id, 'doctor_name', doctor_name, 'issue_date', issue_date,
        'diagnosis', diagnosis, 'notes', notes, 'file_path', file_path
      ) ORDER BY issue_date DESC NULLS LAST) FROM public.prescriptions WHERE user_id = v_share.user_id), '[]'::jsonb)
      ELSE NULL END
  ) INTO v_result;

  RETURN v_result;
END; $$;

-- Allow anonymous calls to this function (it self-validates via token)
GRANT EXECUTE ON FUNCTION public.get_shared_records(TEXT) TO anon, authenticated;

-- =========== SIGNED URL FUNCTION FOR SHARED FILES ===========
-- Returns the file_path of a prescription IF the token grants access to it.
CREATE OR REPLACE FUNCTION public.get_shared_file_path(_token TEXT, _prescription_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_share public.shares%ROWTYPE;
  v_path TEXT;
BEGIN
  SELECT * INTO v_share FROM public.shares WHERE token = _token;
  IF NOT FOUND OR v_share.revoked OR v_share.expires_at < now() OR NOT v_share.include_prescriptions THEN
    RETURN NULL;
  END IF;
  SELECT file_path INTO v_path FROM public.prescriptions
  WHERE id = _prescription_id AND user_id = v_share.user_id;
  RETURN v_path;
END; $$;
GRANT EXECUTE ON FUNCTION public.get_shared_file_path(TEXT, UUID) TO anon, authenticated;

-- =========== STORAGE BUCKETS ===========
INSERT INTO storage.buckets (id, name, public) VALUES
  ('prescriptions', 'prescriptions', false),
  ('lab-reports', 'lab-reports', false);

-- Owner-scoped storage policies (file path prefix = user id)
CREATE POLICY "Users read own prescription files" ON storage.objects FOR SELECT
  USING (bucket_id = 'prescriptions' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users upload own prescription files" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'prescriptions' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own prescription files" ON storage.objects FOR UPDATE
  USING (bucket_id = 'prescriptions' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own prescription files" ON storage.objects FOR DELETE
  USING (bucket_id = 'prescriptions' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users read own lab files" ON storage.objects FOR SELECT
  USING (bucket_id = 'lab-reports' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users upload own lab files" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'lab-reports' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own lab files" ON storage.objects FOR UPDATE
  USING (bucket_id = 'lab-reports' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own lab files" ON storage.objects FOR DELETE
  USING (bucket_id = 'lab-reports' AND auth.uid()::text = (storage.foldername(name))[1]);
