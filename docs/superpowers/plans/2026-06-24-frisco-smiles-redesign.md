# Frisco Smiles Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Frisco Smiles Dentistry site as a clean, hand-editable static site with a new "Clinical Calm" visual identity, preserving all real content and recreating every section + interactive behavior.

**Architecture:** Plain static site — no framework, no build step. Three files: `index.html` (semantic markup), `styles.css` (design tokens + section styles), `script.js` (vanilla-JS interactivity modules attached on `DOMContentLoaded`). Google Fonts + Unsplash images via hosted URLs. The original bundle is preserved as `index.original.html`.

**Tech Stack:** HTML5, CSS (custom properties, fl/grid), vanilla JavaScript (ES2020), Google Fonts (Space Grotesk, Inter), Unsplash hosted images.

**Content & design source of truth:** [`docs/superpowers/specs/2026-06-24-frisco-smiles-redesign-design.md`](../specs/2026-06-24-frisco-smiles-redesign-design.md). All copy (17 services, FAQ Q&As, testimonials, bio, contact details) lives there — copy it verbatim into the markup; do not paraphrase.

**Verification model:** No test runner. Each task ends with a manual browser check (open `index.html`, confirm specific behavior, no console errors) and a commit. Keep `index.html` openable directly via `file://` at every step.

**Design tokens (define once in `:root`):**
```css
:root{
  --bg:#F5F9F9; --bg-2:#EAF3F3; --mist:#E6F0F1; --soft:#CFE4E6;
  --teal:#0E7C86; --teal-deep:#0B5d65; --deep:#0F2E36;
  --ink:#1B3A40; --muted:#4A5E62; --muted-2:#6A7C80; --line:rgba(15,46,54,.08);
  --radius:14px; --radius-lg:18px; --shadow:0 12px 40px rgba(15,46,54,.10);
  --maxw:1200px; --font-head:'Space Grotesk',sans-serif; --font-body:'Inter',sans-serif;
}
```

---

### Task 1: Preserve original + scaffold the three files

**Files:**
- Rename: `index.html` → `index.original.html`
- Create: `index.html`, `styles.css`, `script.js`

- [ ] **Step 1: Preserve the original bundle**

```bash
git mv index.html index.original.html
```

- [ ] **Step 2: Create `styles.css` with reset + design tokens**

Include a minimal reset (`*{box-sizing:border-box;margin:0;padding:0}`), the `:root` token block above, `html{scroll-behavior:smooth}`, base `body{font-family:var(--font-body);color:var(--ink);background:var(--bg);line-height:1.6;-webkit-font-smoothing:antialiased}`, and a `.container{max-width:var(--maxw);margin:0 auto;padding:0 28px}` helper.

- [ ] **Step 3: Create `index.html` shell**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Frisco Smiles Dentistry — Family & Cosmetic Dentist in Frisco, TX</title>
  <meta name="description" content="A calm, modern dental practice in Frisco, TX. Family, cosmetic, and restorative dentistry from Dr. Thanh K. Hong, DMD.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body id="top">
  <!-- sections added in later tasks -->
  <script src="script.js"></script>
</body>
</html>
```

- [ ] **Step 4: Create empty `script.js`**

```js
document.addEventListener('DOMContentLoaded', () => {
  // interactivity modules registered in later tasks
});
```

- [ ] **Step 5: Verify**

Open `index.html` in a browser. Expected: blank cream page, fonts load, no console errors. Confirm `index.original.html` still opens and renders the old site.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "scaffold: preserve original bundle, add clean index/styles/script"
```

---

### Task 2: Sticky nav + scroll-progress bar

**Files:** Modify `index.html` (add `<header>`), `styles.css`, `script.js`.

- [ ] **Step 1: Add the scroll-progress bar + sticky header markup** at the top of `<body>`.

```html
<div class="progress" id="progress"></div>
<header class="nav">
  <div class="container nav-inner">
    <a href="#top" class="brand">
      <span class="brand-mark">F</span>
      <span class="brand-text">
        <strong>Frisco Smiles</strong>
        <small>Dentistry · Frisco TX</small>
      </span>
    </a>
    <nav class="nav-links" id="navLinks">
      <a href="#care">Care</a>
      <a href="#smiles">Smiles</a>
      <a href="#doctor">Our Doctor</a>
      <a href="#faq">FAQ</a>
      <a href="#visit">Visit</a>
    </nav>
    <button class="btn btn-primary" data-open-booking>Book a visit</button>
    <button class="nav-toggle" id="navToggle" aria-label="Menu" aria-expanded="false">☰</button>
  </div>
</header>
```

- [ ] **Step 2: Style** the progress bar (`position:fixed;top:0;left:0;height:3px;background:var(--teal);width:0;z-index:100`), sticky nav (`position:sticky;top:0;z-index:90;backdrop-filter:blur(10px);background:rgba(245,249,249,.85);border-bottom:1px solid var(--line)`), brand mark (teal rounded square), `.btn`/`.btn-primary` (define the reusable button here), and `.nav-toggle{display:none}`.

- [ ] **Step 3: Add JS modules** to `script.js`:

```js
// scroll progress
const progress = document.getElementById('progress');
const onScroll = () => {
  const h = document.documentElement;
  const pct = h.scrollTop / (h.scrollHeight - h.clientHeight || 1) * 100;
  progress.style.width = pct + '%';
};
document.addEventListener('scroll', onScroll, { passive: true }); onScroll();

// mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});
navLinks?.addEventListener('click', e => {
  if (e.target.tagName === 'A') { navLinks.classList.remove('open'); navToggle.setAttribute('aria-expanded','false'); }
});
```

- [ ] **Step 4: Verify** — scrolling moves the progress bar; nav stays pinned with blur; anchor links scroll smoothly. No console errors.

- [ ] **Step 5: Commit** — `git commit -am "feat: sticky nav + scroll progress bar"`

---

### Task 3: Hero + trust strip

**Files:** Modify `index.html`, `styles.css`.

- [ ] **Step 1: Add hero `<section>`** after `<header>` using the exact hero copy from the spec (kicker "Comprehensive family & cosmetic dentistry", H1 "Dental care that feels like being cared for.", the full subcopy paragraph, primary CTA `data-open-booking` "Request an appointment", secondary anchor "Meet Dr. Hong →" → `#doctor`). Include a hero image:

```html
<img class="hero-img" loading="eager"
     src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=900&q=80"
     alt="Smiling patient at a modern dental practice">
```
Add a floating stat card overlay: **17+ yrs** / "caring for Frisco smiles".

- [ ] **Step 2: Add the trust strip** below the hero — a marquee/row: Invisalign® · Ceramic Crowns · Implant Dentistry · Teeth Whitening · Pediatric Care · Digital Impressions. Use `--deep` background, mono-ish uppercase Space Grotesk, letter-spacing.

- [ ] **Step 3: Style** the hero as a 2-col grid (`1.1fr .9fr`, gap 30px) collapsing to one column under 760px; H1 in Space Grotesk ~clamp(34px,5vw,48px); image rounded with shadow; stat card absolutely positioned bottom-left of the image.

- [ ] **Step 4: Verify** — hero matches the approved mockup look (teal accents, real photo, stat card); trust strip reads as a dark band; responsive collapse works when narrowing the window.

- [ ] **Step 5: Commit** — `git commit -am "feat: hero section + trust strip"`

---

### Task 4: Services (Care) — filterable

**Files:** Modify `index.html`, `styles.css`, `script.js`.

- [ ] **Step 1: Add `<section id="care">`** with heading "Comprehensive care, thoughtfully delivered.", a filter tab row (All / Preventive / Restorative / Cosmetic), and a grid of all **17 service cards** from the spec. Each card carries a category for filtering:

```html
<button class="filter active" data-filter="all">All</button>
<button class="filter" data-filter="preventive">Preventive</button>
<!-- ... -->
<article class="svc" data-cat="preventive">
  <h3>Cleanings &amp; Exams</h3>
  <p>Gentle routine visits that keep trouble away.</p>
</article>
<!-- ...remaining 16 from spec, exact titles + descriptions... -->
```

- [ ] **Step 2: Style** filter pills (active = teal fill) and a responsive card grid (`repeat(auto-fill,minmax(260px,1fr))`, gap 18px), cards with `--radius` and hover lift.

- [ ] **Step 3: Add filter JS:**

```js
const filters = document.querySelectorAll('.filter');
const svcs = document.querySelectorAll('.svc');
filters.forEach(btn => btn.addEventListener('click', () => {
  filters.forEach(f => f.classList.remove('active'));
  btn.classList.add('active');
  const cat = btn.dataset.filter;
  svcs.forEach(s => { s.style.display = (cat === 'all' || s.dataset.cat === cat) ? '' : 'none'; });
}));
```

- [ ] **Step 4: Verify** — all 17 services present with correct text; clicking each tab filters correctly; "All" restores everything; active pill styling updates.

- [ ] **Step 5: Commit** — `git commit -am "feat: filterable services section"`

---

### Task 5: Before/After slider (Smiles)

**Files:** Modify `index.html`, `styles.css`, `script.js`.

- [ ] **Step 1: Add `<section id="smiles">`** with heading "See the smile you've been waiting for." and a comparison widget: a container holding two stacked Unsplash smile photos (after = full, before = clipped) and a draggable handle.

```html
<div class="ba" id="ba">
  <img class="ba-after" src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1000&q=80" alt="Bright, healthy smile after treatment">
  <div class="ba-before" id="baBefore" style="width:50%">
    <img src="https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=1000&q=80" alt="Smile before treatment">
  </div>
  <div class="ba-handle" id="baHandle" style="left:50%"></div>
</div>
```

- [ ] **Step 2: Style** — `.ba{position:relative;overflow:hidden;border-radius:var(--radius-lg)}`, both images same fixed aspect ratio/size, `.ba-before{position:absolute;inset:0;overflow:hidden}` clipping its child, `.ba-handle` a vertical bar with a grab knob.

- [ ] **Step 3: Add drag JS** (pointer events, clamp 0–100%):

```js
const ba = document.getElementById('ba');
if (ba) {
  const before = document.getElementById('baBefore');
  const handle = document.getElementById('baHandle');
  let dragging = false;
  const setPct = clientX => {
    const r = ba.getBoundingClientRect();
    const pct = Math.min(100, Math.max(0, (clientX - r.left) / r.width * 100));
    before.style.width = pct + '%'; handle.style.left = pct + '%';
  };
  ba.addEventListener('pointerdown', e => { dragging = true; setPct(e.clientX); });
  window.addEventListener('pointermove', e => { if (dragging) setPct(e.clientX); });
  window.addEventListener('pointerup', () => dragging = false);
}
```

- [ ] **Step 4: Verify** — dragging the handle reveals/hides the before image smoothly; clamps at edges; works with mouse drag.

- [ ] **Step 5: Commit** — `git commit -am "feat: before/after comparison slider"`

---

### Task 6: Doctor + Experience

**Files:** Modify `index.html`, `styles.css`.

- [ ] **Step 1: Add `<section id="doctor">`** — label "Meet your dentist", name "Dr. Thanh K. Hong, DMD", the exact bio paragraph from the spec, a tag "Cosmetic & restorative", and a real headshot:

```html
<img class="doc-photo" loading="lazy"
     src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=700&q=80"
     alt="Dr. Thanh K. Hong, DMD">
```

- [ ] **Step 2: Add the Experience block** — heading "Why patients keep coming back." and four cards (exact titles + copy from spec): Unhurried visits, Digital & precise, Truly gentle, One trusted roof.

- [ ] **Step 3: Style** — doctor as 2-col (photo + text), experience as a 4-up responsive grid of soft cards.

- [ ] **Step 4: Verify** — bio + four experience cards present with exact copy; portrait loads; responsive stacking works.

- [ ] **Step 5: Commit** — `git commit -am "feat: doctor bio + experience cards"`

---

### Task 7: Testimonials carousel

**Files:** Modify `index.html`, `styles.css`, `script.js`.

- [ ] **Step 1: Add testimonials `<section>`** — three slides with exact quotes + attributions from spec (Maya R. / Patient since 2021; Daniel K. / Crown & implant patient; Priya S. / Mom of two), prev/next buttons, and dot indicators.

- [ ] **Step 2: Style** — single visible slide (track with `transform:translateX`), centered quote, controls, active-dot styling.

- [ ] **Step 3: Add carousel JS:**

```js
const track = document.getElementById('tTrack');
if (track) {
  const slides = track.children.length;
  let i = 0;
  const dots = document.querySelectorAll('.t-dot');
  const go = n => {
    i = (n + slides) % slides;
    track.style.transform = `translateX(-${i*100}%)`;
    dots.forEach((d,di) => d.classList.toggle('active', di===i));
  };
  document.getElementById('tPrev')?.addEventListener('click', () => go(i-1));
  document.getElementById('tNext')?.addEventListener('click', () => go(i+1));
  dots.forEach((d,di) => d.addEventListener('click', () => go(di)));
  go(0);
}
```

- [ ] **Step 4: Verify** — next/prev cycle through all three (wrapping); dots jump to slide and reflect active state.

- [ ] **Step 5: Commit** — `git commit -am "feat: testimonials carousel"`

---

### Task 8: FAQ accordion

**Files:** Modify `index.html`, `styles.css`, `script.js`.

- [ ] **Step 1: Add `<section id="faq">`** — heading "Questions, answered." and six items (exact Q + A from spec). Use a button + collapsible panel per item:

```html
<div class="faq-item">
  <button class="faq-q" aria-expanded="false">Are you accepting new patients?<span>+</span></button>
  <div class="faq-a"><p>Absolutely — we love welcoming new faces. Call our new-patient line at (469) 212-9064 and we'll find a time that fits your schedule.</p></div>
</div>
```

- [ ] **Step 2: Style** — `.faq-a{max-height:0;overflow:hidden;transition:max-height .3s}` opened via an `.open` class on the item; rotate/swap the `+`/`−`.

- [ ] **Step 3: Add accordion JS** (single-open):

```js
document.querySelectorAll('.faq-q').forEach(q => q.addEventListener('click', () => {
  const item = q.parentElement;
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(o => { o.classList.remove('open'); o.querySelector('.faq-q').setAttribute('aria-expanded','false'); });
  if (!isOpen) { item.classList.add('open'); q.setAttribute('aria-expanded','true'); }
}));
```
Set opened panel height via CSS `.faq-item.open .faq-a{max-height:300px}`.

- [ ] **Step 4: Verify** — all six Q&As present; clicking opens one and closes others; `aria-expanded` toggles; icon swaps.

- [ ] **Step 5: Commit** — `git commit -am "feat: FAQ accordion"`

---

### Task 9: Visit/Contact + Footer

**Files:** Modify `index.html`, `styles.css`.

- [ ] **Step 1: Add `<section id="visit">`** — heading "Come see us in Frisco.", "Our office" 2955 Eldorado Pkwy, Suite 110, Frisco, TX 75033; phones New (469) 212-9064 (tel link) and Existing (469) 294-4239; "Office hours" Mon–Fri 8:00am–5:00pm, closed weekends; an office photo + a static (non-interactive) map placeholder block — no live map embed (out of scope); a "Call us" / "Book a visit" CTA (`data-open-booking`).

```html
<img loading="lazy" src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=900&q=80" alt="Frisco Smiles Dentistry office">
```

- [ ] **Step 2: Add `<footer>`** — brand block, nav links, a Facebook link (`https://www.facebook.com/FriscoSmilesDentistry/`), and copyright "© 2026 Frisco Smiles Dentistry".

- [ ] **Step 3: Style** visit as 2-col (details + photo/map), dark footer matching `--deep`.

- [ ] **Step 4: Verify** — address/phones/hours exact; `tel:` links work; footer renders; responsive stack.

- [ ] **Step 5: Commit** — `git commit -am "feat: visit/contact section + footer"`

---

### Task 10: Booking modal (5-step, visual-only)

**Files:** Modify `index.html`, `styles.css`, `script.js`.

- [ ] **Step 1: Add the modal markup** at the end of `<body>` — a backdrop + dialog with a header (title + progress dots + close), and five step panels:
  0. **Reason** — "What brings you in?" choices (New patient exam & cleaning, Cleaning & checkup, Cosmetic consult, Tooth pain / emergency, Something else).
  1. **Day** — "Pick a day" (next ~5 weekdays as buttons).
  2. **Time** — "Choose a time" (e.g. 8:00, 9:30, 11:00, 1:30, 3:00).
  3. **Details** — "Your details" (name + phone inputs).
  4. **Confirmation** — "Request received!" summary.
  Footer controls: Back / Next (Next disabled until the current step has a selection; final step shows "Request appointment").

```html
<div class="modal" id="booking" hidden>
  <div class="modal-backdrop" data-close-booking></div>
  <div class="modal-card" role="dialog" aria-modal="true" aria-label="Book an appointment">
    <!-- header, step panels, footer controls -->
  </div>
</div>
```

- [ ] **Step 2: Style** — fixed full-screen overlay, centered card, step panels toggled by a `data-step` attribute on the card, progress dots, disabled-button state. Hidden via the `hidden` attribute.

- [ ] **Step 3: Add modal state-machine JS:**

```js
const modal = document.getElementById('booking');
const state = { step: 0, reason: '', day: '', time: '', name: '', phone: '' };
const open = () => { modal.hidden = false; document.body.style.overflow = 'hidden'; render(); };
const close = () => { modal.hidden = true; document.body.style.overflow = ''; };
document.querySelectorAll('[data-open-booking]').forEach(b => b.addEventListener('click', open));
document.querySelectorAll('[data-close-booking]').forEach(b => b.addEventListener('click', close));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) close(); });
// render(): show panel for state.step, fill confirmation summary, enable/disable Next based on
// the required field for the current step; Back/Next adjust state.step (clamped 0–4);
// choice/day/time buttons set state + advance; final button just advances to step 4 (no network).
```
On open, move focus to the first focusable control in the card; keep focus within the card on
Tab (simple focus trap) and restore focus to the trigger button on close.

- [ ] **Step 4: Verify** — every `data-open-booking` button opens the modal; stepping through reason→day→time→details→confirmation works; Next is gated until a selection exists; Back works; confirmation shows the chosen summary; Escape + backdrop + close button all dismiss; body scroll locks while open. No network calls.

- [ ] **Step 5: Commit** — `git commit -am "feat: 5-step booking modal (visual-only)"`

---

### Task 11: Responsive polish, accessibility, final verification

**Files:** Modify `styles.css`, possibly `index.html`/`script.js`.

- [ ] **Step 1: Mobile pass** — add the `.nav-toggle{display:block}` + `.nav-links` mobile dropdown styles under a `@media(max-width:760px)` breakpoint; confirm every section collapses to one column sensibly; tap targets ≥40px.

- [ ] **Step 2: Accessibility pass** — verify all images have meaningful `alt`; filter tabs, FAQ, carousel, and modal are keyboard-operable; visible focus styles (`:focus-visible`) on interactive elements; modal closes on Escape (already wired).

- [ ] **Step 3: Cross-section sweep** — open `index.html`, scroll the whole page at desktop width, then at ~375px width (devtools). Confirm: no horizontal overflow, no overlapping elements, all real content from the spec present, no broken images, no console errors/warnings.

- [ ] **Step 4: Run @superpowers:requesting-code-review** before final commit.

- [ ] **Step 5: Final commit** — `git commit -am "polish: responsive + accessibility pass, final verification"`

---

## Done criteria

- `index.html`/`styles.css`/`script.js` render the full redesigned site in the Clinical Calm style.
- All 12 sections present with the exact spec content; all 7 interactive behaviors work.
- Real images load; booking is visual-only; no console errors; responsive at mobile + desktop.
- `index.original.html` retained for reference.
