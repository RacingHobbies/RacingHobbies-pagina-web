# Racing Hobbies visual polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify the public site's visual system and motion behavior across every page while preserving existing content, commerce, analytics, security, and mobile rail behavior.

**Architecture:** Add one final, named visual-polish layer to the existing shared stylesheet and make only the smallest JavaScript adjustment needed to expose a reliable motion-ready state. Keep page-specific composition in existing files, regenerate the already-published minified assets, then verify the complete static site in a real browser at desktop, tablet, mobile, and reduced-motion settings.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, local GSAP 3.15, ScrollTrigger, Lenis, Node test runner, Lightning CSS, Terser, Playwright CLI.

**Spec:** `docs/superpowers/specs/2026-09-23-visual-polish-design.md`

## Global Constraints

- Preserve all existing copy, products, prices, links, analytics events, consent defaults, CSP, SRI, and security headers.
- Do not add a runtime dependency or a remote asset.
- Use `transform` and `opacity` for new motion; do not animate layout dimensions or introduce page-level horizontal overflow.
- Keep all public pages usable with `prefers-reduced-motion: reduce` and keyboard navigation.
- Run `bash scripts/build-production.sh` after every CSS or JavaScript source change so published assets and SRI/cache hashes remain synchronized.

## Review Focus

- First visit with the consent panel visible: the panel must not cover the desktop hero CTAs or floating WhatsApp/cart controls; `scripts/visual-polish.test.mjs` pins the safe-width/offset contract in Task 2.
- `prefers-reduced-motion: reduce`: content, navigation, rails, cart, modal, and forms remain visible and usable without waiting for animation; the test pins the CSS and JS escape hatches in Task 3.
- Touch-width pages at 390px: no body-level horizontal overflow and no fixed control collision; the browser matrix in Task 4 catches runtime regressions.
- Keyboard focus on nav links, buttons, cards, form controls, modal close, and cart controls: focus remains visible against both light and dark surfaces; the contract test and browser pass cover this.
- Production references after regeneration: every public page continues to load the exact minified CSS/JS bytes referenced by SRI and cache hashes; the existing security tests and Task 5 build check cover this.

---

### Task 1: Create the visual-polish contract tests

**Files:**
- Create: `scripts/visual-polish.test.mjs`
- Read: `css/styles.css`, `js/main.js`, all eight public `*.html` files

**Interfaces:**
- Consumes: the shared CSS/JS sources and page shell files.
- Produces: deterministic Node tests that describe the visual contract without requiring a browser dependency.

- [ ] **Step 1: Write the failing tests**

Create tests with these exact behaviors:

```js
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const css = fs.readFileSync('css/styles.css', 'utf8');
const js = fs.readFileSync('js/main.js', 'utf8');
const pages = ['index.html', 'catalogo.html', 'servicio-tecnico.html', 'nosotros.html', 'contacto.html', 'garantia.html', 'privacidad.html', '404.html'];

test('the visual layer exposes shared motion and surface tokens', () => {
  assert.match(css, /--rh-motion-fast:/);
  assert.match(css, /--rh-motion-smooth:/);
  assert.match(css, /--rh-surface-glass:/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});

test('floating consent UI reserves a desktop-safe footprint', () => {
  assert.match(css, /\.consent-banner[\s\S]*?max-width:\s*560px/);
  assert.match(css, /\.consent-banner[\s\S]*?env\(safe-area-inset-bottom\)/);
});

test('the motion layer has a reduced-motion escape hatch', () => {
  assert.match(js, /const REDUCED = window\.matchMedia/);
  assert.match(css, /\.js \.reveal[\s\S]*?transition/);
  assert.match(css, /prefers-reduced-motion:\s*reduce[\s\S]*?\.js \.reveal/);
});

test('every public page keeps the shared published stylesheet', () => {
  for (const page of pages) {
    const html = fs.readFileSync(page, 'utf8');
    assert.match(html, /css\/styles\.min\.css\?v=[a-f0-9]{16}/i, page);
    assert.match(html, /integrity="sha256-[A-Za-z0-9+/=]+"/, page);
  }
});
```

- [ ] **Step 2: Run the focused test and verify it fails for the missing contract**

Run: `node --test scripts/visual-polish.test.mjs`

Expected: FAIL because the new `--rh-*` tokens and the tightened consent footprint do not yet exist in the source CSS.

- [ ] **Step 3: Commit the test contract**

```bash
git add scripts/visual-polish.test.mjs
git commit -m "test: define visual polish contract"
```

### Task 2: Add the shared visual polish layer

**Files:**
- Modify: `css/styles.css` at the final source layer after the existing V65/V64 overrides

**Interfaces:**
- Consumes: existing custom properties, page classes, component selectors, and `--ease-reveal`.
- Produces: shared tokens and final cascade rules for surfaces, controls, cards, sections, floating UI, and responsive spacing.

- [ ] **Step 1: Add the shared token block and base interaction rules**

Append a named `V66 — VISUAL POLISH` layer containing:

```css
:root {
  --rh-motion-fast: 180ms;
  --rh-motion-base: 320ms;
  --rh-motion-smooth: 620ms;
  --rh-ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --rh-ease-soft: cubic-bezier(0.22, 1, 0.36, 1);
  --rh-surface-glass: color-mix(in srgb, var(--ink) 91%, transparent);
  --rh-shadow-soft: 0 24px 70px rgba(0, 0, 0, 0.18);
  --rh-ring: 0 0 0 3px color-mix(in srgb, var(--volt) 42%, transparent);
}

button,
a,
input,
textarea,
select {
  -webkit-tap-highlight-color: transparent;
}

:where(a, button, input, textarea, select):focus-visible {
  outline: 0;
  box-shadow: var(--rh-ring);
}

:where(a, button) {
  transition:
    color var(--rh-motion-fast) var(--rh-ease-out),
    background-color var(--rh-motion-fast) var(--rh-ease-out),
    border-color var(--rh-motion-fast) var(--rh-ease-out),
    transform var(--rh-motion-base) var(--rh-ease-out),
    box-shadow var(--rh-motion-base) var(--rh-ease-out);
}
```

Use the actual project variable names and existing focus exceptions where a component already owns a deliberate focus style; do not create a duplicate ring on the same element.

- [ ] **Step 2: Refine the shared shell and component rhythm**

Add final rules for `.site-header`, `.main-nav`, `.cart-btn`, `.menu-btn`, `.btn`, `.sec-head`, `.sec-title`, `.prod-card`, `.tile`, `.collage-item`, `.deck-card`, `.field`, `.site-footer`, `.cart-drawer`, and `.modal`. The rules must:

- Give the header a readable glass surface after scroll without reducing contrast.
- Make active nav, button, card, and form states distinct in hover, pressed, and focus-visible states.
- Lift cards only on fine pointers, keeping touch layouts stable.
- Use the shared tokens for reveal/hover timing and avoid animating `width`, `height`, `top`, `left`, `margin`, or `padding`.
- Keep headings and section gaps fluid with `clamp()` while retaining the existing page-specific composition.

- [ ] **Step 3: Fix floating UI collisions and mobile safe areas**

Override `.consent-banner`, `.consent-banner-actions`, `.wa-float`, and the floating cart/menu controls so that:

- Desktop consent width is `min(560px, calc(100vw - 48px))`, with the existing safe-area-aware bottom offset.
- The desktop banner remains clear of the left-aligned home hero actions at the baseline viewport.
- The mobile banner uses `width: calc(100vw - 24px)`, wraps actions cleanly, and respects `env(safe-area-inset-bottom)`.
- Floating controls never sit above the modal/drawer layer and do not cause horizontal overflow.

- [ ] **Step 4: Add coherent reveal and reduced-motion rules**

Use the existing `.reveal`, `.rh-in`, `.rh-clip-reveal`, `.rh-internal-item`, `.rh-hero-ready`, and `.rh-hero-in` classes to create one consistent reveal curve. Add a media query that sets transition and animation durations to `0ms`, removes transforms, and leaves opacity at `1` for all content-bearing elements. Keep horizontal rails navigable when motion is reduced.

- [ ] **Step 5: Run the focused contract test and inspect the diff**

Run: `node --test scripts/visual-polish.test.mjs`

Expected: PASS with four tests. Then run `git diff --check` and confirm the diff only contains the intended final visual layer.

- [ ] **Step 6: Commit the source CSS**

```bash
git add css/styles.css scripts/visual-polish.test.mjs
git commit -m "feat: polish shared visual system and motion"
```

### Task 3: Align the motion runtime with the visual layer

**Files:**
- Modify: `js/main.js` in `initLoader()` and the shared motion bootstrap near the existing `runMotionLayer()`/`startMotionLayer()` calls
- Test: `scripts/visual-polish.test.mjs`

**Interfaces:**
- Consumes: existing `REDUCED`, loader classes, reveal classes, GSAP/ScrollTrigger/Lenis guards, and `window.RH`.
- Produces: a bounded runtime state in which the visual layer is marked ready after the loader handoff and never blocks reduced-motion visitors.

- [ ] **Step 1: Extend the failing contract test**

Add assertions that `js/main.js`:

```js
assert.match(js, /rh-motion-ready/);
assert.match(js, /REDUCED[\s\S]*rh-motion-ready/);
assert.match(js, /rh-intro-lock/);
```

Run: `node --test scripts/visual-polish.test.mjs`

Expected: FAIL because the runtime does not yet expose `rh-motion-ready`.

- [ ] **Step 2: Add the smallest runtime state transition**

Add a helper named `markMotionReady()` that adds `rh-motion-ready` to `document.documentElement` and call it:

1. Immediately in the reduced-motion/visited-loader branch before returning.
2. In `complete()` immediately after the loader is removed.
3. In the no-loader fallback used by pages that do not render an intro loader.

Do not change the existing GSAP timelines, rail geometry, cart logic, or navigation timing. The class only makes the CSS state explicit and keeps CSS fallback behavior observable.

- [ ] **Step 3: Run focused tests and inspect runtime safety**

Run: `node --test scripts/visual-polish.test.mjs` and `git diff --check`.

Expected: PASS with five tests and no whitespace errors.

- [ ] **Step 4: Regenerate the published JavaScript and commit**

```bash
bash scripts/build-production.sh
git add js/main.js js/main.min.js css/styles.min.css *.html _headers .htaccess
git commit -m "feat: expose resilient motion-ready state"
```

### Task 4: Verify the full browser matrix

**Files:**
- Create: `output/playwright/visual-polish-home-1440.png` (ignored QA artifact)
- Create: `output/playwright/visual-polish-home-390.png` (ignored QA artifact)
- Create: `output/playwright/visual-polish-reduced-motion.png` (ignored QA artifact)
- Read: all eight public pages through the local static server

**Interfaces:**
- Consumes: the generated branch assets and public page routes.
- Produces: visual evidence and a written check of layout, motion, controls, and console behavior.

- [ ] **Step 1: Start a local static server**

Run from the repository root: `python3 -m http.server 5173`.

- [ ] **Step 2: Check the desktop page set**

At a 1440×900 viewport, visit each route:

```text
/
/catalogo.html
/servicio-tecnico.html
/nosotros.html
/contacto.html
/garantia.html
/privacidad.html
/404.html
```

For each page, confirm the title, header, main content, footer, focusable controls, and floating controls render without console errors or body-level horizontal overflow. On the home page, leave consent visible and confirm the hero actions remain clickable.

- [ ] **Step 3: Check mobile and tablet behavior**

Repeat home, catalog, service, about, and contact at 390×844 and 768×1024. Confirm no clipped text, no fixed UI collision, no body horizontal overflow, and that every horizontal rail can still be reached by touch/keyboard.

- [ ] **Step 4: Check reduced motion**

Enable `prefers-reduced-motion: reduce`, reload the home page with `?intro=1`, and confirm the loader does not lock the page, content is visible immediately, and the same controls remain operable.

- [ ] **Step 5: Save screenshots and record evidence**

Capture the desktop home, mobile home, and reduced-motion home into `output/playwright/`. Use the screenshots to check typography, CTA clearance, card rhythm, and the consent/floating-control relationship.

- [ ] **Step 6: Commit only if runtime changes are required**

QA artifacts remain ignored. If a browser finding requires a correction, return to the owning task, add or update its contract test first, then repeat the focused test and browser check before committing.

### Task 5: Run the complete production verification

**Files:**
- Read: `scripts/*.test.mjs`, `scripts/security-audit.sh`, `scripts/package-cloudflare.sh`
- Modify: only generated files if the build changes them

**Interfaces:**
- Consumes: the final branch source and generated assets.
- Produces: verified production artifacts suitable for pushing to GitHub.

- [ ] **Step 1: Run the full regression suite**

Run: `node --test scripts/*.test.mjs`

Expected: all tests pass with zero failures.

- [ ] **Step 2: Run the production build**

Run: `bash scripts/build-production.sh`

Expected: minified CSS/JS, SRI, cache versions, and CSP hashes regenerate without errors.

- [ ] **Step 3: Run the security and package checks**

Run:

```bash
bash scripts/security-audit.sh
bash scripts/package-cloudflare.sh
```

Expected: both commands exit successfully and the Cloudflare package contains the regenerated assets with matching SRI.

- [ ] **Step 4: Re-run the full suite after generation**

Run: `node --test scripts/*.test.mjs`

Expected: all tests still pass after generated files and HTML references change.

- [ ] **Step 5: Inspect the final diff and commit**

Run: `git status --short`, `git diff --stat origin/main...HEAD`, and `git diff --check`.

Confirm that no secrets, screenshots, logs, or unrelated rebase changes are included. Commit the generated production update:

```bash
git add css/styles.min.css js/*.min.js *.html _headers .htaccess scripts/visual-polish.test.mjs
git commit -m "build: regenerate polished production assets"
```

### Task 6: Push and integrate the verified branch

**Files:**
- Read: GitHub remote state and branch protection/status checks

**Interfaces:**
- Consumes: verified `codex/visual-polish` branch.
- Produces: the visual polish changes on the configured GitHub publication branch.

- [ ] **Step 1: Confirm the branch is clean and tests are fresh**

Run: `git status --short --branch` and `node --test scripts/*.test.mjs`.

Expected: a clean branch and zero test failures.

- [ ] **Step 2: Push the feature branch**

```bash
git push -u origin codex/visual-polish
```

- [ ] **Step 3: Integrate through the safest available GitHub path**

Prefer the repository's existing protected-branch workflow. If GitHub CLI/authentication is available, create a pull request from `codex/visual-polish` into `main`, wait for the required checks, and merge it. If direct main pushes are permitted and the user explicitly requested direct integration, fast-forward/merge only after fetching the latest `origin/main` and re-running the production verification on the merged result.

- [ ] **Step 4: Verify the remote result**

Run: `git fetch origin` and `git log --oneline --decorate -5 origin/main`.

Expected: the integrated commit(s) are present on the remote publication branch, with no force-push or destructive reset used.
