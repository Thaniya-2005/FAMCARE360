-- ==============================================================================
-- FAMCARE360: Fix RLS Policy Recursion on families and family_members
-- Version: 20261118000001
-- ==============================================================================

-- 1. Create a SECURITY DEFINER helper to safely check family membership without RLS recursion
CREATE OR REPLACE FUNCTION public.is_in_family(f_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.family_members
    WHERE family_id = f_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Update FAMILIES policy using is_in_family()
DROP POLICY IF EXISTS "Family members can view family" ON public.families;
CREATE POLICY "Family members can view family" ON public.families FOR SELECT USING (
  created_by = auth.uid() OR public.is_in_family(id)
);

-- 3. Update FAMILY_MEMBERS policy using is_in_family()
DROP POLICY IF EXISTS "Family members can view their group" ON public.family_members;
CREATE POLICY "Family members can view their group" ON public.family_members FOR SELECT USING (
  user_id = auth.uid() OR public.is_in_family(family_id)
);
