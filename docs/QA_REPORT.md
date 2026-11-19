# RALLY Interview Hub — Selected Bank & Randomized Interview Cycles QA

Last updated: 2026-11-19

## Verified in the local workspace

- TypeScript build: `tsc -p tsconfig.json` **PASS**.
- Automated deterministic tests: **12/12 PASS**, including per-question weighted criterion calculation, old-state migration, deduplicated roster merge, invalid records, exported CSV escaping, and roster ciphertext format.
- Headless Chromium interactive checks: **PASS** at 360 × 720, 390 × 844 and 1440 × 900; tested advancing through six consecutive rounds.
  - Current question, TWIST, WATCH, linked criterion, six rating options, notes and next/previous controls visible together.
  - No page-level vertical or horizontal overflow in tested interview viewports.
  - Each generated six-card round covers the six criteria exactly once, in independently randomized order; a new round appears after the sixth card. The interviewer can proceed through unlimited six-card cycles until explicit finish.
  - The bank screen lists **15 board-approved questions** and no retired questions.
  - Within a criterion, a question is reused only after all options in that category have been used.
  - Repeated questions retain independent notes/scores per attempt.
  - Existing 36-question interview backups are migrated without erasing historical scores or notes.
  - Per-question rating persists without touching the old manual six-criteria fields. Notes persist when navigating.
  - Ending a partially scored interview routes to review/results rather than inventing a complete score.
- Verified source roster: 13 accepted applicants from the Operations tab, no name or contact details written in plaintext to the public source tree. No source Google Sheet changes.

## Limitations / not yet verified

- Full passphrase-based roster decryption in the **deployed browser** has not been run end to end. The local payload was produced using PBKDF2-SHA256 (310000 rounds) and AES-256-GCM, matching the browser `SubtleCrypto` implementation. An end-user first import should be tested on the Vercel production URL.
- No cloud database, authentication or synchronization across interviewers. Applicant names and interview notes are stored in the importing browser's localStorage after decryption; anyone with physical or browser-profile access to that browser can inspect them.
- Actual production browser checks on the Vercel hostname are not complete; Vercel deployment status validates build and upload, not interactive functionality.
- The repository is public and question text/criteria remain public. The encrypted roster cipher bundle is public but plaintext names and its passphrase are not.