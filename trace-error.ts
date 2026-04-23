import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function traceError() {
  console.log('--- Testing basic select on owners ---')
  const { error: e1 } = await supabase.from('owners').select('*').limit(1)
  if (e1) console.log('Error e1:', e1.message)
  else console.log('Success e1')

  console.log('--- Testing select with decryption via RPC ---')
  const { error: e2 } = await supabase.rpc('get_owners_decrypted', { p_clinic_id: 'c0000000-0000-0000-0000-000000000001', p_key: 'test' })
  if (e2) console.log('Error e2:', e2.message)
  else console.log('Success e2')
}

traceError()
