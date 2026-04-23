import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTriggers() {
  const { data, error } = await supabase.rpc('inspect_triggers', { table_name: 'owners' })
  if (error) {
    console.log('Error inspecting owners triggers:', error.message)
    // Try another way: query information_schema
    const { data: d2, error: e2 } = await supabase.from('information_schema.triggers').select('trigger_name, event_manipulation, event_object_table').eq('event_object_table', 'owners')
    if (e2) console.log('Error 2:', e2.message)
    else console.log('Owners triggers:', d2)
  } else {
    console.log('Owners triggers:', data)
  }

  const { data: d3, error: e3 } = await supabase.rpc('inspect_triggers', { table_name: 'invoices' })
  if (e3) {
      const { data: d4, error: e4 } = await supabase.from('information_schema.triggers').select('trigger_name').eq('event_object_table', 'invoices')
      if (e4) console.log('Error 4:', e4.message)
      else console.log('Invoices triggers:', d4)
  } else {
      console.log('Invoices triggers:', d3)
  }
}

checkTriggers()
