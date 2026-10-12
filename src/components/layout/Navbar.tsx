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
import { Menu, X, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'

const NAV_LINKS = [
  { label: 'How It Works', to: '/#how-it-works' },
  { label: 'View Map',     to: '/#map-preview' },
  { label: 'Track Report', to: '/reports' },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

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
            </nav>

            {/* Desktop CTA buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" size="sm" to="/sign-in">
                Sign In
              </Button>
              <Button variant="primary" size="sm" to="/report">
                Report Waste
              </Button>
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
              <div className="flex flex-col gap-3 mt-4 pt-4 border-t-2 border-brand-ink">
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
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
