import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTransactionsColumns() {
  const { data, error } = await supabase.from('inventory_transactions').select('*').limit(1)
  if (error) {
    console.log('Error fetching inventory_transactions:', error.message)
  } else {
    console.log('Sample transaction:', data[0])
    console.log('Columns:', Object.keys(data[0] || {}))
  }
}

checkTransactionsColumns()
