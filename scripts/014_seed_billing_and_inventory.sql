-- 014: Seed Billing and Inventory
-- DEPENDENCY: Requires at least one owner to exist for invoices.
-- Seed Inventory Items
INSERT INTO inventory_items (
        id,
        organization_id,
        clinic_id,
        name,
        sku,
        category,
        unit,
        current_stock,
        low_stock_threshold,
        price,
        cost
    )
VALUES (
        'b0000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000001',
        'Rabies Vaccine',
        'VAC-RB-001',
        'vaccine',
        'dose',
        100,
        20,
        45.00,
        15.00
    ),
    (
        'b0000000-0000-0000-0000-000000000002',
        'a0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000001',
        'Amoxicillin 250mg',
        'MED-AM-250',
        'medication',
        'tablet',
        500,
        50,
        2.50,
        0.50
    ),
    (
        'b0000000-0000-0000-0000-000000000003',
        'a0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000001',
        'Premium Dog Food 5kg',
        'PROD-DF-005',
        'product',
        'bag',
        15,
        5,
        65.00,
        40.00
    ),
    (
        'b0000000-0000-0000-0000-000000000004',
        'a0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000001',
        'Microchip Kit',
        'MISC-MC-001',
        'other',
        'kit',
        5,
        10,
        35.00,
        12.00
    ) ON CONFLICT (id) DO NOTHING;
-- Seed Inventory Transactions (Initial Stock)
INSERT INTO inventory_transactions (item_id, type, quantity, reason)
VALUES (
        'b0000000-0000-0000-0000-000000000001',
        'in',
        100,
        'Initial seed stock'
    ),
    (
        'b0000000-0000-0000-0000-000000000002',
        'in',
        500,
        'Initial seed stock'
    ),
    (
        'b0000000-0000-0000-0000-000000000003',
        'in',
        15,
        'Initial seed stock'
    ),
    (
        'b0000000-0000-0000-0000-000000000004',
        'in',
        5,
        'Initial seed stock'
    ) ON CONFLICT DO NOTHING;
-- Seed Invoices (Only if an owner exists)
DO $$
DECLARE first_owner_id UUID;
BEGIN
SELECT id INTO first_owner_id
FROM owners
LIMIT 1;
IF first_owner_id IS NOT NULL THEN
INSERT INTO invoices (
        id,
        organization_id,
        clinic_id,
        owner_id,
        status,
        total_amount,
        due_date,
        notes
    )
VALUES (
        'e0000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000001',
        first_owner_id,
        'paid',
        125.50,
        CURRENT_DATE,
        'Sample paid invoice'
    ),
    (
        'e0000000-0000-0000-0000-000000000002',
        'a0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000001',
        first_owner_id,
        'sent',
        240.00,
        CURRENT_DATE + 14,
        'Sample pending invoice'
    ) ON CONFLICT (id) DO NOTHING;
-- Seed Invoice Items for the first invoice
INSERT INTO invoice_items (
        invoice_id,
        title,
        quantity,
        unit_price,
        total_price,
        category
    )
VALUES (
        'e0000000-0000-0000-0000-000000000001',
        'General Consultation',
        1,
        85.00,
        85.00,
        'service'
    ),
    (
        'e0000000-0000-0000-0000-000000000001',
        'Rabies Vaccine',
        1,
        40.50,
        40.50,
        'product'
    );
END IF;
END $$;