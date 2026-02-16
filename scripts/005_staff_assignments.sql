-- 005: Staff Assignments

CREATE TABLE IF NOT EXISTS staff_pet_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(staff_id, pet_id)
);

ALTER TABLE staff_pet_assignments ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS staff_owner_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(staff_id, owner_id)
);

ALTER TABLE staff_owner_assignments ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_staff_pet_staff ON staff_pet_assignments(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_pet_pet ON staff_pet_assignments(pet_id);
CREATE INDEX IF NOT EXISTS idx_staff_owner_staff ON staff_owner_assignments(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_owner_owner ON staff_owner_assignments(owner_id);
