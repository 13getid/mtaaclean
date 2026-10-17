import { useEffect, useState, useCallback } from 'react'
import { Shield, Users, FileText, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@clerk/clerk-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MetricsOverview, type MetricsData } from '@/components/ui/MetricsOverview'
import { API_BASE_URL } from '@/lib/constants'

interface UserProfile {
  id: string
  clerk_user_id: string
  display_name: string
  email: string
  role: 'resident' | 'staff' | 'admin'
  created_at: string
}

interface AuditLogItem {
  id: string
  actor_id: string
  action: string
  target_type?: string
  target_id?: string
  metadata?: Record<string, unknown>
  created_at: string
}

export function AdminDashboardPage() {
  const { getToken } = useAuth()
  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'audit'>('metrics')
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const token = await getToken({ template: 'supabase' }).catch(() => getToken())

      // 1. Metrics
      const metRes = await fetch(`${API_BASE_URL}/api/admin/metrics`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (metRes.ok) setMetrics(await metRes.json())

      // 2. Users
      const usrRes = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (usrRes.ok) setUsers(await usrRes.json())

      // 3. Audit logs
      const audRes = await fetch(`${API_BASE_URL}/api/admin/audit-logs`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (audRes.ok) setAuditLogs(await audRes.json())
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error loading admin data.')
    } finally {
      setIsLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleRoleChange = async (clerkUserId: string, newRole: string) => {
    try {
      setActionMessage(null)
      const token = await getToken({ template: 'supabase' }).catch(() => getToken())
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${clerkUserId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || 'Failed to update role')
      }

      setActionMessage(`Role updated successfully to ${newRole}.`)
      loadData()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error updating role')
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b-2 border-brand-ink">
        <div>
          <div className="inline-flex items-center gap-1.5 border border-brand-ink bg-brand-orange px-2 py-0.5 text-xs font-bold uppercase mb-2">
            <Shield size={13} />
            Administrator Console
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-brand-ink">
            System Administration
          </h1>
          <p className="text-sm text-brand-ink/70 mt-1">
            Oversee user roles, monitor system metrics, and inspect the immutable audit log.
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={loadData}
          leftIcon={<RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />}
        >
          Refresh Console
        </Button>
      </div>

      {actionMessage && (
        <div className="border-2 border-brand-green bg-brand-green/20 p-3 mb-6 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          {actionMessage}
        </div>
      )}

      {error && (
        <div className="border-2 border-brand-red bg-brand-red/10 p-3 mb-6 text-sm font-semibold flex items-center gap-2">
          <AlertCircle size={16} className="text-brand-red" />
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b-2 border-brand-ink">
        <button
          onClick={() => setActiveTab('metrics')}
          className={[
            'px-4 py-2 text-xs font-bold uppercase tracking-wider border-t-2 border-l-2 border-r-2 border-brand-ink transition-colors',
            activeTab === 'metrics' ? 'bg-brand-ink text-brand-green' : 'bg-white hover:bg-brand-sage',
          ].join(' ')}
        >
          Overview & Metrics
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={[
            'px-4 py-2 text-xs font-bold uppercase tracking-wider border-t-2 border-l-2 border-r-2 border-brand-ink transition-colors',
            activeTab === 'users' ? 'bg-brand-ink text-brand-green' : 'bg-white hover:bg-brand-sage',
          ].join(' ')}
        >
          User Roles ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={[
            'px-4 py-2 text-xs font-bold uppercase tracking-wider border-t-2 border-l-2 border-r-2 border-brand-ink transition-colors',
            activeTab === 'audit' ? 'bg-brand-ink text-brand-green' : 'bg-white hover:bg-brand-sage',
          ].join(' ')}
        >
          Audit Log ({auditLogs.length})
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'metrics' && metrics && (
        <div className="flex flex-col gap-6">
          <MetricsOverview metrics={metrics} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-white p-5 shadow-brutal flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-sage border-2 border-brand-ink flex items-center justify-center">
                <Users size={24} />
              </div>
              <div>
                <span className="text-xs font-bold text-brand-ink/60 uppercase">Registered Accounts</span>
                <p className="font-display text-2xl font-bold">{metrics.total_users || users.length}</p>
              </div>
            </Card>
            <Card className="bg-white p-5 shadow-brutal flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-green border-2 border-brand-ink flex items-center justify-center">
                <Shield size={24} />
              </div>
              <div>
                <span className="text-xs font-bold text-brand-ink/60 uppercase">Authorized Staff</span>
                <p className="font-display text-2xl font-bold">{metrics.total_staff || 0}</p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: User Roles Management */}
      {activeTab === 'users' && (
        <Card className="bg-white p-6 shadow-brutal overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-brand-ink bg-brand-offwhite">
                <th className="p-2 font-bold uppercase">Name</th>
                <th className="p-2 font-bold uppercase">Email</th>
                <th className="p-2 font-bold uppercase">Current Role</th>
                <th className="p-2 font-bold uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-brand-ink/10 hover:bg-brand-sage/20">
                  <td className="p-2 font-semibold">{u.display_name}</td>
                  <td className="p-2 text-brand-ink/70">{u.email}</td>
                  <td className="p-2">
                    <span
                      className={[
                        'px-2 py-0.5 border border-brand-ink font-bold text-[10px] uppercase',
                        u.role === 'admin'
                          ? 'bg-brand-orange text-brand-ink'
                          : u.role === 'staff'
                          ? 'bg-brand-green text-brand-ink'
                          : 'bg-brand-offwhite text-brand-ink',
                      ].join(' ')}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-2">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.clerk_user_id, e.target.value)}
                      className="border border-brand-ink bg-brand-offwhite p-1 text-[11px] font-semibold"
                    >
                      <option value="resident">Resident</option>
                      <option value="staff">Staff</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Tab 3: Immutable Audit Log */}
      {activeTab === 'audit' && (
        <Card className="bg-white p-6 shadow-brutal overflow-x-auto">
          {auditLogs.length === 0 ? (
            <p className="text-xs text-brand-ink/60 py-4">No audit logs recorded yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 border border-brand-ink bg-brand-offwhite flex flex-col gap-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase tracking-wider text-brand-ink flex items-center gap-1.5">
                      <FileText size={13} />
                      {log.action}
                    </span>
                    <span className="text-brand-ink/50 text-[11px]">
                      {new Date(log.created_at).toLocaleString('en-GB')}
                    </span>
                  </div>
                  <div className="text-brand-ink/70 font-mono text-[11px]">
                    Actor: {log.actor_id} | Target: {log.target_type}:{log.target_id}
                  </div>
                  {log.metadata && (
                    <pre className="text-[10px] bg-white border border-brand-ink/20 p-1.5 overflow-x-auto mt-1">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </main>
  )
}
