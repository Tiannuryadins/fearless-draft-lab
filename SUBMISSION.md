# SUBMISSION.md — Devpost draft for Fearless Draft Lab

> DRAFT — fill in the bracketed links (repo URL, demo URL, video URL) at
> submit time. Do not submit this file itself; paste the sections into the
> Devpost submission form.

## Title

**Fearless Draft Lab — LoL Macro Scouting & Draft Management**

## Tagline

Kill the spreadsheet: a Fearless Draft simulator with counter-pick
recommendations, a live draft win-rate model, and data-backed How-to-Win
scouting — in one zero-dependency web app.

## Category

Category 2 (LoL): Macro Scouting & Draft Management System
(blueprint: Modular Draft Organizer supporting Fearless Draft rules,
plus Draft Tendency Analysis & Recommendations and supporting macro context)

## Links (fill in at submit time)

- Code repository: [https://github.com/Tiannuryadins/fearless-draft-lab]
- Working demo: [https://tiannuryadins.github.io/fearless-draft-lab/]
- Demo video (YouTube, ≤ 3 min): [https://www.youtube.com/watch?v=...]
- Bonus prize — AI workflow story: `AI_SHOWCASE.md` in the repo
  ([direct link to the file on GitHub])

## Text description (paste into Devpost)

Fearless Draft Lab is a coaching tool for League of Legends teams playing
under Fearless Draft rules, where every champion picked in a game is gone
for the rest of the series. Coaches currently track this in spreadsheets
while also juggling opponent champion pools, ban tendencies, and macro
patterns. This tool puts all of it in one place, in a web app with no
server, no login, and no API keys.

**Draft Lab.** A full Fearless Draft simulator for best-of-3 and best-of-5
series with the official pick/ban order. As games complete, picked
champions lock out of the pool — you watch the draftable pool shrink into
Games 3, 4 and 5 exactly as it does on stage. Every pick slot gets
counter-pick recommendations with reasons (lane counter, synergy, missing
damage type, missing engage or crowd control). A live win-rate model
scores the draft after every pick from lane matchups, synergy, and
composition balance, and explains the factors behind it. A heuristic AI
opponent can play the other side, a single step, or a whole draft — and it
is provably role-safe: it can never ban or pick a team into a stranded
role, even in a depleted Game 5 pool.

**Scouting.** Opponent profiles with per-player champion pools (games and
win rates), macro tendencies (first blood, first dragon, first Herald,
game length, warding), Game 1 pick rates, and ban tendencies. A rule-based
engine turns that data into "How to Win" insights — which comfort pick to
ban early and what it forces the opponent onto, one-trick detection,
early-game exploits, objective plans, and game-length reads — each with
the numbers behind it. A Fearless-shift panel shows how the opponent's
pools shrink as series locks pile up. Coaches can import real GRID-shaped
scouting data as JSON; the importer validates it before it is stored.

**Champion database.** 88 champions from the 2025–2026 pro meta with
roles, power curves, and curated matchup relations, searchable and
filterable.

**Reports.** Full series reports (every game's picks, bans, and winner),
named save/load, JSON export, and a print-friendly report for the
coach's desk.

The bundled scouting profiles are clearly labelled synthetic samples that
demonstrate the engine; the import feature is how real GRID data flows in.
Win-rate figures are a transparent heuristic model, labelled as an
estimate, not a prediction.

## Tooling Explanation (which JetBrains tools, and what each one did)

- **IntelliJ IDEA 2025.3** (build 253.28294.334, the distribution served by
  JetBrains' own Community channel) — the project's IDE. Because the build
  ran on a headless Linux VM, the IDE was used through its headless
  inspection command: `idea.sh inspect` ran a full-project code inspection
  over all sources on first launch (findings triaged in
  `BUILD-TRANSCRIPT.md`), and its actionable findings were fixed (missing
  form labels, redundant initializers, a redundant local). The IDE
  subsequently disabled its Ultimate module for lack of a licence, so the
  shipped `verification/idea-inspection/` report covers Community
  inspections only — that licence state was not bypassed.
  `idea.sh format` was attempted but the headless formatter reported
  "No style … skipping" for every file and changed nothing, so formatting
  is not claimed. No `.idea/` folder is committed: headless inspection
  does not persist IDE project files, and the folder was not hand-faked
  — the inspection report is the evidence.
- JetBrains Air and AI Coding Agent Junie were **not** used — both require
  an account sign-in / licence activation that a headless agent
  environment cannot perform. The free JetBrains codes issued with
  hackathon registration are for the human entrant to activate.
- The code itself was written by an AI coding agent (Muse) under the
  entrant's direction, with the engine verified by a 33-test
  dependency-free test suite; see `AI_SHOWCASE.md` for the workflow story.

## Methodology write-up

See `METHODOLOGY.md` in the repo (also pasted into the Devpost form).

## Demo script outline (≤ 3 min video)

0:00–0:20 — The problem: Fearless Draft + spreadsheets. Open the app,
  show the four views.
0:20–1:10 — Draft Lab: start a C9 vs NXF best-of-5, ban/pick a few steps,
  point at the live win-rate meter moving and a counter-pick
  recommendation with its reasons. Let the AI finish the draft, record
  a Blue win, and show the 10 Fearless locks appearing.
1:10–1:50 — Scouting: open NXF's profile — Burrow's 72%-WR Sejuani pool,
  the "Ban Sejuani early" insight, and the Fearless-shift panel showing
  his pool down to one champion after Game 1.
1:50–2:30 — Champions + Reports: search the 88-champion database, open a
  champion's counters; save the series report and show the export.
2:30–3:00 — Close: zero-dependency static app, runs on GitHub Pages;
  JetBrains IDEA headless inspection; what a coach would do next
  (import real GRID data).

## Submission checklist

- [ ] Public repo with LICENSE at root (MIT) + inspection report in `verification/`
- [ ] Working demo link (GitHub Pages)
- [ ] Demo video ≤ 3 min, public on YouTube
- [ ] Text description + methodology pasted into the form
- [ ] Category 2 selected
- [ ] Bonus prize link: `AI_SHOWCASE.md` in the repo
