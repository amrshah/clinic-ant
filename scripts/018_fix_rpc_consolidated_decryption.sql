-- 018: Fix RPC functions for consolidated decryption
-- This allows admins to view decrypted PII across all clinics in Consolidated View.

-- 1. Update get_owners_decrypted to support null p_clinic_id
DROP FUNCTION IF EXISTS get_owners_decrypted(uuid, text);
CREATE OR REPLACE FUNCTION get_owners_decrypted(p_clinic_id uuid, p_key text)
RETURNS TABLE(
  id uuid,
  display_name text,
  first_name text,
  last_name text,
  email text,
  phone text,
  address text,
  city text,
  province_state text,
  postal_code text,
  notes text,
  created_at timestamptz,
  updated_at timestamptz,
  clinic_id uuid
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
    SELECT
      o.id,
      o.display_name,
      CASE WHEN o.first_name_encrypted IS NOT NULL THEN pgp_sym_decrypt(o.first_name_encrypted, p_key)::text ELSE NULL END AS first_name,
      CASE WHEN o.last_name_encrypted IS NOT NULL THEN pgp_sym_decrypt(o.last_name_encrypted, p_key)::text ELSE NULL END AS last_name,
      CASE WHEN o.email_encrypted IS NOT NULL THEN pgp_sym_decrypt(o.email_encrypted, p_key)::text ELSE NULL END AS email,
      CASE WHEN o.phone_encrypted IS NOT NULL THEN pgp_sym_decrypt(o.phone_encrypted, p_key)::text ELSE NULL END AS phone,
      CASE WHEN o.address_encrypted IS NOT NULL THEN pgp_sym_decrypt(o.address_encrypted, p_key)::text ELSE NULL END AS address,
      o.city,
      o.province_state,
      o.postal_code,
      o.notes,
      o.created_at,
      o.updated_at,
      o.clinic_id
    FROM owners o
    WHERE (p_clinic_id IS NULL OR o.clinic_id = p_clinic_id) 
      AND o.is_deleted = false
    ORDER BY o.created_at DESC;
END;
$$;

-- 2. Update get_owner_by_id_decrypted to support null p_clinic_id
DROP FUNCTION IF EXISTS get_owner_by_id_decrypted(uuid, uuid, text);
CREATE OR REPLACE FUNCTION get_owner_by_id_decrypted(p_owner_id uuid, p_clinic_id uuid, p_key text)
RETURNS TABLE(
  id uuid,
  display_name text,
  first_name text,
  last_name text,
  email text,
  phone text,
  address text,
  city text,
  province_state text,
  postal_code text,
  notes text,
  created_at timestamptz,
  updated_at timestamptz,
  clinic_id uuid
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
    SELECT
      o.id,
      o.display_name,
      CASE WHEN o.first_name_encrypted IS NOT NULL THEN pgp_sym_decrypt(o.first_name_encrypted, p_key)::text ELSE NULL END AS first_name,
      CASE WHEN o.last_name_encrypted IS NOT NULL THEN pgp_sym_decrypt(o.last_name_encrypted, p_key)::text ELSE NULL END AS last_name,
      CASE WHEN o.email_encrypted IS NOT NULL THEN pgp_sym_decrypt(o.email_encrypted, p_key)::text ELSE NULL END AS email,
      CASE WHEN o.phone_encrypted IS NOT NULL THEN pgp_sym_decrypt(o.phone_encrypted, p_key)::text ELSE NULL END AS phone,
      CASE WHEN o.address_encrypted IS NOT NULL THEN pgp_sym_decrypt(o.address_encrypted, p_key)::text ELSE NULL END AS address,
      o.city,
      o.province_state,
      o.postal_code,
      o.notes,
      o.created_at,
      o.updated_at,
      o.clinic_id
    FROM owners o
    WHERE o.id = p_owner_id 
      AND (p_clinic_id IS NULL OR o.clinic_id = p_clinic_id);
END;
$$;
