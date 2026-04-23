-- 015: Add Appointment Statuses & Inventory Trigger

-- 1. Drop existing CHECK constraint securely
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;

-- 2. Add the wider CHECK constraint
ALTER TABLE appointments ADD CONSTRAINT appointments_status_check 
CHECK (status IN ('scheduled', 'checked-in', 'in-exam', 'billing', 'confirmed', 'in-progress', 'completed', 'cancelled'));

-- 3. Create a trigger function to auto-update stock natively on transaction
CREATE OR REPLACE FUNCTION update_inventory_stock_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.type = 'in' OR NEW.type = 'return' THEN
        UPDATE inventory_items SET current_stock = current_stock + NEW.quantity WHERE id = NEW.item_id;
    ELSIF NEW.type = 'out' THEN
        UPDATE inventory_items SET current_stock = current_stock - NEW.quantity WHERE id = NEW.item_id;
    ELSIF NEW.type = 'adjustment' THEN
        UPDATE inventory_items SET current_stock = current_stock + NEW.quantity WHERE id = NEW.item_id; -- Adjustment handles pos/neg in qty
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Apply Trigger
DROP TRIGGER IF EXISTS trg_update_inventory_stock ON inventory_transactions;
CREATE TRIGGER trg_update_inventory_stock
AFTER INSERT ON inventory_transactions
FOR EACH ROW
EXECUTE FUNCTION update_inventory_stock_on_transaction();
