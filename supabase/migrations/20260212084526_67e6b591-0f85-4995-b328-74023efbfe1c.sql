
-- Create status enum
CREATE TYPE public.grievance_status AS ENUM (
  'Submitted', 'Acknowledged', 'Under Review', 'In Progress', 
  'Awaiting Confirmation', 'Resolved', 'Closed', 'Rejected'
);

-- Create category enum
CREATE TYPE public.grievance_category AS ENUM (
  'Academic', 'Examination', 'Infrastructure', 'Hostel', 
  'Library', 'Administration', 'IT / Network', 'Discipline / Harassment', 'Other'
);

-- Profiles table for staff/admin users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read profiles"
  ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grievances table
CREATE TABLE public.grievances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grievance_id TEXT UNIQUE NOT NULL DEFAULT 'GRV-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0'),
  category grievance_category NOT NULL DEFAULT 'Other',
  description TEXT NOT NULL DEFAULT '',
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  user_id TEXT,
  user_name TEXT,
  user_role TEXT,
  user_department TEXT,
  image_url TEXT,
  video_url TEXT,
  status grievance_status NOT NULL DEFAULT 'Submitted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.grievances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read all grievances"
  ON public.grievances FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can update grievances"
  ON public.grievances FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert grievances"
  ON public.grievances FOR INSERT TO authenticated WITH CHECK (true);

-- Action history table
CREATE TABLE public.grievance_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grievance_id UUID NOT NULL REFERENCES public.grievances(id) ON DELETE CASCADE,
  action_by UUID REFERENCES public.profiles(id),
  admin_name TEXT,
  remarks TEXT NOT NULL DEFAULT '',
  new_status grievance_status NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.grievance_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read actions"
  ON public.grievance_actions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert actions"
  ON public.grievance_actions FOR INSERT TO authenticated WITH CHECK (true);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_grievances_updated_at
  BEFORE UPDATE ON public.grievances
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Generate unique grievance IDs
CREATE OR REPLACE FUNCTION public.generate_grievance_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(grievance_id FROM 5) AS INTEGER)), 0) + 1
  INTO next_num FROM public.grievances;
  NEW.grievance_id = 'GRV-' || LPAD(next_num::TEXT, 6, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_grievance_id
  BEFORE INSERT ON public.grievances
  FOR EACH ROW EXECUTE FUNCTION public.generate_grievance_id();
