const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function check() {
  const { data: users, error: authError } = await supabase.auth.admin.listUsers()
  if (authError) {
    console.error('Auth Error:', authError)
    return
  }

  const adminUser = users.users.find(u => u.email.toLowerCase() === 'admin@clinicflow.demo')
  if (!adminUser) {
    console.error('Admin user not found in Auth')
    return
  }

  console.log('Admin Auth User ID:', adminUser.id)

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', adminUser.id)
    .single()

  if (profileError) {
    console.error('Profile Error:', profileError)
    return
  }

  console.log('Admin Profile:', JSON.stringify(profile, null, 2))
}

check()
