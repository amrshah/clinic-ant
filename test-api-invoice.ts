import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function testApiInvoice() {
  const ownerId = '60c15f16-c681-4bea-90ed-4c771ec3f2ac'
  
  console.log('--- Testing POST /api/invoices ---')
  try {
    const response = await axios.post('http://localhost:3000/api/invoices', {
      owner_id: ownerId,
      status: 'draft',
      total_amount: 120,
      items: [
        { title: 'API Test Item', quantity: 1, unit_price: 120, category: 'service' }
      ]
    }, {
      // We need a session or mock auth if the API requires it
      // Since it's local and we use service role in scripts, but API uses user auth
      // This test might fail if not authenticated
    })
    console.log('API Response:', response.data)
  } catch (err: any) {
    console.error('API Error:', err.response?.data || err.message)
  }
}

// testApiInvoice() // Skipping as it needs auth cookie
console.log('Skipping API test as it requires authentication. Using direct DB test instead.')
