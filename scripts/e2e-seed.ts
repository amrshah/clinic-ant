import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const API_BASE = 'http://localhost:3000/api'

// Initialize clients
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function fetchAPI(endpoint: string, method: string, body: any, token: string) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: body ? JSON.stringify(body) : undefined
    })

    if (!res.ok) {
        let errStr = res.statusText
        try {
            const errBody = await res.json()
            errStr = JSON.stringify(errBody)
        } catch { }
        throw new Error(`API Error ${res.status} on ${method} ${endpoint}: ${errStr}`)
    }
    return res.json()
}

async function processInventoryDeduction(supabase: any, invoiceId: string, userId: string) {
    // NOTE: invoice_items table is missing, so this will fail to fetch items.
    // 1. Fetch all items for this invoice that are linked to inventory
    const { data: items, error: itemsError } = await supabase
        .from('invoice_items')
        .select('item_id, quantity, title')
        .eq('invoice_id', invoiceId)
        .not('item_id', 'is', null)

    if (itemsError || !items) {
        console.log('Skipping deduction: invoice_items table missing or error')
        return
    }
    if (items.length === 0) return

    // 2. Create inventory transactions
    const transactions = items.map((i: any) => ({
        item_id: i.item_id,
        type: 'out',
        quantity: i.quantity,
        reason: `Auto-deducted for Invoice ${invoiceId.split('-')[0].toUpperCase()}`,
        created_by: userId
    }))

    await supabase.from('inventory_transactions').insert(transactions)
    await supabase.from('invoices').update({ inventory_deducted: true }).eq('id', invoiceId)
}

async function run() {
    console.log('🚀 Starting End-to-End API Seeder')

    // 1. Purge data using Service Role (dangerous, handles RLS bypass)
    console.log('\n🧹 Purging existing development data...')
    const tablesToPurge = [
        'inventory_transactions',
        'invoices',
        'medical_records',
        'appointments',
        'pets',
        'owners',
        'inventory_items'
    ]

    for (const table of tablesToPurge) {
        const { error } = await supabaseAdmin.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
        if (error) {
            console.error(`Failed to purge ${table}:`, error.message)
        } else {
            console.log(`✅ Purged ${table}`)
        }
    }

    // 2. Authenticate
    console.log('\n🔐 Authenticating as admin@ClinicFlow.demo...')
    const { data: authData, error: authErr } = await supabaseClient.auth.signInWithPassword({
        email: 'admin@ClinicFlow.demo',
        password: 'Admin123!'
    })

    if (authErr || !authData.session) {
        throw new Error(`Auth failed: ${authErr?.message}`)
    }

    const token = authData.session.access_token

    const { data: adminProfile } = await supabaseAdmin.from('profiles').select('organization_id, default_clinic_id').eq('id', authData.session.user.id).single()
    if (!adminProfile) throw new Error('Admin profile not found')

    const { data: vets } = await supabaseAdmin.from('profiles')
        .select('id, default_clinic_id')
        .eq('role', 'veterinarian')
        .eq('organization_id', adminProfile.organization_id)
        .not('default_clinic_id', 'is', null)
        
    const vet = vets && vets.length > 0 ? vets[0] : null
    if (!vet) throw new Error('No veterinarian profile found in admin organization!')

    // Get a valid clinic ID from the admin or vet's profile
    const clinicId = vet.default_clinic_id || adminProfile.default_clinic_id
    
    if (!clinicId) throw new Error('No clinic found for veterinarian!')

    const qs = `?clinicId=${clinicId}`

    // 3. Seed Inventory via API
    console.log('\n📦 Seeding Inventory...')
    const inventoryData = [
        { name: 'Rabies Vaccine (1yr)', sku: 'VACC-RAB-1', category: 'vaccine', unit: 'dose', current_stock: 50, low_stock_threshold: 10, price: 25.00, cost: 8.00 },
        { name: 'FVRCP Vaccine', sku: 'VACC-FVRCP', category: 'vaccine', unit: 'dose', current_stock: 40, low_stock_threshold: 10, price: 30.00, cost: 10.00 },
        { name: 'Amoxicillin 250mg', sku: 'MED-AMOX-250', category: 'medication', unit: 'pill', current_stock: 500, low_stock_threshold: 50, price: 0.50, cost: 0.10 },
        { name: 'Bravecto Chew (Large)', sku: 'MED-BRAV-L', category: 'medication', unit: 'chew', current_stock: 20, low_stock_threshold: 5, price: 65.00, cost: 40.00 },
        { name: 'Metacam 1.5mg/ml', sku: 'MED-META-15', category: 'medication', unit: 'bottle', current_stock: 15, low_stock_threshold: 5, price: 45.00, cost: 25.00 },
    ]
    const createdInventory = []
    for (const item of inventoryData) {
        const { data, error } = await supabaseAdmin.from('inventory_items').insert({
            ...item,
            organization_id: adminProfile.organization_id,
            clinic_id: clinicId
        }).select().single()
        
        if (error) throw new Error(`Failed to create inventory item: ${error.message}`)
        
        createdInventory.push(data)
        console.log(`  + Created inventory: ${data.name}`)
    }

    // 4. Seed Owners
    console.log('\n👥 Seeding Owners...')
    const ownersData = [
        { display_name: 'John Doe' },
        { display_name: 'Jane Smith' },
        { display_name: 'Alice Johnson' }
    ]
    const createdOwners = []
    for (const owner of ownersData) {
        const { data, error } = await supabaseAdmin.from('owners').insert({
            ...owner,
            organization_id: adminProfile.organization_id,
            clinic_id: clinicId
        }).select().single()
        
        if (error) throw new Error(`Failed to create owner: ${error.message}`)
        
        createdOwners.push(data)
        console.log(`  + Created owner: ${data.display_name}`)
    }

    // 5. Seed Pets
    console.log('\n🐾 Seeding Pets...')
    const petsData = [
        { name: 'Rex', species: 'Dog', breed: 'German Shepherd', owner_id: createdOwners[0].id, weight: 35.5, date_of_birth: '2020-05-10' },
        { name: 'Mittens', species: 'Cat', breed: 'Domestic Shorthair', owner_id: createdOwners[1].id, weight: 4.2, date_of_birth: '2021-08-15' },
        { name: 'Bella', species: 'Dog', breed: 'Golden Retriever', owner_id: createdOwners[2].id, weight: 28.0, date_of_birth: '2019-11-20' },
    ]
    const createdPets = []
    for (const pet of petsData) {
        const { data, error } = await supabaseAdmin.from('pets').insert({
            ...pet,
            organization_id: adminProfile.organization_id,
            clinic_id: clinicId
        }).select().single()
        
        if (error) throw new Error(`Failed to create pet: ${error.message}`)
        
        createdPets.push(data)
        console.log(`  + Created pet: ${data.name}`)
    }

    // 6. Seed Appointments
    console.log('\n📅 Seeding Appointments...')
    const today = new Date().toISOString().split('T')[0]
    const aptsData = [
        { pet_id: createdPets[0].id, owner_id: createdOwners[0].id, veterinarian_id: vet.id, date: today, time: '09:00', type: 'checkup', status: 'completed' },
        { pet_id: createdPets[1].id, owner_id: createdOwners[1].id, veterinarian_id: vet.id, date: today, time: '10:30', type: 'vaccination', status: 'billing' },
        { pet_id: createdPets[2].id, owner_id: createdOwners[2].id, veterinarian_id: vet.id, date: today, time: '14:00', type: 'checkup', status: 'scheduled' },
    ]
    const createdAppointments = []
    for (const apt of aptsData) {
        // Create appointment directly
        const { data: created, error } = await supabaseAdmin.from('appointments').insert({
            ...apt,
            organization_id: adminProfile.organization_id,
            clinic_id: clinicId
        }).select().single()
        
        if (error) throw new Error(`Failed to create appointment: ${error.message}`)
        
        createdAppointments.push(created)
        console.log(`  + Created appointment for ${apt.time}`)

        // If completed, add Medical Record
        if (apt.status === 'completed') {
            await fetchAPI(`/medical-records${qs}`, 'POST', {
                pet_id: apt.pet_id,
                appointment_id: created.id,
                title: 'Annual Checkup',
                type: 'note',
                description: 'Patient is healthy. Heart and lungs sound normal. Teeth are in good condition.',
                date: today
            }, token)
            console.log(`    -> Created medical record for completed appointment`)
        }
    }

    // 7. Seed Invoices
    console.log('\n🧾 Seeding Invoices & Deducting Inventory...')
    // Invoice for Rex (completed apt) -> Paid
    const { data: inv1, error: inv1Error } = await supabaseAdmin.from('invoices').insert({
        organization_id: adminProfile.organization_id,
        clinic_id: clinicId,
        owner_id: createdOwners[0].id,
        appointment_id: createdAppointments[0].id,
        status: 'draft',
        total_amount: 0,
        tax_amount: 0,
        currency: 'USD',
        notes: 'Annual checkup fees'
    }).select().single()
    
    if (inv1Error) throw new Error(`Invoice 1 creation failed: ${inv1Error.message}`)
    
    // Add line item (Rabies Vaccine)
    // NOTE: invoice_items table is currently missing from the database schema!
    // const { error: itemsError } = await supabaseAdmin.from('invoice_items').insert({
    //     invoice_id: inv1.id,
    //     title: createdInventory[0].name,
    //     quantity: 1,
    //     unit_price: createdInventory[0].price,
    //     total_price: createdInventory[0].price,
    //     category: 'product',
    //     item_id: createdInventory[0].id
    // })
    // if (itemsError) throw new Error(`Invoice item creation failed: ${itemsError.message}`)

    // Patch to 'paid' to trigger inventory deduction
    await supabaseAdmin.from('invoices').update({
        status: 'paid',
        total_amount: createdInventory[0].price
    }).eq('id', inv1.id)
    
    // Explicitly call the deduction logic (what the API would do)
    console.log('    -> Processing inventory deduction...')
    await processInventoryDeduction(supabaseAdmin as any, inv1.id, authData.session.user.id)
    
    console.log(`  + Paid invoice generated for ${createdOwners[0].display_name}`)

    // Invoice for Mittens (billing apt) -> Draft
    const { data: inv2, error: inv2Error } = await supabaseAdmin.from('invoices').insert({
        organization_id: adminProfile.organization_id,
        clinic_id: clinicId,
        owner_id: createdOwners[1].id,
        appointment_id: createdAppointments[1].id,
        status: 'draft',
        total_amount: 0,
        tax_amount: 0,
        currency: 'USD',
        notes: 'Vaccination fees'
    }).select().single()
    if (inv2Error) throw new Error(`Invoice 2 creation failed: ${inv2Error.message}`)
    console.log(`  + Draft invoice generated for ${createdOwners[1].display_name}`)

    console.log('\n🎉 End-to-End Seeding Complete!')
}

run().catch(console.error)

