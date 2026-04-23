import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function audit() {
  const tables = ['owners', 'pets', 'appointments', 'profiles', 'clinics', 'invoices', 'inventory_items', 'inventory_transactions']
  let report = '# Database Schema Audit\n\n'

  for (const table of tables) {
    report += `## Table: ${table}\n`
    const { data, error } = await supabase.from(table).select('*').limit(1)
    if (error) {
      report += `Error: ${error.message}\n\n`
    } else {
      const columns = Object.keys(data[0] || {})
      report += 'Columns:\n'
      columns.forEach(col => {
        report += `- ${col}\n`
      })
      report += '\n'
    }
  }

  console.log(report)
}

audit()
