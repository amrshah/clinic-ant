import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  const { data, error } = await supabase.from('owners').select('*').eq('id', '67618cf9-086a-4f1f-bd97-365a95fba639').single()
  if (error) {
    console.error('Error:', error.message)
  } else {
    console.log('Owner record:', data)
  }
}

check()
