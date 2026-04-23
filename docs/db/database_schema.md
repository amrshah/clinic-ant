# VetCare Database Schema Documentation
**Generated: April 22, 2026**

This document provides a comprehensive overview of the VetCare platform's database schema as it currently exists on the Supabase production instance.

## 1. Core Tables

### `owners` (Pet Owners / Clients)
Stores client information with hybrid PII protection (plaintext + encrypted columns).
- `id` (UUID, Primary Key)
- `display_name` (Text) - Full name for UI display
- `first_name`, `last_name`, `email`, `phone`, `address`, `province` (Text) - Plaintext columns
- `first_name_enc`, `last_name_enc`, `email_enc`, `phone_enc`, `address_enc`, `city_enc`, `province_enc` (Text) - Encrypted columns (managed by DB triggers)
- `clinic_id` (UUID) - Foreign key to `clinics`
- `organization_id` (UUID) - Foreign key for multi-tenant isolation

### `pets`
Stores patient information.
- `id` (UUID, Primary Key)
- `owner_id` (UUID) - Foreign key to `owners`
- `name` (Text)
- `species` (Text) - e.g., dog, cat
- `breed` (Text)
- `weight` (Decimal)
- `date_of_birth` (Date)

### `appointments`
Manages the clinic schedule.
- `id` (UUID, Primary Key)
- `pet_id`, `owner_id`, `veterinarian_id` (UUID) - Foreign keys
- `date` (Date)
- `time` (Time)
- `status` (Text) - scheduled, confirmed, arrived, in-progress, completed, cancelled
- `type` (Text) - checkup, vaccination, surgery, etc.

### `profiles`
User accounts for clinic staff.
- `id` (UUID, Primary Key - matches Auth ID)
- `role` (Text) - administrator, veterinarian, receptionist
- `default_clinic_id` (UUID)

## 2. Revenue & Inventory

### `invoices`
- `id` (UUID, Primary Key)
- `owner_id`, `appointment_id` (UUID)
- `status` (Text) - draft, open, paid, void
- `total_amount` (Decimal)

### `inventory_items`
- `id` (UUID, Primary Key)
- `name`, `sku` (Text)
- `current_stock` (Integer)
- `price` (Decimal)

---

## 3. Security & Isolation
- **Multi-Tenancy**: Every table contains `organization_id`.
- **Clinic Isolation**: Most queries filter by `clinic_id` unless in "Consolidated View."
- **Audit Logs**: All state changes are logged in the `audit_logs` table.
