import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkVetProfile() {
  const { data, error } = await supabase.from('profiles').select('*').eq('role', 'veterinarian')
  if (error) {
    console.log('Error fetching vet profiles:', error.message)
  } else {
    console.log('Vet profiles:', JSON.stringify(data, null, 2))
  }
}

checkVetProfile()
