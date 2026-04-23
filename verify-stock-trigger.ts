import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const itemId = '1a320d05-7ba6-4e32-99d1-1b7f845da00a'
  
  // 1. Get current stock
  const { data: itemBefore } = await supabase.from('inventory_items').select('current_stock').eq('id', itemId).single()
  console.log('Stock Before:', itemBefore.current_stock)

  // 2. Insert transaction
  const { error } = await supabase.from('inventory_transactions').insert({
    item_id: itemId,
    organization_id: 'a0000000-0000-0000-0000-000000000001',
    clinic_id: 'c0000000-0000-0000-0000-000000000001',
    type: 'out',
    quantity: 1,
    reason: 'Test deduction',
    created_by: 'fd30ba1b-392a-4be4-94f0-e429cae8eeab'
  })

  if (error) {
    console.error('Insert Error:', error.message)
    return
  }

  // 3. Get current stock again
  const { data: itemAfter } = await supabase.from('inventory_items').select('current_stock').eq('id', itemId).single()
  console.log('Stock After:', itemAfter.current_stock)
  
  if (itemBefore.current_stock === itemAfter.current_stock) {
    console.log('STOCK DID NOT CHANGE! Trigger is missing on inventory_transactions.')
  } else {
    console.log('STOCK CHANGED! Trigger is working.')
  }
}

test()
