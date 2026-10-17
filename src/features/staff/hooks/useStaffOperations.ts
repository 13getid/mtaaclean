import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { API_BASE_URL, type ReportStatus } from '@/lib/constants'

export interface StaffReportItem {
  id: string
  reporter_id: string
  description: string
  status: ReportStatus
  area_name?: string
  latitude: number
  longitude: number
  address_hint?: string
  submitted_at: string
  updated_at: string
  reporter_name?: string
  reporter_email?: string
  photos_count: number
  assigned_to_name?: string
}

export interface StaffMember {
  id: string
  clerk_user_id: string
  display_name: string
  email: string
  role: string
}

export function useStaffOperations() {
  const { getToken } = useAuth()
  const [reports, setReports] = useState<StaffReportItem[]>([])
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchQueue = useCallback(
    async (statusFilter: string = 'all', searchQuery: string = '') => {
      try {
        setIsLoading(true)
        setError(null)
        const token = await getToken({ template: 'supabase' }).catch(() => getToken())
        const params = new URLSearchParams()
        if (statusFilter && statusFilter !== 'all') params.append('status_filter', statusFilter)
        if (searchQuery.trim()) params.append('search', searchQuery.trim())

        const res = await fetch(`${API_BASE_URL}/api/staff/reports?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.detail || 'Failed to fetch staff queue')
        }

        const data = await res.json()
        setReports(data || [])
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error loading staff reports.')
      } finally {
        setIsLoading(false)
      }
    },
    [getToken],
  )

  const fetchStaffMembers = useCallback(async () => {
    try {
      const token = await getToken({ template: 'supabase' }).catch(() => getToken())
      const res = await fetch(`${API_BASE_URL}/api/staff/members`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (res.ok) {
        const data = await res.json()
        setStaffMembers(data || [])
      }
    } catch {
      // Non-critical background fetch
    }
  }, [getToken])

  const assignReport = async (reportId: string, assignedTo: string, notes?: string) => {
    const token = await getToken({ template: 'supabase' }).catch(() => getToken())
    const res = await fetch(`${API_BASE_URL}/api/staff/reports/${reportId}/assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ assigned_to: assignedTo, notes }),
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData.detail || 'Assignment failed')
    }
    return res.json()
  }

  const updateStatus = async (
    reportId: string,
    newStatus: ReportStatus,
    notes?: string,
    afterPhotoPath?: string,
    afterPhotoMime?: string,
  ) => {
    const token = await getToken({ template: 'supabase' }).catch(() => getToken())
    const res = await fetch(`${API_BASE_URL}/api/staff/reports/${reportId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        new_status: newStatus,
        notes,
        after_photo_storage_path: afterPhotoPath,
        after_photo_mime_type: afterPhotoMime,
      }),
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData.detail || 'Status transition rejected')
    }
    return res.json()
  }

  useEffect(() => {
    fetchQueue()
    fetchStaffMembers()
  }, [fetchQueue, fetchStaffMembers])

  return {
    reports,
    staffMembers,
    isLoading,
    error,
    fetchQueue,
    assignReport,
    updateStatus,
  }
}
