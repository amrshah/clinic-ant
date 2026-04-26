import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function cleanupNames() {
  console.log('Fetching profiles from Supabase...')
  const { data, error } = await supabase.from('profiles').select('id, first_name, role')
  
  if (error) {
    console.error('Error fetching profiles:', error.message)
    return
  }

  console.log(`Found ${data.length} profiles. Checking for redundant "Dr. " prefixes...\n`)

  for (const profile of data) {
    if (profile.first_name && profile.first_name.startsWith('Dr. ')) {
      const newName = profile.first_name.replace(/^Dr\.\s+/i, '')
      console.log(`🔄 Cleaning up: ${profile.first_name} -> ${newName}`)
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ first_name: newName })
        .eq('id', profile.id)

      if (updateError) {
        console.error(`  ❌ Failed to update ${profile.first_name}:`, updateError.message)
      } else {
        console.log(`  ✅ Successfully cleaned ${profile.first_name}`)
      }
    } else {
      console.log(`  ⏭️  Skipping: ${profile.first_name || 'N/A'} (no cleanup needed)`)
    }
  }
}

cleanupNames()
  .then(() => console.log('\nCleanup finished.'))
  .catch((err) => console.error('\nCleanup failed:', err))
