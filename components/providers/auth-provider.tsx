'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { type UserRole } from '@/lib/permissions'
import type { User } from '@supabase/supabase-js'

export interface Profile {
  id: string
  email: string
  role: UserRole | null
  org_id: string | null
  clinic_id: string | null
  first_name: string | null
  last_name: string | null
  needs_setup: boolean
  clinics?: { id: string; name: string; city: string | null; province: string | null } | null
  organizations?: { id: string; name: string } | null
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabaseRef = useRef(createClient())
  const fetchedRef = useRef(false)

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/profile')
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    const supabase = supabaseRef.current
    let mounted = true

    const getUser = async () => {
      if (fetchedRef.current) return
      fetchedRef.current = true
      const { data: { user } } = await supabase.auth.getUser()
      if (!mounted) return
      setUser(user)
      if (user) {
        await fetchProfile()
      }
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return
      const sessionUser = session?.user ?? null
      setUser(sessionUser)
      if (sessionUser) {
        await fetchProfile()
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  const signOut = useCallback(async () => {
    await supabaseRef.current.auth.signOut()
    setUser(null)
    setProfile(null)
    router.push('/auth/login')
  }, [router])

  const refreshProfile = useCallback(async () => {
    await fetchProfile()
  }, [fetchProfile])

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
