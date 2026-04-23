import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  // 1. Find a valid item and its org/clinic context
  const { data: item } = await supabase.from('inventory_items').select('*').limit(1).single()
  if (!item) {
    console.error('No inventory items found to test with.')
    return
  }
  console.log(`Testing with item: ${item.name} (Stock: ${item.current_stock})`)

  // 2. Insert a transaction
  console.log('Inserting transaction...')
  const { error } = await supabase.from('inventory_transactions').insert({
    item_id: item.id,
    organization_id: item.organization_id,
    clinic_id: item.clinic_id,
    type: 'out',
    quantity: 1,
    reason: 'Final verification test',
    created_by: 'fd30ba1b-392a-4be4-94f0-e429cae8eeab'
  })

  if (error) {
    console.error('Insert Error:', error.message)
    return
  }
  console.log('Transaction inserted successfully.')

  // 3. Verify stock update (Wait a second for the DB trigger to finish)
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const { data: updatedItem } = await supabase.from('inventory_items').select('current_stock').eq('id', item.id).single()
  console.log(`New Stock: ${updatedItem.current_stock}`)

  if (updatedItem.current_stock < item.current_stock) {
    console.log('✅ VERIFICATION SUCCESS: Inventory stock was automatically updated.')
  } else {
    console.log('❌ VERIFICATION FAILURE: Stock did not change. Is the stock update trigger missing on inventory_transactions?')
  }
}

test()
