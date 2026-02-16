-- 007: PIPEDA Consent and Data Requests

CREATE TABLE IF NOT EXISTS consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  consent_type consent_type NOT NULL,
  status consent_status NOT NULL DEFAULT 'pending',
  consent_text TEXT,
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  granted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ip_address TEXT,
  method TEXT DEFAULT 'in_person',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS data_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  request_type data_request_type NOT NULL,
  status data_request_status DEFAULT 'pending',
  requested_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  handled_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT,
  response_details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE data_access_requests ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_consent_owner ON consent_records(owner_id);
CREATE INDEX IF NOT EXISTS idx_consent_org ON consent_records(organization_id);
CREATE INDEX IF NOT EXISTS idx_data_requests_org ON data_access_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_data_requests_status ON data_access_requests(status);
