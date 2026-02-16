-- 008: RLS Policies

-- ===== ORGANIZATIONS =====
DROP POLICY IF EXISTS "org_select" ON organizations;
CREATE POLICY "org_select" ON organizations FOR SELECT USING (
  id = get_user_org_id()
);
DROP POLICY IF EXISTS "org_update" ON organizations;
CREATE POLICY "org_update" ON organizations FOR UPDATE USING (
  id = get_user_org_id() AND get_user_role() = 'administrator'
);

-- ===== CLINICS =====
DROP POLICY IF EXISTS "clinics_select" ON clinics;
CREATE POLICY "clinics_select" ON clinics FOR SELECT USING (
  organization_id = get_user_org_id()
);
DROP POLICY IF EXISTS "clinics_insert" ON clinics;
CREATE POLICY "clinics_insert" ON clinics FOR INSERT WITH CHECK (
  organization_id = get_user_org_id() AND get_user_role() = 'administrator'
);
DROP POLICY IF EXISTS "clinics_update" ON clinics;
CREATE POLICY "clinics_update" ON clinics FOR UPDATE USING (
  organization_id = get_user_org_id() AND get_user_role() = 'administrator'
);
DROP POLICY IF EXISTS "clinics_delete" ON clinics;
CREATE POLICY "clinics_delete" ON clinics FOR DELETE USING (
  organization_id = get_user_org_id() AND get_user_role() = 'administrator'
);

-- ===== PROFILES =====
DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (
  organization_id = get_user_org_id()
);
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (
  organization_id = get_user_org_id() AND get_user_role() = 'administrator'
);
DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (
  organization_id = get_user_org_id() AND (
    id = auth.uid() OR get_user_role() = 'administrator'
  )
);
DROP POLICY IF EXISTS "profiles_delete" ON profiles;
CREATE POLICY "profiles_delete" ON profiles FOR DELETE USING (
  organization_id = get_user_org_id() AND get_user_role() = 'administrator'
);

-- ===== OWNERS =====
DROP POLICY IF EXISTS "owners_select" ON owners;
CREATE POLICY "owners_select" ON owners FOR SELECT USING (
  organization_id = get_user_org_id()
);
DROP POLICY IF EXISTS "owners_insert" ON owners;
CREATE POLICY "owners_insert" ON owners FOR INSERT WITH CHECK (
  organization_id = get_user_org_id() AND get_user_role() IN ('administrator', 'reception')
);
DROP POLICY IF EXISTS "owners_update" ON owners;
CREATE POLICY "owners_update" ON owners FOR UPDATE USING (
  organization_id = get_user_org_id() AND get_user_role() IN ('administrator', 'reception')
);
DROP POLICY IF EXISTS "owners_delete" ON owners;
CREATE POLICY "owners_delete" ON owners FOR DELETE USING (
  organization_id = get_user_org_id() AND get_user_role() = 'administrator'
);

-- ===== PETS =====
DROP POLICY IF EXISTS "pets_select" ON pets;
CREATE POLICY "pets_select" ON pets FOR SELECT USING (
  organization_id = get_user_org_id()
);
DROP POLICY IF EXISTS "pets_insert" ON pets;
CREATE POLICY "pets_insert" ON pets FOR INSERT WITH CHECK (
  organization_id = get_user_org_id() AND get_user_role() IN ('administrator', 'veterinarian', 'nurse_assistant', 'reception')
);
DROP POLICY IF EXISTS "pets_update" ON pets;
CREATE POLICY "pets_update" ON pets FOR UPDATE USING (
  organization_id = get_user_org_id() AND get_user_role() IN ('administrator', 'veterinarian', 'nurse_assistant', 'technician')
);
DROP POLICY IF EXISTS "pets_delete" ON pets;
CREATE POLICY "pets_delete" ON pets FOR DELETE USING (
  organization_id = get_user_org_id() AND get_user_role() = 'administrator'
);

-- ===== APPOINTMENTS =====
DROP POLICY IF EXISTS "appointments_select" ON appointments;
CREATE POLICY "appointments_select" ON appointments FOR SELECT USING (
  organization_id = get_user_org_id()
);
DROP POLICY IF EXISTS "appointments_insert" ON appointments;
CREATE POLICY "appointments_insert" ON appointments FOR INSERT WITH CHECK (
  organization_id = get_user_org_id() AND get_user_role() IN ('administrator', 'veterinarian', 'nurse_assistant', 'reception')
);
DROP POLICY IF EXISTS "appointments_update" ON appointments;
CREATE POLICY "appointments_update" ON appointments FOR UPDATE USING (
  organization_id = get_user_org_id() AND get_user_role() IN ('administrator', 'veterinarian', 'nurse_assistant', 'reception')
);
DROP POLICY IF EXISTS "appointments_delete" ON appointments;
CREATE POLICY "appointments_delete" ON appointments FOR DELETE USING (
  organization_id = get_user_org_id() AND get_user_role() IN ('administrator', 'veterinarian')
);

-- ===== MEDICAL RECORDS =====
DROP POLICY IF EXISTS "medical_records_select" ON medical_records;
CREATE POLICY "medical_records_select" ON medical_records FOR SELECT USING (
  organization_id = get_user_org_id() AND get_user_role() IN ('administrator', 'veterinarian', 'nurse_assistant', 'technician')
);
DROP POLICY IF EXISTS "medical_records_insert" ON medical_records;
CREATE POLICY "medical_records_insert" ON medical_records FOR INSERT WITH CHECK (
  organization_id = get_user_org_id() AND get_user_role() IN ('administrator', 'veterinarian', 'nurse_assistant', 'technician')
);
DROP POLICY IF EXISTS "medical_records_update" ON medical_records;
CREATE POLICY "medical_records_update" ON medical_records FOR UPDATE USING (
  organization_id = get_user_org_id() AND get_user_role() IN ('administrator', 'veterinarian', 'nurse_assistant')
);
DROP POLICY IF EXISTS "medical_records_delete" ON medical_records;
CREATE POLICY "medical_records_delete" ON medical_records FOR DELETE USING (
  organization_id = get_user_org_id() AND get_user_role() IN ('administrator', 'veterinarian')
);

-- ===== STAFF ASSIGNMENTS =====
DROP POLICY IF EXISTS "staff_pet_select" ON staff_pet_assignments;
CREATE POLICY "staff_pet_select" ON staff_pet_assignments FOR SELECT USING (
  organization_id = get_user_org_id()
);
DROP POLICY IF EXISTS "staff_pet_insert" ON staff_pet_assignments;
CREATE POLICY "staff_pet_insert" ON staff_pet_assignments FOR INSERT WITH CHECK (
  organization_id = get_user_org_id() AND get_user_role() = 'administrator'
);
DROP POLICY IF EXISTS "staff_pet_delete" ON staff_pet_assignments;
CREATE POLICY "staff_pet_delete" ON staff_pet_assignments FOR DELETE USING (
  organization_id = get_user_org_id() AND get_user_role() = 'administrator'
);

DROP POLICY IF EXISTS "staff_owner_select" ON staff_owner_assignments;
CREATE POLICY "staff_owner_select" ON staff_owner_assignments FOR SELECT USING (
  organization_id = get_user_org_id()
);
DROP POLICY IF EXISTS "staff_owner_insert" ON staff_owner_assignments;
CREATE POLICY "staff_owner_insert" ON staff_owner_assignments FOR INSERT WITH CHECK (
  organization_id = get_user_org_id() AND get_user_role() = 'administrator'
);
DROP POLICY IF EXISTS "staff_owner_delete" ON staff_owner_assignments;
CREATE POLICY "staff_owner_delete" ON staff_owner_assignments FOR DELETE USING (
  organization_id = get_user_org_id() AND get_user_role() = 'administrator'
);

-- ===== AUDIT LOGS =====
DROP POLICY IF EXISTS "audit_logs_select" ON audit_logs;
CREATE POLICY "audit_logs_select" ON audit_logs FOR SELECT USING (
  organization_id = get_user_org_id() AND get_user_role() = 'administrator'
);
-- Inserts done via service role (bypasses RLS)

-- ===== CONSENT RECORDS =====
DROP POLICY IF EXISTS "consent_select" ON consent_records;
CREATE POLICY "consent_select" ON consent_records FOR SELECT USING (
  organization_id = get_user_org_id() AND get_user_role() IN ('administrator', 'reception')
);
DROP POLICY IF EXISTS "consent_insert" ON consent_records;
CREATE POLICY "consent_insert" ON consent_records FOR INSERT WITH CHECK (
  organization_id = get_user_org_id() AND get_user_role() IN ('administrator', 'reception')
);
DROP POLICY IF EXISTS "consent_update" ON consent_records;
CREATE POLICY "consent_update" ON consent_records FOR UPDATE USING (
  organization_id = get_user_org_id() AND get_user_role() = 'administrator'
);

-- ===== DATA ACCESS REQUESTS =====
DROP POLICY IF EXISTS "data_requests_select" ON data_access_requests;
CREATE POLICY "data_requests_select" ON data_access_requests FOR SELECT USING (
  organization_id = get_user_org_id() AND get_user_role() = 'administrator'
);
DROP POLICY IF EXISTS "data_requests_insert" ON data_access_requests;
CREATE POLICY "data_requests_insert" ON data_access_requests FOR INSERT WITH CHECK (
  organization_id = get_user_org_id() AND get_user_role() = 'administrator'
);
DROP POLICY IF EXISTS "data_requests_update" ON data_access_requests;
CREATE POLICY "data_requests_update" ON data_access_requests FOR UPDATE USING (
  organization_id = get_user_org_id() AND get_user_role() = 'administrator'
);
