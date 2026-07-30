# MR.WASH IT — Premium Car Wash Single-Page Website

A modern, image-led single-page site for a premium car wash and detailing business. Pure HTML, CSS and vanilla JavaScript — no build step, no framework, no dependencies beyond Google Fonts and Phosphor Icons.

## Highlights

### Interactive wash bay (`#washbay`)
A canvas-based "scrub it yourself" demo. A procedurally generated mud layer is painted over a clean car photo; drag across it to wash it off.

- **Three tools** — foam sponge (soft round brush), pressure jet (tight brush + scattered droplets), wide mop (broad soft-edged sweep). Each has its own radius, water flow rate and suds density.
- **Live progress** — cleaned percentage, animated progress bar, contextual coaching hints and a running "water used" readout.
- **Reward gate** — clear 85% and the panel auto-finishes with a shine sweep, a completion overlay and an unlocked booking CTA that deep-links into the wizard with Premium Shine preselected.
- **Reset** — "Muddy it again" repaints a fresh, randomised dirt layer.

Progress is tracked with a lightweight 56×40 coverage grid rather than `getImageData`, so it stays cheap and never trips canvas tainting.

### Mock booking wizard
A five-step modal with a live summary panel, opened by any `[data-open-booking]` element:

1. **Vehicle** — four sizes with surcharges, plus a surface-condition selector
2. **Package** — three wash tiers and two unlimited memberships, with photography
3. **Add-ons** — six optional extras, each with its own price and time cost
4. **Slot** — three locations, the next seven days, and time slots whose availability varies deterministically per location + date (some render as "Full")
5. **Details** — name, phone, email and plate, with inline validation

Pricing and estimated duration recompute live in the summary aside. Confirming produces an animated success state with a generated booking reference and a full recap. Nothing is transmitted anywhere — it is a front-end mockup.

### Other interactions
- Draggable **before/after** comparison slider (pointer + keyboard)
- Gallery **lightbox** with full-resolution swap
- **Scroll-reveal** animations, animated stat counters, scroll-spy navigation
- FAQ accordion, toast notifications, validated callback form
- Today's row highlighted automatically in the opening-hours table

### Design & platform
- **Dark / light theme** with `localStorage` persistence and system-preference fallback
- **RTL support** — the navbar toggle swaps `dir` and enables `rtl.css`
- Responsive from 360px to ultrawide; glassmorphic navbar, gradient accents, layered elevation
- `prefers-reduced-motion` respected throughout
- Every remote image has an `onerror` fallback to a branded gradient, so a blocked CDN degrades cleanly

## File structure

```
carwash/
├── index.html          # Single-page site + booking modal + lightbox
├── 404.html            # Branded error page
├── assets/
│   ├── css/
│   │   ├── style.css   # Design tokens, components, layout, responsive rules
│   │   └── rtl.css     # RTL overrides (loaded disabled, enabled by the toggle)
│   └── js/
│       └── main.js     # Shell, wash bay, slider, booking wizard, forms
└── README.md
```

## Customisation

- **Colours** — edit the `:root` and `[data-theme="dark"]` custom properties at the top of `style.css`.
- **Packages, add-ons, vehicles, locations, time slots** — edit the `VEHICLES`, `CONDITIONS`, `PACKAGES`, `ADDONS`, `LOCATIONS` and `TIMES` arrays in the `Booking` module in `main.js`. The UI, pricing and summary all derive from these.
- **Wash bay difficulty** — `TARGET` (completion threshold) and the `TOOLS` map in the `washBay` module.
- **Forms** — both forms are front-end only. Point the callback form at Formspree, Netlify Forms or your own endpoint, and POST the booking `state` object from `confirmBooking()` to your backend.
- **Images** — currently hot-linked from Unsplash. Swap for local assets in `assets/img/` before going live.
- **Typography** — replace the Google Fonts URL in the HTML files and update `--font-heading` / `--font-body`.

## Notes

- Two `overflow` details are load-bearing and intentional: `overflow-x` lives on `<html>` (on `<body>` it creates a scroll container and breaks `scrollIntoView`), and the scroll lock applies `.no-scroll` to both `<html>` and `<body>`.
- The wash bay uses `touch-action: pan-y` so vertical page scrolling still works when the bay fills a phone screen.

Built for performance, accessibility (WCAG 2.1 AA colour contrast, focus-visible states, ARIA on interactive widgets) and readable code.
"# carwash" 
