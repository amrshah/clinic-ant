import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkViews() {
  const { data, error } = await supabase.from('pg_views').select('viewname').eq('schemaname', 'public')
  if (error) {
      console.log('Error:', error.message)
  } else {
      console.log('Views:', data)
  }
}

checkViews()
