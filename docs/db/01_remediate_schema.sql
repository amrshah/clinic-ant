-- ClinicFlow Database Remediation Script (Update 2)
-- Run this in your Supabase SQL Editor.

-- Add all missing encrypted columns that triggers might be expecting
ALTER TABLE public.owners ADD COLUMN IF NOT EXISTS first_name_enc TEXT;
ALTER TABLE public.owners ADD COLUMN IF NOT EXISTS last_name_enc TEXT;
ALTER TABLE public.owners ADD COLUMN IF NOT EXISTS email_enc TEXT;
ALTER TABLE public.owners ADD COLUMN IF NOT EXISTS phone_enc TEXT;
ALTER TABLE public.owners ADD COLUMN IF NOT EXISTS address_enc TEXT;
ALTER TABLE public.owners ADD COLUMN IF NOT EXISTS city_enc TEXT;
ALTER TABLE public.owners ADD COLUMN IF NOT EXISTS province_enc TEXT;
ALTER TABLE public.owners ADD COLUMN IF NOT EXISTS postal_code_enc TEXT;

-- Ensure plaintext columns exist for the application to use
ALTER TABLE public.owners ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.owners ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE public.owners ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.owners ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.owners ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.owners ADD COLUMN IF NOT EXISTS province TEXT;

