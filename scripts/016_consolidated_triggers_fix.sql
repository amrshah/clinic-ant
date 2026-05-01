-- 016: Consolidated Triggers and Schema Fix
-- This script fixes naming inconsistencies in triggers and ensures all necessary columns exist.

-- 1. Ensure inventory_transactions has organization/clinic context
ALTER TABLE public.inventory_transactions ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES public.clinics(id);
ALTER TABLE public.inventory_transactions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.inventory_transactions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 2. Ensure invoices has necessary columns
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS inventory_deducted BOOLEAN DEFAULT false;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id);

-- 3. Fix handle_invoice_payment_inventory_deduction function
-- Uses 'inventory_item_id' to match the actual invoice_items schema
CREATE OR REPLACE FUNCTION public.handle_invoice_payment_inventory_deduction()
RETURNS TRIGGER AS $$
DECLARE
    item_record RECORD;
BEGIN
    -- Only trigger if status changed to 'paid' and inventory hasn't been deducted yet
    IF (NEW.status = 'paid') AND (OLD.status != 'paid') AND (NEW.inventory_deducted = false) THEN
        
        -- Loop through all items associated with this invoice
        FOR item_record IN 
            SELECT inventory_item_id, quantity 
            FROM public.invoice_items 
            WHERE invoice_id = NEW.id AND inventory_item_id IS NOT NULL
        LOOP
            -- Insert into inventory_transactions (This will trigger the stock update)
            INSERT INTO public.inventory_transactions (
                item_id, 
                organization_id,
                clinic_id,
                type, 
                quantity, 
                reason, 
                created_by
            ) VALUES (
                item_record.inventory_item_id,
                NEW.organization_id,
                NEW.clinic_id,
                'out',
                item_record.quantity,
                'Auto-deducted for Invoice ' || UPPER(LEFT(NEW.id::text, 8)),
                NEW.created_by
            );
        END LOOP;

        -- Mark the invoice as deducted
        NEW.inventory_deducted := true;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Re-apply the trigger
DROP TRIGGER IF EXISTS on_invoice_paid_deduct_inventory ON public.invoices;
CREATE TRIGGER on_invoice_paid_deduct_inventory
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_invoice_payment_inventory_deduction();
