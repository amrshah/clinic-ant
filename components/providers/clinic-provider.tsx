'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface ClinicContextType {
  currentClinicId: string | null
  setCurrentClinicId: (id: string | null) => void
  isLoading: boolean
}

const ClinicContext = createContext<ClinicContextType>({
  currentClinicId: null,
  setCurrentClinicId: () => {},
  isLoading: true,
})

export const useClinic = () => useContext(ClinicContext)

export function ClinicProvider({ children }: { children: React.ReactNode }) {
  const [currentClinicId, setCurrentClinicId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize from localStorage or first available clinic
  useEffect(() => {
    const saved = localStorage.getItem('currentClinicId')
    if (saved) {
      setCurrentClinicId(saved)
    }
    setIsLoading(false)
  }, [])

  const handleSetClinic = (id: string | null) => {
    setCurrentClinicId(id)
    if (id) {
      localStorage.setItem('currentClinicId', id)
    } else {
      localStorage.removeItem('currentClinicId')
    }
  }

  return (
    <ClinicContext.Provider 
      value={{ 
        currentClinicId, 
        setCurrentClinicId: handleSetClinic,
        isLoading 
      }}
    >
      {children}
    </ClinicContext.Provider>
  )
}
