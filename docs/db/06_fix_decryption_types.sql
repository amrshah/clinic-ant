-- 06_fix_decryption_types.sql
-- Fixes "CASE types text and bytea cannot be matched" error by adding explicit casting to ::text

-- Drop existing functions to allow changing return table structure
DROP FUNCTION IF EXISTS public.get_owners_decrypted(UUID, TEXT);
DROP FUNCTION IF EXISTS public.get_owner_by_id_decrypted(UUID, UUID, TEXT);

-- 1. Redefine get_owners_decrypted
CREATE OR REPLACE FUNCTION public.get_owners_decrypted(p_clinic_id UUID, p_key TEXT)
RETURNS TABLE (
    id UUID,
    display_name TEXT,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    city TEXT,
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
                WHEN o.first_name_enc IS NOT NULL AND o.first_name_enc <> '' 
                THEN pgp_sym_decrypt(decode(o.first_name_enc, 'base64'), p_key)::text 
                ELSE NULL 
            END, 
            o.first_name
        ) as first_name,
        COALESCE(
            CASE 
                WHEN o.last_name_enc IS NOT NULL AND o.last_name_enc <> '' 
                THEN pgp_sym_decrypt(decode(o.last_name_enc, 'base64'), p_key)::text 
                ELSE NULL 
            END, 
            o.last_name
        ) as last_name,
        COALESCE(
            CASE 
                WHEN o.email_enc IS NOT NULL AND o.email_enc <> '' 
                THEN pgp_sym_decrypt(decode(o.email_enc, 'base64'), p_key)::text 
                ELSE NULL 
            END, 
            o.email
        ) as email,
        COALESCE(
            CASE 
                WHEN o.phone_enc IS NOT NULL AND o.phone_enc <> '' 
                THEN pgp_sym_decrypt(decode(o.phone_enc, 'base64'), p_key)::text 
                ELSE NULL 
            END, 
            o.phone
        ) as phone,
        o.city,
        o.notes,
        o.created_at,
        o.updated_at,
        o.clinic_id
    FROM public.owners o
    WHERE o.clinic_id = p_clinic_id AND o.is_deleted = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Redefine get_owner_by_id_decrypted
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
                WHEN o.first_name_enc IS NOT NULL AND o.first_name_enc <> '' 
                THEN pgp_sym_decrypt(decode(o.first_name_enc, 'base64'), p_key)::text 
                ELSE NULL 
            END, 
            o.first_name
        ) as first_name,
        COALESCE(
            CASE 
                WHEN o.last_name_enc IS NOT NULL AND o.last_name_enc <> '' 
                THEN pgp_sym_decrypt(decode(o.last_name_enc, 'base64'), p_key)::text 
                ELSE NULL 
            END, 
            o.last_name
        ) as last_name,
        COALESCE(
            CASE 
                WHEN o.email_enc IS NOT NULL AND o.email_enc <> '' 
                THEN pgp_sym_decrypt(decode(o.email_enc, 'base64'), p_key)::text 
                ELSE NULL 
            END, 
            o.email
        ) as email,
        COALESCE(
            CASE 
                WHEN o.phone_enc IS NOT NULL AND o.phone_enc <> '' 
                THEN pgp_sym_decrypt(decode(o.phone_enc, 'base64'), p_key)::text 
                ELSE NULL 
            END, 
            o.phone
        ) as phone,
        COALESCE(
            CASE 
                WHEN o.address_enc IS NOT NULL AND o.address_enc <> '' 
                THEN pgp_sym_decrypt(decode(o.address_enc, 'base64'), p_key)::text 
                ELSE NULL 
            END, 
            o.address
        ) as address,
        o.city,
        COALESCE(
            CASE 
                WHEN o.province_enc IS NOT NULL AND o.province_enc <> '' 
                THEN pgp_sym_decrypt(decode(o.province_enc, 'base64'), p_key)::text 
                ELSE NULL 
            END, 
            o.province
        ) as province,
        COALESCE(
            CASE 
                WHEN o.postal_code_enc IS NOT NULL AND o.postal_code_enc <> '' 
                THEN pgp_sym_decrypt(decode(o.postal_code_enc, 'base64'), p_key)::text 
                ELSE NULL 
            END, 
            o.postal_code
        ) as postal_code,
        o.notes,
        o.created_at,
        o.updated_at,
        o.clinic_id
    FROM public.owners o
    WHERE o.id = p_owner_id AND o.clinic_id = p_clinic_id AND o.is_deleted = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
