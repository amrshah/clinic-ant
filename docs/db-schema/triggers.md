# Database Triggers

This document maps database tables to their active triggers and the functions they execute.

| Table | Trigger Name | Event | Function | Description | Source File |
|---|---|---|---|---|---|
| `auth.users` | `on_auth_user_created` | `AFTER INSERT` | `handle_new_user()` | Automatically creates a profile in the `public.profiles` table. | [003_profiles.sql](file:///e:/myapps/clinic-ant/scripts/003_profiles.sql) |
| `inventory_transactions` | `trg_update_inventory_stock` | `AFTER INSERT` | `update_inventory_stock_on_transaction()` | Synchronizes item stock levels when a transaction is added. | [015_alter_appointment_status.sql](file:///e:/myapps/clinic-ant/scripts/015_alter_appointment_status.sql) |
| `invoices` | `on_invoice_paid_deduct_inventory` | `BEFORE UPDATE` | `handle_invoice_payment_inventory_deduction()` | Deducts inventory items automatically when invoice is paid/sent. | [inventory_trigger.sql](file:///e:/myapps/clinic-ant/docs/db/inventory_trigger.sql) |

---

## Trigger Logic Reference

### `trg_update_inventory_stock`
- **Table**: `inventory_transactions`
- **Condition**: Runs on every `INSERT`.
- **Logic**: Depending on the transaction `type` (`in`, `out`, `adjustment`, `return`), it increments or decrements the `current_stock` in the `inventory_items` table.
