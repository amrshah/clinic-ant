# Implementation Plan: ClinicFlow Phase 1 Enhancements

This plan covers the implementation of **Billing & Invoicing** and **Basic Inventory** modules as outlined in the roadmap.

## 1. Database Schema Extensions

We need to add tables for invoices, line items, and inventory stock.

### New Tables:
- `invoices`: Tracks billing documents (linked to owner and clinic).
- `invoice_items`: Individual lines on an invoice (treatments, medicines, etc.).
- `inventory_items`: Catalog of items in stock (medicines, vaccines, supplies).
- `inventory_transactions`: Log of stock changes (GRN, usage, waste).

## 2. API Infrastructure

Create new API routes in `app/api/`:
- `/api/billing`: CRUD for invoices.
- `/api/inventory`: CRUD for inventory catalog and stock levels.

## 3. UI Components

### Billing Module (`components/billing/`):
- `InvoiceList`: Overview of all invoices.
- `InvoiceForm`: Create/Edit invoice with searchable items.
- `InvoicePDF`: (Internal or library based) for professional receipts.

### Inventory Module (`components/inventory/`):
- `InventoryList`: Current stock levels and alerts.
- `StockAdjustmentForm`: Record usage or received goods.

## 4. Workflows & Automations

- **Record to Invoice**: Button on Medical Records to "Add to Bill".
- **Usage to Stock**: When a medical record of type 'vaccination' or 'prescription' is created, optionally deduct from inventory.

## 5. Execution Steps

1. **Step A**: Apply SQL Migrations for new tables.
2. **Step B**: Implement API logic in `lib/api/`.
3. **Step C**: Build UI components using existing design system (shadcn/ui + Tailwind v4).
4. **Step D**: Integrate modules into Sidebar navigation.

