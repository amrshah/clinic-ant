-- 07_robust_decryption_fix.sql
-- Fixes "CASE types text and bytea cannot be matched" by ensuring all branches of CASE/COALESCE are TEXT.
-- Handles both _enc (TEXT/BASE64) and _encrypted (BYTEA) column naming conventions.

-- 1. Drop existing functions
DROP FUNCTION IF EXISTS public.get_owners_decrypted(UUID, TEXT);
DROP FUNCTION IF EXISTS public.get_owner_by_id_decrypted(UUID, UUID, TEXT);

-- 2. Redefine get_owners_decrypted
CREATE OR REPLACE FUNCTION public.get_owners_decrypted(p_clinic_id UUID, p_key TEXT)
RETURNS TABLE (
    id UUID,
    display_name TEXT,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    province_state TEXT,
    postal_code TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    clinic_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.display_name,
        -- Robust first_name decryption
        COALESCE(
            CASE 
                WHEN o.first_name_encrypted IS NOT NULL THEN pgp_sym_decrypt(o.first_name_encrypted::bytea, p_key)::text 
                WHEN o.first_name_enc IS NOT NULL AND o.first_name_enc::text <> '' THEN pgp_sym_decrypt(o.first_name_enc::bytea, p_key)::text 
                ELSE NULL::text 
            END, 
            o.first_name::text
        ) as first_name,
        -- Robust last_name decryption
        COALESCE(
            CASE 
                WHEN o.last_name_encrypted IS NOT NULL THEN pgp_sym_decrypt(o.last_name_encrypted::bytea, p_key)::text 
                WHEN o.last_name_enc IS NOT NULL AND o.last_name_enc::text <> '' THEN pgp_sym_decrypt(o.last_name_enc::bytea, p_key)::text 
                ELSE NULL::text 
            END, 
            o.last_name::text
        ) as last_name,
        -- Robust email decryption
        COALESCE(
            CASE 
                WHEN o.email_encrypted IS NOT NULL THEN pgp_sym_decrypt(o.email_encrypted::bytea, p_key)::text 
                WHEN o.email_enc IS NOT NULL AND o.email_enc::text <> '' THEN pgp_sym_decrypt(o.email_enc::bytea, p_key)::text 
                ELSE NULL::text 
            END, 
            o.email::text
        ) as email,
        -- Robust phone decryption
        COALESCE(
            CASE 
                WHEN o.phone_encrypted IS NOT NULL THEN pgp_sym_decrypt(o.phone_encrypted::bytea, p_key)::text 
                WHEN o.phone_enc IS NOT NULL AND o.phone_enc::text <> '' THEN pgp_sym_decrypt(o.phone_enc::bytea, p_key)::text 
                ELSE NULL::text 
            END, 
            o.phone::text
        ) as phone,
        -- Robust address decryption
        COALESCE(
            CASE 
                WHEN o.address_encrypted IS NOT NULL THEN pgp_sym_decrypt(o.address_encrypted::bytea, p_key)::text 
                WHEN o.address_enc IS NOT NULL AND o.address_enc::text <> '' THEN pgp_sym_decrypt(o.address_enc::bytea, p_key)::text 
                ELSE NULL::text 
            END, 
            o.address::text
        ) as address,
        o.city::text,
        o.province_state::text,
        o.postal_code::text,
        o.notes::text,
        o.created_at,
        o.updated_at,
        o.clinic_id
    FROM public.owners o
    WHERE o.clinic_id = p_clinic_id AND o.is_deleted = false
    ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Redefine get_owner_by_id_decrypted
CREATE OR REPLACE FUNCTION public.get_owner_by_id_decrypted(p_owner_id UUID, p_clinic_id UUID, p_key TEXT)
RETURNS TABLE (
    id UUID,
    display_name TEXT,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    province TEXT,
    postal_code TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    clinic_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.display_name,
        COALESCE(
            CASE 
                WHEN o.first_name_encrypted IS NOT NULL THEN pgp_sym_decrypt(o.first_name_encrypted::bytea, p_key)::text 
                WHEN o.first_name_enc IS NOT NULL AND o.first_name_enc::text <> '' THEN pgp_sym_decrypt(o.first_name_enc::bytea, p_key)::text 
                ELSE NULL::text 
            END, 
            o.first_name::text
        ) as first_name,
        COALESCE(
            CASE 
                WHEN o.last_name_encrypted IS NOT NULL THEN pgp_sym_decrypt(o.last_name_encrypted::bytea, p_key)::text 
                WHEN o.last_name_enc IS NOT NULL AND o.last_name_enc::text <> '' THEN pgp_sym_decrypt(o.last_name_enc::bytea, p_key)::text 
                ELSE NULL::text 
            END, 
            o.last_name::text
        ) as last_name,
        COALESCE(
            CASE 
                WHEN o.email_encrypted IS NOT NULL THEN pgp_sym_decrypt(o.email_encrypted::bytea, p_key)::text 
                WHEN o.email_enc IS NOT NULL AND o.email_enc::text <> '' THEN pgp_sym_decrypt(o.email_enc::bytea, p_key)::text 
                ELSE NULL::text 
            END, 
            o.email::text
        ) as email,
        COALESCE(
            CASE 
                WHEN o.phone_encrypted IS NOT NULL THEN pgp_sym_decrypt(o.phone_encrypted::bytea, p_key)::text 
                WHEN o.phone_enc IS NOT NULL AND o.phone_enc::text <> '' THEN pgp_sym_decrypt(o.phone_enc::bytea, p_key)::text 
                ELSE NULL::text 
            END, 
            o.phone::text
        ) as phone,
        COALESCE(
            CASE 
                WHEN o.address_encrypted IS NOT NULL THEN pgp_sym_decrypt(o.address_encrypted::bytea, p_key)::text 
                WHEN o.address_enc IS NOT NULL AND o.address_enc::text <> '' THEN pgp_sym_decrypt(o.address_enc::bytea, p_key)::text 
                ELSE NULL::text 
            END, 
            o.address::text
        ) as address,
        o.city::text,
        COALESCE(
            CASE 
                WHEN o.province_enc IS NOT NULL AND o.province_enc::text <> '' THEN pgp_sym_decrypt(o.province_enc::bytea, p_key)::text 
                ELSE NULL::text 
            END, 
            o.province::text
        ) as province,
        COALESCE(
            CASE 
                WHEN o.postal_code_enc IS NOT NULL AND o.postal_code_enc::text <> '' THEN pgp_sym_decrypt(o.postal_code_enc::bytea, p_key)::text 
                ELSE NULL::text 
            END, 
            o.postal_code::text
        ) as postal_code,
        o.notes::text,
        o.created_at,
        o.updated_at,
        o.clinic_id
    FROM public.owners o
    WHERE o.id = p_owner_id AND o.clinic_id = p_clinic_id AND o.is_deleted = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
