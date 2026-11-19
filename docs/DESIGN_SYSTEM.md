# RALLY Interview Hub — Design System

Last updated: 2026-11-19

## Provenance & intent

Design based on the user's uploaded `ui-ux-pro-max` skill (`SKILL.md`, `references/quick-reference.md`, `references/pro-rules.md`) and its product-wide `--design-system`/`--stack react` recommendations. The generated baseline recommended minimal/Swiss style, which **does** fit an operations interview tool; its lavender palette, marketing landing pattern and Lora/Raleway typography **do not** fit this product or the explicit request. Those were rejected. This is a focused interviewer tool, not a decorative SaaS or landing page.

## Visual identity

- **Direction:** quiet Swiss-influenced operational editorial UI; flat surfaces, strict rhythm, no glassmorphism, no gradients, no stock photography, no huge decorative illustrations.
- **Palette:** off-white `#F6F8F6` background; white `#FFFFFF` surfaces; deep petrol `#1B6064` interactive primary; dark ink `#1D3035` text; restrained sage `#EAF2EF` functional tint; subtle border `#E3E9E6`.
- **Typography:** `IBM Plex Sans Arabic` for Arabic UI and `DM Sans` for Latin technical identifiers; local fallbacks `Tahoma`, `Segoe UI`, sans-serif. Body base 16px, 1.55 line-height; critical question text 20–25px, titles 29–43px. Latin codes use tabular figures; no display-font theatrics.
- **Shape:** radii 8–13px, minimal shadow, no oversized rounded pills on cards. Spacing built from 4/8px cadence, mobile gutters 13–18px, desktop 24–60px.
- **Iconography:** consistent 1.8px stroke inline SVG; no emoji icons. Decorative SVGs have `aria-hidden`.

## Interaction & information hierarchy

1. **Focus-first:** dashboard shows candidate slot, status and action, not graphs or performative metrics. One visually dominant action on each screen.
2. **Questions:** 36-card automatic queue that continues until explicit finish; TWIST/WATCH and one criterion-specific 0–5 rating are visible alongside the current question.
3. **Assessment:** one per-question 0–5 scale tied to that question’s criterion, aggregated by criterion mean; zero is recorded and missing is *Not Evaluated*. Score only appears at 6/6 coverage. A completion with missing criteria is flagged for review rather than scored as zero.
4. **Local data honesty:** visible local-only storage status, manual JSON backup/restore, explicit restore confirmation, CSV export with spreadsheet formula escaping.
5. **Micro-feedback:** subtle hover/press, responsive button states, no decorative entrance animation. Reduced-motion media query disables visual transitions.

## A11y / QA targets

- Keyboard navigation, visible focus ring and skip link; `dialog` for accessible modal focus containment.
- Explicit labels/ARIA names, `aria-pressed` for scale selection, textual statuses beyond color.
- Small-screen tap targets generally ≥44px for primary interactive controls, with no hover-only actions.
- No page-level horizontal overflow at viewport widths 390px and 1440px in tested views.
- Body/important secondary text colors target WCAG AA 4.5:1 against white. Tiny section metadata intentionally remains secondary; it does not replace readable labels.
- Bottom navigation respects phone safe-area inset and page content has padding to avoid overlap.
- Mobile inputs and notes are 16px to avoid browser text zoom.

## Non-goals of this phase

- React/Tailwind: not needed for a 4-screen, single-user static MVP; removing npm runtime dependencies improves deployment reliability. If teams, access control, network synchronization or rich reports become real requirements, move to a tested app architecture and database rather than extending localStorage into a pseudo-backend.
- Dark mode: not introduced without independently verifying its contrast and visual system. Current approved direction is light, calm and highly readable.
- Branding: the `R` symbol is an original placeholder monogram for the tool, **not** an assertion that it is Rally's official logo.