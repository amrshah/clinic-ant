import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data, error } = await supabase.from('owners').select('phone').limit(1)
  if (error) {
    console.log('Phone column check:', error.message)
  } else {
    console.log('Phone column EXISTS')
  }

  const { data: emailData, error: emailError } = await supabase.from('owners').select('email').limit(1)
  if (emailError) {
    console.log('Email column check:', emailError.message)
  } else {
    console.log('Email column EXISTS')
  }
}

test()
