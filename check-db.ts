import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkOwners() {
  const { data, error } = await supabase.from('owners').select('id, display_name, clinic_id').limit(5)
  if (error) {
    console.error('Error:', error.message)
  } else {
    console.log('Owners:', data)
  }
}

checkOwners()
