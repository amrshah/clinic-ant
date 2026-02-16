-- 001: Extensions and Enums
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Role enum
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('administrator', 'veterinarian', 'nurse_assistant', 'reception', 'technician', 'client');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Consent enums
DO $$ BEGIN
  CREATE TYPE consent_type AS ENUM ('data_collection', 'data_sharing', 'marketing', 'emergency_contact');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE consent_status AS ENUM ('granted', 'revoked', 'pending');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Data request enums
DO $$ BEGIN
  CREATE TYPE data_request_type AS ENUM ('access', 'deletion', 'correction', 'portability');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE data_request_status AS ENUM ('pending', 'in_progress', 'completed', 'denied');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
