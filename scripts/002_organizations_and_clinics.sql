-- 002: Organizations and Clinics

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_user_id UUID,
  billing_email TEXT,
  country TEXT DEFAULT 'CA',
  province_state TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  province_state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'CA',
  phone TEXT,
  fax TEXT,
  emergency_phone TEXT,
  email TEXT,
  website TEXT,
  timezone TEXT DEFAULT 'America/Toronto',
  opening_hours JSONB DEFAULT '{}',
  tagline TEXT,
  description TEXT,
  tax_id TEXT,
  license_number TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
