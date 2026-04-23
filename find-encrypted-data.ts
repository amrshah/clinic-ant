import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function findData() {
  const { data: owners } = await supabase.from('owners')
    .select('*')
    .or('first_name_enc.not.is.null,first_name_encrypted.not.is.null')
    .limit(1)
  
  if (owners && owners[0]) {
      console.log('ID:', owners[0].id)
      console.log('first_name_enc type:', typeof owners[0].first_name_enc)
      console.log('first_name_encrypted type:', typeof owners[0].first_name_encrypted)
  } else {
      console.log('No encrypted records found.')
  }
}

findData()
