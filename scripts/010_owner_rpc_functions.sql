-- RPC functions for encrypted owner CRUD

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
  province text,
  postal_code text,
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
      pgp_sym_decrypt(o.first_name_enc, p_key)::text as first_name,
      pgp_sym_decrypt(o.last_name_enc, p_key)::text as last_name,
      case when o.email_enc is not null then pgp_sym_decrypt(o.email_enc, p_key)::text else null end as email,
      case when o.phone_enc is not null then pgp_sym_decrypt(o.phone_enc, p_key)::text else null end as phone,
      case when o.address_enc is not null then pgp_sym_decrypt(o.address_enc, p_key)::text else null end as address,
      case when o.city_enc is not null then pgp_sym_decrypt(o.city_enc, p_key)::text else null end as city,
      case when o.province_enc is not null then pgp_sym_decrypt(o.province_enc, p_key)::text else null end as province,
      case when o.postal_code_enc is not null then pgp_sym_decrypt(o.postal_code_enc, p_key)::text else null end as postal_code,
      o.created_at,
      o.updated_at,
      o.clinic_id
    from owners o
    where o.clinic_id = p_clinic_id
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
  province text,
  postal_code text,
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
      pgp_sym_decrypt(o.first_name_enc, p_key)::text as first_name,
      pgp_sym_decrypt(o.last_name_enc, p_key)::text as last_name,
      case when o.email_enc is not null then pgp_sym_decrypt(o.email_enc, p_key)::text else null end as email,
      case when o.phone_enc is not null then pgp_sym_decrypt(o.phone_enc, p_key)::text else null end as phone,
      case when o.address_enc is not null then pgp_sym_decrypt(o.address_enc, p_key)::text else null end as address,
      case when o.city_enc is not null then pgp_sym_decrypt(o.city_enc, p_key)::text else null end as city,
      case when o.province_enc is not null then pgp_sym_decrypt(o.province_enc, p_key)::text else null end as province,
      case when o.postal_code_enc is not null then pgp_sym_decrypt(o.postal_code_enc, p_key)::text else null end as postal_code,
      o.created_at,
      o.updated_at,
      o.clinic_id
    from owners o
    where o.id = p_owner_id and o.clinic_id = p_clinic_id;
end;
$$;

-- Insert owner with encryption
create or replace function insert_owner_encrypted(
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
  p_key text
)
returns uuid
language plpgsql security definer
as $$
declare
  new_id uuid;
begin
  insert into owners (
    clinic_id, display_name,
    first_name_enc, last_name_enc, email_enc, phone_enc,
    address_enc, city_enc, province_enc, postal_code_enc
  ) values (
    p_clinic_id, p_display_name,
    pgp_sym_encrypt(p_first_name, p_key),
    pgp_sym_encrypt(p_last_name, p_key),
    case when p_email is not null then pgp_sym_encrypt(p_email, p_key) else null end,
    case when p_phone is not null then pgp_sym_encrypt(p_phone, p_key) else null end,
    case when p_address is not null then pgp_sym_encrypt(p_address, p_key) else null end,
    case when p_city is not null then pgp_sym_encrypt(p_city, p_key) else null end,
    case when p_province is not null then pgp_sym_encrypt(p_province, p_key) else null end,
    case when p_postal_code is not null then pgp_sym_encrypt(p_postal_code, p_key) else null end
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
  p_key text
)
returns void
language plpgsql security definer
as $$
begin
  update owners set
    display_name = coalesce(p_display_name, display_name),
    first_name_enc = case when p_first_name is not null then pgp_sym_encrypt(p_first_name, p_key) else first_name_enc end,
    last_name_enc = case when p_last_name is not null then pgp_sym_encrypt(p_last_name, p_key) else last_name_enc end,
    email_enc = case when p_email is not null then pgp_sym_encrypt(p_email, p_key) else email_enc end,
    phone_enc = case when p_phone is not null then pgp_sym_encrypt(p_phone, p_key) else phone_enc end,
    address_enc = case when p_address is not null then pgp_sym_encrypt(p_address, p_key) else address_enc end,
    city_enc = case when p_city is not null then pgp_sym_encrypt(p_city, p_key) else city_enc end,
    province_enc = case when p_province is not null then pgp_sym_encrypt(p_province, p_key) else province_enc end,
    postal_code_enc = case when p_postal_code is not null then pgp_sym_encrypt(p_postal_code, p_key) else postal_code_enc end,
    updated_at = now()
  where id = p_owner_id and clinic_id = p_clinic_id;
end;
$$;
