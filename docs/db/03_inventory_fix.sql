-- Fix missing columns in inventory_transactions
ALTER TABLE public.inventory_transactions ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES public.clinics(id);
ALTER TABLE public.inventory_transactions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.inventory_transactions ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id);

-- Ensure the trigger function uses the correct column names
-- I'll re-provide the trigger script with clinic_id check
CREATE OR REPLACE FUNCTION public.handle_invoice_payment_inventory_deduction()
RETURNS TRIGGER AS $$
DECLARE
    item_record RECORD;
BEGIN
    IF (NEW.status IN ('paid', 'sent')) AND (OLD.status NOT IN ('paid', 'sent')) AND (NEW.inventory_deducted = false) THEN
        FOR item_record IN 
            SELECT item_id, quantity 
            FROM public.invoice_items 
            WHERE invoice_id = NEW.id AND item_id IS NOT NULL
        LOOP
            INSERT INTO public.inventory_transactions (
                item_id, 
                organization_id,
                clinic_id,
                type, 
                quantity, 
                reason, 
                created_by
            ) VALUES (
                item_record.item_id,
                NEW.organization_id,
                NEW.clinic_id,
                'out',
                item_record.quantity,
                'Auto-deducted for Invoice ' || UPPER(LEFT(NEW.id::text, 8)),
                NEW.created_by
            );
        END LOOP;
        NEW.inventory_deducted := true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
