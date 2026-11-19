# RALLY Interview Hub

Last updated: 2026-11-19

A mobile-first, Arabic RTL interview workspace for **RALLY Menoufia · Operations**. The initial version is a deliberately small, client-only app for an individual interviewer conducting in-person technical interviews.

## What's included

- Twelve editable candidate slots (placeholders, **not** real applicant records); additional candidates can be added.
- The **six previously approved weighted criteria (15%, 20%, 20%, 15%, 15%, 15%)**, exactly sourced from the approved Operations interview bank.
- **36 approved question/scenario cards**, including original TWIST / WATCH notes, organized into six categories.
- **Twelve suggested three-question interview mixes**, preserving their original codes. Interviewers can select extra questions, mark questions asked, and write notes.
- Auto-save for interviews and criterion ratings (0–5); **Not Evaluated is `null`, not zero**. The final weighted score / 100 is only displayed when all six criteria are rated.
- Interview timer, completed/interrupted states, final decisions, filtered dashboard, rankings, CSV reports, and JSON backup/restore with validation.
- Responsive views for desktop and mobile; no authentication, database, or external runtime JavaScript dependencies.

## Important operational limitations

**Storage is browser-local (`localStorage`).** It is not shared across devices, users, or browsers, and browser data clearing can destroy it. Export a JSON backup after each interview day. This is **not** a multi-interviewer or cloud-synced system. Do not treat it as production-grade secure applicant-record storage.

The **GitHub repository is public and this app is not access controlled**: the question bank and interviewer's TWIST/WATCH notes bundled in the app are viewable by anyone who can access the site or source code. The `noindex` meta tag does not provide security. Before using with confidential interview content, switch to a private code/data arrangement and introduce server-side authentication and access controls.

No original applicants' names or private contact details are included in source control. The 12 initial slots are intentionally blank.

## Development

This app is compiled from **TypeScript to browser-native ES modules**, uses **semantic HTML + CSS**, and has **no npm runtime dependencies**. The design follows the supplied `ui-ux-pro-max` rules, with small touch-friendly controls, visible focus, reduced-motion support, and an editorial/minimal layout.

```bash
# Rebuild generated browser JavaScript after editing src/*.ts
npx --yes --package typescript@5.9.3 tsc -p tsconfig.json

# Serve static files from repository root (Python 3 required)
python3 -m http.server 8765
# Visit http://localhost:8765

# Run deterministic data/scoring/export tests (Node 22+)
node --experimental-default-type=module --test tests/*.test.mjs
```

Use a local TypeScript installation instead of `npx` in offline environments (`tsc -p tsconfig.json`). Deployed output is the repository root (`index.html`, `assets/`, `favicon.svg`); Vercel can serve it as a static site, with **no build command**.

### File map

| Path | Purpose |
| --- | --- |
| `src/data/bank.ts` | Canonical approved questions, criterion weights and interview packs |
| `src/store.ts` | Validated data model, score computation, persistence and export functions |
| `src/app.ts` | Views, navigation, timer and event handling |
| `assets/` | Checked-in compiled ES modules and stylesheet for static hosting |
| `docs/DESIGN_SYSTEM.md` | Approved visual/interaction system and skill-derived constraints |
| `docs/QA_REPORT.md` | Verification details and unverified limits |

When updating the questionnaire, **do not silently replace or invent approved criteria/questions**. Version changes to data schema require a migration before deploying; `validateState` currently supports version 1.

## Scoring

Each criterion is an integer score `0..5` or `null` (Not Evaluated). Once all six have a score:

```text
overall / 100 = Σ [(criterionScore / 5) × criterionWeight]
```

A completed interview without six criterion ratings stays **unranked** until its missing evidence is entered. Decisions are manually assigned; there is no automatic acceptance threshold.

## Deploy to Vercel

Create or link a Vercel project to `mahmoud-kun/Rally-Interview-Hup` → `main`. Framework preset: `Other`; root directory: repository root; build command: **none**; output directory: repository root (`.`). Vercel automatically deploys future pushes to `main` once linked.