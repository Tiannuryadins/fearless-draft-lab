# STATUS.md — Fearless Draft Lab (Cloud9 x JetBrains Hackathon 2026)

## Concept

**Fearless Draft Lab** — a League of Legends Macro Scouting & Draft
Management System (Category 2) for Cloud9 coaches. A zero-dependency
static web app: Fearless Draft simulator (Bo3/Bo5, official pick/ban
order, picks lock out for the series), counter-pick recommendations with
reasons, a live heuristic draft win-rate model with explained factors,
composition analysis, a role-safe AI opponent, macro scouting profiles
with rule-based "How to Win" insights, a Fearless-shift panel, an
88-champion database, and series reports with save/load/export plus
validated GRID-shaped scouting-data import.

## Track & prize target

- **Track**: Category 2 (LoL): Macro Scouting & Draft Management System
  — Modular Draft Organizer (Fearless Draft) blueprint + draft-tendency
  analysis + macro context.
- **Prize target**: Best of Category 2 — **$6,000** cash (+ $100 C9 gift
  card, JetBrains All Products Pack 1-year, GDC ticket + trip).
  Runner-up $2,000. Bonus prize (Best AI-Powered Workflow Story, $1,000)
  also entered via `AI_SHOWCASE.md`.
- **Deadline**: Tue 13 Jan 2027, 02:00 WIB (12 Jan 2027, 11:00 PT).
  Judging 27 Jan–3 Feb 2027 PT; winners ~8 Feb 2027 PT.
- **Competition**: ~153 registrations at discovery (low).

## JetBrains-tool requirement — SATISFIED (honest)

- **IntelliJ IDEA 2025.3** (build 253.28294.334, from JetBrains' own
  Community channel) used headless: `idea.sh inspect` ran a full-project
  code inspection on first launch; its actionable findings were fixed
  (see `BUILD-TRANSCRIPT.md` §4). The IDE later disabled its Ultimate
  module for lack of a licence (not bypassed), so the shipped
  `verification/idea-inspection/` report covers Community inspections
  only; the full first-run triage is documented in the transcript.
- `idea.sh format` was attempted but skipped every file (no style
  configured headless) — **not** claimed.
- No `.idea/` committed (headless mode doesn't persist one; not faked).
- Junie / JetBrains Air **not** used (need account sign-in).
- Full honest record: `README.md` (JetBrains tools used) +
  `SUBMISSION.md` (Tooling Explanation) + `BUILD-TRANSCRIPT.md` (§4).

## Verification results

- **Unit tests: 33/33 pass** (`node --test tests/engine.test.js
  tests/ui-smoke.test.js`, Node v24.22.1, zero dependencies):
  26 engine tests (draft machine, Fearless rules incl. full 5-game
  series, scoring, recommendations, AI safety, insights, import
  validation) + 7 UI smoke tests (full draft flow, Fearless locks,
  undo, all four views, save/load/export/import).
- **Bugs caught by tests and fixed**: UMD global-resolution bug (would
  have broken the browser app), undo double-step bug, AI role-stranding
  in Game 5 (fixed with safety guards + pool expanded 64 → 88).
- **IntelliJ inspection**: completed; actionable findings fixed, the
  rest documented false positives.
- **Static checks**: `node --check` clean on all JS; local HTTP serve
  returns 200 for all assets.
- **NOT verified in a real browser**: the VM's Chromium is gated by a
  Hatch WebGL domain policy that rejects all policy formats tried; the
  gate was not bypassed. The DOM-shim UI tests cover the same code
  paths. A real-browser harness is provided
  (`tests/browser-harness.html`) for the human to run before submitting.

## What still needs the user (human-only steps)

1. **Devpost registration** (https://cloud9.devpost.com/ → Join
   Hackathon) — creates the account and triggers the free JetBrains
   codes by email (within 5 business days).
2. **JetBrains codes** — activate the All Products Pack + AI Ultimate
   codes from that email on the user's own machine (optional for the
   entry; the entry already satisfies the JetBrains-tool rule via the
   headless IDEA inspection).
3. **Publish the repo** — create public GitHub repo (suggested name
   `fearless-draft-lab`), push this directory, confirm the MIT LICENSE
   shows in the repo About. Do NOT re-bundle or add anything with
   credentials.
4. **Publish the demo** — enable GitHub Pages on the repo (root of the
   default branch); demo URL goes in the submission form.
5. **Demo video** — record ≤ 3 min, public on YouTube; script outline
   in `SUBMISSION.md`. Suggested: run the real-browser harness flow on
   screen (draft → Fearless locks → scouting insight → report).
6. **Real-browser check** — open the Pages demo in a real browser (or
   run `tests/browser-harness.html`) and confirm the 21 harness checks
   pass with no console errors.
7. **Submit on Devpost** — paste `SUBMISSION.md` sections into the form
   (description, tooling explanation, methodology from
   `METHODOLOGY.md`), attach repo + demo + video links, select
   Category 2, add the bonus-prize link to `AI_SHOWCASE.md`.

## Files

Work dir: `~/workspace/hunt-round2-20261118/cloud9-skys-limit/`
(`index.html`, `styles.css`, `data.js`, `engine.js`, `app.js`,
`tests/`, `LICENSE`, `README.md`, `SUBMISSION.md`, `METHODOLOGY.md`,
`AI_SHOWCASE.md`, `BUILD-TRANSCRIPT.md`, `STATUS.md`,
`verification/idea-inspection/`). Nothing has been published,
submitted, or uploaded anywhere. No accounts were created; no money
was spent.
