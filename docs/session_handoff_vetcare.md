# Session Handoff: Communications & Bug Triage
**Date**: April 22, 2026  
**Next Phase Focus**: High-Priority Bug Squashing & UI Stabilization

---

## What Was Completed This Session

### 1. Automated Client Communications
- Designed a scalable architecture (`lib/notifications.ts`) for SMS and Email notifications using mock providers that safely log to the console.
- **Immediate Confirmations**: Integrated the `sendAppointmentConfirmation` hook directly into the `POST /api/appointments` route. (Also patched a bug where owner contact information was not being selected from the database).
- **Scheduled Reminders**: Created a `GET /api/cron/reminders/route.ts` endpoint for a daily CRON job to scan for upcoming appointments and dispatch 24-hour reminders with idempotency checks against the audit logs.
- **Communications Dashboard**: Built a new `/communications` UI dashboard accessible via the sidebar to view all dispatched messages.

### 2. Environment Fixes
- Identified that Next.js standalone build (`output: 'standalone'`) causes `EPERM: symlink` failures on Windows when attempting to run `npm run build` locally without Developer Mode enabled.
- Clarified Docker vs Host filesystem boundaries (the container does not have a live volume mount, thus requires `docker compose up --build -d` to ingest local edits).

---

## 🚨 Critical Bugs Logged for Next Session

Before proceeding to Phase 4 (AI SOAP Notes) or other enhancements, the next session **must** prioritize fixing these critical system-breaking bugs:

1. **Create Appointment Fails**: The UI component for creating appointments is not working correctly. Needs immediate debugging of the network payload and API response.
2. **Client Details Page Error**: Navigating to a specific client/owner details page is throwing a "Client not found" error. Likely a mismatch in routing parameters or a Supabase row-level-security/query issue.
3. **Silent Failure on New Client Creation**: Adding a new client fails silently without showing any error toasts or validation messages. This indicates a missing `try/catch` handler or improperly swallowed API responses in the Owner creation form.

---

## To Resume (Next Session)

1. **Start the Dev Server**: `npm run dev` to test the UI issues interactively with hot-reloading.
2. **Triage the Bugs**: Start with the "Client Details Page" and "Silent Failure on Client Creation", as appointments depend heavily on owners existing correctly in the system.
3. **Database Migration Check**: Ensure the `invoice_items` table and `owners` schema fixes from the previous session were actually run on the Supabase instance, as this might be causing the silent failures on Client Creation!
