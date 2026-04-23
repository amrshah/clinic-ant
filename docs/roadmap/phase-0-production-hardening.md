# Phase 0: Production Hardening

**Status**: In Progress (Started: Mar 12, 2026 - Estd Finish April 15, 2026)
**Objective**: Stabilize architecture and prepare for scale.

## Core Initiatives
- [x] Refactor database schema (Supabase/Postgres) for multi-tenant readiness
- [x] Harden RBAC, role hierarchies, and audit logging
- [x] Normalize billing and inventory schema for extensibility
- [x] Implement migration and versioning strategy (schema + seed data)
- [x] Introduce structured logging (`lib/logger.ts` — all critical API routes covered, JSON stdout → Docker)
- [x] Configure centralized monitoring sink (GlitchTip via `@sentry/nextjs` — dual-sink: GlitchTip + stdout fallback)
- [x] Refactor codebase into modular domain boundaries (Appointments, Billing, Inventory, AI/Chat, Users)
- [x] Appointment workflow states & status transition UI (Check-in / Exam / Billing quick-actions + full dropdown)
- [ ] Configure CI/CD using GitHub Actions + VPS deployment pipeline *(paused — pending monitoring validation)*

## Progress Updates
- Multi-tenant DB schema complete: `organization_id` FK on all tables, RLS enforced via `get_user_org_id()`.
- RBAC fully implemented: role-based RLS policies across all modules + `audit_logs` table with full coverage.
- 15 numbered migration scripts applied; inventory auto-deduction trigger live (`015_alter_appointment_status.sql`).
- Structured JSON logger covers all API mutations; outputs to Docker stdout (ingestion-ready).
- GlitchTip monitoring integrated via `@sentry/nextjs`: dual-sink logger (GlitchTip + stdout fallback), `instrumentation.ts` for server/edge bootstrap, `sentry.{server,client,edge}.config.ts` files created. Activate by setting `SENTRY_DSN` in `.env.local`.
- Appointment status workflow UI shipped: quick-action buttons and full status dropdown in `appointments-content.tsx`.
- Docker (Dockerfile + docker-compose) operational; cloudflared tunnel active.
- **Remaining:** CI/CD pipeline (GitHub Actions → VPS) — paused pending monitoring validation.

**Outcome Statement:**
A production-safe, scalable foundation with observability in place.
