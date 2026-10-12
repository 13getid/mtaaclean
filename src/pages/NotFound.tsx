import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function NotFound() {
  return (
    <main className="min-h-screen bg-brand-offwhite flex items-center justify-center p-6">
      <div className="max-w-md w-full border-2 border-brand-ink bg-white p-8 shadow-brutal text-center flex flex-col items-center gap-6">
        <div className="w-16 h-16 bg-brand-orange border-2 border-brand-ink flex items-center justify-center">
          <AlertCircle size={32} className="text-brand-ink" />
        </div>
        
        <div>
          <span className="font-display text-5xl font-bold text-brand-ink block mb-2">404</span>
          <h1 className="font-display text-2xl font-bold text-brand-ink mb-2">Page Not Found</h1>
          <p className="text-sm text-brand-ink/70">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          to="/"
          leftIcon={<ArrowLeft size={16} aria-hidden="true" />}
        >
          Back to Home
        </Button>
      </div>
    </main>
  )
}
