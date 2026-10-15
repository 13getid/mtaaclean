import { useState, useEffect, useCallback } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { getAuthenticatedSupabaseClient } from '@/lib/supabase'
import type { Report } from '@/types'

export function useMyReports() {
  const { getToken } = useAuth()
  const { user } = useUser()
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReports = useCallback(async () => {
    if (!user) return

    try {
      setIsLoading(true)
      setError(null)

      const token = await getToken({ template: 'supabase' }).catch(() => getToken())
      const supabase = getAuthenticatedSupabaseClient(token)

      // Query reports for current resident ordered by submitted_at desc
      const { data, error: queryError } = await supabase
        .from('reports')
        .select(`
          *,
          photos:report_photos(*)
        `)
        .eq('reporter_id', user.id)
        .order('submitted_at', { ascending: false })

      if (queryError) {
        throw queryError
      }

      setReports((data as Report[]) || [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load your reports.')
    } finally {
      setIsLoading(false)
    }
  }, [user, getToken])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  return {
    reports,
    isLoading,
    error,
    refresh: fetchReports,
  }
}
