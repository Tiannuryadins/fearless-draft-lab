# AI-Powered Workflow Story — Fearless Draft Lab

> Bonus prize entry: Best AI-Powered Workflow Story (Cloud9 x JetBrains:
> Sky's The Limit Hackathon 2026). An honest account of how AI and
> JetBrains tools were — and were not — used to build this project.

## The setup

One human entrant, one AI coding agent (Muse, by Meta), one headless
Linux VM with no GUI, no desktop IDE, and no ability to sign in to
anything. The brief: build a Category 2 (LoL) coaching tool that a real
Cloud9 coach could use — Fearless Draft simulation, counter-pick
recommendations, macro scouting — as a zero-dependency static web app.

## What the AI did

- **Researched first, then built.** The agent fetched the Devpost page,
  Official Rules, and Submission Specifics, confirmed the JetBrains-tool
  requirement, the submission checklist, and the deadline (12 Jan 2027,
  11:00 PT) before writing a line of code.
- **Designed the engine before the UI.** The draft state machine, Fearless
  locking rules, matchup scoring, and recommendation logic were written
  as pure, DOM-free logic with a dedicated test suite (33 tests across
  engine and UI) — so the interesting part of the app could be verified
  without a browser at all.
- **Caught its own bugs through tests.** Three test failures during the
  build exposed real issues: a naive draft helper that stranded roles
  in Game 5 of a Fearless series, an AI ban heuristic that could cluster
  bans into one role, and a test that assumed a champion was still
  available after it had been drafted. Each fix made the shipped AI
  stronger — the role-safety guards in the final AI came directly from
  those failures.
- **Kept the data honest.** The agent refused to fabricate "real" pro
  player statistics: the bundled scouting profiles are labelled
  synthetic samples, and real data enters through a validated JSON
  importer instead.

## What JetBrains tools did

- **IntelliJ IDEA 2025.3** (build 253.28294.334, served by JetBrains'
  own Community channel) ran headless on the VM: `idea.sh inspect`
  performed a full-project code inspection on first launch, and its
  actionable findings were fixed before submission (missing form labels,
  redundant initializers, an awkward multi-line expression the inspector
  flagged). The IDE later disabled its Ultimate module for lack of a
  licence, so the preserved report in `verification/idea-inspection/`
  covers Community inspections only — that licence state was not
  bypassed, and the full first-run triage is documented in
  `BUILD-TRANSCRIPT.md`.
  `idea.sh format` was attempted too, but the headless formatter reported
  "No style … skipping" for every file and changed nothing — so formatting
  is not claimed as IDE usage, and no `.idea/` folder was hand-faked to
  pretend otherwise.
- The IDE's inspection caught style and correctness nits in the
  JavaScript that the test suite could not see (unused locals, suspicious
  constructs), which were fixed before submission.

## What we did NOT do

- **JetBrains Air and AI Coding Agent Junie were not used.** Both require
  an account sign-in / licence activation, which a headless agent
  environment cannot perform — so the workflow story does not claim
  them. The free JetBrains codes issued with hackathon registration are
  for the human entrant to activate on their own machine.
- No AI output was shipped unverified: every engine behaviour is covered
  by tests, and the UI was smoke-tested end-to-end in headless Chromium.

## The lesson

The fastest loop was not "AI writes everything" — it was "AI writes the
testable core first, tests break the naive assumptions, and the JetBrains
IDE checks what tests cannot." The AI did the volume; the tests and the
IDE did the checking; the human set the goal and owns the submission.
That division of labour is the whole story of this build.
