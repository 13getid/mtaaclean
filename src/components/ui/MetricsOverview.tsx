import { Card } from '@/components/ui/Card'
import { Inbox, CheckCircle2, AlertCircle, Clock, Users, ShieldAlert } from 'lucide-react'

export interface MetricsData {
  total_reports: number
  submitted: number
  under_review: number
  assigned: number
  in_progress: number
  resolved: number
  rejected: number
  total_users?: number
  total_staff?: number
}

interface MetricsOverviewProps {
  metrics: MetricsData
  isLoading?: boolean
}

export function MetricsOverview({ metrics, isLoading = false }: MetricsOverviewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-20 bg-brand-sage/30 animate-pulse border-2 border-brand-ink/20" />
        ))}
      </div>
    )
  }

  const statCards = [
    {
      label: 'Submitted',
      value: metrics.submitted,
      icon: <Inbox size={15} />,
      accent: 'border-l-4 border-l-brand-ink',
    },
    {
      label: 'Under Review',
      value: metrics.under_review,
      icon: <Clock size={15} />,
      accent: 'border-l-4 border-l-brand-sage',
    },
    {
      label: 'Assigned',
      value: metrics.assigned,
      icon: <Users size={15} />,
      accent: 'border-l-4 border-l-brand-green',
    },
    {
      label: 'In Progress',
      value: metrics.in_progress,
      icon: <AlertCircle size={15} />,
      accent: 'border-l-4 border-l-brand-orange',
    },
    {
      label: 'Resolved',
      value: metrics.resolved,
      icon: <CheckCircle2 size={15} />,
      accent: 'border-l-4 border-l-brand-ink bg-brand-green/20',
    },
    {
      label: 'Rejected',
      value: metrics.rejected,
      icon: <ShieldAlert size={15} />,
      accent: 'border-l-4 border-l-brand-red',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {statCards.map((card) => (
        <Card
          key={card.label}
          className={`p-3 bg-white shadow-brutal-sm flex flex-col justify-between ${card.accent}`}
        >
          <div className="flex items-center justify-between text-brand-ink/60 text-xs font-semibold">
            <span>{card.label}</span>
            {card.icon}
          </div>
          <span className="font-display font-bold text-2xl text-brand-ink mt-1">
            {card.value}
          </span>
        </Card>
      ))}
    </div>
  )
}
