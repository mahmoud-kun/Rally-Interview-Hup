# QA Report — RALLY Interview Hub v1

Last updated: 2026-11-19

## Tests executed

- Static TypeScript compile: `tsc -p tsconfig.json` — PASS (local global `tsc`).
- Browser behavioral smoke in headless Chromium via a local in-page script fixture — PASS on 1440×900 desktop and 390×844 mobile. The execution environment blocks external/localhost browser navigation, so modules were concatenated and injected for browser QA rather than loaded through HTTP. This verifies DOM interactions and application logic, **not the real hosted module-fetch path**.
- Full mobile interview scenario via Chromium — PASS: candidate creation; rename with Enter; TWIST / WATCH; question bank picker; question note and evidence; 0–5 scoring; weighted score / 100 gated on 6/6 coverage; finishing and results ranking; candidate decision; CSV/JSON exports; malformed import rejection without data loss; bank filter; no page JS errors.
- Browser-local persistence inspected after changes. `localStorage` stub was used in headless QA because the environment blocked local origin navigation. Real browser refresh/sync still needs on-site spot-check.
- 390px horizontal overflow checks — PASS: overview, interview, results, bank, settings. 1440px overview — PASS.

## Must-verify on the deployed site

- Actual ES-module fetch and CDN caching behavior; real browser/localStorage after reload.
- 320/375px narrow phones, landscape and touch keyboard on physical iOS/Android.
- Color contrast and screen-reader audit against real font delivery (Google Fonts can fall back when offline).
- Long interviews with imported/exported real (consented) names, before recording sensitive applicant data.

## Security and scope

- No server-side auth, encrypted database, multi-device sync or cloud backups: **not implemented**.
- Public repo/static assets expose the interview question bank; `noindex` is not access control.
- Data remains only in the browser storage of each interviewer.