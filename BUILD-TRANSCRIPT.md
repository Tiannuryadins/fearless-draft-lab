# BUILD-TRANSCRIPT.md — Fearless Draft Lab

Build date: 18 Nov 2026. Builder: AI coding agent (Muse), solo, no subagents.
Hackathon: Cloud9 x JetBrains: Sky's The Limit Hackathon 2026
(https://cloud9.devpost.com/), Category 2 (LoL).

## 1. Rules verification (done first, before building)

Fetched and read in full (18 Nov 2026, ~15:40 WIB):
- https://cloud9.devpost.com/ (main page)
- https://cloud9.devpost.com/rules (Official Rules)
- https://cloud9.devpost.com/details/submission-specifics (blueprints)

Confirmed:
- **JetBrains requirement**: "Build or significantly update a working
  project using at least one JetBrains tool (a JetBrains IDE such as
  IntelliJ IDEA, PyCharm, WebStorm, Rider or DataGrip, JetBrains Air, AI
  Coding Agent Junie)". Submission must include a text description of
  which JetBrains tools were used and what each did; committing
  `.idea`/`.junie`/`.air` is *encouraged* as supporting evidence, not
  required. "You may use more than one JetBrains tool, and you may use
  other editors alongside them."
- **Submission requirements**: public repo + open-source licence at root,
  working demo link, text description, methodology write-up, demo video
  ≤ 3 min on public YouTube, category choice. Bonus prize: URL to a case
  study / post / video / `AI_SHOWCASE.md` in the repo.
- **Category 2 blueprints**: Automated Macro Scouting Tool, or Modular
  Draft Organizer supporting Fearless Draft rules. Judges look for
  draft-tendency analysis and answers to: "What pick/ban tendencies
  repeat most often for this opponent?" and "How does the opponent's
  draft strategy shift in a Fearless Draft Game 3, 4, or 5 scenario?"
  Suggested extras: data-backed "How to Win" insights, live draft
  win-rate impact.
- **Deadline**: 12 Jan 2027, 11:00 PT = **13 Jan 2027, 02:00 WIB**.
  Judging 27 Jan–3 Feb 2027 PT; winners ~8 Feb 2027 PT.
- **Prizes**: $25,000 total — Best of Category $6,000 ×3, runner-ups
  $2,000 ×3, bonus $1,000. "NO PURCHASE OR PAYMENT NECESSARY."
  Every registrant gets 1 All Products Pack code + 1 AI Ultimate code
  (while supplies last; AI Ultimate needs an IDE licence/trial/EAP).
- **Eligibility**: Indonesia is not on the excluded list (Brazil,
  Quebec, Russia, Crimea, Cuba, Iran, North Korea, OFAC-sanctioned
  countries). GRID data is optional for every category.

## 2. Track choice

Category 2 (LoL), following the **Modular Draft Organizer (Fearless
Draft)** blueprint, plus draft-tendency analysis and macro context.
Reasons: the most agent-buildable (pure logic + static data, no game
engine, no assets), the richest genuine logic (draft state machine,
Fearless series rules, counter-pick engine, win-rate model), and the
blueprint's judging questions map directly onto features (tendency
analysis → insights; Fearless shift → shift panel). Category 1 would
need map/heatmap assets and real telemetry to be credible; Category 3
needs a game loop with far less analytical depth.

## 3. What was built

Zero-dependency static web app (plain HTML/CSS/JS, no npm, no build
step). Files:

| File | Lines | Role |
|---|---|---|
| `index.html` | 169 | App shell, 4 views |
| `styles.css` | 254 | Dark coaching-desk theme + print CSS |
| `data.js` | 177 | 88 champions + 3 sample scouting profiles |
| `engine.js` | 539 | Draft machine, scoring, AI, insights |
| `app.js` | 748 | UI layer, persistence |
| `tests/engine.test.js` | 375 | 26 engine tests |
| `tests/ui-smoke.test.js` | 206 | 7 UI smoke tests (DOM shim) |
| `tests/browser-harness.html` | 121 | Real-browser harness (manual) |
| `README.md`, `SUBMISSION.md`, `METHODOLOGY.md`, `AI_SHOWCASE.md` | 419 | Docs + submission drafts |
| `LICENSE` (MIT) | — | Required open-source licence |

Key decisions:
- **Embedded static data, no APIs**: 88 champions with curated stats and
  matchup relations (beats/loses/pairs). No Riot API key, no account.
- **Sample scouting data labelled synthetic**: the 3 bundled opponent
  profiles are fictional and clearly marked; real data enters via a
  validated JSON importer (GRID-shaped). Fabricating "real" pro stats
  would have been dishonest.
- **UMD modules**: `data.js`/`engine.js` load both as classic browser
  scripts and via Node `require`, so the same code is tested and shipped.
- **Heuristic win-rate model, labelled as such**: lane matchups +
  synergy + comp balance, with factors explained in the UI. Never
  presented as a prediction.
- **AI role-safety guards**: the AI opponent can never ban/pick a team
  into a stranded role — required for playable Game 4–5 Fearless drafts
  (this was found by tests, see §5).

## 4. JetBrains tooling record (honest)

- Downloaded IntelliJ IDEA via JetBrains' own Community channel
  (`data.services.jetbrains.com/products/download?code=IIC&platform=linux`,
  1.52 GB). The 2025.3 distribution is unified: the tarball extracts to
  `idea-IU-253.28294.334` (productCode `IU`, build 253.28294.334) and the
  IIC releases API points at the same file, with sources from the
  open-source `intellij-community` repo. **No licence, account, or
  activation was needed or used** — `inspect` and `format` ran without
  any sign-in (the IDE's trial-promotion phone-home failed through the
  proxy and was irrelevant).
- **Run 1** (08:44 WIB): `idea.sh inspect` with `-Xmx512m` /
  `MaxMetaspaceSize=256m` → died with `OutOfMemoryError: Metaspace`
  after ~145 s (only a spell-check partial report survived).
- **Run 2** (08:47 WIB): raised to `-Xmx1024m` / metaspace 512m →
  **completed** ("Analyzing code… Done."). Full report: 15 inspection
  files. The only SEVERE log lines were missing descriptions for
  unrelated DB inspection tools (cosmetic).
- **Format attempt** (08:50 WIB): `idea.sh format -r … -mask
  *.js,*.css,*.html` → scanned 7 files, **skipped all** ("No style for
  …, skipping…"). Verified by diff against a pre-run snapshot: zero
  files changed. Formatting is therefore **not** claimed as IDE usage.
- **Run 3** (final, after fixes): re-ran `inspect` on the shipped code —
  but the IDE had by then written `com.intellij.modules.ultimate` into
  its own `disabled_plugins.txt` (no licence on file), so the Ultimate
  plugins — including 'JavaScript and TypeScript' and 'CSS' — did not
  load and only Community inspections ran (GrazieStyle 19, spell-check
  126). That licence-state flip was the IDE's own enforcement, and it
  was **not** bypassed (no config wipe, no re-activation attempt). The
  run-3 report is what ships in `verification/idea-inspection/`; the
  run-2 full report (deleted before run 3) is documented in the triage
  table below from its actual output.
- **No `.idea/` folder**: headless `inspect`/`format` run against the
  directory without persisting IDE project files. The folder was **not**
  hand-faked. Evidence of JetBrains-tool use is the inspection report
  itself plus this transcript. (Rules only *encourage* committing
  `.idea`.)
- Junie and JetBrains Air were **not** used (account sign-in required).

### Inspection findings triage (Run 2)

| Finding | Count | Verdict |
|---|---|---|
| SpellCheckingInspection (champion names, esports terms, "Januar Nuryadin") | 458 | False positives — domain vocabulary |
| JSUnresolvedReference (`module`/`require`, `assert.*`, `E.*` in tests) | 177 | False positives — UMD/CommonJS pattern IDEA cannot resolve statically; all resolve at runtime (tests pass). **Zero** in `app.js`. |
| CssUnusedSymbol (17 classes) | 17 | False positives — all applied from JS-generated HTML strings; verified by grep (HIGH/MEDIUM/LOW come from engine priority values) |
| JSJQueryEfficiency | 4 | False positives — `$` is a `getElementById` helper, not jQuery |
| JSCheckFunctionSignatures | 3 | False positives — downstream of unresolved UMD types |
| BadExpressionStatementJS (`roleChipsHtml` multi-line arrow) | 5 | **Fixed** — rewrote with explicit return |
| HtmlFormInputWithoutLabel (4 inputs) | 4 | **Fixed** — added `aria-label` attributes |
| JSUnusedAssignment (redundant `= ''` initializers) | 2 | **Fixed** — declared without initializer |
| UnnecessaryLocalVariableJS (`label` in `renderBadge`) | 1 | **Fixed** — inlined |
| JSUnusedGlobalSymbols (`autoRole`, `laneMatchups`, `setDraftRole`, `setChampRole`) | 4 | `autoRole`/`laneMatchups`: **fixed** by adding tests that use them; `set*Role`: false positives (called from HTML string onclick handlers) |
| JSUnusedLocalSymbols (harness `stepAfter`) | 1 | Temp harness file; harmless |
| CssNonIntegerLengthInPixels (`.2px`, `.5px` letter-spacing) | 2 | **Fixed** — switched to em units |
| GrazieInspection / GrazieStyle (prose nits in MD) | 27 | Ignored — documentation prose |

## 5. Verification log

### Unit tests — `node --test` (Node v24.22.1)
- Final: **33 tests, 0 failures** (26 engine + 7 UI smoke).
- Bugs the tests caught and fixed during the build:
  1. Naive draft helper stranded roles in Game 5 Fearless → rewrote
     helper to drive the AI; added AI role-safety guards (ban surplus
     check + pick strand check) and expanded the pool 64 → 88 champs.
  2. Test assumed a banned champion was available → corrected test.
  3. **UMD global bug (real, would have broken the browser app)**:
     `engine.js` read `root.CHAMPIONS`, but top-level `const` in a
     classic script is not a `window` property. Fixed by resolving bare
     globals with a `root` fallback. Caught by the UI smoke test.
  4. **Undo double-step bug (real)**: undo checked the history entry
     *after* popping instead of before, so undo-with-AI stopped one
     step short. Fixed by capturing the entry first.
  5. Fearless-shift test miscounted a pool (Ashe was also locked) →
     corrected test data.

### UI smoke tests — `tests/ui-smoke.test.js`
- Real `app.js` loaded in a Node `vm` context with a purpose-built DOM
  shim. Covers: initial render (88 cards, BAN step, 5 ban suggestions),
  full auto-play draft + Fearless locks (10 lock chips, Game 2),
  manual ban + AI reply + undo, invalid-champion error toast, scouting
  view (insights + Fearless shift), champion DB filter/search/detail,
  reports (save/load round-trip, export, import reject/accept).
- **Real-browser check NOT completed**: the VM's Chromium
  (`/opt/meta-chromium/chrome`, the Hatch CVM build) refuses to start
  without a Hatch WebGL domain policy; four policy-format guesses
  (bare/file/JSON variants) were all rejected with "invalid WebGL
  domain policy contract". The policy gate was not bypassed. A
  real-browser harness is provided at `tests/browser-harness.html` —
  serve the project and open it in any real browser to run the same
  checks interactively (21 checks: draft, views, import, console
  errors). This is the one verification step left for a human/browser
  run; the DOM-shim tests cover the same code paths.

### Static checks
- `node --check` clean on `data.js`, `engine.js`, `app.js`,
  `tests/*.js`.
- Served locally (`python3 -m http.server`): `index.html` and all
  assets return HTTP 200.
- No dependencies installed; no accounts created; no network calls in
  the app itself (fully offline-capable).

## 6. What still needs the user (human-only)

See `STATUS.md`: Devpost registration + JetBrains codes, repo publish,
GitHub Pages demo, demo video (script in `SUBMISSION.md`), final
real-browser check, Devpost submit. Deadline 13 Jan 2027, 02:00 WIB.
