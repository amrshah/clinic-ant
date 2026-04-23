-- 02_inventory_trigger.sql (Updated)
-- Fixes column name mismatch (item_id -> inventory_item_id)

CREATE OR REPLACE FUNCTION public.handle_invoice_payment_inventory_deduction()
RETURNS TRIGGER AS $$
DECLARE
    item_record RECORD;
BEGIN
    IF (NEW.status IN ('paid', 'sent')) AND (OLD.status NOT IN ('paid', 'sent')) AND (NEW.inventory_deducted = false) THEN
        FOR item_record IN 
            SELECT inventory_item_id as item_id, quantity 
            FROM public.invoice_items 
            WHERE invoice_id = NEW.id AND inventory_item_id IS NOT NULL
        LOOP
            INSERT INTO public.inventory_transactions (
                item_id, 
                organization_id,
                clinic_id,
                type, 
                quantity, 
                reason
            ) VALUES (
                item_record.item_id,
                NEW.organization_id,
                NEW.clinic_id,
                'out',
                item_record.quantity,
                'Auto-deducted for Invoice ' || UPPER(LEFT(NEW.id::text, 8))
            );
        END LOOP;
        NEW.inventory_deducted := true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
