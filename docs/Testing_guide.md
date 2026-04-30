# clinicflow — Manual Testing Guide

**Version**: 1.0  
**Environment**: Local Docker (`http://localhost:3000`)  
**Last Updated**: April 10, 2026

This guide covers end-to-end manual testing procedures for all rollout phases. Each phase maps directly to the product roadmap. Tests are marked with their **current status** relative to implementation.

---

## Test Credentials

| Role | Email | Password | Branch |
|---|---|---|---|
| **Administrator** | admin@clinicflow.demo | Admin123! | Toronto |
| **Veterinarian** | vet@clinicflow.demo | Vet12345! | Toronto |
| **Nurse/Assistant** | nurse@clinicflow.demo | Nurse123! | Toronto |
| **Reception** | reception@clinicflow.demo | Recep123! | Toronto |
| **Technician** | tech@clinicflow.demo | Tech1234! | Ottawa |

---

## Phase 0: Production Hardening

**Goal**: Verify the foundational infrastructure is stable — authentication, role-based access, data isolation, and audit logging.

### TC-0.1 — Authentication Flow

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Navigate to `http://localhost:3000` without being logged in | Redirected to `/auth/login` | ✅ Implemented |
| 2 | Attempt login with wrong password | Error message shown, no login | ✅ Implemented |
| 3 | Login as `admin@clinicflow.demo / Admin123!` | Redirected to Dashboard | ✅ Implemented |
| 4 | Click **Sign Out** from the top-right user menu | Redirected to `/auth/login`, session cleared | ✅ Implemented |
| 5 | Navigate directly to `/pets` without logging in | Redirected to `/auth/login` | ✅ Implemented |

### TC-0.2 — Role-Based Access Control (RBAC)

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Login as `reception@clinicflow.demo` | Sidebar should **not** show Medical Records or Audit Logs | ✅ Implemented |
| 2 | Login as `vet@clinicflow.demo` | Sidebar should show Pets, Appointments, Medical Records — **not** Billing or User Management | ✅ Implemented |
| 3 | Login as `nurse@clinicflow.demo` | Sidebar should show Pets and Appointments — **not** Billing or User Management | ✅ Implemented |
| 4 | Login as `admin@clinicflow.demo` | All modules visible including User Management and Audit Logs | ✅ Implemented |
| 5 | Login as `tech@clinicflow.demo` | Medical records visible, landing on Ottawa branch by default | ✅ Implemented |

### TC-0.3 — Multi-Branch Data Isolation

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Login as admin, sidebar shows **Toronto Animal Care** by default | Dashboard stats reflect Toronto data | ✅ Implemented |
| 2 | Open the clinic switcher, select **Ottawa Pet Hospital** | Pets and Owners lists update to show Ottawa's records only | ✅ Implemented |
| 3 | Navigate to `/pets` while on Ottawa | Shows Ottawa's patients only (or empty if none) | ✅ Implemented |
| 4 | Switch back to Toronto | Pets list repopulates with Toronto's records | ✅ Implemented |

### TC-0.4 — Audit Logging

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Login as admin, navigate to **Audit Logs** | List of past system actions is displayed | ✅ Implemented |
| 2 | Create a new client from the **Owners** page | A new audit entry appears with action `create` and module `owners` | ✅ Implemented |
| 3 | Update an existing pet's weight | An audit entry appears with action `update` and module `pets` | ✅ Implemented |
| 4 | Delete a test inventory item | An audit entry appears with action `delete` and module `inventory` | ✅ Implemented |

### TC-0.5 — Staff User Management (Admin Only)

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Login as Admin. Navigate to **User Management** (if available) or check `profiles` table | List of staff members is displayed | ✅ Implemented |
| 2 | Create a new user in Supabase Auth | A corresponding record is automatically created in `public.profiles` via trigger | ✅ Implemented |
| 3 | Assign a `default_clinic_id` to the new profile | User now lands on that branch by default upon login | ✅ Implemented |
| 4 | Deactivate a staff profile (`is_active = false`) | User is blocked from accessing clinic APIs (403 Forbidden) | ✅ Implemented |

---

## Phase 1: Revenue Engine (Billing & Inventory)

**Goal**: Verify end-to-end client billing, invoice creation with live inventory catalog, tax/discount calculations, and payment recording.

### TC-1.1 — Client (Owner) Onboarding

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Navigate to `/owners`, click **Add Client** | A dialog/form opens | ✅ Implemented |
| 2 | Fill in: First Name, Last Name, Phone, Email. Submit. | Client appears in the owners list with `display_name` | ✅ Implemented |
| 3 | Click the client's name to open their profile | Owner detail page shows personal info and linked pets | ✅ Implemented |
| 4 | Verify email/phone are shown (decrypted from DB) | PII data is readable | ✅ Verified (SQL Fix 07) |

### TC-1.2 — Inventory Catalog Management

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Navigate to `/inventory`, click **Add Item** | An inventory form opens | ✅ Implemented |
| 2 | Fill: Name `Rabies Vaccine`, SKU `RV-001`, Category `Vaccine`, Price `$35`, Cost `$12`, Stock `100` | Item saves and appears in list | ✅ Implemented |
| 3 | Verify `Current Stock` shows **100** | Stock is correctly initialized | ✅ Implemented |
| 4 | Click **Adjust Stock**, add `+20` units | `Current Stock` updates to **120** | ✅ Implemented |

### TC-1.3 — Invoice Creation with Live Catalog

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Navigate to `/billing`, click **Create Invoice** | Invoice form dialog opens | ✅ Implemented |
| 2 | Select a client from the dropdown | Client name is displayed in the form | ✅ Implemented |
| 3 | Click **Add Item (+)** and select `Rabies Vaccine` from the catalog | Item is added as a line item with price auto-filled | ✅ Implemented |
| 4 | Set quantity to `2` | Line total shows `$70.00` | ✅ Implemented |
| 5 | Apply a discount of `10%` | Subtotal reflects discount | ✅ Implemented |
| 6 | Verify HST is calculated and shown in the total | Tax line is visible in the invoice summary | ✅ Implemented |
| 7 | Click **Create Invoice** | Invoice appears in the billing list with status `draft` or `sent` | ✅ Verified (Consolidated View) |

### TC-1.4 — Payment Processing (Manual Override)

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | From the billing list, find the invoice created in TC-1.3 | Invoice is visible with a **Pay** button | ✅ Implemented |
| 2 | Click **Pay** | Payment dialog opens (mock card UI) | ✅ Implemented |
| 3 | Click **Mark as Paid (Manual Override)** | Invoice status changes to `paid` | ✅ Implemented |
| 4 | Navigate to `/inventory` | `Rabies Vaccine` stock has decreased from `120` to **118** | ✅ Implemented |
| 5 | Return to `/` Dashboard | **Revenue** stat reflects the invoice total | ✅ Implemented |

### TC-1.6 — Lifecycle: Updates & Deletions (CRUD Hardening)

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Navigate to `/pets`, select a pet, click **Edit** | Edit dialog opens with current data | ✅ Implemented |
| 2 | Change name/species and save | Pet list updates immediately; details are persisted | ✅ Implemented |
| 3 | Navigate to `/owners`, select an owner, click **Delete** | Confirmation prompt appears | ✅ Implemented |
| 4 | Confirm deletion | Owner is removed from list (Soft Delete recommended) | ✅ Implemented |
| 5 | Search for the deleted owner | Record should no longer appear in active lists | ✅ Implemented |

### TC-1.5 — Payment Processing (Stripe — Future)

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | In the payment dialog, enter a test card `4242 4242 4242 4242` | Card accepted, payment processed | 🔲 Pending (Stripe integration) |
| 2 | Verify receipt generated | PDF or email receipt sent to client | 🔲 Pending |

---

## Phase 2: Operational Depth

**Goal**: Verify automated inventory deductions, consolidated enterprise reporting, appointment lifecycle, and multi-branch operational dashboards.

### TC-2.1 — Automated Stock Deduction on Payment

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Note the current stock of any inventory item | e.g., `50 units` | ✅ Implemented |
| 2 | Create an invoice including that item (qty: 3) | Invoice in `draft` state | ✅ Implemented |
| 3 | Mark invoice as paid (Manual Override) | Invoice status → `paid` | ✅ Implemented |
| 4 | Navigate to `/inventory` | Item stock decreased by 3 → `47 units` | ✅ Implemented |
| 5 | Check **Inventory Transactions** | A new `out` transaction exists for this item with reason "Auto-deducted for Invoice..." | ✅ Implemented |
| 6 | Re-mark the same invoice as paid (if UI allows) | Stock should **not** decrease again (idempotent check on `inventory_deducted` flag) | ✅ Implemented |

### TC-2.2 — Hardened Owner Details (Decryption Fallback)

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Navigate to `/owners/[id]` for a record with encrypted data | Profile loads normally (using RPC decryption) | ✅ Implemented |
| 2 | Simulate `pgcrypto` failure (e.g., disable extension in dev) | Profile **still loads** using hardened table fallback (plaintext columns) | ✅ Implemented |
| 3 | Verify "Client Not Found" error does not occur | Fallback prevents false 404s | ✅ Implemented |

### TC-2.2 — Consolidated Enterprise View

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Login as admin. Switch to **Toronto Animal Care** | Dashboard shows Toronto-specific stats | ✅ Implemented |
| 2 | Note: Patients count for Toronto | e.g., `3 Patients` | ✅ Implemented |
| 3 | Switch to **Ottawa Pet Hospital** | Dashboard stats update to Ottawa's data | ✅ Implemented |
| 4 | Note: Patients count for Ottawa | e.g., `0 Patients` | ✅ Implemented |
| 5 | Select **✨ Consolidated View** from the top of the switcher | Dashboard stats aggregate both branches | ✅ Implemented |
| 6 | Verify `Patients = Toronto + Ottawa` | e.g., `3 + 0 = 3` | ✅ Implemented |
| 7 | Navigate to `/inventory` while in Consolidated View | All inventory from all branches is listed | ✅ Implemented |
| 8 | Navigate to `/billing` while in Consolidated View | All invoices from all branches are shown | ✅ Implemented |

### TC-2.3 — Default Branch Landing on Login

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Log out and clear `localStorage` (DevTools → Application → Clear Storage) | Clean state | ✅ Implemented |
| 2 | Log back in as admin (has `default_clinic_id` = Toronto) | Sidebar auto-selects **Toronto Animal Care** | ✅ Implemented |
| 3 | Log out. Login as a user without a default clinic assigned | Sidebar defaults to **✨ Consolidated View** | ✅ Implemented |

### TC-2.4 — Appointment Lifecycle Workflow

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Navigate to `/appointments`, create a new appointment for a pet | Status: `Scheduled` | ⚠️ Debugging (Select is not defined) |
| 2 | Check in the patient at reception | Status changes to `Arrived` | 🔲 Pending |
| 3 | Vet begins examination | Status changes to `In Exam` | 🔲 Pending |
| 4 | Staff creates invoice from the appointment | Status changes to `Billing` | 🔲 Pending |
| 5 | Invoice is paid | Status changes to `Completed` | 🔲 Pending |
| 6 | Patient does not attend | Staff can mark appointment as `No Show` | 🔲 Pending |

### TC-2.5 — Low Stock Alerts

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Set an inventory item `Low Stock Threshold` to `10` | Threshold saved | ✅ Implemented |
| 2 | Reduce stock below `10` via an invoice payment | Stock drops below threshold | ✅ Implemented |
| 3 | Navigate to Dashboard | **Low Stock** counter increments by 1 | ✅ Implemented |

### TC-2.6 — Interactive API Documentation (Swagger)

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Navigate to `http://localhost:3000/api-docs` | Swagger UI loads successfully | ✅ Implemented |
| 2 | Explore **Appointments** tag | POST, PATCH, and DELETE endpoints are visible | ✅ Implemented |
| 3 | Click **Try it out** on `GET /api/owners` | Returns 200 OK with list of owners | ✅ Implemented |
| 4 | Verify **Medical Records** description | Bulk Fetch pattern (`?petId=...`) is clearly documented | ✅ Implemented |

---

## Phase 3: AI Differentiation

**Goal**: Verify AI-generated clinical documentation, automated client messaging, and voice-to-text workflows.

> [!NOTE]
> All Phase 3 test cases are **Pending Implementation**. These serve as acceptance criteria for the upcoming AI feature release.

### TC-3.1 — AI SOAP Note Generation

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Open a Pet's medical record, click **Generate SOAP Note** | AI produces a structured Subjective/Objective/Assessment/Plan note | 🔲 Pending |
| 2 | Review and edit the generated note | Inline editing is supported | 🔲 Pending |
| 3 | Approve the note | Note is saved to the medical record | 🔲 Pending |

### TC-3.2 — AI Discharge Summary

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | On a completed appointment, click **Generate Discharge Summary** | AI produces a client-readable summary | 🔲 Pending |
| 2 | Export or email to client | Client receives the summary | 🔲 Pending |

### TC-3.3 — Automated Vaccination Reminders

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | A pet's vaccination record shows a due date within 30 days | System queues a reminder | 🔲 Pending |
| 2 | An automated SMS/Email is sent to the pet owner | Owner receives the reminder | 🔲 Pending |
| 3 | Owner replies to confirm | Appointment is created or confirmed | 🔲 Pending |

### TC-3.4 — AI Assistant Chat

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Navigate to `/assistant` | Chat interface loads | ✅ Implemented (UI) |
| 2 | Ask: "How many appointments do I have today?" | AI responds with today's schedule | 🔲 Pending (live data) |
| 3 | Ask: "Show vaccine inventory levels" | AI queries and summarizes stock | 🔲 Pending |

---

## Phase 4: Enterprise & Scale

**Goal**: Verify multi-branch BI reporting, Pet Owner Portal, public API, and infrastructure resilience.

> [!NOTE]
> All Phase 4 test cases are **Pending Implementation**. These serve as acceptance criteria for the enterprise release.

### TC-4.1 — Revenue Analytics Dashboard

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Navigate to the **Reporting** section (admin only) | Revenue charts visible | 🔲 Pending |
| 2 | Filter by branch: **Toronto Animal Care** | Revenue breakdown for Toronto shown | 🔲 Pending |
| 3 | View **Revenue per Veterinarian** | Chart breaks down earnings by vet | 🔲 Pending |
| 4 | View **Treatment Profitability** | Margin per procedure type shown | 🔲 Pending |

### TC-4.2 — Pet Owner Portal

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Client navigates to the Owner Portal URL | Login page shown | 🔲 Pending |
| 2 | Client logs in using their email and a portal PIN | Their pet's records and invoices are visible | 🔲 Pending |
| 3 | Client books an appointment online | Appointment appears in clinic's calendar | 🔲 Pending |
| 4 | Client pays an outstanding invoice | Invoice status changes to `paid` in the clinic system | 🔲 Pending |

### TC-4.3 — Public API & Webhooks

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Make a `GET /api/pets?clinicId=<id>` request with a valid API key | Returns paginated list of pets | 🔲 Pending |
| 2 | Configure a webhook for `invoice.paid` event | Webhook fires when any invoice is paid | 🔲 Pending |

### TC-4.4 — Infrastructure Resilience

| # | Step | Expected Result | Status |
|---|---|---|---|
| 1 | Simulate a container restart (`docker compose restart`) | Application recovers and serves traffic within 30 seconds | ✅ Verified |
| 2 | Verify that Cloudflare tunnel reconnects after restart | Public URL remains accessible | ✅ Verified |
| 3 | Backup the Supabase database | Backup file generated and restorable | 🔲 Pending (automation) |

---

## Regression Checklist (Run After Every Deployment)

Run these core checks after any deployment or schema change:

- [ ] Admin can log in and see the Dashboard
- [ ] Switching clinic branches updates all live list pages (Pets, Owners)
- [ ] Dashboard stats change correctly on branch switch
- [ ] "✨ Consolidated View" shows aggregated totals
- [ ] A new client can be created from `/owners`
- [ ] A new inventory item can be added from `/inventory`
- [ ] An invoice can be created and marked as paid
- [ ] Paying an invoice reduces the inventory stock count
- [ ] Production build compiles without errors (`npm run build`)

---

## Known Limitations (As of April 2026)

| Area | Limitation |
|---|---|
| **Payment** | Stripe integration is pending; Manual Override is used for demo |
| **Owners list** | In Consolidated View, `/owners` API remains branch-scoped |
| **Appointment automation** | Status transitions are manual; lifecycle automation is Phase 2 pending |
| **AI Assistant** | Chat UI exists but responses are not yet wired to live clinic data |
| **Reporting** | No visual charts yet; revenue visible as a raw dashboard counter only |

## Tests Performed
- ✅ Phase 1: Core CRUD verified
- ⚠️ Phase 2: Some items pending (Inventory, Appointments)
- 🔲 Phase 3: AI features pending
- 🔲 Phase 4: Enterprise features pending

# Tests Performed/Results:
1. Pet: Create, Update, delete, assign owner working. Search by pet name, breed, owner name Only; Age, Weight, species are not searchable yet
2. Owner: Create, Update, delete, assign pet working.
3. Appointment: Create, Update, delete working.
4. Dashboard: All metrics working.
5. Inventory: Create, Update, delete working.
6. Invoice: Create, Update, delete working.
7. Users: Create, Update, delete working.

