import { useState } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { getAuthenticatedSupabaseClient } from '@/lib/supabase'
import { API_BASE_URL } from '@/lib/constants'
import type { ReportFormData } from '../schemas/reportSchema'

export function useSubmitReport() {
  const { getToken } = useAuth()
  const { user } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitReport = async (formData: ReportFormData) => {
    if (!user) {
      throw new Error('You must be signed in to submit a report.')
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // 1. Get Clerk JWT token
      const token = await getToken({ template: 'supabase' }).catch(() => getToken())
      if (!token) {
        throw new Error('Authentication token unavailable. Please sign in again.')
      }

      // 2. Upload evidence photo to Supabase Storage
      const file = formData.photo
      const fileExt = file.name.split('.').pop() || 'jpg'
      const timestamp = Date.now()
      const storagePath = `${user.id}/${timestamp}_${Math.random().toString(36).substring(7)}.${fileExt}`

      const supabase = getAuthenticatedSupabaseClient(token)
      const { error: uploadError } = await supabase.storage
        .from('report-photos')
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) {
        throw new Error(`Failed to upload evidence photograph: ${uploadError.message}`)
      }

      // 3. Submit report to trusted FastAPI backend
      const response = await fetch(`${API_BASE_URL}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          description: formData.description,
          latitude: formData.latitude,
          longitude: formData.longitude,
          address_hint: formData.address_hint || null,
          area_name: 'Tudor',
          photo_storage_path: storagePath,
          photo_mime_type: file.type,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.detail || 'Failed to submit report to server.'
        throw new Error(errorMessage)
      }

      const result = await response.json()
      return result
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.'
      setError(msg)
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    submitReport,
    isSubmitting,
    error,
  }
}
