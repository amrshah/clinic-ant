-- 004: Core tables - Owners, Pets, Appointments, Medical Records

-- Owners table with encrypted PII columns
CREATE TABLE IF NOT EXISTS owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
  first_name_encrypted BYTEA,
  last_name_encrypted BYTEA,
  first_name_hash TEXT,
  last_name_hash TEXT,
  email_encrypted BYTEA,
  email_hash TEXT,
  phone_encrypted BYTEA,
  address_encrypted BYTEA,
  city TEXT,
  province_state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'CA',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  deletion_reason TEXT
);

ALTER TABLE owners ENABLE ROW LEVEL SECURITY;

-- Pets table
CREATE TABLE IF NOT EXISTS pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  species TEXT,
  breed TEXT,
  date_of_birth DATE,
  weight NUMERIC,
  owner_id UUID REFERENCES owners(id) ON DELETE SET NULL,
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ
);

ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
  pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
  owner_id UUID REFERENCES owners(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  time TEXT,
  type TEXT,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  veterinarian_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Medical records table
CREATE TABLE IF NOT EXISTS medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
  pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  type TEXT,
  title TEXT NOT NULL,
  description TEXT,
  veterinarian_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  attachments TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_owners_org_clinic ON owners(organization_id, clinic_id) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_pets_org_clinic ON pets(organization_id, clinic_id) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_appointments_org_clinic ON appointments(organization_id, clinic_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_org_clinic ON medical_records(organization_id, clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_owners_email_hash ON owners(email_hash);
