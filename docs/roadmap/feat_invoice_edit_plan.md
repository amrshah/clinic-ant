# Implementation Plan: Invoice View/Edit Feature

## Objective
Enable operators to view and edit existing invoices, including adding, removing, or modifying services and medicine (line items).

## Phase 1: Backend & Data Layer
### 1.1 API Enhancement
- **File**: `app/api/invoices/route.ts`
- **Action**: Update the `PATCH` handler to:
    - Receive an `items` array in the body.
    - Perform a transaction-like update:
        1. Update the main `invoices` table record (amount, status, notes, etc.).
        2. Delete existing `invoice_items` for the given `invoice_id`.
        3. Insert the new/updated `invoice_items`.
- **Note**: Ensure the database trigger for inventory deduction is handled correctly (currently triggers on status change to 'paid').

### 1.2 Data Store Integration
- **File**: `lib/data-store.ts`
- **Action**: 
    - Verify `useInvoice(id)` hook exists and fetches from `/api/invoices/[id]`.
    - Ensure `updateInvoice` correctly passes the `items` payload to the API.

## Phase 2: Frontend Components
### 2.1 Refactor Invoice Form Logic
- **File**: `components/billing/invoice-editor-dialog.tsx` (New)
- **Action**: 
    - Create a dialog that loads an existing invoice.
    - Reuse the line-item editing logic from `InvoiceFormDialog`.
    - Calculate totals (subtotal, tax, discount) dynamically as items change.
    - Handle the "Save Changes" action.

### 2.2 Update Billing Dashboard
- **File**: `components/billing/billing-content.tsx`
- **Action**: 
    - Add an "Edit" button (eye or pencil icon) to each row in the `Invoice History` table.
    - Trigger the `InvoiceEditorDialog` when clicked.

## Phase 3: Validation & Deployment
### 3.1 Local Testing
- Run `npm run dev` and verify the full CRUD flow for invoices.
- Verify that editing an invoice correctly updates the total amount in the database.
- Verify that changing status to 'paid' still triggers inventory deduction.

### 3.2 Docker Testing
- Run `docker-compose up --build` to validate the standalone build and production environment.
- Confirm that the `output: 'standalone'` configuration works with the new changes.

## Phase 4: Git Workflow
- Work on `feature/invoice-editing` branch.
- Merge into `demo` after successful local and Docker validation.
- Push to GitHub for VPS deployment.
