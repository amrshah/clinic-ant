# Phase 1: Revenue Engine (Billing & Inventory)

**Status**: In Progress (Estimated Duration: 4-6 Weeks)
**Objective**: Complete the base monetizable system (Invoice generation, Billing workflows, Basic Inventory tracking).

## Core Initiatives

### Billing & Invoicing
- [x] Basic Billing Dashboard & UI
- [x] Database Schema for Invoices and Transactions
- [x] Integrate RBAC and Seeded Demo Data
- [x] Branding & Logo adjustments
- [x] Invoice Creation Form (Line items, tax logic, estimates, discounts)
- [x] Pet/Invoice relational linkage in the Pet Detail page
- [ ] Payment processing (Stripe integration) -> *Note: Mock UI approved for initial demo, actual Stripe API to be integrated post-meeting.*
- [ ] Split payments, refunds, and credit balance handling
- [ ] Daily reconciliation reports and financial audit logs
- [ ] Deposit workflows for procedures

### Inventory Expansion
- [x] Basic Inventory Dashboard & UI
- [x] Inventory Management Dialogs ("Add Item" and "Adjust Stock")

## Next Immediate Steps
1. **Invoice Refinement**: Implement tax logic, estimates, and discount fields within the existing Invoice Form.
2. **Payment Integration**: Set up the UI and backend hooks for Payment processing (Stripe/Card).
3. **Financial Reporting**: Build the first set of daily reconciliation reports.

**Outcome Statement:**
A fully monetizable clinic system capable of handling end-to-end client billing and raw stock taking.
