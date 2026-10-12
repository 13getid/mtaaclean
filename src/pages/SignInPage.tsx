import { SignIn } from '@clerk/clerk-react'

export function SignInPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="mb-6 text-center">
          <h1 className="font-display text-3xl font-bold text-brand-ink">Welcome Back</h1>
          <p className="text-sm text-brand-ink/70 mt-1">
            Sign in to track your reports or access authorized cleanup workflows.
          </p>
        </div>
        <div className="border-2 border-brand-ink shadow-brutal bg-white p-2">
          <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
        </div>
      </div>
    </main>
  )
}
