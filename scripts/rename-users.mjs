import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function renameUsers() {
  console.log('Fetching users from Supabase Auth...')
  const { data: { users }, error } = await supabase.auth.admin.listUsers()
  
  if (error) {
    console.error('Error listing users:', error.message)
    return
  }

  console.log(`Found ${users.length} users. Checking for @clinicant.demo emails...\n`)

  for (const user of users) {
    if (user.email.endsWith('@clinicant.demo')) {
      const newEmail = user.email.replace('@clinicant.demo', '@clinicflow.demo')
      console.log(`🔄 Updating: ${user.email} -> ${newEmail}`)
      
      // 1. Update Auth User
      const { error: authError } = await supabase.auth.admin.updateUserById(
        user.id,
        { email: newEmail }
      )
      
      if (authError) {
        console.error(`  ❌ Failed to update Auth:`, authError.message)
        continue
      }

      // 2. Update Public Profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ email: newEmail })
        .eq('id', user.id)

      if (profileError) {
        console.error(`  ❌ Failed to update Profile:`, profileError.message)
      } else {
        console.log(`  ✅ Successfully updated ${user.email}`)
      }
    } else {
      console.log(`  ⏭️  Skipping: ${user.email} (no change needed)`)
    }
  }
}

renameUsers()
  .then(() => console.log('\nMigration finished.'))
  .catch((err) => console.error('\nMigration failed:', err))
