import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkColumns() {
  const { data, error } = await supabase.from('owners').select('*').limit(0)
  // Selecting 0 rows still gives us the columns if we check the response headers or metadata
  // But with supabase-js it's easier to just use a dummy query
  
  const { data: cols, error: colErr } = await supabase.rpc('get_table_columns', { p_table_name: 'owners' })
  if (colErr) {
    console.log('RPC get_table_columns not found, trying direct query on information_schema...')
    // Note: This usually requires a special RPC or being admin
    const { data: info, error: infoErr } = await supabase.from('owners').select('id').limit(1)
    console.log('Can access owners table')
  } else {
    console.log('Owners columns from RPC:', cols)
  }
}

checkColumns()
