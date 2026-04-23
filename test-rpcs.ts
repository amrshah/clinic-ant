import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testRPCs() {
  const dummyUUID = 'c0000000-0000-0000-0000-000000000001'
  const dummyKey = 'test'

  console.log('Testing get_owners_decrypted...')
  const { error: e1 } = await supabase.rpc('get_owners_decrypted', { p_clinic_id: dummyUUID, p_key: dummyKey })
  if (e1) console.log('get_owners_decrypted error:', e1.message)
  else console.log('get_owners_decrypted: SUCCESS')

  console.log('Testing get_owner_by_id_decrypted...')
  const { error: e2 } = await supabase.rpc('get_owner_by_id_decrypted', { p_owner_id: dummyUUID, p_clinic_id: dummyUUID, p_key: dummyKey })
  if (e2) console.log('get_owner_by_id_decrypted error:', e2.message)
  else console.log('get_owner_by_id_decrypted: SUCCESS')
}

testRPCs()
