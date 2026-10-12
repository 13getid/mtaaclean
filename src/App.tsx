import { Routes, Route } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { LandingPage } from '@/pages/LandingPage'
import { NotFound } from '@/pages/NotFound'

export function App() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-offwhite text-brand-ink selection:bg-brand-green selection:text-brand-ink">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}

export default App
