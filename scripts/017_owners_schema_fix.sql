-- 017: Owners Schema Fix and Cleanup
-- This script consolidates the owners table and fixes type mismatch issues in RPC functions.

-- 1. Consolidate columns if they exist under old names
-- Move data from old names to new standard names if they exist
DO $$
BEGIN
    -- first_name_enc -> first_name_encrypted
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owners' AND column_name = 'first_name_enc') THEN
        UPDATE owners SET first_name_encrypted = first_name_enc WHERE first_name_encrypted IS NULL;
    END IF;

    -- last_name_enc -> last_name_encrypted
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owners' AND column_name = 'last_name_enc') THEN
        UPDATE owners SET last_name_encrypted = last_name_enc WHERE last_name_encrypted IS NULL;
    END IF;

    -- email_enc -> email_encrypted
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owners' AND column_name = 'email_enc') THEN
        UPDATE owners SET email_encrypted = email_enc WHERE email_encrypted IS NULL;
    END IF;

    -- phone_enc -> phone_encrypted
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owners' AND column_name = 'phone_enc') THEN
        UPDATE owners SET phone_encrypted = phone_enc WHERE phone_encrypted IS NULL;
    END IF;

    -- address_enc -> address_encrypted
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owners' AND column_name = 'address_enc') THEN
        UPDATE owners SET address_encrypted = address_enc WHERE address_encrypted IS NULL;
    END IF;
    
    -- city_enc -> first_name_encrypted (Wait, city_enc was in 010 but not in 012? 012 moved city to plaintext)
    -- If city_enc has data, we can't easily move it to plaintext without the key, 
    -- but we can at least keep it for now or move it to a temporary column.
END $$;

-- 2. Drop polluted columns (CAUTION: Only if we are sure data is migrated or can be lost in demo)
-- For now, let's just ensure the RPC functions use the CORRECT columns and types.

-- 3. Fix RPC functions with explicit type casting to avoid "CASE types text and bytea cannot be matched"
CREATE OR REPLACE FUNCTION update_owner_encrypted(
  p_owner_id uuid,
  p_clinic_id uuid,
  p_first_name text,
  p_last_name text,
  p_email text,
  p_phone text,
  p_address text,
  p_city text,
  p_province text,
  p_postal_code text,
  p_display_name text,
  p_notes text,
  p_key text
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  UPDATE owners SET
    display_name = COALESCE(p_display_name, display_name),
    notes = COALESCE(p_notes, notes),
    -- Explicitly cast both branches to BYTEA or TEXT to avoid type mismatch
    first_name_encrypted = CASE 
      WHEN p_first_name IS NOT NULL THEN pgp_sym_encrypt(p_first_name, p_key)::bytea 
      ELSE first_name_encrypted::bytea 
    END,
    first_name_hash = CASE 
      WHEN p_first_name IS NOT NULL THEN encode(digest(lower(p_first_name), 'sha256'), 'hex')::text 
      ELSE first_name_hash::text 
    END,
    last_name_encrypted = CASE 
      WHEN p_last_name IS NOT NULL THEN pgp_sym_encrypt(p_last_name, p_key)::bytea 
      ELSE last_name_encrypted::bytea 
    END,
    last_name_hash = CASE 
      WHEN p_last_name IS NOT NULL THEN encode(digest(lower(p_last_name), 'sha256'), 'hex')::text 
      ELSE last_name_hash::text 
    END,
    email_encrypted = CASE 
      WHEN p_email IS NOT NULL THEN pgp_sym_encrypt(p_email, p_key)::bytea 
      ELSE email_encrypted::bytea 
    END,
    email_hash = CASE 
      WHEN p_email IS NOT NULL THEN encode(digest(lower(p_email), 'sha256'), 'hex')::text 
      ELSE email_hash::text 
    END,
    phone_encrypted = CASE 
      WHEN p_phone IS NOT NULL THEN pgp_sym_encrypt(p_phone, p_key)::bytea 
      ELSE phone_encrypted::bytea 
    END,
    address_encrypted = CASE 
      WHEN p_address IS NOT NULL THEN pgp_sym_encrypt(p_address, p_key)::bytea 
      ELSE address_encrypted::bytea 
    END,
    city = COALESCE(p_city, city),
    province_state = COALESCE(p_province, province_state),
    postal_code = COALESCE(p_postal_code, postal_code),
    updated_at = NOW()
  WHERE id = p_owner_id AND clinic_id = p_clinic_id;
END;
$$;
