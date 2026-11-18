-- ==============================================================================
-- FAMCARE360: Comprehensive Database Schema Migration
-- Version: 20261118000000
-- Modules: profiles, families, family_members, children, health_reports,
--          vital_signs, meals, exercises, medications, appointments,
--          sos_alerts, notifications
-- ==============================================================================

-- 1. Create role enum if not exists
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('parent', 'child');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  role app_role NOT NULL DEFAULT 'parent',
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- 4. FAMILIES TABLE
CREATE TABLE IF NOT EXISTS public.families (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'My Family',
  invite_code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_families_invite_code ON public.families(invite_code);
CREATE INDEX IF NOT EXISTS idx_families_created_by ON public.families(created_by);

-- 5. FAMILY MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'parent',
  relationship TEXT DEFAULT 'Family Member',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(family_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_family_members_lookup ON public.family_members(family_id, user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user ON public.family_members(user_id);

-- 6. CHILDREN TABLE
CREATE TABLE IF NOT EXISTS public.children (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  family_id UUID REFERENCES public.families(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  age INTEGER,
  health_details TEXT,
  linked_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_children_parent ON public.children(parent_id);
CREATE INDEX IF NOT EXISTS idx_children_linked_user ON public.children(linked_user_id);

-- 7. HEALTH REPORTS TABLE (Daily Parent Health Check-ins)
CREATE TABLE IF NOT EXISTS public.health_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  family_id UUID REFERENCES public.families(id) ON DELETE SET NULL,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  -- Vitals
  heart_rate INTEGER DEFAULT 72,
  temperature NUMERIC(4, 1) DEFAULT 98.6,
  steps_count INTEGER DEFAULT 0,
  distance_km NUMERIC(5, 2) DEFAULT 0,
  active_calories INTEGER DEFAULT 0,
  -- Mental & Emotional
  mood_score INTEGER DEFAULT 3 CHECK (mood_score BETWEEN 1 AND 5),
  stress_level INTEGER DEFAULT 2 CHECK (stress_level BETWEEN 1 AND 5),
  anxiety_level INTEGER DEFAULT 2 CHECK (anxiety_level BETWEEN 1 AND 5),
  emotional_notes TEXT,
  had_social_interactions BOOLEAN DEFAULT true,
  feeling_lonely BOOLEAN DEFAULT false,
  outdoor_time_minutes INTEGER DEFAULT 0,
  -- Food & Hydration
  meals_eaten INTEGER DEFAULT 3,
  ate_breakfast BOOLEAN DEFAULT true,
  ate_lunch BOOLEAN DEFAULT true,
  ate_dinner BOOLEAN DEFAULT true,
  water_intake INTEGER DEFAULT 6,
  caffeine_intake INTEGER DEFAULT 1,
  appetite_good BOOLEAN DEFAULT true,
  had_fruits_veggies BOOLEAN DEFAULT true,
  took_vitamins BOOLEAN DEFAULT false,
  diet_habits_score INTEGER DEFAULT 50,
  -- Sleep & Rest
  sleep_hours NUMERIC(4, 1) DEFAULT 7,
  sleep_quality INTEGER DEFAULT 3 CHECK (sleep_quality BETWEEN 1 AND 5),
  had_nap BOOLEAN DEFAULT false,
  wake_up_time TEXT,
  sleep_in_bed_time TEXT,
  deep_sleep_hours NUMERIC(4, 1) DEFAULT 2,
  light_sleep_hours NUMERIC(4, 1) DEFAULT 3,
  rem_sleep_hours NUMERIC(4, 1) DEFAULT 1.5,
  awake_during_night INTEGER DEFAULT 30,
  felt_rested_after_sleep BOOLEAN DEFAULT true,
  snoring_concerns BOOLEAN DEFAULT false,
  -- Physical Activity
  mobility_level INTEGER DEFAULT 3 CHECK (mobility_level BETWEEN 1 AND 5),
  exercise_minutes INTEGER DEFAULT 0,
  pain_level INTEGER DEFAULT 0 CHECK (pain_level BETWEEN 0 AND 5),
  did_physical_therapy BOOLEAN DEFAULT false,
  did_stretching BOOLEAN DEFAULT false,
  used_walking_aid BOOLEAN DEFAULT false,
  -- Medicines & Readings
  medication_taken BOOLEAN DEFAULT true,
  medication_side_effects TEXT,
  blood_pressure TEXT,
  blood_sugar TEXT,
  cholesterol TEXT,
  diabetes_reading TEXT,
  allergies TEXT,
  -- Overall Safety
  felt_safe BOOLEAN DEFAULT true,
  had_fall BOOLEAN DEFAULT false,
  needs_help BOOLEAN DEFAULT false,
  home_hazards BOOLEAN DEFAULT false,
  used_emergency_contact BOOLEAN DEFAULT false,
  caregiver_notes TEXT,
  -- Family Connection & Emergency
  bonding_message TEXT,
  sos_activated BOOLEAN DEFAULT false,
  lifestyle_score NUMERIC(5, 1) DEFAULT 50,
  health_status TEXT DEFAULT 'stable' CHECK (health_status IN ('stable', 'moderate', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, report_date)
);

CREATE INDEX IF NOT EXISTS idx_health_reports_user_date ON public.health_reports(user_id, report_date DESC);
CREATE INDEX IF NOT EXISTS idx_health_reports_family ON public.health_reports(family_id);

-- 8. VITAL SIGNS TABLE
CREATE TABLE IF NOT EXISTS public.vital_signs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  heart_rate INTEGER,
  temperature NUMERIC(4, 1),
  blood_pressure TEXT,
  blood_sugar TEXT,
  cholesterol TEXT,
  steps_count INTEGER,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vital_signs_user ON public.vital_signs(user_id, recorded_at DESC);

-- 9. MEALS TABLE
CREATE TABLE IF NOT EXISTS public.meals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  meal_date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  name TEXT NOT NULL,
  calories INTEGER NOT NULL DEFAULT 0,
  protein NUMERIC(5, 1) DEFAULT 0,
  carbs NUMERIC(5, 1) DEFAULT 0,
  fat NUMERIC(5, 1) DEFAULT 0,
  time TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meals_user_date ON public.meals(user_id, meal_date);

-- 10. EXERCISES TABLE
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exercise_date DATE NOT NULL DEFAULT CURRENT_DATE,
  exercise_id TEXT NOT NULL,
  name TEXT NOT NULL,
  sets JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_reps INTEGER DEFAULT 0,
  calories_burned INTEGER DEFAULT 0,
  duration INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exercises_user_date ON public.exercises(user_id, exercise_date);

-- 11. MEDICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.medications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  dose TEXT NOT NULL,
  time TEXT NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'Daily',
  taken BOOLEAN DEFAULT false,
  refill_needed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_medications_user ON public.medications(user_id);

-- 12. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  doctor TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT,
  notes TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointments_user_date ON public.appointments(user_id, date);

-- 13. SOS ALERTS TABLE
CREATE TABLE IF NOT EXISTS public.sos_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  family_id UUID REFERENCES public.families(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  notes TEXT,
  vital_snapshot JSONB,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sos_alerts_user ON public.sos_alerts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_sos_alerts_family ON public.sos_alerts(family_id, status);

-- 14. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'sos', 'health_warning', 'medication', 'appointment')),
  read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, read);

-- ==============================================================================
-- HELPER FUNCTIONS & TRIGGERS
-- ==============================================================================

-- Trigger to update updated_at timestamps
CREATE OR REPLACE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE TRIGGER update_families_updated_at BEFORE UPDATE ON public.families FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE TRIGGER update_children_updated_at BEFORE UPDATE ON public.children FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE TRIGGER update_health_reports_updated_at BEFORE UPDATE ON public.health_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE TRIGGER update_medications_updated_at BEFORE UPDATE ON public.medications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check if current user belongs to a specific family (Security Definer avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.is_in_family(f_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.family_members
    WHERE family_id = f_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to check if a user is in the same family or authorized relation
CREATE OR REPLACE FUNCTION public.is_family_member(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF auth.uid() = target_user_id THEN
    RETURN TRUE;
  END IF;

  -- Check shared family
  IF EXISTS (
    SELECT 1 FROM public.family_members fm1
    JOIN public.family_members fm2 ON fm1.family_id = fm2.family_id
    WHERE fm1.user_id = auth.uid() AND fm2.user_id = target_user_id
  ) THEN
    RETURN TRUE;
  END IF;

  -- Check parent-child relation via children table
  IF EXISTS (
    SELECT 1 FROM public.children
    WHERE (parent_id = target_user_id AND linked_user_id = auth.uid())
       OR (parent_id = auth.uid() AND linked_user_id = target_user_id)
  ) THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Auto-create profile and personal family on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role app_role;
  v_family_id UUID;
  v_invite_code TEXT;
  v_joined_invite_code TEXT;
BEGIN
  v_role := COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'parent');
  v_joined_invite_code := NULLIF(TRIM(NEW.raw_user_meta_data->>'invite_code'), '');

  -- 1. Insert Profile
  INSERT INTO public.profiles (user_id, full_name, role, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    v_role,
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;

  -- 2. Family Assignment
  IF v_joined_invite_code IS NOT NULL THEN
    -- Look up existing family by invite code
    SELECT id INTO v_family_id FROM public.families WHERE invite_code = v_joined_invite_code LIMIT 1;
    IF v_family_id IS NOT NULL THEN
      INSERT INTO public.family_members (family_id, user_id, role, relationship)
      VALUES (v_family_id, NEW.id, v_role, CASE WHEN v_role = 'child' THEN 'Child' ELSE 'Parent' END)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  -- If parent and not joining existing family, create their default family
  IF v_role = 'parent' AND v_family_id IS NULL THEN
    v_invite_code := 'FC-' || UPPER(SUBSTRING(MD5(NEW.id::text || now()::text) FROM 1 FOR 6));
    INSERT INTO public.families (name, invite_code, created_by)
    VALUES (
      COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', '') || '''s Family', 'Family Care Circle'),
      v_invite_code,
      NEW.id
    ) RETURNING id INTO v_family_id;

    INSERT INTO public.family_members (family_id, user_id, role, relationship)
    VALUES (v_family_id, NEW.id, 'parent', 'Parent')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate on_auth_user_created trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vital_signs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- PROFILES
DROP POLICY IF EXISTS "Users can view family profiles" ON public.profiles;
CREATE POLICY "Users can view family profiles" ON public.profiles FOR SELECT USING (public.is_family_member(user_id));

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- FAMILIES
DROP POLICY IF EXISTS "Family members can view family" ON public.families;
CREATE POLICY "Family members can view family" ON public.families FOR SELECT USING (
  created_by = auth.uid() OR public.is_in_family(id)
);

DROP POLICY IF EXISTS "Parents can create families" ON public.families;
CREATE POLICY "Parents can create families" ON public.families FOR INSERT WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Parents can update families" ON public.families;
CREATE POLICY "Parents can update families" ON public.families FOR UPDATE USING (created_by = auth.uid());

-- FAMILY MEMBERS
DROP POLICY IF EXISTS "Family members can view their group" ON public.family_members;
CREATE POLICY "Family members can view their group" ON public.family_members FOR SELECT USING (
  user_id = auth.uid() OR public.is_in_family(family_id)
);

DROP POLICY IF EXISTS "Users can join families" ON public.family_members;
CREATE POLICY "Users can join families" ON public.family_members FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can leave families" ON public.family_members;
CREATE POLICY "Users can leave families" ON public.family_members FOR DELETE USING (user_id = auth.uid());

-- CHILDREN
DROP POLICY IF EXISTS "Parents and linked children can view children" ON public.children;
CREATE POLICY "Parents and linked children can view children" ON public.children FOR SELECT USING (
  auth.uid() = parent_id OR auth.uid() = linked_user_id OR public.is_family_member(parent_id)
);

DROP POLICY IF EXISTS "Parents can insert children" ON public.children;
CREATE POLICY "Parents can insert children" ON public.children FOR INSERT WITH CHECK (auth.uid() = parent_id);

DROP POLICY IF EXISTS "Parents can update children" ON public.children;
CREATE POLICY "Parents can update children" ON public.children FOR UPDATE USING (auth.uid() = parent_id);

DROP POLICY IF EXISTS "Parents can delete children" ON public.children;
CREATE POLICY "Parents can delete children" ON public.children FOR DELETE USING (auth.uid() = parent_id);

-- HEALTH REPORTS
DROP POLICY IF EXISTS "Users and family can view health reports" ON public.health_reports;
CREATE POLICY "Users and family can view health reports" ON public.health_reports FOR SELECT USING (
  public.is_family_member(user_id)
);

DROP POLICY IF EXISTS "Users can insert their own health reports" ON public.health_reports;
CREATE POLICY "Users can insert their own health reports" ON public.health_reports FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own health reports" ON public.health_reports;
CREATE POLICY "Users can update their own health reports" ON public.health_reports FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own health reports" ON public.health_reports;
CREATE POLICY "Users can delete their own health reports" ON public.health_reports FOR DELETE USING (auth.uid() = user_id);

-- VITAL SIGNS
DROP POLICY IF EXISTS "Family can view vital signs" ON public.vital_signs;
CREATE POLICY "Family can view vital signs" ON public.vital_signs FOR SELECT USING (public.is_family_member(user_id));

DROP POLICY IF EXISTS "Users can insert their vital signs" ON public.vital_signs;
CREATE POLICY "Users can insert their vital signs" ON public.vital_signs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- MEALS
DROP POLICY IF EXISTS "Family can view meals" ON public.meals;
CREATE POLICY "Family can view meals" ON public.meals FOR SELECT USING (public.is_family_member(user_id));

DROP POLICY IF EXISTS "Users can manage meals" ON public.meals;
CREATE POLICY "Users can manage meals" ON public.meals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- EXERCISES
DROP POLICY IF EXISTS "Family can view exercises" ON public.exercises;
CREATE POLICY "Family can view exercises" ON public.exercises FOR SELECT USING (public.is_family_member(user_id));

DROP POLICY IF EXISTS "Users can manage exercises" ON public.exercises;
CREATE POLICY "Users can manage exercises" ON public.exercises FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- MEDICATIONS
DROP POLICY IF EXISTS "Family can view medications" ON public.medications;
CREATE POLICY "Family can view medications" ON public.medications FOR SELECT USING (public.is_family_member(user_id));

DROP POLICY IF EXISTS "Users can manage medications" ON public.medications;
CREATE POLICY "Users can manage medications" ON public.medications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- APPOINTMENTS
DROP POLICY IF EXISTS "Family can view appointments" ON public.appointments;
CREATE POLICY "Family can view appointments" ON public.appointments FOR SELECT USING (public.is_family_member(user_id));

DROP POLICY IF EXISTS "Users can manage appointments" ON public.appointments;
CREATE POLICY "Users can manage appointments" ON public.appointments FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- SOS ALERTS
DROP POLICY IF EXISTS "Family can view SOS alerts" ON public.sos_alerts;
CREATE POLICY "Family can view SOS alerts" ON public.sos_alerts FOR SELECT USING (public.is_family_member(user_id));

DROP POLICY IF EXISTS "Users can trigger SOS alerts" ON public.sos_alerts;
CREATE POLICY "Users can trigger SOS alerts" ON public.sos_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Family can resolve SOS alerts" ON public.sos_alerts;
CREATE POLICY "Family can resolve SOS alerts" ON public.sos_alerts FOR UPDATE USING (public.is_family_member(user_id));

-- NOTIFICATIONS
DROP POLICY IF EXISTS "Users view their own notifications" ON public.notifications;
CREATE POLICY "Users view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update their notifications" ON public.notifications;
CREATE POLICY "Users update their notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System/Family can insert notifications" ON public.notifications;
CREATE POLICY "System/Family can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- REALTIME PUBLICATION CONFIGURATION
-- ==============================================================================
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.health_reports;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.sos_alerts;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

