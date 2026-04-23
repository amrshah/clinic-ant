import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTypes() {
  const { data, error } = await supabase.from('owners').select('*').limit(1)
  if (error) {
    console.log('Error:', error.message)
    return
  }
  // Try to find a way to get types via RPC or query
  // Since we can't query information_schema, we guess from values
  if (data[0]) {
      console.log('first_name_enc type hint:', typeof data[0].first_name_enc)
      console.log('first_name_enc value:', data[0].first_name_enc)
  }
}

checkTypes()
