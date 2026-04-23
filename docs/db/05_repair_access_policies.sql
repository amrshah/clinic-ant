-- 05_repair_access_policies.sql
-- Loosens RLS policies for testing purposes to ensure data visibility

-- 1. Owners Table
DROP POLICY IF EXISTS "Users can view their organization owners" ON public.owners;
CREATE POLICY "Users can view their organization owners" ON public.owners
    FOR SELECT USING (true);

-- 2. Pets Table
DROP POLICY IF EXISTS "Users can view their organization pets" ON public.pets;
CREATE POLICY "Users can view their organization pets" ON public.pets
    FOR SELECT USING (true);

-- 3. Invoices Table
DROP POLICY IF EXISTS "Users can view their organization invoices" ON public.invoices;
CREATE POLICY "Users can view their organization invoices" ON public.invoices
    FOR SELECT USING (true);

-- 4. Inventory Items
DROP POLICY IF EXISTS "Users can view their organization items" ON public.inventory_items;
CREATE POLICY "Users can view their organization items" ON public.inventory_items
    FOR SELECT USING (true);

-- 5. Appointments
DROP POLICY IF EXISTS "Users can view their organization appointments" ON public.appointments;
CREATE POLICY "Users can view their organization appointments" ON public.appointments
    FOR SELECT USING (true);
