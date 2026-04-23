import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkApts() {
  const { data: apts } = await supabase.from('appointments').select('id, date, time').limit(10)
  console.log('Recent Appointments:', apts)
}

checkApts()
