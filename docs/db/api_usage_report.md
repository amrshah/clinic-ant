# API Usage & Mapping Report
**Generated: April 22, 2026**

This report maps the available API routes in `app/api` to their actual usage within the application frontend and library layers.

## API Usage Summary Table

| Endpoint Path | Method(s) | Used In | Status |
| :--- | :--- | :--- | :--- |
| `/api/owners` | `GET`, `POST` | `lib/data-store.ts` | ✅ Active |
| `/api/owners/[id]` | `GET`, `PATCH`, `DELETE` | `lib/data-store.ts` | ✅ Active |
| `/api/pets` | `GET`, `POST` | `lib/data-store.ts` | ✅ Active |
| `/api/pets/[id]` | `GET`, `PATCH`, `DELETE` | `lib/data-store.ts` | ✅ Active |
| `/api/appointments` | `GET`, `POST` | `lib/data-store.ts` | ✅ Active |
| `/api/appointments/[id]` | `PATCH`, `DELETE` | `lib/data-store.ts` | ✅ Active |
| `/api/clinics` | `GET` | `lib/data-store.ts` | ✅ Active |
| `/api/dashboard` | `GET` | `lib/data-store.ts` | ✅ Active |
| `/api/medical-records` | `GET`, `POST` | `lib/data-store.ts` | ✅ Active |
| `/api/medical-records/[id]` | - | - | ⚠️ Unused |
| `/api/invoices` | `GET`, `POST`, `PATCH` | `lib/data-store.ts` | ✅ Active |
| `/api/invoices/[id]` | `GET` | `lib/data-store.ts` | ✅ Active |
| `/api/inventory` | `GET` | `lib/data-store.ts` | ✅ Active |
| `/api/inventory/transactions` | - | - | ⚠️ Unused |
| `/api/audit-logs` | `GET` | `communications/page.tsx` | ✅ Active |
| `/api/cron/reminders` | `POST` | (Triggered via Secure Cron) | ✅ Active |
| `/api/profile` | `GET` | Auth Context / Layout | ✅ Active |
| `/api/users` | - | - | ⚠️ Unused (Managed via Auth/Profiles) |
| `/api/users/[id]` | - | - | ⚠️ Unused (Managed via Auth/Profiles) |
| `/api/chat` | - | - | ⚠️ Unused (AI features calling direct LLM) |

## Findings & Implementation Details
1. **Inventory Transactions**: While `/api/inventory/transactions` is not called by the frontend, inventory deduplication is actively performed as a **server-side side-effect** in `app/api/invoices/route.ts`. When an invoice is marked as 'paid', the system automatically inserts records into the `inventory_transactions` table directly.
2. **Medical Records**: Individual fetching via `[id]` is currently bypassed because the UI (Patient Timeline) fetches the entire history in a single request using the bulk `/api/medical-records?petId=...` endpoint. This is documented in Swagger as a **Bulk Fetch** operation.
3. **Staff/User Management**: Endpoints for `/api/users` are currently dormant because staff profiles are handled via the `profiles` table. This table is **automatically managed by Supabase Database Triggers** that sync data from `auth.users` to `public.profiles` upon signup, ensuring consistent staff identity without a separate management API.
4. **Chat/AI**: The `/api/chat` route is a placeholder. Current AI experimental features (like SOAP notes) are implemented using direct server-side calls to the LLM provider rather than an internal chat endpoint. (Note: As per feedback, this remains untouched for now).

