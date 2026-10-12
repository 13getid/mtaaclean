/**
 * pages/LandingPage.tsx
 *
 * Public landing page for MtaaClean Mombasa.
 *
 * Sections:
 *   1. Hero          — strong headline, two CTAs, abstract graphic
 *   2. How It Works  — 3 numbered steps
 *   3. Map Preview   — static placeholder (Leaflet added in Phase 4)
 *   4. Why It Matters — editorial statement, no fake statistics
 *   5. CTA strip     — secondary call to action
 *
 * All statistics labelled "Demonstration data".
 * No fake endorsements or government claims.
 */

import { motion, useReducedMotion } from 'framer-motion'
import {
  Camera,
  MapPin,
  ClipboardList,
  CheckCircle,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

// ── Animation variants ────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' },
  }),
}

// ── Sub-components ────────────────────────────────────────────────

/**
 * Abstract geometric graphic representing the Tudor / Mombasa waterfront area.
 * Uses only brand colours; no images required.
 */
function HeroGraphic() {
  return (
    <div
      className="relative w-full max-w-sm mx-auto aspect-square border-2 border-brand-ink bg-brand-sage"
      aria-hidden="true"
    >
      {/* Ocean / creek band */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-brand-green/40 border-t-2 border-brand-ink" />

      {/* Abstract buildings */}
      <div className="absolute bottom-1/3 left-6 w-12 h-24 bg-brand-ink" />
      <div className="absolute bottom-1/3 left-[4.5rem] w-8 h-16 bg-brand-orange border-2 border-brand-ink" />
      <div className="absolute bottom-1/3 left-28 w-14 h-20 bg-brand-ink" />
      <div className="absolute bottom-1/3 right-8 w-10 h-28 bg-brand-sage border-2 border-brand-ink" />
      <div className="absolute bottom-1/3 right-20 w-8 h-14 bg-brand-ink" />

      {/* Alert pin — the "report" icon */}
      <div className="absolute top-6 right-8 flex flex-col items-center">
        <div className="w-10 h-10 bg-brand-red border-2 border-brand-ink flex items-center justify-center">
          <AlertTriangle size={18} className="text-white" />
        </div>
        <div className="w-0.5 h-8 bg-brand-ink" />
      </div>

      {/* Label */}
      <div className="absolute top-4 left-4 bg-brand-green border-2 border-brand-ink px-2 py-1">
        <span className="font-display text-xs font-bold text-brand-ink uppercase tracking-wide">
          Tudor, Mombasa
        </span>
      </div>
    </div>
  )
}

/** A single "how it works" step card */
function StepCard({
  number,
  icon,
  title,
  description,
  delay,
}: {
  number: string
  icon: React.ReactNode
  title: string
  description: string
  delay: number
}) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      custom={delay}
      initial={shouldReduceMotion ? 'visible' : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={fadeUp}
      className="relative border-2 border-brand-ink bg-white p-6 flex flex-col gap-4"
    >
      {/* Big number — editorial accent */}
      <span className="absolute -top-4 -left-2 font-display text-6xl font-bold text-brand-green leading-none select-none">
        {number}
      </span>
      <div className="mt-6 flex items-center justify-center w-12 h-12 bg-brand-ink text-brand-green">
        {icon}
      </div>
      <h3 className="font-display text-xl font-bold text-brand-ink">{title}</h3>
      <p className="text-sm text-brand-ink/70 leading-relaxed">{description}</p>
    </motion.div>
  )
}

/** Static map placeholder used until Phase 4 installs Leaflet */
function MapPreviewPlaceholder() {
  return (
    <div
      className="w-full border-2 border-brand-ink bg-brand-sage"
      style={{ minHeight: '340px' }}
      role="img"
      aria-label="Map preview placeholder — Tudor Sub-county, Mombasa"
    >
      <div className="flex flex-col items-center justify-center h-full min-h-[340px] gap-4 p-8">
        {/* Simple grid suggesting a map */}
        <div className="relative w-full max-w-lg border-2 border-brand-ink/30" style={{ height: '220px' }}>
          {/* Horizontal grid lines */}
          {[25, 50, 75].map((pct) => (
            <div
              key={pct}
              className="absolute left-0 right-0 border-t border-brand-ink/20"
              style={{ top: `${pct}%` }}
            />
          ))}
          {/* Vertical grid lines */}
          {[25, 50, 75].map((pct) => (
            <div
              key={pct}
              className="absolute top-0 bottom-0 border-l border-brand-ink/20"
              style={{ left: `${pct}%` }}
            />
          ))}
          {/* Demo markers */}
          {[
            { top: '30%', left: '40%', color: 'bg-brand-red' },
            { top: '55%', left: '60%', color: 'bg-brand-orange' },
            { top: '45%', left: '25%', color: 'bg-brand-green' },
          ].map((m, i) => (
            <div
              key={i}
              className={`absolute w-4 h-4 ${m.color} border-2 border-brand-ink -translate-x-1/2 -translate-y-1/2`}
              style={{ top: m.top, left: m.left }}
            />
          ))}
          {/* Centre label */}
          <div className="absolute inset-0 flex items-end justify-start p-3">
            <span className="bg-white border border-brand-ink/30 px-2 py-0.5 text-xs font-semibold text-brand-ink/60">
              Tudor, Mombasa · Demo view
            </span>
          </div>
        </div>
        <p className="text-sm text-brand-ink/50 text-center">
          Interactive map available after sign-in. Demonstration data shown.
        </p>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────

export function LandingPage() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <main>
      {/* ── 1. HERO ────────────────────────────────────────────── */}
      <section
        className="min-h-screen bg-brand-offwhite border-b-2 border-brand-ink pt-24 pb-16"
        aria-labelledby="hero-heading"
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-10rem)]">
            {/* Text */}
            <div className="flex flex-col gap-6">
              {/* Eyebrow */}
              <motion.div
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="inline-flex w-fit items-center gap-2 border-2 border-brand-ink bg-brand-green px-3 py-1"
              >
                <MapPin size={14} aria-hidden="true" />
                <span className="text-xs font-bold uppercase tracking-widest">
                  Tudor Sub-county · Mombasa, Kenya
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                id="hero-heading"
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.02] text-brand-ink"
              >
                Mombasa's
                <br />
                Waste.
                <br />
                <span className="bg-brand-green px-2">Report It.</span>
                <br />
                Track It.
              </motion.h1>

              {/* Sub-copy */}
              <motion.p
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="text-lg text-brand-ink/70 leading-relaxed max-w-md"
              >
                See illegal dumping or uncollected waste in Tudor? Submit a
                report with a photo and location. Authorized teams review and
                respond. You follow the progress.
              </motion.p>

              {/* CTA buttons */}
              <motion.div
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="flex flex-wrap gap-4"
              >
                <Button
                  variant="primary"
                  size="lg"
                  to="/report"
                  leftIcon={<Camera size={18} aria-hidden="true" />}
                >
                  Report Waste
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  to="/reports"
                  leftIcon={<ClipboardList size={18} aria-hidden="true" />}
                >
                  Track a Report
                </Button>
              </motion.div>

              {/* Trust signals — demonstration labels */}
              <motion.div
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.25 }}
                className="flex flex-wrap gap-6 pt-4 border-t-2 border-brand-ink/20"
              >
                {[
                  { value: '—', label: 'Reports submitted*' },
                  { value: '—', label: 'Issues resolved*' },
                  { value: 'Tudor', label: 'Focus area' },
                ].map(({ value, label }) => (
                  <div key={label} className="flex flex-col">
                    <span className="font-display text-2xl font-bold text-brand-ink">
                      {value}
                    </span>
                    <span className="text-xs text-brand-ink/50">{label}</span>
                  </div>
                ))}
              </motion.div>
              <p className="text-xs text-brand-ink/40">
                * Demonstration system. Live data will appear after deployment.
              </p>
            </div>

            {/* Graphic */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex justify-center lg:justify-end"
            >
              <HeroGraphic />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 2. HOW IT WORKS ────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="py-24 bg-white border-b-2 border-brand-ink"
        aria-labelledby="how-heading"
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-ink/50 mb-2">
                The Process
              </p>
              <h2
                id="how-heading"
                className="font-display text-4xl sm:text-5xl font-bold text-brand-ink"
              >
                Three steps.
                <br />
                One cleaner neighbourhood.
              </h2>
            </div>
            <Button
              variant="ghost"
              size="md"
              to="/report"
              leftIcon={<ArrowRight size={16} aria-hidden="true" />}
            >
              Start now
            </Button>
          </div>

          {/* Step cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <StepCard
              number="01"
              icon={<Camera size={22} />}
              title="Photograph and describe"
              description="Spot illegal dumping or uncollected waste? Take a photo and write a short description of what you see and where."
              delay={0}
            />
            <StepCard
              number="02"
              icon={<MapPin size={22} />}
              title="Pin the location"
              description="Select the exact location on the Tudor area map. Your pin is validated to ensure it falls within the reporting zone."
              delay={1}
            />
            <StepCard
              number="03"
              icon={<CheckCircle size={22} />}
              title="Track the response"
              description="Your report is reviewed by authorized staff, assigned to a cleanup team, and progressed through to resolution. You see every update."
              delay={2}
            />
          </div>
        </div>
      </section>

      {/* ── 3. MAP PREVIEW ─────────────────────────────────────── */}
      <section
        id="map-preview"
        className="py-24 bg-brand-offwhite border-b-2 border-brand-ink"
        aria-labelledby="map-heading"
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-ink/50 mb-2">
              Incident Map
            </p>
            <h2
              id="map-heading"
              className="font-display text-4xl sm:text-5xl font-bold text-brand-ink"
            >
              Where the reports are.
            </h2>
            <p className="mt-4 text-brand-ink/60 max-w-lg">
              Reports submitted by residents appear on the map. Staff can see
              the full picture; the public sees area and status only.
            </p>
          </div>
          <MapPreviewPlaceholder />
        </div>
      </section>

      {/* ── 4. WHY IT MATTERS ──────────────────────────────────── */}
      <section
        className="py-24 bg-brand-ink text-brand-offwhite border-b-2 border-brand-ink"
        aria-labelledby="why-heading"
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-green mb-4">
                The Problem
              </p>
              <h2
                id="why-heading"
                className="font-display text-4xl sm:text-5xl font-bold mb-6"
              >
                Waste reported.
                <br />
                <span className="text-brand-green">Waste resolved.</span>
              </h2>
              <p className="text-brand-offwhite/70 leading-relaxed mb-8 max-w-lg">
                In dense urban areas, waste incidents that go unreported can
                persist for weeks. A structured reporting and tracking workflow
                helps ensure incidents are visible, assigned, and followed
                through to resolution — not forgotten.
              </p>
              <Button
                variant="primary"
                size="lg"
                to="/report"
                leftIcon={<Camera size={18} aria-hidden="true" />}
              >
                Report an Incident
              </Button>
            </div>

            {/* Abstract info panel */}
            <div className="flex flex-col gap-4">
              {[
                {
                  icon: <AlertTriangle size={20} />,
                  title: 'Illegal Dumping',
                  body:  'Waste left in public spaces, roadsides, and waterways outside designated collection points.',
                  accent: 'bg-brand-red',
                },
                {
                  icon: <ClipboardList size={20} />,
                  title: 'Uncollected Waste',
                  body:  'Overflowing bins or missed collection stops that have not been serviced.',
                  accent: 'bg-brand-orange',
                },
                {
                  icon: <CheckCircle size={20} />,
                  title: 'Resolved Reports',
                  body:  'Reports marked resolved by an authorized team member with completion evidence.',
                  accent: 'bg-brand-green',
                },
              ].map(({ icon, title, body, accent }) => (
                <div
                  key={title}
                  className="flex gap-4 border-2 border-brand-offwhite/20 p-5"
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 ${accent} flex items-center justify-center text-brand-ink border-2 border-brand-offwhite/30`}
                  >
                    {icon}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base mb-1">{title}</h3>
                    <p className="text-sm text-brand-offwhite/60 leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. CTA STRIP ───────────────────────────────────────── */}
      <section
        className="py-20 bg-brand-green border-b-2 border-brand-ink"
        aria-label="Call to action"
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-brand-ink mb-4">
            See a problem?
          </h2>
          <p className="text-brand-ink/70 mb-8 max-w-md mx-auto">
            Submit your first report in under two minutes. No app download required.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              variant="secondary"
              size="lg"
              to="/sign-up"
            >
              Create an Account
            </Button>
            <Button
              variant="ghost"
              size="lg"
              to="/sign-in"
            >
              Sign In
            </Button>
          </div>
          <p className="mt-6 text-xs text-brand-ink/50">
            This is an academic demonstration project. Not affiliated with any government body.
          </p>
        </div>
      </section>
    </main>
  )
}
