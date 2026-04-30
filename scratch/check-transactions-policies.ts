import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkPolicies() {
  const { data, error } = await supabase.rpc('get_table_policies', { p_table_name: 'inventory_transactions' })
  if (error) {
    console.log('Error fetching policies via RPC:', error.message)
    // Fallback to direct query if possible (usually not via Supabase client unless it has access to pg_catalog)
  } else {
    console.log('Policies for inventory_transactions:', JSON.stringify(data, null, 2))
  }
}

checkPolicies()
