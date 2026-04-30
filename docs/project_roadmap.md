# Project Roadmap & Progress Tracker
**Updated: April 21, 2026**

This document serves as the permanent artifact to track the current phase, sprint, and overall progress of the project.

## Phase 0: Production Hardening
**Status: ✅ COMPLETE**
- [x] **Schema Normalization**: Core tables are fully established for Billing, Inventory, and Owners.
- [x] **Relational Security**: Implemented encryption for PII (Owners) and robust RLS policies for multi-tenant isolation.
- [x] **Environment Stability**: Resolved auth-related 500 errors via a resilient Auth Context "Safety Net."

## Phase 1: Revenue Engine (Billing & Inventory)
**Status: ✅ COMPLETE**
- [x] **Interactive Invoicing**: Multi-item invoices with live catalog selection from Inventory.
- [x] **Tax & Discount Logic**: Automated calculations for HST and global invoice discounts.
- [x] **Brand Identity**: Full VetCare brand migration across all assets and Docker containers.
- [x] **Client Onboarding**: Synchronized encryption RPCs for reliable owner registration.

## Phase 2: Operational Depth
**Status: ✅ COMPLETE**
- [x] **Automated Stock Deduction**: Inventory adjusted automatically on invoice payment.
- [x] **Manual Payment Overrides**: Cash/check payments can bypass card simulation.
- [x] **Multi-Branch Sync**: Hardened navigation hooks for strict clinic data isolation.
- [x] **Consolidated Enterprise View**: "✨ Consolidated View" in the sidebar aggregates org-wide data across all branches on the Dashboard, Inventory, and Billing APIs.
- [x] **Dashboard Live Reload**: Removed stale SSR fallback; dashboard always fetches fresh data on branch switch.
- [x] **Appointment Lifecycle Automation**: Status transitions correctly auto-generate invoices during billing.
- [x] **Enterprise Analytics**: Advanced financial reporting revenue breakdown by branch inside the Billing page.

## Phase 3: Client Engagement & Automation (IN PROGRESS)
*Goal: Enhance client communication and operational efficiency through automated notifications.*
- [ ] Automated SMS and Email Reminders
  - Integrate messaging provider (e.g., Twilio, SendGrid).
  - Create trigger events for upcoming appointments and due vaccinations.
- [x] Swagger API Documentation
  - Implemented Swagger UI and comprehensive Markdown documentation in `docs/api-docs/`.
- [x] Database Security Hardening
  - Fixed `inventory_transactions` RLS isolation.
  - Established a full schema registry in `docs/db-schema/`.
- [ ] Patient Portal (Client View)
  - Allow pet owners to view medical records, upcoming appointments, and pay invoices online.
- [ ] Telemedicine Integration (Basic)
  - Video consultation scheduling and links.

## Phase 4: Intelligence & AI Integration
*Goal: Integrate independent, decoupled intelligence modules into the core operational platform.*
- [ ] AI-Powered SOAP Notes (External Integration)
  - Integrate with the decoupled AI-SOAP dictation module to push generated notes into medical records.
- [ ] Predictive Analytics for Inventory
  - AI forecasting to suggest order quantities based on seasonal trends.

---

## Technical Evaluations
- [x] **Laravel Migration Study**: Conducted a comprehensive feasibility study (Ref: `laravel_feasibility_study.md`) evaluating a move from Next.js APIs to Laravel 11. Conversion is on hold.

---

### Alignment Summary
We have transitioned into **Phase 3 (Client Engagement & Automation)** by completing the technical documentation required for enterprise expansion. All database logic (Triggers, Functions, Policies) and API endpoints are now fully documented. 

**Current Focus**: Preparing for the **Patient Portal** and **Telemedicine** integrations.
