import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyTests() {
  console.log('--- Checking for Owners ---')
  const { data: owners } = await supabase.from('owners').select('id, display_name, clinic_id, created_at').order('created_at', { ascending: false }).limit(5)
  console.log('Recent Owners:', owners)

  console.log('--- Checking for Invoices ---')
  const { data: invoices } = await supabase.from('invoices').select('id, owner_id, total_amount, clinic_id, status, created_at').order('created_at', { ascending: false }).limit(5)
  console.log('Recent Invoices:', invoices)
}

verifyTests()
