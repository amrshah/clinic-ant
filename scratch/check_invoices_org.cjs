const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function check() {
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('id, organization_id, status')
    .limit(10)

  if (error) {
    console.error('Invoices Error:', error)
    return
  }

  console.log('Invoices in DB:', JSON.stringify(invoices, null, 2))
}

check()
