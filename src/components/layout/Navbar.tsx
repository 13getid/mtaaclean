/**
 * components/layout/Navbar.tsx
 *
 * Site-wide navigation bar.
 *
 * Desktop: logo left | links centre | CTA buttons right (sticky, border-bottom on scroll).
 * Mobile:  logo left | hamburger right → full-screen slide-down menu.
 *
 * Phase 1: no auth integration yet — Sign In / Sign Up are placeholder links.
 * Phase 2: replace with Clerk <SignInButton> and user avatar.
 */

import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, Trash2, LayoutDashboard, Shield } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth, UserButton } from '@clerk/clerk-react'
import { Button } from '@/components/ui/Button'
import { useProfile } from '@/hooks/useProfile'

const NAV_LINKS = [
  { label: 'How It Works', to: '/#how-it-works' },
  { label: 'Incident Map', to: '/map' },
  { label: 'Track Report', to: '/reports' },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { isSignedIn } = useAuth()
  const { isStaff, isAdmin } = useProfile()

  // Add border-bottom when scrolled past 10px
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <>
      <header
        className={[
          'fixed top-0 left-0 right-0 z-50 bg-brand-offwhite transition-all duration-200',
          isScrolled ? 'border-b-2 border-brand-ink' : '',
        ].join(' ')}
        role="banner"
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 font-display font-bold text-xl text-brand-ink"
              aria-label="MtaaClean Mombasa — home"
            >
              <span className="flex items-center justify-center w-8 h-8 bg-brand-green border-2 border-brand-ink">
                <Trash2 size={16} strokeWidth={2.5} aria-hidden="true" />
              </span>
              MtaaClean
            </Link>

            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className="text-sm font-semibold text-brand-ink hover:text-brand-ink underline-offset-4 hover:underline transition-colors"
                >
                  {link.label}
                </NavLink>
              ))}

              {isStaff && (
                <NavLink
                  to="/staff"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-ink hover:underline underline-offset-4 bg-brand-sage px-2 py-0.5 border border-brand-ink"
                >
                  <LayoutDashboard size={14} />
                  Staff Queue
                </NavLink>
              )}

              {isAdmin && (
                <NavLink
                  to="/admin"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-ink hover:underline underline-offset-4 bg-brand-orange px-2 py-0.5 border border-brand-ink"
                >
                  <Shield size={14} />
                  Admin
                </NavLink>
              )}
            </nav>

            {/* Desktop CTA buttons */}
            <div className="hidden md:flex items-center gap-3">
              {isSignedIn ? (
                <>
                  <Button variant="primary" size="sm" to="/report">
                    Report Waste
                  </Button>
                  <div className="p-0.5 border-2 border-brand-ink bg-white flex items-center justify-center">
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" to="/sign-in">
                    Sign In
                  </Button>
                  <Button variant="primary" size="sm" to="/report">
                    Report Waste
                  </Button>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="md:hidden p-2 border-2 border-brand-ink bg-white"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? (
                <X size={20} aria-hidden="true" />
              ) : (
                <Menu size={20} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu — slide down */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            key="mobile-menu"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.18 }}
            className="fixed top-16 left-0 right-0 z-40 bg-brand-offwhite border-b-2 border-brand-ink md:hidden"
          >
            <nav
              className="flex flex-col p-4 gap-1"
              aria-label="Mobile navigation"
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className="py-3 px-4 font-semibold text-brand-ink hover:bg-brand-sage border-b border-brand-ink/20 last:border-0"
                >
                  {link.label}
                </Link>
              ))}
              {isStaff && (
                <Link
                  to="/staff"
                  onClick={() => setMenuOpen(false)}
                  className="py-3 px-4 font-semibold text-brand-ink bg-brand-sage border-b border-brand-ink/20 flex items-center gap-2"
                >
                  <LayoutDashboard size={16} />
                  Staff Incident Queue
                </Link>
              )}

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="py-3 px-4 font-semibold text-brand-ink bg-brand-orange border-b border-brand-ink/20 flex items-center gap-2"
                >
                  <Shield size={16} />
                  Admin Dashboard
                </Link>
              )}

              <div className="flex flex-col gap-3 mt-4 pt-4 border-t-2 border-brand-ink">
                {isSignedIn ? (
                  <div className="flex items-center justify-between p-2 bg-white border-2 border-brand-ink">
                    <span className="text-sm font-semibold">Account</span>
                    <UserButton afterSignOutUrl="/" />
                  </div>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="md"
                      to="/sign-in"
                      onClick={() => setMenuOpen(false)}
                    >
                      Sign In
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      to="/report"
                      onClick={() => setMenuOpen(false)}
                    >
                      Report Waste
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
