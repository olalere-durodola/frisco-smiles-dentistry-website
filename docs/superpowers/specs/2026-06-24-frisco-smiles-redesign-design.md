# Frisco Smiles Dentistry — Site Redesign Design Doc

**Date:** 2026-06-24
**Status:** Approved (direction + look)

## Problem

The current site is a single 598 KB `index.html` — a tool-generated bundle using a custom
`<x-dc>` template engine, `{{ }}` variables, and a compiled JS runtime that drives all
interactivity. The content (services, testimonials, FAQ, contact info) is embedded as data
objects inside the template. This bundle is effectively un-editable by hand, so any real
redesign requires rebuilding the site as clean, maintainable code.

## Goal

Rebuild the site as a clean, hand-editable static site with a new visual identity
("Clinical Calm"), preserving all real business content and recreating the existing
section structure and interactivity.

## Approach

Plain static site — no framework, no build step:

- `index.html` — semantic markup, all sections.
- `styles.css` — design system + section styles.
- `script.js` — vanilla JS for all interactivity.
- Google Fonts (Space Grotesk + Inter) via `<link>`.
- Original bundle kept as `index.original.html` for reference.

Rejected alternatives: restyling inside the existing bundle (fragile, opaque);
introducing a framework/build step (unnecessary for a static marketing site, adds friction
for future edits).

## Visual System ("Clinical Calm")

- **Palette:** mist backgrounds `#F5F9F9` / `#EAF3F3`; teal accent `#0E7C86`;
  deep ink `#0F2E36`; soft accent `#CFE4E6`; muted text `#4A5E62` / `#6A7C80`.
- **Type:** Space Grotesk (headings, labels, stats); Inter (body).
- **Feel:** airy whitespace, soft rounded cards (12–18px radius), subtle shadows,
  trustworthy modern-medical.
- Defined as CSS custom properties so the palette can be retuned in one place.

## Sections & Content

All content below is the real copy extracted from the current bundle.

1. **Sticky nav + scroll-progress bar.** Logo "F" + "Frisco Smiles / Dentistry · Frisco TX".
   Links: Care, Smiles, Our Doctor, FAQ, Visit. CTA: "Book a visit". Mobile: collapsible menu.
2. **Hero.** Kicker, H1 "Dental care that feels like being cared for.", subcopy
   ("A calm, modern practice in Frisco where skilled, compassionate dentistry meets the warmth
   of a neighborhood you trust — for healthy, beautiful smiles at every age."),
   primary CTA "Request an appointment" + secondary "Meet Dr. Hong", portrait/visual with
   "17+ yrs" stat card.
3. **Trust strip.** Marquee: Invisalign® · Ceramic Crowns · Implant Dentistry ·
   Teeth Whitening · Pediatric Care · Digital Impressions.
4. **Services (Care).** Heading "Comprehensive care, thoughtfully delivered." Filter tabs:
   Preventive / Restorative / Cosmetic (+ All). 17 services with descriptions:
   - *Preventive:* Cleanings & Exams, Oral Cancer Screening, Fluoride & Sealants,
     Pediatric Dentistry, Periodontal Care, Night Guards.
   - *Restorative:* Ceramic Crowns, Implant Dentistry, Tooth-Colored Fillings,
     Bridges & Dentures, Inlays & Onlays, Emergency Care.
   - *Cosmetic:* Invisalign®, Teeth Whitening, Porcelain Veneers, Cosmetic Bonding,
     Smile Makeovers.
5. **Before/After (Smiles).** Heading "See the smile you've been waiting for."
   Draggable comparison slider (placeholder images).
6. **Doctor.** "Dr. Thanh K. Hong, DMD". Bio: "Dr. Hong leads Frisco Smiles with a steady
   hand and a genuine warmth that puts even the most anxious patients at ease. His philosophy
   is simple: listen first, explain clearly, and treat every smile the way he'd treat his own
   family's." Portrait placeholder.
7. **Experience.** Heading "Why patients keep coming back." Four cards:
   Unhurried visits, Digital & precise, Truly gentle, One trusted roof.
8. **Testimonials.** Carousel of three: Maya R. (Patient since 2021), Daniel K.
   (Crown & implant patient), Priya S. (Mom of two), with the extracted quotes.
9. **FAQ.** Accordion, six Q&As (accepting new patients; insurance/PPO + membership;
   dental emergency; treating children; Invisalign cost/financing; office hours Mon–Fri 8–5).
10. **Visit/Contact.** "Come see us in Frisco." Address: 2955 Eldorado Pkwy, Suite 110,
    Frisco, TX 75033. Phones: New (469) 212-9064 / Existing (469) 294-4239.
    Hours: Mon–Fri 8:00am–5:00pm, closed weekends. Map placeholder. "Call us" CTA.
11. **Footer.** Brand, nav links, social, copyright.
12. **Booking modal.** Five steps — (0) reason, (1) day, (2) time, (3) details
    (name/phone), (4) confirmation "Request received!". Visual-only state machine;
    no backend submission.

## Interactivity (vanilla JS)

Each behavior is a small, independent module attached on `DOMContentLoaded`:

- Scroll-progress bar width tracking.
- Mobile nav toggle.
- Services filter (show/hide by category).
- Before/after drag slider (pointer events, clamped 0–100%).
- Testimonial carousel (prev/next + dots).
- FAQ accordion (single-open).
- Booking modal state machine (open/close, step navigation, field capture, confirmation).

## Error Handling / Edge Cases

- Booking "submit" never hits a network — always resolves to the confirmation step.
- Slider/carousel clamp to valid bounds; keyboard-accessible where reasonable.
- Modal traps focus and closes on Escape / backdrop click.
- Responsive breakpoints for mobile (single column, hidden desktop nav → menu).

## Out of Scope

Real booking/contact backend; real photography (placeholders/SVG used); analytics;
multi-page routing; CMS.

## Testing

Manual verification in a browser:

- All sections render with the correct real content.
- Each interactive module works (filter, slider, carousel, accordion, modal flow).
- Layout holds at mobile and desktop widths.
- No console errors.

## Files

- `index.html` (new) — markup.
- `styles.css` (new) — design system + sections.
- `script.js` (new) — interactivity.
- `index.original.html` (renamed from current `index.html`) — reference.
