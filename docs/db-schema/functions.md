# Database Functions

This document lists all custom PostgreSQL functions defined in the ClinicFlow database.

| Function Name | Description | Source File |
|---|---|---|
| `get_user_org_id()` | Returns the organization ID for the currently authenticated user. | [003_profiles.sql](file:///e:/myapps/clinic-ant/scripts/003_profiles.sql) |
| `get_user_role()` | Returns the role of the currently authenticated user. | [003_profiles.sql](file:///e:/myapps/clinic-ant/scripts/003_profiles.sql) |
| `handle_new_user()` | Trigger function to create a profile when a new user signs up. | [003_profiles.sql](file:///e:/myapps/clinic-ant/scripts/003_profiles.sql) |
| `update_inventory_stock_on_transaction()` | Trigger function that automatically updates `inventory_items.current_stock` when a transaction is recorded. | [015_alter_appointment_status.sql](file:///e:/myapps/clinic-ant/scripts/015_alter_appointment_status.sql) |
| `get_owners_decrypted(...)` | RPC to fetch owners with decrypted PII fields. | [012_fix_rpc_functions.sql](file:///e:/myapps/clinic-ant/scripts/012_fix_rpc_functions.sql) |
| `handle_invoice_payment_inventory_deduction()` | Trigger function to automatically deduct stock when an invoice is marked as paid. | [inventory_trigger.sql](file:///e:/myapps/clinic-ant/docs/db/inventory_trigger.sql) |
| `insert_owner_encrypted(...)` | RPC to insert a new owner with encrypted PII fields. | [012_fix_rpc_functions.sql](file:///e:/myapps/clinic-ant/scripts/012_fix_rpc_functions.sql) |

---

## Detailed Definitions

### `get_user_org_id()`
```sql
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID AS $$
  SELECT organization_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

### `update_inventory_stock_on_transaction()`
```sql
CREATE OR REPLACE FUNCTION update_inventory_stock_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.type = 'in' OR NEW.type = 'return' THEN
        UPDATE inventory_items SET current_stock = current_stock + NEW.quantity WHERE id = NEW.item_id;
    ELSIF NEW.type = 'out' THEN
        UPDATE inventory_items SET current_stock = current_stock - NEW.quantity WHERE id = NEW.item_id;
    ELSIF NEW.type = 'adjustment' THEN
        UPDATE inventory_items SET current_stock = current_stock + NEW.quantity WHERE id = NEW.item_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```
