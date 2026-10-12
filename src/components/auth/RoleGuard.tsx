/**
 * components/auth/RoleGuard.tsx
 *
 * Route guard that restricts access based on application role (resident, staff, admin).
 * Redirects or renders a 403 Forbidden state when unauthorized.
 */

import { ShieldAlert, ArrowLeft } from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'
import { Button } from '@/components/ui/Button'
import type { UserRole } from '@/types'

interface RoleGuardProps {
  allowedRoles: UserRole[]
  children: React.ReactNode
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { role, isLoading } = useProfile()

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-6">
        <div className="border-2 border-brand-ink bg-white p-6 shadow-brutal flex items-center gap-3">
          <span
            className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-brand-ink border-t-transparent"
            aria-hidden="true"
          />
          <span className="font-semibold text-brand-ink font-body">Checking permissions...</span>
        </div>
      </div>
    )
  }

  if (!allowedRoles.includes(role)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full border-2 border-brand-ink bg-white p-8 shadow-brutal text-center flex flex-col items-center gap-6">
          <div className="w-16 h-16 bg-brand-red border-2 border-brand-ink flex items-center justify-center">
            <ShieldAlert size={32} className="text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-brand-ink mb-2">Access Denied</h1>
            <p className="text-sm text-brand-ink/70">
              This area is restricted to authorized {allowedRoles.join(' or ')} accounts. Your current
              role is <span className="font-bold uppercase tracking-wider">{role}</span>.
            </p>
          </div>
          <Button variant="primary" size="md" to="/">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
