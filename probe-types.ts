import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkActualTypes() {
  // Query to get column types from information_schema
  // We can use a trick: try to call a function that only takes bytea on the column
  const { data, error } = await supabase.rpc('get_owners_decrypted', { 
      p_clinic_id: 'c0000000-0000-0000-0000-000000000001', 
      p_key: 'test' 
  })
  
  if (error) {
      console.log('RPC Error:', error.message)
      if (error.message.includes('pgp_sym_decrypt(text, text)')) {
          console.log('CONFIRMED: One of the columns is TEXT but passed to pgp_sym_decrypt as-is.')
      }
  }
}

checkActualTypes()
