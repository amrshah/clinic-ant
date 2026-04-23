import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function inspectData() {
  const { data: owners } = await supabase.from('owners').select('*').limit(1)
  if (owners && owners[0]) {
      console.log('first_name_enc:', owners[0].first_name_enc)
      console.log('first_name_encrypted:', owners[0].first_name_encrypted)
  }
}

inspectData()
