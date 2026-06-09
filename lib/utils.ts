import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatStaffName(firstName: string, lastName: string, role?: string) {
  const name = `${firstName} ${lastName}`
  if (role === 'veterinarian' && !firstName.toLowerCase().startsWith('dr.')) {
    return `Dr. ${name}`
  }
  return name
}
