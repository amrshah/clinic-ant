import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testInvoice() {
  const orgId = 'a0000000-0000-0000-0000-000000000001'
  const ownerId = '60c15f16-c681-4bea-90ed-4c771ec3f2ac'
  const clinicId = 'c0000000-0000-0000-0000-000000000001'

  console.log('--- Testing Invoice Insert ---')
  const { data, error } = await supabase.from('invoices').insert({
    organization_id: orgId,
    clinic_id: clinicId,
    owner_id: ownerId,
    status: 'draft',
    total_amount: 100,
    tax_amount: 13,
    currency: 'CAD',
    inventory_deducted: false
  }).select().single()

  if (error) {
    console.error('Invoice Error:', error.message)
  } else {
    console.log('Invoice Created:', data.id)
  }
}

testInvoice()
