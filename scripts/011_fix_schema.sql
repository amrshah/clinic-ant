-- 011: Fix schema issues

-- 1. Fix RLS circular dependency: Allow users to read their OWN profile always
DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (
  id = auth.uid() OR organization_id = get_user_org_id()
);

-- 2. Add display_name column to owners (non-encrypted, for joins/search)
ALTER TABLE owners ADD COLUMN IF NOT EXISTS display_name TEXT;

-- 3. Create index on display_name
CREATE INDEX IF NOT EXISTS idx_owners_display_name ON owners(display_name);
