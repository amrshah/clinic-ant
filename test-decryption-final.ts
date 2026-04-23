import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const ENCRYPTION_KEY = process.env.OWNER_PII_ENCRYPTION_KEY || 'default-dev-key-change-me'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDecryption() {
  const ottawaId = 'c0000000-0000-0000-0000-000000000002'
  
  console.log('--- Testing get_owners_decrypted for Ottawa ---')
  const { data, error } = await supabase.rpc('get_owners_decrypted', { 
    p_clinic_id: ottawaId, 
    p_key: ENCRYPTION_KEY 
  })
  
  if (error) {
    console.error('Decryption Error:', error.message)
  } else {
    console.log('Decrypted Owners:', data)
  }
}

testDecryption()
