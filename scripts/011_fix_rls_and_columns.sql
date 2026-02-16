-- 011: Fix RLS circular dependency and column naming issues

-- Fix 1: Profiles SELECT - allow users to read their OWN profile (breaks circular dep)
-- AND allow reading profiles within the same org
DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (
  id = auth.uid() OR organization_id = get_user_org_id()
);

-- Fix 2: Profiles INSERT - the trigger runs as SECURITY DEFINER so it bypasses RLS,
-- but we also need a policy for admin-created users
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (
  id = auth.uid() OR (organization_id = get_user_org_id() AND get_user_role() = 'administrator')
);

-- Fix 3: Audit logs INSERT - allow any authenticated user to insert their own audit logs
DROP POLICY IF EXISTS "audit_logs_insert" ON audit_logs;
CREATE POLICY "audit_logs_insert" ON audit_logs FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

-- Fix 4: Add clinic_id as an alias column via a view or just rename
-- Actually, let's just add the column alias. The profile table uses default_clinic_id.
-- We will handle this in the app code instead of renaming the column.
