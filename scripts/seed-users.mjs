import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const ORG_ID = 'a0000000-0000-0000-0000-000000000001'
const CLINIC_TORONTO = 'c0000000-0000-0000-0000-000000000001'
const CLINIC_OTTAWA = 'c0000000-0000-0000-0000-000000000002'

const users = [
  {
    email: 'admin@clinicflow.demo',
    password: 'Admin123!',
    first_name: 'Sarah',
    last_name: 'Chen',
    role: 'administrator',
    clinic_id: CLINIC_TORONTO,
  },
  {
    email: 'vet@clinicflow.demo',
    password: 'Vet12345!',
    first_name: 'Dr. James',
    last_name: 'Wilson',
    role: 'veterinarian',
    clinic_id: CLINIC_TORONTO,
  },
  {
    email: 'nurse@clinicflow.demo',
    password: 'Nurse123!',
    first_name: 'Emily',
    last_name: 'Martinez',
    role: 'nurse',
    clinic_id: CLINIC_TORONTO,
  },
  {
    email: 'reception@clinicflow.demo',
    password: 'Recep123!',
    first_name: 'David',
    last_name: 'Thompson',
    role: 'reception',
    clinic_id: CLINIC_TORONTO,
  },
  {
    email: 'tech@clinicflow.demo',
    password: 'Tech1234!',
    first_name: 'Lisa',
    last_name: 'Park',
    role: 'technician',
    clinic_id: CLINIC_OTTAWA,
  },
]

console.log('Seeding demo users...\n')

for (const u of users) {
  // First check if user already exists by trying to list
  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const existing = existingUsers?.users?.find((eu) => eu.email === u.email)

  if (existing) {
    console.log(`  SKIP  ${u.email} (already exists)`)
    // Make sure the profile has the right role and clinic
    await supabase
      .from('profiles')
      .update({ role: u.role, default_clinic_id: u.clinic_id })
      .eq('id', existing.id)
    continue
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: u.email,
    password: u.password,
    email_confirm: true,
    user_metadata: {
      first_name: u.first_name,
      last_name: u.last_name,
      organization_id: ORG_ID,
      role: u.role,
    },
  })

  if (error) {
    console.error(`  FAIL  ${u.email}: ${error.message}`)
    continue
  }

  // Set the default clinic on the profile
  if (data.user) {
    await supabase
      .from('profiles')
      .update({ default_clinic_id: u.clinic_id })
      .eq('id', data.user.id)
  }

  console.log(`  OK    ${u.email} (${u.role})`)
}

console.log('\n--- Demo Credentials ---\n')
console.log('| Role           | Email                    | Password    |')
console.log('|----------------|--------------------------|-------------|')
for (const u of users) {
  const pad = (s, n) => s + ' '.repeat(Math.max(0, n - s.length))
  console.log(`| ${pad(u.role, 14)} | ${pad(u.email, 24)} | ${pad(u.password, 11)} |`)
}
console.log('\nDone!')

