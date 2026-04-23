import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkActualTypesSql() {
  const { data, error } = await supabase.rpc('get_owners_decrypted', { 
    p_clinic_id: 'c0000000-0000-0000-0000-000000000001', 
    p_key: 'test' 
  })
  
  if (error) {
      console.log('RPC Error:', error.message)
  }

  // Direct SQL query via RPC (if we have one) or just a raw query
  const { data: columnInfo, error: colError } = await supabase.from('owners').select('*').limit(0)
  // This doesn't give types.
  
  // Use a query that will fail if type is not what we expect
  console.log('--- Testing if first_name_enc is bytea ---')
  const { error: e1 } = await supabase.from('owners').select('first_name_enc').filter('first_name_enc', 'is', 'not.null').limit(1)
  if (e1) console.log('Error e1:', e1.message)
  
  // Try to use a string function on it
  const { data: d2, error: e2 } = await supabase.rpc('get_owners_decrypted', { 
      p_clinic_id: 'c0000000-0000-0000-0000-000000000001', 
      p_key: 'test' 
  })
}

checkActualTypesSql()
