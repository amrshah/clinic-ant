import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function listRLS() {
  const { data, error } = await supabase.rpc('get_rls_policies')
  if (error) {
    console.log('Error fetching RLS:', error.message)
  } else {
    console.log('RLS Policies:', JSON.stringify(data, null, 2))
  }
}

listRLS()
