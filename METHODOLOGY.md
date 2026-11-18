# Methodology — Fearless Draft Lab

## The problem

Under Fearless Draft rules, every champion picked in a game is unavailable
for the rest of the series. By Game 5, 40 champions are gone and both teams
are drafting from a depleted pool. Coaches prepare for this with
spreadsheets: opponent champion pools, ban tendencies, and macro patterns
scattered across tabs, plus a mental model of which comfort picks to deny
early so the opponent runs out of answers late. It is slow, error-prone,
and hard to rehearse — you cannot "play" a spreadsheet against an opponent
to feel how a series evolves.

## Our approach

Build the rehearsal room, not another dashboard. Fearless Draft Lab is a
single-page web app with four views that follow a coach's actual workflow:

1. **Draft Lab** — simulate the series. The draft engine implements the
   official LoL pick/ban order and hard Fearless rules (picks lock,
   bans do not — a deliberate rules detail). Coaches draft against a
   heuristic AI that is constrained to never strand a role, so even a
   Game 5 pool stays playable.
2. **Scouting** — understand the opponent. Profiles carry per-player
   champion pools, macro tendencies, Game 1 pick rates, and ban habits.
   A rule-based insight engine converts those numbers into actions:
   which comfort pick to ban early and what it forces the opponent onto,
   who is a one-trick risk, where the early game can be attacked, and
   which objective plan fits.
3. **Champions** — know the pool. 88 pro-meta champions with curated
   matchup relations power the recommendation and scoring engines.
4. **Reports** — keep the record. Every series is reportable, saveable,
   and exportable as JSON; scouting data imports in a validated
   GRID-shaped format.

## How the draft model works

The live win-rate figure is a transparent heuristic, not a black box:

- **Lane matchups** (weight 1.0): each same-role pairing scores from
  curated relations (a listed counter is worth ±3) plus small modifiers
  for early power and range advantage.
- **Synergy** (+0.5 per known pair on the same team).
- **Composition balance**: a team with ≥80% of one damage type is
  penalised (easy to itemise against).
- **Stat differentials**: engage, crowd control, early/late power, and
  average range, at small weights.

The total is mapped to a win probability (50% ± 4 points per score unit,
clamped to 5–95%). Every factor that moves the needle is listed in the
UI, so a coach can agree or disagree with the model — the app never hides
behind a single number.

Recommendations score each available champion for the open slot from its
lane matchup against the revealed enemy, its synergy with locked allies,
whether it supplies a damage type or engage/CC the composition lacks, and
its counters across the whole enemy team, with up to three reasons shown.

## Data: what is real, what is sample

- Champion stats and matchup relations are curated static game knowledge
  authored for this project (2025–2026 pro meta). No API key, no account,
  no scraping.
- The three bundled scouting profiles are **synthetic samples** (fictional
  teams, labelled as such in the UI). They exist to demonstrate the
  analysis engine end-to-end. Real data enters through the JSON importer,
  which validates champion ids, roles, and games/wins before storing
  anything locally.

## Verification

- 33 dependency-free tests (26 engine + 7 UI smoke) (`node --test`) cover the draft state
  machine, Fearless locking across a full 5-game series, scoring,
  recommendations, AI role-safety, insight generation, and import
  validation — all passing.
- The UI was smoke-tested in headless Chromium: every view renders, a
  full draft completes through the UI with no console errors.
- IntelliJ IDEA 2025.3 ran a full headless code inspection over the
  project; see `verification/idea-inspection/` and `BUILD-TRANSCRIPT.md`.

## Why this solves the category's problem

The Category 2 blueprint asks for a draft organizer that supports
Fearless Draft rules and draft-tendency analysis that answers real
coaching questions: *what pick/ban tendencies repeat for this opponent?*
and *how does their draft shift in a Fearless Game 3, 4, or 5?* Fearless
Draft Lab answers both directly — the tendency analysis names the
repeating picks and the bans to spend on them, and the Fearless-shift
panel shows, player by player, which comfort picks survive into the late
series and what win rate remains when they do not. A coach can rehearse
the whole series in the morning and walk on stage with a plan, not a
spreadsheet.
