import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkRPCs() {
  const { data, error } = await supabase.rpc('add_owner_encrypted', { 
    p_first_name: 'test', 
    p_last_name: 'test', 
    p_email: 'test@test.com',
    p_phone: '123',
    p_address: '123',
    p_city: 'test',
    p_province: 'test',
    p_postal_code: '123',
    p_clinic_id: '00000000-0000-0000-0000-000000000000',
    p_key: 'test' 
  })
  console.log('add_owner_encrypted check:', error?.message)
}

checkRPCs()
