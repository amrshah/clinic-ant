import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkOttawa() {
  const { data: clinics } = await supabase.from('clinics').select('*')
  console.log('Clinics:', clinics?.map(c => ({ id: c.id, name: c.name })))

  const { data: owners } = await supabase.from('owners').select('id, display_name, clinic_id, first_name_enc, first_name_encrypted')
  console.log('Owners (last 5):', owners?.slice(-5))
}

checkOttawa()
