# UI/UX Design Brief
## MtaaClean Mombasa — Waste Collection and Illegal Dumping Reporting System

**Version:** 0.1 (Phase 0 — Draft)
**Date:** October 2026

---

## 1. Design Goals

1. **Civic clarity** — The interface must communicate that this is a serious, trustworthy public service tool, not a social media or consumer app.
2. **Local relevance** — Visual references to Mombasa's geography, character, and community should feel authentic rather than stock.
3. **Functional beauty** — Every visual decision should serve the user's task. No decoration for its own sake.
4. **Accessible to all residents** — The interface must work on mid-range Android phones with small screens and variable connectivity.
5. **Student-demonstrable** — The design must be achievable by one developer with AI assistance in a realistic timeframe.

---

## 2. Intended Users (Design Perspective)

| User | Context of use | Device | Key need |
|------|---------------|--------|---------|
| Resident | On the street, near an incident | Mobile phone, potentially in bright sunlight | Fast, clear, low-effort report submission |
| Staff | At a desk or in a vehicle | Desktop or tablet | Efficient scanning of a large report queue |
| Administrator | At a desk | Desktop | Control and oversight without clutter |

---

## 3. Visual Direction — Three Options Considered

### Option A — Civic Editorial (Recommended ✅)
Inspired by high-quality municipal/NGO websites and editorial publication design. Confident typography, generous white space, strong horizontal rules, and restrained use of colour. Neo-brutalist elements are present but refined: thick borders, solid fills, no rounded-card uniformity. The brand colour (environmental green) is used as a deliberate accent, not a background flood.

**Why it fits:** A waste reporting tool must feel authoritative. Option A signals competence and reliability while remaining approachable for residents who may be unfamiliar with civic tech.

### Option B — High-Contrast Activist
Bold red-and-black palette with protest-poster typography. Aggressive layout, slab fonts, heavy rules. More confrontational — draws attention to the problem of illegal dumping.

**Why not chosen:** Too aggressive for a tool that must also be used by staff in a calm working environment. Could feel alarming rather than helpful.

### Option C — Nature-forward Organic
Soft greens, earthy browns, rounded forms, leaf imagery. Prioritises environmental branding.

**Why not chosen:** Conflicts with the neo-brutalism direction. Rounded softness reduces the sense of civic authority.

---

## 4. Colour Palette

| Name | Hex | Usage |
|------|-----|-------|
| Off-white | `#F7F5EE` | Main page background |
| Deep ink | `#20211D` | Primary text, borders, button fills |
| Environmental green | `#B8ED70` | Primary accent: CTAs, active status badges, key highlights |
| Muted sage | `#DCE8D4` | Secondary backgrounds, card fills, subtle section dividers |
| Warm orange | `#F1A078` | Warning states, "In Progress" badges, secondary highlights |
| White | `#FFFFFF` | Form fields, modal backgrounds, photo cards |
| Reject red | `#E53935` | Rejected status only; used sparingly |

### Colour rules
- Body text on off-white: `#20211D` — contrast ratio > 7:1 ✅
- Green CTA button: `#20211D` text on `#B8ED70` fill — contrast ratio ≈ 7.4:1 ✅
- Orange badge: `#20211D` text on `#F1A078` fill — contrast ratio ≈ 4.8:1 ✅
- Never use green as a text colour on white backgrounds (insufficient contrast).
- Focus rings use a 3px solid `#20211D` outline.

---

## 5. Typography

### Font pairing

| Role | Font | Weight | Usage |
|------|------|--------|-------|
| Display / Headings | Space Grotesk | 700, 600 | Page titles, section headings, hero text |
| Body / UI | Inter | 400, 500, 600 | Body copy, labels, buttons, navigation |

Both fonts are loaded from Google Fonts via a `<link>` in the HTML head, or via the `fontsource` npm packages to avoid external network dependency.

### Type scale (desktop)

| Role | Size | Weight | Line height |
|------|------|--------|-------------|
| Hero headline | 56–72px | 700 | 1.05 |
| Section heading | 32–40px | 700 | 1.1 |
| Sub-heading | 22–28px | 600 | 1.2 |
| Body large | 18px | 400 | 1.6 |
| Body | 16px | 400 | 1.6 |
| Label / caption | 13–14px | 500 | 1.4 |
| Button | 15px | 600 | 1 |

On mobile, hero headlines scale down to 36–44px.

---

## 6. Spacing, Borders, Buttons, and Component Principles

### Spacing
- Base unit: 4px.
- Common values: 4, 8, 12, 16, 24, 32, 48, 64, 96px.
- Section padding: 64–96px top and bottom on desktop; 40–64px on mobile.
- Content max-width: 1200px, centred.

### Borders
- Standard card border: `2px solid #20211D`.
- Heavy accent border: `3px solid #20211D` for feature cards and highlighted sections.
- No border-radius on most elements (intentional brutalist aesthetic).
- Selective border-radius (4px) on form inputs and photo thumbnails only.

### Shadows
- Primary shadow: `4px 4px 0px #20211D` — flat, offset, no blur. Used on buttons and feature cards.
- No diffuse box shadows. No glassmorphism.

### Buttons

| Variant | Fill | Text | Border | Shadow | Use |
|---------|------|------|--------|--------|-----|
| Primary | `#B8ED70` | `#20211D` | `2px #20211D` | `4px 4px 0 #20211D` | Main CTA |
| Secondary | `#FFFFFF` | `#20211D` | `2px #20211D` | none | Secondary actions |
| Danger | `#E53935` | `#FFFFFF` | `2px #20211D` | none | Reject, delete |
| Ghost | transparent | `#20211D` | `2px #20211D` | none | Tertiary |

Hover: shift the element 2px up and right; shadow becomes `6px 6px 0 #20211D`.
Active: element moves back to original position; shadow removed.
Disabled: 40% opacity; cursor not-allowed.

### Form inputs
- Border: `2px solid #20211D`.
- Border-radius: 4px.
- Background: `#FFFFFF`.
- Focus: border colour stays `#20211D`; add `outline: 3px solid #B8ED70`.
- Error state: border `#E53935`; error message below in `#E53935`.

### Cards
- Background: `#FFFFFF` or `#DCE8D4`.
- Border: `2px solid #20211D`.
- No border-radius.
- Padding: 24px.
- Shadow on hover for interactive cards: `4px 4px 0 #20211D`.

### Status badges
| Status | Background | Text |
|--------|-----------|------|
| Submitted | `#F7F5EE` | `#20211D` |
| Under Review | `#DCE8D4` | `#20211D` |
| Assigned | `#B8ED70` | `#20211D` |
| In Progress | `#F1A078` | `#20211D` |
| Resolved | `#20211D` | `#B8ED70` |
| Rejected | `#E53935` | `#FFFFFF` |

---

## 7. Page-by-Page Layout Descriptions

### 7.1 Landing Page

**Layout:** Full-width, single-column on mobile; editorial grid on desktop.

**Sections (top to bottom):**
1. **Navigation bar** — Logo (left), nav links (centre), Sign In / Report Waste buttons (right). Sticky on scroll; border-bottom `2px solid #20211D` on scroll.
2. **Hero section** — Left: large headline ("Mombasa's Waste. Report It. Track It."), sub-copy, two buttons (Report Waste, Track a Report). Right: full-height photo of a real Mombasa urban environment (appropriately licensed) or an illustrated graphic. Strong horizontal rule below.
3. **How it works** — Three large numbered steps in a horizontal strip with offset layout. Icons from Lucide. Step labels in Space Grotesk bold.
4. **Map preview** — Full-width embedded Leaflet map with a simple overlay explaining that markers represent reported incidents. Label: "Demonstration data — not real-time."
5. **Why it matters** — Editorial layout: one large quote or fact, one paragraph. No fake statistics.
6. **Footer** — Two columns: project name + description, contact placeholder + privacy notice.

### 7.2 Resident Dashboard

**Layout:** Sidebar navigation (hidden on mobile, bottom tab bar on mobile) + main content area.

**Content:**
- Greeting header: "Welcome back, [first name]."
- Quick stats row: Total reports submitted, reports resolved, reports in progress.
- Recent reports list (last 5): status badge, description snippet, date, link to detail.
- "Report a new waste incident" card — prominent CTA.

### 7.3 New Report Form

**Layout:** Two-panel on desktop (form left, map right). Single column stacked on mobile.

**Steps:**
1. Description text area (labelled, character count visible).
2. Photo upload zone (drag-and-drop or click; preview shown).
3. Map location selector (click to pin; coordinates displayed below map).
4. Review step: all entries visible before submit.
5. Submit button with loading state.

### 7.4 My Reports

**Layout:** Full-width list with a filter bar.

**Per-report row:** Status badge, short description, area name, date submitted, "View Details" link.

**Detail view:** Two-column layout (details left, map + photos right). Status history timeline at the bottom.

### 7.5 Staff Dashboard

**Layout:** Full-width table/list view with a collapsible filter sidebar.

**Report table columns:** #ID, description snippet, area, status badge, assigned to, last updated, Actions.

**Detail panel:** Slide-in side panel (desktop) or full-page (mobile). Contains all report fields, photos, location map, assignment form, and status-update form.

### 7.6 Admin Area

**Layout:** Simple two-column: side nav (Users, Audit Log, Summary) + content panel.

**Users page:** Table with name, email, role, joined date, role-change button.

---

## 8. Responsive Behaviour

| Breakpoint | Behaviour |
|-----------|----------|
| < 640px (mobile) | Single column; sidebar becomes bottom tab bar; map takes full width; form steps stack vertically |
| 640–1024px (tablet) | Two-column starts; sidebar visible; map and form side-by-side |
| > 1024px (desktop) | Full grid layout; sticky sidebar; split panels |

---

## 9. Accessibility Requirements

- All interactive elements reachable and operable by keyboard alone.
- Focus order follows visual reading order.
- All form inputs have associated `<label>` elements.
- Error messages are linked to their input via `aria-describedby`.
- Map markers have accessible tooltips (title attributes or aria-label).
- Colour is never the only means of conveying status — status badges also include text.
- All images have meaningful `alt` attributes; decorative images use `alt=""`.
- Minimum touch target size: 44×44px on mobile.
- Reduced-motion: all Framer Motion animations respect `prefers-reduced-motion: reduce`.

---

## 10. Motion Principles

### Permitted animations

| Trigger | Animation | Duration |
|---------|-----------|----------|
| Page navigation | Fade in (opacity 0→1) | 200ms |
| Report submission success | Scale up confirmation card | 300ms |
| Status badge update | Cross-fade between old and new badge | 150ms |
| Side panel open (staff) | Slide in from right | 250ms |
| Dashboard cards on first load | Staggered fade-up | 300ms stagger 50ms |

### Rules
- No animations on map interactions (performance).
- No looping or attention-seeking animations.
- No animation that delays an action by more than 100ms.
- All animations wrapped with `useReducedMotion()` from Framer Motion; if reduced motion is preferred, instant transitions are used.

---

## 11. Design References

The following links were provided as inspiration sources. They have not been browsed or verified during Phase 0. These are directional references, not designs to copy:

- Dribbble search: [dashboard](https://dribbble.com/search/dashboard), [sustainability](https://dribbble.com/search/sustainability), [neo-brutalism](https://dribbble.com/search/neo-brutalism), [landing page](https://dribbble.com/search/landing-page)
- Pinterest search: [neo brutalism web design](https://www.pinterest.com/search/pins/?q=neo%20brutalism%20web%20design), [environmental website design](https://www.pinterest.com/search/pins/?q=environmental%20website%20design), [map dashboard ui](https://www.pinterest.com/search/pins/?q=map%20dashboard%20ui)

**Important:** The design choices in this document (colour palette, typography, border style, button shadows, layout structure) are original interpretations developed for this project. No visual design from the reference sites has been reproduced. The references were used only to understand general tendencies in neo-brutalist and editorial civic UI design.

---

## 12. Photography and Illustration Notes

- If photography is used on the landing page, it must be appropriately licensed (e.g., Unsplash, Pexels, or original photos).
- Photos of Mombasa urban environments are preferred; generic stock images of garbage should be avoided.
- Do not use AI-generated images of real people or real locations without appropriate disclosure.
- If real imagery is unavailable, use abstract graphic elements (solid colour blocks, geometric shapes, text-heavy layouts) rather than placeholder stock.
- Report photographs uploaded by residents are user-generated content; no editorial curation is applied to them.
