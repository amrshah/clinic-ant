import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function listColumns() {
  // Use a query that will fail if type is not what we expect, to probe
  const columns = [
      'first_name_enc', 'first_name_encrypted', 'email_enc', 'email_encrypted'
  ]
  
  for (const col of columns) {
      try {
          const { data, error } = await supabase.from('owners').select(`${col}`).limit(1)
          if (error) {
              console.log(`${col} error:`, error.message)
          } else {
              console.log(`${col} value:`, data[0]?.[col] ? 'PRESENT' : 'NULL')
          }
      } catch (err) {
          console.log(`${col} catch:`, err)
      }
  }
}

listColumns()
