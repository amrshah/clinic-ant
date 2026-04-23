import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function listFunctions() {
  const { data, error } = await supabase.rpc('get_functions_definition')
  if (error) {
    // If get_functions_definition doesn't exist, try querying directly via SQL if possible
    // But I can't run arbitrary SQL. 
    // I'll try to find common ones.
    console.log('Error fetching functions:', error.message)
    
    // Fallback: search for RPC names in the codebase
  } else {
    console.log('Functions:', JSON.stringify(data, null, 2))
  }
}

listFunctions()
