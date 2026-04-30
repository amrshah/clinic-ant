# Database Tables and Schema

This document provides a high-level overview of the core tables in the ClinicFlow system.

## Core Entities

### `organizations`
Foundational unit for data isolation (Multitenancy).
- `id`: Primary Key (UUID)
- `name`: Organization name
- `subscription_tier`: enum ('basic', 'professional', 'enterprise')

### `clinics`
Specific clinic locations within an organization.
- `id`: Primary Key (UUID)
- `organization_id`: FK to `organizations`
- `name`: Clinic name

### `profiles`
User profiles (Staff members).
- `id`: FK to `auth.users`
- `organization_id`: FK to `organizations`
- `default_clinic_id`: FK to `clinics`
- `role`: enum ('administrator', 'veterinarian', 'nurse_assistant', 'reception', 'technician')

---

## Inventory & Billing

### `inventory_items`
- `id`: Primary Key (UUID)
- `organization_id`: FK to `organizations`
- `clinic_id`: FK to `clinics`
- `current_stock`: numeric (Real-time stock level)
- `low_stock_threshold`: numeric

### `inventory_transactions`
- `id`: Primary Key (UUID)
- `item_id`: FK to `inventory_items`
- `type`: enum ('in', 'out', 'adjustment', 'return')
- `quantity`: numeric
- `organization_id`: FK to `organizations` (Added in Phase 2)
- `clinic_id`: FK to `clinics` (Added in Phase 2)

## Relationships

The database follows a strict hierarchical multitenant structure:

1.  **Organization** (Top Level): All data is isolated by `organization_id`.
2.  **Clinic** (Mid Level): Data is further partitioned by `clinic_id`.
3.  **Staff/Profile**: Linked to one organization and has a `default_clinic_id`.

### Key Foreign Keys
- `inventory_transactions` -> `inventory_items` (`item_id`)
- `appointments` -> `pets` (`pet_id`)
- `pets` -> `owners` (`owner_id`)
- `medical_records` -> `pets` (`pet_id`)
- `invoices` -> `owners` (`owner_id`)

---

## Data Privacy (PII)
Fields marked as **ENCRYPTED** in the database:
- `owners.first_name`
- `owners.last_name`
- `owners.email`
- `owners.phone`

*These fields are handled via RPC functions (`get_owners_decrypted`, etc.) to ensure that only authorized users can view the plain text data.*
