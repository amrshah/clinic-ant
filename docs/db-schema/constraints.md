# Database Constraints

This document lists all non-trivial constraints (CHECK constraints) that enforce business logic in the ClinicFlow database.

## Status & Type Constraints

These constraints ensure that only valid lifecycle statuses are recorded in the system.

### `appointments.status`
- **Constraint**: `CHECK (status IN ('scheduled', 'checked-in', 'in-exam', 'billing', 'confirmed', 'in-progress', 'completed', 'cancelled'))`
- **Purpose**: Controls the workflow stages of a patient visit.

### `invoices.status`
- **Constraint**: `CHECK (status IN ('draft', 'sent', 'paid', 'void', 'partially_paid', 'overdue'))`
- **Purpose**: Tracks the financial lifecycle of a bill.

### `inventory_transactions.type`
- **Constraint**: `CHECK (type IN ('in', 'out', 'adjustment', 'return'))`
- **Purpose**: Categorizes stock movements for accurate auditing and trigger logic.

### `inventory_items.category`
- **Constraint**: `CHECK (category IN ('medication', 'vaccine', 'supply', 'product', 'other'))`
- **Purpose**: Used for reporting and inventory organization.

## Soft-Delete Logic

The following tables use a soft-delete mechanism instead of permanent row removal. This is critical for maintaining audit logs and historical medical records.

| Table | Flag | Notes |
|---|---|---|
| `owners` | `is_deleted` | Associated pets and records are preserved but hidden from active UI. |
| `pets` | `is_deleted` | Historical records are preserved. |
| `inventory_items` | `is_deleted` | Past transactions remain valid for financial auditing. |

> [!NOTE]
> Standard indexes on these tables include a `WHERE is_deleted = FALSE` filter to maintain performance on active datasets.
