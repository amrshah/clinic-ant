import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function listTriggers() {
  const { data, error } = await supabase.rpc('get_triggers')
  if (error) {
    // Fallback to direct query if RPC doesn't exist
    const { data: d2, error: e2 } = await supabase.from('pg_trigger').select('tgname').limit(10)
    if (e2) {
        console.log('Error fetching triggers:', e2.message)
    } else {
        console.log('Triggers (sample):', d2)
    }
  } else {
    console.log('Triggers:', JSON.stringify(data, null, 2))
  }
}

listTriggers()
