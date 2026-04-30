# Database Indexes

This document lists key performance and functional indexes in the ClinicFlow database.

## Multitenancy & Performance

Most tables share a composite index on `(organization_id, clinic_id)` to optimize for the most common query pattern (filtering by clinic).

| Table | Index Name | Columns | Notes |
|---|---|---|---|
| `invoices` | `idx_invoices_org_clinic` | `(organization_id, clinic_id)` | |
| `inventory_items` | `idx_inventory_items_org_clinic` | `(organization_id, clinic_id)` | |
| `owners` | `idx_owners_org_clinic` | `(organization_id, clinic_id)` | Filtered: `WHERE is_deleted = FALSE` |
| `pets` | `idx_pets_org_clinic` | `(organization_id, clinic_id)` | Filtered: `WHERE is_deleted = FALSE` |
| `appointments` | `idx_appointments_org_clinic` | `(organization_id, clinic_id)` | |

## Functional & Search Indexes

| Table | Index Name | Columns | Purpose |
|---|---|---|---|
| `owners` | `idx_owners_display_name` | `display_name` | Supports quick owner search. |
| `owners` | `idx_owners_email_hash` | `email_hash` | Supports lookup by email without decrypting. |
| `audit_logs` | `idx_audit_logs_org_created` | `(organization_id, created_at DESC)` | Optimized for the Audit Log viewer. |
| `appointments` | `idx_appointments_date` | `date` | Optimized for the calendar view. |

## Assignment Indexes

Used for filtering staff-to-pet or staff-to-owner relationships.
- `idx_staff_pet_staff`
- `idx_staff_pet_pet`
- `idx_staff_owner_staff`
- `idx_staff_owner_owner`
