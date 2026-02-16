-- 012: Fix RPC functions to use correct column names from schema

-- Drop old functions first (return types changed)
DROP FUNCTION IF EXISTS get_owners_decrypted(uuid, text);
DROP FUNCTION IF EXISTS get_owner_by_id_decrypted(uuid, uuid, text);
DROP FUNCTION IF EXISTS insert_owner_encrypted(uuid, text, text, text, text, text, text, text, text, text, text);
DROP FUNCTION IF EXISTS update_owner_encrypted(uuid, uuid, text, text, text, text, text, text, text, text, text, text);

-- Get all owners decrypted
create or replace function get_owners_decrypted(p_clinic_id uuid, p_key text)
returns table(
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
language plpgsql security definer
as $$
begin
  return query
    select
      o.id,
      o.display_name,
      case when o.first_name_encrypted is not null then pgp_sym_decrypt(o.first_name_encrypted, p_key)::text else null end as first_name,
      case when o.last_name_encrypted is not null then pgp_sym_decrypt(o.last_name_encrypted, p_key)::text else null end as last_name,
      case when o.email_encrypted is not null then pgp_sym_decrypt(o.email_encrypted, p_key)::text else null end as email,
      case when o.phone_encrypted is not null then pgp_sym_decrypt(o.phone_encrypted, p_key)::text else null end as phone,
      case when o.address_encrypted is not null then pgp_sym_decrypt(o.address_encrypted, p_key)::text else null end as address,
      o.city,
      o.province_state,
      o.postal_code,
      o.notes,
      o.created_at,
      o.updated_at,
      o.clinic_id
    from owners o
    where o.clinic_id = p_clinic_id and o.is_deleted = false
    order by o.created_at desc;
end;
$$;

-- Get single owner decrypted
create or replace function get_owner_by_id_decrypted(p_owner_id uuid, p_clinic_id uuid, p_key text)
returns table(
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
language plpgsql security definer
as $$
begin
  return query
    select
      o.id,
      o.display_name,
      case when o.first_name_encrypted is not null then pgp_sym_decrypt(o.first_name_encrypted, p_key)::text else null end as first_name,
      case when o.last_name_encrypted is not null then pgp_sym_decrypt(o.last_name_encrypted, p_key)::text else null end as last_name,
      case when o.email_encrypted is not null then pgp_sym_decrypt(o.email_encrypted, p_key)::text else null end as email,
      case when o.phone_encrypted is not null then pgp_sym_decrypt(o.phone_encrypted, p_key)::text else null end as phone,
      case when o.address_encrypted is not null then pgp_sym_decrypt(o.address_encrypted, p_key)::text else null end as address,
      o.city,
      o.province_state,
      o.postal_code,
      o.notes,
      o.created_at,
      o.updated_at,
      o.clinic_id
    from owners o
    where o.id = p_owner_id and o.clinic_id = p_clinic_id;
end;
$$;

-- Insert owner with encryption
create or replace function insert_owner_encrypted(
  p_org_id uuid,
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
  p_created_by uuid,
  p_key text
)
returns uuid
language plpgsql security definer
as $$
declare
  new_id uuid;
begin
  insert into owners (
    organization_id, clinic_id, display_name, notes, created_by,
    first_name_encrypted, last_name_encrypted, first_name_hash, last_name_hash,
    email_encrypted, email_hash, phone_encrypted, address_encrypted,
    city, province_state, postal_code
  ) values (
    p_org_id, p_clinic_id, p_display_name, p_notes, p_created_by,
    pgp_sym_encrypt(p_first_name, p_key),
    pgp_sym_encrypt(p_last_name, p_key),
    encode(digest(lower(p_first_name), 'sha256'), 'hex'),
    encode(digest(lower(p_last_name), 'sha256'), 'hex'),
    case when p_email is not null then pgp_sym_encrypt(p_email, p_key) else null end,
    case when p_email is not null then encode(digest(lower(p_email), 'sha256'), 'hex') else null end,
    case when p_phone is not null then pgp_sym_encrypt(p_phone, p_key) else null end,
    case when p_address is not null then pgp_sym_encrypt(p_address, p_key) else null end,
    p_city, p_province, p_postal_code
  ) returning id into new_id;

  return new_id;
end;
$$;

-- Update owner with encryption
create or replace function update_owner_encrypted(
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
returns void
language plpgsql security definer
as $$
begin
  update owners set
    display_name = coalesce(p_display_name, display_name),
    notes = coalesce(p_notes, notes),
    first_name_encrypted = case when p_first_name is not null then pgp_sym_encrypt(p_first_name, p_key) else first_name_encrypted end,
    first_name_hash = case when p_first_name is not null then encode(digest(lower(p_first_name), 'sha256'), 'hex') else first_name_hash end,
    last_name_encrypted = case when p_last_name is not null then pgp_sym_encrypt(p_last_name, p_key) else last_name_encrypted end,
    last_name_hash = case when p_last_name is not null then encode(digest(lower(p_last_name), 'sha256'), 'hex') else last_name_hash end,
    email_encrypted = case when p_email is not null then pgp_sym_encrypt(p_email, p_key) else email_encrypted end,
    email_hash = case when p_email is not null then encode(digest(lower(p_email), 'sha256'), 'hex') else email_hash end,
    phone_encrypted = case when p_phone is not null then pgp_sym_encrypt(p_phone, p_key) else phone_encrypted end,
    address_encrypted = case when p_address is not null then pgp_sym_encrypt(p_address, p_key) else address_encrypted end,
    city = coalesce(p_city, city),
    province_state = coalesce(p_province, province_state),
    postal_code = coalesce(p_postal_code, postal_code),
    updated_at = now()
  where id = p_owner_id and clinic_id = p_clinic_id;
end;
$$;
