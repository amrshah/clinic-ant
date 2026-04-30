# Billing & Inventory

## Invoices
Financial management of services and products.

### `GET /invoices`
List all invoices.

### `POST /invoices`
Create a new invoice.
- **Body**: `owner_id`, `items` (array), `status`, `total_amount`.

### `PATCH /invoices/{id}`
Update status (e.g., mark as `paid`).
- **Side Effect**: If status changes to `paid`, inventory is automatically deducted via database trigger.

---

## Inventory
Stock management and tracking.

### `GET /api/inventory`
List all inventory items.

### `POST /api/inventory`
Add a new inventory item/product.

### `POST /api/inventory/transactions`
Record a manual stock adjustment.
- **Body**: `item_id`, `type` (in/out/adjustment), `quantity`, `reason`.
