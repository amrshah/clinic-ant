import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const itemId = '1a320d05-7ba6-4e32-99d1-1b7f845da00a'
  const ownerId = 'f699d65c-06eb-4755-9ed2-6d5eeca5ae0d'
  
  // 1. Get initial stock
  const { data: itemBefore } = await supabase.from('inventory_items').select('current_stock').eq('id', itemId).single()
  console.log(`Initial Stock: ${itemBefore.current_stock}`)

  // 2. Create a DRAFT invoice
  console.log('Creating draft invoice...')
  const { data: invoice, error: invError } = await supabase.from('invoices').insert({
    organization_id: 'a0000000-0000-0000-0000-000000000001',
    clinic_id: 'c0000000-0000-0000-0000-000000000001',
    owner_id: ownerId,
    status: 'draft',
    total_amount: 50,
    currency: 'CAD',
    inventory_deducted: false
  }).select().single()

  if (invError) {
    console.error('Invoice Error:', invError.message)
    return
  }

  // 3. Add an item to the invoice
  console.log('Adding item to invoice...')
  await supabase.from('invoice_items').insert({
    invoice_id: invoice.id,
    inventory_item_id: itemId,
    name: 'Rabies Vaccine (Test)',
    quantity: 2,
    unit_price: 25,
    total_price: 50
  })

  // 4. Update invoice to PAID
  console.log('Marking invoice as PAID...')
  const { error: updateError } = await supabase.from('invoices')
    .update({ status: 'paid' })
    .eq('id', invoice.id)

  if (updateError) {
    console.error('Update Error:', updateError.message)
    return
  }

  // 5. Verify results
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  const { data: itemAfter } = await supabase.from('inventory_items').select('current_stock').eq('id', itemId).single()
  console.log(`Final Stock: ${itemAfter.current_stock}`)

  if (itemAfter.current_stock === itemBefore.current_stock - 2) {
    console.log('✅ E2E SUCCESS: Invoice payment automatically deducted 2 units from inventory via DB trigger.')
  } else {
    console.log(`❌ E2E FAILURE: Stock went from ${itemBefore.current_stock} to ${itemAfter.current_stock} (expected ${itemBefore.current_stock - 2})`)
  }
}

test()
