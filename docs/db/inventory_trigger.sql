-- 1. Create a function to handle automatic inventory deduction
CREATE OR REPLACE FUNCTION public.handle_invoice_payment_inventory_deduction()
RETURNS TRIGGER AS $$
DECLARE
    item_record RECORD;
BEGIN
    -- Only trigger if status changed to 'paid' or 'sent' and inventory hasn't been deducted yet
    IF (NEW.status IN ('paid', 'sent')) AND (OLD.status NOT IN ('paid', 'sent')) AND (NEW.inventory_deducted = false) THEN
        
        -- Loop through all items associated with this invoice
        FOR item_record IN 
            SELECT item_id, quantity, id 
            FROM public.invoice_items 
            WHERE invoice_id = NEW.id AND item_id IS NOT NULL
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
                item_record.item_id,
                NEW.organization_id,
                NEW.clinic_id,
                'out',
                item_record.quantity,
                'Auto-deducted for Invoice ' || UPPER(LEFT(NEW.id::text, 8)),
                NEW.created_by -- Or a system user ID if available
            );
        END LOOP;

        -- Mark the invoice as deducted
        NEW.inventory_deducted := true;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger on the invoices table
DROP TRIGGER IF EXISTS on_invoice_paid_deduct_inventory ON public.invoices;
CREATE TRIGGER on_invoice_paid_deduct_inventory
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_invoice_payment_inventory_deduction();
