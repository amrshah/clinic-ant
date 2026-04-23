import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTriggers() {
  const { data, error } = await supabase.from('owners').select('*').limit(0)
  
  const { data: triggers, error: triggerErr } = await supabase.rpc('get_table_triggers', { p_table_name: 'owners' })
  if (triggerErr) {
    console.log('RPC get_table_triggers not found')
  } else {
    console.log('Owners triggers:', triggers)
  }
}

checkTriggers()
