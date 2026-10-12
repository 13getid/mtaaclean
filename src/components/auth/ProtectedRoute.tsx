/**
 * components/auth/ProtectedRoute.tsx
 *
 * Route guard that ensures the visitor is authenticated via Clerk.
 * If not authenticated, redirects to /sign-in while preserving return URL.
 */

import { useAuth } from '@clerk/clerk-react'
import { Navigate, useLocation } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoaded, isSignedIn } = useAuth()
  const location = useLocation()

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-brand-offwhite flex items-center justify-center p-6">
        <div className="border-2 border-brand-ink bg-white p-6 shadow-brutal flex items-center gap-3">
          <span
            className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-brand-ink border-t-transparent"
            aria-hidden="true"
          />
          <span className="font-semibold text-brand-ink font-body">Verifying session...</span>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />
  }

  return <>{children}</>
}
