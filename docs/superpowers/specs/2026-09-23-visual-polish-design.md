# Racing Hobbies visual polish design

## Goal

Make every public page of Racing Hobbies feel like one polished, premium RC
experience: a clear visual system, intentional motion, strong hierarchy, and
reliable behavior on desktop, mobile, keyboard navigation, and reduced-motion
settings.

## Current evidence

- The site is a static multi-page experience with shared HTML shells and a
  shared `css/styles.css` source plus generated `css/styles.min.css`.
- `js/main.js` already owns the shared interface behavior and loads GSAP,
  ScrollTrigger, and Lenis from local vendor files.
- Existing regression tests cover security, SRI, horizontal rails, mobile
  layout, product availability, consent, and section-heading consistency.
- The current home render is visually bold, but the cookie-consent panel can
  cover the primary hero actions, and the visual language is spread across
  several late-stage CSS overrides. The redesign must improve polish without
  destabilizing the proven interaction behavior.

## Scope

The shared shell and all public pages are in scope:

- Home: hero, manifesto, category rail, featured product, social section,
  location, header, consent panel, cart, and footer.
- Catalog: search, filters, product cards, empty state, detail modal, cart,
  and mobile rail behavior.
- Service, About, Contact, Guarantee, Privacy, and 404: hero treatment,
  section rhythm, cards, forms, link/button states, and footer.
- Shared motion: initial page entrance, reveals, hover/focus states, scroll
  scenes, menu, cart, modal, and page transitions.

## Non-goals

- No new product, copy, pricing, analytics, or checkout behavior.
- No new animation dependency; use the existing local GSAP/ScrollTrigger/Lenis
  stack and CSS transitions.
- No replacement of the brand logo or product photography.
- No weakening of CSP, SRI, consent behavior, or security headers.

## Design direction

Use a restrained “track-night editorial” direction: near-black surfaces,
paper-white content blocks, the established electric-green accent, thin
technical rules, and generous editorial spacing. Components should feel
assembled rather than decorated: one clear heading scale, one button family,
one card language, and consistent corner/radius/shadow rules.

The polish layer should be centralized in the existing stylesheet rather than
creating another cascade of page-specific overrides. Existing page-specific
rules remain only where the content genuinely needs a different composition.

## Motion system

1. Establish shared motion tokens for duration, easing, reveal distance, and
   interactive lift. Use transform and opacity for animated elements to keep
   scroll scenes composited.
2. Keep the page entrance brief and non-blocking. The hero becomes readable
   even if a vendor script fails or the user has reduced motion enabled.
3. Use one reveal grammar across pages: headings and section groups enter in a
   short stagger; product and social cards use a smaller stagger; hover states
   lift or scale imagery subtly without causing layout shift.
4. Preserve the existing horizontal rails and Lenis integration, but make the
   visual cue and end state obvious on touch and keyboard. Do not add extra
   scroll hijacking.
5. Every motion path has a reduced-motion path that removes interpolation and
   preserves access to the same content and controls.

## Component rules

- Header: consistent height, active-page indicator, visible focus ring, and
  menu/cart states that never hide the primary navigation context.
- Buttons and links: shared height, type scale, focus treatment, hover/pressed
  state, and an animated underline or fill that does not depend on color alone.
- Cards: stable aspect ratio, image crop rules, sold-out treatment, title and
  price hierarchy, and a single hover/focus language.
- Sections: consistent container width, kicker/title/subtitle rhythm, and
  predictable vertical spacing at the three verification widths.
- Floating UI: consent, WhatsApp, cart, and modal controls must respect safe
  areas and must not cover critical hero actions on small or large screens.

## Accessibility and resilience

- Preserve semantic landmarks, existing labels, and keyboard operation.
- Keep visible `:focus-visible` states and a contrast-safe accent treatment.
- Honor `prefers-reduced-motion: reduce` in CSS and JavaScript.
- Avoid horizontal page overflow; horizontal content remains intentionally
  scrollable only inside its rail.
- Maintain local resource SRI and regenerate minified assets and cache hashes
  after source changes.

## Verification contract

Before integration, the branch must provide:

- Full `node --test scripts/*.test.mjs` with zero failures.
- A fresh production build and security audit with zero errors.
- Browser checks at 390×844, 768×1024, and 1440×900 for all public pages.
- Screenshots confirming no clipped hero actions, no consent/floating-control
  collisions, no horizontal page overflow, and coherent motion states.
- A reduced-motion browser pass confirming content is visible without waiting
  for animation.
- A clean diff limited to the visual polish and the generated assets needed to
  publish it.

## Delivery

Work is isolated on `codex/visual-polish` from `origin/main`. The original
checkout and its existing user changes remain untouched. After verification,
the feature branch is pushed to the configured GitHub remote and integrated
into the repository's publication branch using the safest available GitHub
workflow.
