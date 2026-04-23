import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function inspectFunctions() {
  // Query pg_proc to get function definitions
  const { data, error } = await supabase.from('pg_proc').select('proname, prosrc').ilike('proname', '%decrypted%')
  if (error) {
    console.log('Error fetching functions:', error.message)
    // Try via RPC if available
    const { data: d2 } = await supabase.rpc('get_function_def', { name: 'get_owners_decrypted' })
    console.log('Definition from RPC:', d2)
  } else {
    data.forEach(f => {
      console.log(`--- ${f.proname} ---`)
      console.log(f.prosrc)
    })
  }
}

inspectFunctions()
