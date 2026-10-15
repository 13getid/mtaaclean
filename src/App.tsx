import { Routes, Route } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { LandingPage } from '@/pages/LandingPage'
import { SignInPage } from '@/pages/SignInPage'
import { SignUpPage } from '@/pages/SignUpPage'
import { NotFound } from '@/pages/NotFound'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { RoleGuard } from '@/components/auth/RoleGuard'
import { NewReportPage } from '@/features/reports/NewReportPage'
import { MyReportsPage } from '@/features/reports/MyReportsPage'
import { ReportDetailPage } from '@/features/reports/ReportDetailPage'

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || ''

export function App() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <div className="min-h-screen flex flex-col bg-brand-offwhite text-brand-ink selection:bg-brand-green selection:text-brand-ink">
        <Navbar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/sign-in/*" element={<SignInPage />} />
            <Route path="/sign-up/*" element={<SignUpPage />} />

            {/* Resident Reporting Routes */}
            <Route
              path="/report"
              element={
                <ProtectedRoute>
                  <NewReportPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <MyReportsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/reports/:id"
              element={
                <ProtectedRoute>
                  <ReportDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Staff Queue Protected Route (Phase 5) */}
            <Route
              path="/staff/*"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['staff', 'admin']}>
                    <div className="max-w-screen-xl mx-auto p-12 text-center">
                      <h1 className="font-display text-3xl font-bold mb-4">Staff Review & Assignment Queue</h1>
                      <p className="text-brand-ink/70">
                        Operational incident queue, assignment dropdown, and status transitions (Phase 5).
                      </p>
                    </div>
                  </RoleGuard>
                </ProtectedRoute>
              }
            />

            {/* Admin Area Protected Route */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['admin']}>
                    <div className="max-w-screen-xl mx-auto p-12 text-center">
                      <h1 className="font-display text-3xl font-bold mb-4">Administrator Management</h1>
                      <p className="text-brand-ink/70">
                        User role assignment and audit log viewer.
                      </p>
                    </div>
                  </RoleGuard>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </ClerkProvider>
  )
}

export default App
