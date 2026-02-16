-- 009: Seed Data

-- Insert default organization
INSERT INTO organizations (id, name, slug, billing_email, country, province_state)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Demo Veterinary Clinic Inc.',
  'demo-vet-clinic',
  'billing@demovetclinic.ca',
  'CA',
  'ON'
) ON CONFLICT (id) DO NOTHING;

-- Insert two clinics
INSERT INTO clinics (id, organization_id, name, address, city, province_state, postal_code, country, phone, email, timezone, tagline)
VALUES
  (
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Toronto Animal Care',
    '123 King St W',
    'Toronto',
    'ON',
    'M5H 1A1',
    'CA',
    '(416) 555-0100',
    'toronto@demovetclinic.ca',
    'America/Toronto',
    'Compassionate care for your pets'
  ),
  (
    'c0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'Ottawa Pet Hospital',
    '456 Rideau St',
    'Ottawa',
    'ON',
    'K1N 5Y5',
    'CA',
    '(613) 555-0200',
    'ottawa@demovetclinic.ca',
    'America/Toronto',
    'Expert veterinary services'
  )
ON CONFLICT (id) DO NOTHING;

-- NOTE: Pets, owners (encrypted), appointments, and medical records
-- will be seeded by the application after the first admin user is created.
-- This is because owner data requires encryption with the OWNER_PII_ENCRYPTION_KEY
-- which is only available at application runtime.
