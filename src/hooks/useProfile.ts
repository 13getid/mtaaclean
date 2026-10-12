/**
 * hooks/useProfile.ts
 *
 * Custom hook to load the logged-in user's profile and application role.
 * Queries Supabase `profiles` using the user's Clerk JWT.
 */

import { useState, useEffect } from 'react'
import { useUser, useAuth } from '@clerk/clerk-react'
import { getAuthenticatedSupabaseClient } from '@/lib/supabase'
import type { Profile, UserRole } from '@/types'

export function useProfile() {
  const { user, isLoaded: isUserLoaded } = useUser()
  const { getToken } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [role, setRole] = useState<UserRole>('resident')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchProfile() {
      if (!isUserLoaded) return
      if (!user) {
        if (isMounted) {
          setProfile(null)
          setRole('resident')
          setIsLoading(false)
        }
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Request Supabase JWT template if configured in Clerk, or default token
        const token = await getToken({ template: 'supabase' }).catch(() => getToken())
        const client = getAuthenticatedSupabaseClient(token)

        const { data, error: queryError } = await client
          .from('profiles')
          .select('*')
          .eq('clerk_user_id', user.id)
          .maybeSingle()

        if (queryError) {
          console.warn('Could not fetch profile from Supabase:', queryError.message)
          // Fallback: check Clerk publicMetadata
          const clerkRole = (user.publicMetadata?.role as UserRole) || 'resident'
          if (isMounted) {
            setRole(clerkRole)
          }
        } else if (data && isMounted) {
          setProfile(data as Profile)
          setRole(data.role as UserRole)
        } else if (isMounted) {
          // If no row exists yet, check Clerk metadata
          const clerkRole = (user.publicMetadata?.role as UserRole) || 'resident'
          setRole(clerkRole)
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Error fetching user profile')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchProfile()

    return () => {
      isMounted = false
    }
  }, [user, isUserLoaded, getToken])

  return {
    profile,
    role,
    isLoading: !isUserLoaded || isLoading,
    error,
    isStaff: role === 'staff' || role === 'admin',
    isAdmin: role === 'admin',
  }
}
