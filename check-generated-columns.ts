import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkGenerated() {
  const { data, error } = await supabase.from('owners').select('*').limit(1)
  if (error) console.log('Error:', error.message)
  else console.log('Columns:', Object.keys(data[0] || {}))
}

checkGenerated()
