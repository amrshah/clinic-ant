import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  const { data, error } = await supabase.from('inventory_items').select('id, name, current_stock').limit(1).single()
  if (error) {
    console.error('Error:', error.message)
    return
  }
  console.log('Sample Item Stock:', data)

  // I'll try to find if a trigger exists on inventory_transactions
  const { data: triggers, error: triggerErr } = await supabase.rpc('get_table_triggers', { p_table_name: 'inventory_transactions' })
  if (triggerErr) {
    console.log('RPC get_table_triggers not found')
  } else {
    console.log('Inventory Transactions triggers:', triggers)
  }
}

check()
