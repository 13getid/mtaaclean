/**
 * components/layout/Footer.tsx
 *
 * Site-wide footer.
 * Two columns: project identity left, links + disclaimer right.
 */

import { Link } from 'react-router-dom'
import { Trash2, Mail, Github } from 'lucide-react'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="bg-brand-ink text-brand-offwhite border-t-2 border-brand-ink"
      role="contentinfo"
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 font-display font-bold text-xl mb-4">
              <span className="flex items-center justify-center w-8 h-8 bg-brand-green border-2 border-brand-offwhite">
                <Trash2 size={16} strokeWidth={2.5} className="text-brand-ink" aria-hidden="true" />
              </span>
              MtaaClean
            </div>
            <p className="text-sm text-brand-offwhite/70 leading-relaxed max-w-xs">
              A community waste reporting system for Tudor Sub-county, Mombasa.
              Built as a final-year IT project.
            </p>
          </div>

          {/* Links */}
          <div className="md:col-span-1">
            <h3 className="font-display text-sm font-bold uppercase tracking-widest mb-4 text-brand-green">
              Navigation
            </h3>
            <ul className="flex flex-col gap-2 text-sm">
              {[
                { label: 'Home',        to: '/' },
                { label: 'Report Waste', to: '/report' },
                { label: 'Track Report', to: '/reports' },
                { label: 'Sign In',     to: '/sign-in' },
              ].map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-brand-offwhite/70 hover:text-brand-green transition-colors underline-offset-4 hover:underline"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + disclaimer */}
          <div className="md:col-span-1">
            <h3 className="font-display text-sm font-bold uppercase tracking-widest mb-4 text-brand-green">
              Contact
            </h3>
            <ul className="flex flex-col gap-3 text-sm text-brand-offwhite/70">
              <li className="flex items-center gap-2">
                <Mail size={14} aria-hidden="true" />
                <span>student@university.ac.ke{/* placeholder */}</span>
              </li>
              <li className="flex items-center gap-2">
                <Github size={14} aria-hidden="true" />
                <span>github.com/username/mtaaclean{/* placeholder */}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider + legal */}
        <div className="mt-10 pt-6 border-t border-brand-offwhite/20 flex flex-col sm:flex-row justify-between gap-4 text-xs text-brand-offwhite/50">
          <p>
            &copy; {year} MtaaClean Mombasa. Final-year academic project.
          </p>
          <p className="max-w-sm text-right sm:text-right">
            Not affiliated with or endorsed by Mombasa County Government or any
            government authority. Demonstration data only.
          </p>
        </div>
      </div>
    </footer>
  )
}
