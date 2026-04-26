import React from 'react'
import { renderToString } from 'react-dom/server'
import { AppointmentFormDialog } from './components/appointments/appointment-form-dialog'

// Mock props
const props = {
  open: true,
  onOpenChange: () => {},
  appointment: null,
}

try {
  console.log('Attempting to render AppointmentFormDialog...')
  // Note: This will likely fail because of missing contexts (Clinic, Auth, SWR)
  // but it should at least tell us if 'Select' is defined.
  // We wrap it in the necessary providers if possible, or just catch the specific error.
  const html = renderToString(<AppointmentFormDialog {...props} />)
  console.log('Render successful (unexpectedly, given missing providers)')
} catch (error) {
  console.error('Render failed as expected, checking error type...')
  console.error(error)
  if (error instanceof ReferenceError) {
    console.error('CRITICAL: ReferenceError detected!')
  }
}
