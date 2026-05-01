-- 013: Billing and Inventory tables
-- DEPENDENCY: Scripts 001-012 MUST be run before this script.
-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    clinic_id UUID REFERENCES clinics(id) ON DELETE
    SET NULL,
        owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
        appointment_id UUID REFERENCES appointments(id) ON DELETE
    SET NULL,
        status TEXT NOT NULL CHECK (
            status IN ('draft', 'sent', 'paid', 'cancelled', 'overdue')
        ) DEFAULT 'draft',
        total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
        tax_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
        currency TEXT DEFAULT 'CAD',
        due_date DATE,
        notes TEXT,
        inventory_deducted BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        created_by UUID REFERENCES profiles(id) ON DELETE
    SET NULL
);
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
-- Invoice Items table
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    quantity NUMERIC(15, 2) NOT NULL DEFAULT 1.00,
    unit_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    inventory_item_id UUID, -- Link to inventory_items
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
-- Inventory Items table
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    clinic_id UUID REFERENCES clinics(id) ON DELETE
    SET NULL,
        name TEXT NOT NULL,
        sku TEXT,
        category TEXT,
        unit TEXT DEFAULT 'unit',
        current_stock NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
        low_stock_threshold NUMERIC(15, 2) NOT NULL DEFAULT 5.00,
        price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
        cost NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        is_deleted BOOLEAN DEFAULT FALSE
);
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
-- Inventory Transactions table
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('in', 'out', 'adjustment', 'return')),
    quantity NUMERIC(15, 2) NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
-- Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_org_clinic ON invoices(organization_id, clinic_id);
CREATE INDEX IF NOT EXISTS idx_invoices_owner ON invoices(owner_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_org_clinic ON inventory_items(organization_id, clinic_id)
WHERE is_deleted = FALSE;
-- RLS Policies
-- Use DROP/CREATE pattern to avoid errors on re-run
DROP POLICY IF EXISTS "invoices_select" ON invoices;
CREATE POLICY "invoices_select" ON invoices FOR
SELECT USING (organization_id = get_user_org_id());
DROP POLICY IF EXISTS "invoices_all" ON invoices;
CREATE POLICY "invoices_all" ON invoices FOR ALL USING (organization_id = get_user_org_id());
DROP POLICY IF EXISTS "invoice_items_all" ON invoice_items;
CREATE POLICY "invoice_items_all" ON invoice_items FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM invoices
        WHERE id = invoice_items.invoice_id
            AND organization_id = get_user_org_id()
    )
);
DROP POLICY IF EXISTS "inventory_items_all" ON inventory_items;
CREATE POLICY "inventory_items_all" ON inventory_items FOR ALL USING (organization_id = get_user_org_id());
DROP POLICY IF EXISTS "inventory_transactions_all" ON inventory_transactions;
CREATE POLICY "inventory_transactions_all" ON inventory_transactions FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM inventory_items
        WHERE id = inventory_transactions.item_id
            AND organization_id = get_user_org_id()
    )
);