-- 04_inventory_timestamps.sql
-- Add timestamp columns to inventory tables to support automated triggers

ALTER TABLE public.inventory_items 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

ALTER TABLE public.inventory_transactions 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
