# RALLY Interview Hub

Last updated: 2026-11-19

A mobile-first, Arabic RTL interview workspace for **RALLY Menoufia · Operations**. The initial version is a deliberately small, client-only app for an individual interviewer conducting in-person technical interviews.

## What's included

- 13 Operations applicants are available through an AES-256-GCM encrypted roster bundle. First-time import requires a separate passphrase; applicant names are never stored in plaintext in this public repository. The initial blank 12-slot state is retained until import.
- The **six previously approved weighted criteria (15%, 20%, 20%, 15%, 15%, 15%)**, exactly sourced from the approved Operations interview bank.
- **36 approved question/scenario cards**, including TWIST / WATCH notes, automatically queued for each interview with no three-card stop.
- **Twelve suggested starting mixes** define the first questions, followed automatically by all remaining cards. Every card presents its own criterion, rating and notes in one screen.
- Auto-save for per-question ratings (0–5); each question updates only its linked criterion. A criterion is the mean of scored questions in that category. **Not Evaluated is `null`, not zero**. The final weighted score / 100 is only displayed when all six criteria are rated.
- Interview timer, completed/interrupted states, final decisions, filtered dashboard, rankings, CSV reports, and JSON backup/restore with validation.
- Responsive views for desktop and mobile; no authentication, database, or external runtime JavaScript dependencies.

## Important operational limitations

**Storage is browser-local (`localStorage`).** It is not shared across devices, users, or browsers, and browser data clearing can destroy it. Export a JSON backup after each interview day. This is **not** a multi-interviewer or cloud-synced system. Do not treat it as production-grade secure applicant-record storage.

The **GitHub repository is public and this app is not access controlled**: the question bank and interviewer's TWIST/WATCH notes bundled in the app are viewable by anyone who can access the site or source code. The `noindex` meta tag does not provide security. Before using with confidential interview content, switch to a private code/data arrangement and introduce server-side authentication and access controls.

No plaintext applicant names, emails or phone numbers are included in source control. The original 13 names are encrypted in `assets/operations-roster.enc.json`, decryptable only with the separately shared secret. Local browser storage remains unencrypted. Avoid sharing the passphrase or backups.

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

## First-time Operations roster activation

1. Open the deployed site, then choose **تحميل متقدمين Operations** from the Overview screen.
2. Paste the separately delivered roster passphrase into the dialog.
3. The 13 names are decrypted in the browser, merged with existing candidate slots without overwriting recorded interviews, and saved locally. Repeating the import will not create duplicates.
4. After each interview day, export a JSON backup from Settings and store it securely. Never publish this backup or the passphrase in GitHub or a public chat.

The app deliberately does **not** contain a shared backend or automatic cross-device roster synchronization. The published roster bundle is encrypted at rest; after import, the localStorage copy is **not encrypted**. The passphrase is not stored in the repository or on Vercel.