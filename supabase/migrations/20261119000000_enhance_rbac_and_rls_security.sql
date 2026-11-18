-- ==============================================================================
-- FAMCARE360: Role-Based Access Control (RBAC) & Enhanced RLS Migration
-- Version: 20261119000000
-- Purpose: 
--   1. Enforce strict authorization for Parent and Child accounts.
--   2. Allow Parents to view and manage health data for their linked Children.
--   3. Restrict Children to their own health records and prevent cross-access.
--   4. Prevent privilege escalation (users updating their own role).
--   5. Fix family and child table creation permissions.
-- ==============================================================================

-- 1. Helper function: verify if caller is an authorized parent of a specific child
CREATE OR REPLACE FUNCTION public.is_parent_of(target_child_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF auth.uid() IS NULL OR target_child_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Caller must have role 'parent' in their profile
  IF (SELECT role FROM public.profiles WHERE user_id = auth.uid()) <> 'parent' THEN
    RETURN FALSE;
  END IF;

  -- Direct link in public.children table
  IF EXISTS (
    SELECT 1 FROM public.children
    WHERE parent_id = auth.uid() AND linked_user_id = target_child_id
  ) THEN
    RETURN TRUE;
  END IF;

  -- Shared family membership where caller is parent and target is child
  IF EXISTS (
    SELECT 1 FROM public.family_members fm_p
    JOIN public.family_members fm_c ON fm_p.family_id = fm_c.family_id
    WHERE fm_p.user_id = auth.uid()
      AND fm_p.role = 'parent'
      AND fm_c.user_id = target_child_id
      AND fm_c.role = 'child'
  ) THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- 2. Prevent privilege escalation on public.profiles (disallow mutating role)
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    role = (SELECT p.role FROM public.profiles p WHERE p.user_id = auth.uid())
  );

-- 3. Restrict family creation and updates to authenticated Parents
DROP POLICY IF EXISTS "Parents can create families" ON public.families;
CREATE POLICY "Parents can create families" ON public.families
  FOR INSERT
  WITH CHECK (
    created_by = auth.uid() AND
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'parent'
  );

DROP POLICY IF EXISTS "Parents can update families" ON public.families;
CREATE POLICY "Parents can update families" ON public.families
  FOR UPDATE
  USING (
    created_by = auth.uid() AND
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'parent'
  );

-- 4. Restrict children records management to Parents
DROP POLICY IF EXISTS "Parents can insert children" ON public.children;
CREATE POLICY "Parents can insert children" ON public.children
  FOR INSERT
  WITH CHECK (
    auth.uid() = parent_id AND
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'parent'
  );

DROP POLICY IF EXISTS "Parents can update children" ON public.children;
CREATE POLICY "Parents can update children" ON public.children
  FOR UPDATE
  USING (
    auth.uid() = parent_id AND
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'parent'
  );

DROP POLICY IF EXISTS "Parents can delete children" ON public.children;
CREATE POLICY "Parents can delete children" ON public.children
  FOR DELETE
  USING (
    auth.uid() = parent_id AND
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'parent'
  );

-- 5. Health Reports: Parents can view & manage for self and linked children;
--                  Children can only view & manage their own reports.
DROP POLICY IF EXISTS "Users and family can view health reports" ON public.health_reports;
DROP POLICY IF EXISTS "Users and parents can view health reports" ON public.health_reports;
CREATE POLICY "Users and parents can view health reports" ON public.health_reports
  FOR SELECT
  USING (auth.uid() = user_id OR public.is_parent_of(user_id));

DROP POLICY IF EXISTS "Users can insert their own health reports" ON public.health_reports;
DROP POLICY IF EXISTS "Users and parents can insert health reports" ON public.health_reports;
CREATE POLICY "Users and parents can insert health reports" ON public.health_reports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_parent_of(user_id));

DROP POLICY IF EXISTS "Users can update their own health reports" ON public.health_reports;
DROP POLICY IF EXISTS "Users and parents can update health reports" ON public.health_reports;
CREATE POLICY "Users and parents can update health reports" ON public.health_reports
  FOR UPDATE
  USING (auth.uid() = user_id OR public.is_parent_of(user_id))
  WITH CHECK (auth.uid() = user_id OR public.is_parent_of(user_id));

DROP POLICY IF EXISTS "Users can delete their own health reports" ON public.health_reports;
DROP POLICY IF EXISTS "Users and parents can delete health reports" ON public.health_reports;
CREATE POLICY "Users and parents can delete health reports" ON public.health_reports
  FOR DELETE
  USING (auth.uid() = user_id OR public.is_parent_of(user_id));

-- 6. Medications: Parents can manage for linked children; Children only own records
DROP POLICY IF EXISTS "Family can view medications" ON public.medications;
DROP POLICY IF EXISTS "Users and parents can view medications" ON public.medications;
CREATE POLICY "Users and parents can view medications" ON public.medications
  FOR SELECT
  USING (auth.uid() = user_id OR public.is_parent_of(user_id));

DROP POLICY IF EXISTS "Users can manage medications" ON public.medications;
DROP POLICY IF EXISTS "Users and parents can manage medications" ON public.medications;
CREATE POLICY "Users and parents can manage medications" ON public.medications
  FOR ALL
  USING (auth.uid() = user_id OR public.is_parent_of(user_id))
  WITH CHECK (auth.uid() = user_id OR public.is_parent_of(user_id));

-- 7. Appointments: Parents can manage for linked children; Children only own records
DROP POLICY IF EXISTS "Family can view appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users and parents can view appointments" ON public.appointments;
CREATE POLICY "Users and parents can view appointments" ON public.appointments
  FOR SELECT
  USING (auth.uid() = user_id OR public.is_parent_of(user_id));

DROP POLICY IF EXISTS "Users can manage appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users and parents can manage appointments" ON public.appointments;
CREATE POLICY "Users and parents can manage appointments" ON public.appointments
  FOR ALL
  USING (auth.uid() = user_id OR public.is_parent_of(user_id))
  WITH CHECK (auth.uid() = user_id OR public.is_parent_of(user_id));

-- 8. Vital Signs: Parents can view & record for linked children; Children only own records
DROP POLICY IF EXISTS "Family can view vital signs" ON public.vital_signs;
DROP POLICY IF EXISTS "Users and parents can view vital signs" ON public.vital_signs;
CREATE POLICY "Users and parents can view vital signs" ON public.vital_signs
  FOR SELECT
  USING (auth.uid() = user_id OR public.is_parent_of(user_id));

DROP POLICY IF EXISTS "Users can insert their vital signs" ON public.vital_signs;
DROP POLICY IF EXISTS "Users and parents can insert vital signs" ON public.vital_signs;
CREATE POLICY "Users and parents can insert vital signs" ON public.vital_signs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_parent_of(user_id));
