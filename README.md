# Fearless Draft Lab

**League of Legends Macro Scouting & Draft Management System** — built for the
[Cloud9 x JetBrains: Sky's The Limit Hackathon 2026](https://cloud9.devpost.com/)
(Category 2: LoL Macro Scouting & Draft Management System).

A zero-dependency, single-page coaching tool that replaces spreadsheet chaos
with a working Fearless Draft simulator, counter-pick recommendations, a live
draft win-rate model, macro scouting profiles, and data-backed "How to Win"
insights — all running entirely in the browser, no server, no API keys.

![Stack](https://img.shields.io/badge/stack-HTML%20%2B%20CSS%20%2B%20JS-blue)
![Tests](https://img.shields.io/badge/tests-33%20passing-brightgreen)

## What it does

### Draft Lab — Fearless Draft simulator
- Full official LoL pick/ban order (6 bans → 6 picks → 4 bans → 4 picks) for
  best-of-3 and best-of-5 series.
- **Fearless Draft rules**: every champion picked in a completed game is
  locked out for the rest of the series — the pool visibly shrinks into
  Games 3, 4 and 5.
- **Counter-pick recommendations** for the current slot, with reasons
  (lane counter, synergy, missing damage type, missing engage/CC).
- **Live draft win-rate model**: a heuristic estimate (lane matchups +
  synergy + comp balance) that updates after every pick, with the factors
  behind it explained in plain language.
- **Composition analysis**: damage mix, engage, crowd control, range, and
  early/late power curves, side by side.
- **AI opponent** (heuristic, role-safe — it can never ban or pick a team
  into a stranded role, even in a depleted Game 5 pool). Play against it,
  let it play a single step, or auto-play a whole draft.
- Undo (including past AI moves), per-game log, series score tracking.

### Scouting — macro scouting & How to Win
- Opponent profiles: per-player champion pools (games + win rate), macro
  tendencies (first blood / dragon / Herald, game length, warding),
  Game 1 pick rates, and ban tendencies.
- **Rule-based "How to Win" insights**: early-ban targets for comfort picks,
  one-trick detection, early-game exploits, objective plans, and game-length
  reads — each with the numbers behind it.
- **Fearless shift panel**: after each game, see exactly how the opponent's
  champion pools shrink under the series' Fearless locks.
- **Import real data**: paste a GRID-shaped JSON scouting profile
  (Reports & Data → Import); it is validated and stored locally.

### Champion database
- 88 champions from the 2025–2026 pro meta, with roles, class, damage type,
  power curves, and curated matchup relations (strong/weak against, pairs
  well with). Search, filter by role, sort by power or difficulty.

### Reports & Data
- Series report (every game's picks/bans/winner), save/load named reports,
  export series JSON, print-friendly report, and scouting-data import.

## Run it

No build step, no dependencies, no server required:

```sh
# Option A — open index.html directly in any modern browser.
# Option B — serve locally:
python3 -m http.server 8000
# then open http://localhost:8000/
```

All state (current series, imported teams, saved reports) lives in the
browser's `localStorage`. Nothing leaves the machine.

## Tests

```sh
node --test tests/engine.test.js tests/ui-smoke.test.js
# 33 tests (26 engine + 7 UI smoke), 0 failures — draft state machine, Fearless rules, scoring,
# recommendations, AI safety, scouting insights, import validation, and end-to-end UI flows.
```

Node 18+ is enough; no packages are installed.

## Project structure

```
index.html      App shell + four views (Draft Lab, Scouting, Champions, Reports)
styles.css      Dark coaching-desk theme, print stylesheet for reports
data.js         Embedded static data: 88 champions + 3 sample scouting profiles
engine.js       Pure logic: draft machine, Fearless rules, scoring, AI, insights
app.js          UI layer: rendering, events, localStorage persistence
tests/          node:test suites for the engine + UI smoke tests (no dependencies)
verification/   IntelliJ IDEA headless inspection report (evidence of IDE use)
```

## Data sources & honesty notes

- **Champion data** (`data.js`) is curated static game knowledge authored for
  this project (pro-meta pool, patch 25.x era): stats are 1–10 heuristic
  ratings and matchup relations are documented expert knowledge, not scraped
  data. No Riot API key or account is used anywhere.
- **Scouting profiles** bundled with the app are **synthetic sample data**
  (fictional teams, clearly labelled "sample" in the UI) that demonstrate the
  analysis engine. Coaches replace them by importing real GRID exports as
  JSON — the importer validates champion ids, roles, and games/wins.
- **Win-rate figures** are a transparent heuristic model (lane matchups,
  synergy, comp balance), labelled in the UI as a model estimate, not a
  prediction.
- Champion names are used referentially to identify game content, as a
  coaching tool requires; no Riot artwork, assets, or content are reproduced.
  This project is not affiliated with Riot Games, Cloud9, or JetBrains.

## JetBrains tools used (honest record)

- **IntelliJ IDEA 2025.3** (build 253.28294.334, the distribution served by
  JetBrains' own Community channel) — used headless on a Linux VM:
  `idea.sh inspect` ran a full-project code inspection over all sources
  on first launch (report triaged in `BUILD-TRANSCRIPT.md` §4; the
  shipped `verification/idea-inspection/` holds the final re-run, which
  covers only Community inspections because the IDE itself disabled its
  Ultimate module for lack of a licence — that state was not bypassed).
  The inspection's actionable findings were fixed (see
  `BUILD-TRANSCRIPT.md`); the rest are documented false positives (UMD/CommonJS globals IDEA cannot resolve statically,
  CSS classes applied from JS-generated HTML, champion names flagged by
  the spell checker). `idea.sh format` was also attempted, but the
  headless formatter reported "No style … skipping" for every file and
  changed nothing — so formatting is **not** claimed as IDE usage. No
  `.idea/` folder is committed: headless `inspect` runs against the
  directory without persisting IDE project files, and the folder was not
  hand-faked.
- JetBrains Air and AI Coding Agent Junie were **not** used: both require an
  account sign-in / licence activation, which this headless agent environment
  cannot do. The free JetBrains codes that come with hackathon registration
  are for the human entrant to activate.
- See `SUBMISSION.md` (Tooling Explanation) and `AI_SHOWCASE.md` for the full
  story, and `BUILD-TRANSCRIPT.md` for the verification log.

## License

MIT — see [LICENSE](LICENSE).
