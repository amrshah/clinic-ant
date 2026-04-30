# Row-Level Security (RLS) Policies

This document details all RLS policies applied to tables in the `public` schema.

## Summary Table

| Table | Policy Name | Operations | Logic | Source |
|---|---|---|---|---|
| `organizations` | `org_select` | `SELECT` | `id = get_user_org_id()` | [008_rls_policies.sql](file:///e:/myapps/clinic-ant/scripts/008_rls_policies.sql) |
| `profiles` | `profiles_select` | `SELECT` | `id = auth.uid() OR organization_id = get_user_org_id()` | [011_fix_rls_and_columns.sql](file:///e:/myapps/clinic-ant/scripts/011_fix_rls_and_columns.sql) |
| `profiles` | `profiles_insert` | `INSERT` | `id = auth.uid() OR (org_id = get_user_org_id() AND role = 'administrator')` | [011_fix_rls_and_columns.sql](file:///e:/myapps/clinic-ant/scripts/011_fix_rls_and_columns.sql) |
| `inventory_items` | `inventory_items_all` | `ALL` | `organization_id = get_user_org_id()` | [013_billing_and_inventory.sql](file:///e:/myapps/clinic-ant/scripts/013_billing_and_inventory.sql) |
| `inventory_transactions` | `inventory_transactions_all` | `ALL` | `EXISTS (SELECT 1 FROM inventory_items ...)` | [013_billing_and_inventory.sql](file:///e:/myapps/clinic-ant/scripts/013_billing_and_inventory.sql) |
| `audit_logs` | `audit_logs_insert` | `INSERT` | `user_id = auth.uid()` | [011_fix_rls_and_columns.sql](file:///e:/myapps/clinic-ant/scripts/011_fix_rls_and_columns.sql) |

---

## Detailed Logic

### `inventory_transactions` (Crucial)
**Policy Name**: `inventory_transactions_all`
**Definition**:
```sql
CREATE POLICY "inventory_transactions_all" ON inventory_transactions FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM inventory_items
        WHERE id = inventory_transactions.item_id
            AND organization_id = get_user_org_id()
    )
);
```
> [!WARNING]
> This policy relies on a subquery to `inventory_items`. If the user has permission to see the item but the subquery fails (e.g., due to recursive RLS checks), insertions may fail with an RLS violation error.

### `profiles` (Revised)
**Policy Name**: `profiles_select`
**Definition**:
```sql
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (
  id = auth.uid() OR organization_id = get_user_org_id()
);
```
Allows users to read their own profile or profiles within the same organization.
