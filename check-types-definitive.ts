import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTypes() {
  const { data, error } = await supabase.rpc('get_owners_decrypted', { 
    p_clinic_id: 'c0000000-0000-0000-0000-000000000001', 
    p_key: 'test' 
  })
  
  if (error) {
      console.log('RPC Error:', error.message)
  }

  // Probe with direct select and typeof
  const { data: owners } = await supabase.from('owners').select('*').limit(1)
  if (owners && owners[0]) {
      console.log('first_name_enc type:', typeof owners[0].first_name_enc)
      console.log('first_name_encrypted type:', typeof owners[0].first_name_encrypted)
  }
}

checkTypes()
