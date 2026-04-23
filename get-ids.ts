import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function getIds() {
  const { data: orgs } = await supabase.from('organizations').select('id').limit(1)
  const { data: owners } = await supabase.from('owners').select('id, clinic_id, organization_id').order('created_at', { ascending: false }).limit(1)
  console.log('Org ID:', orgs?.[0]?.id)
  console.log('Owner:', owners?.[0])
}

getIds()
