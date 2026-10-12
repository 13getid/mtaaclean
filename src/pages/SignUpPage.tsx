import { SignUp } from '@clerk/clerk-react'

export function SignUpPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="mb-6 text-center">
          <h1 className="font-display text-3xl font-bold text-brand-ink">Create Resident Account</h1>
          <p className="text-sm text-brand-ink/70 mt-1">
            Join MtaaClean to report waste incidents and keep Tudor clean.
          </p>
        </div>
        <div className="border-2 border-brand-ink shadow-brutal bg-white p-2">
          <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
        </div>
      </div>
    </main>
  )
}
