---
name: using-brainstorm
description: Runs the brainstorm Phase 1 workflow, which turns an idea into approved documents for a design phase. Use it in any project holding a brainstorm/status.json file, and whenever the user asks to continue the workflow, write a proposal, spec a story, or package the design handoff.
---

# Using brainstorm

Phase 1 of delivery: an idea becomes approved documents. Phase 2, design and UI, is a
separate workflow that reads what this one produces.

Claude runs every stage. The human answers four questions.

## Three words this workflow runs on

- A **unit** is one stage applied to one story. A session handles one unit.
- A **gate** holds the unit until its condition clears: a human decision (D1-D4), or
  a stage's exit checks passing.
- The **frontier** is every question answerable now, with nothing still assumed
  upstream of it. An interview ends when the frontier is empty.

<HARD-GATE>
Ask each direction decision (D1-D4) with the AskUserQuestion tool, log the answer,
and hold the unit until it arrives.

Run `python3 "${CLAUDE_PLUGIN_ROOT}/scripts/check.py"` on every artifact and read its
output. The checker decides whether an artifact passes; correct the artifact to clear
a finding.
</HARD-GATE>

## Operating rules

- **R1. One unit per session.** Suggest `/clear` after each. A small change takes a
  shallower stage, and the stage still runs.
- **R2. Read the stage's declared inputs.** Treat those files as the only source, and
  re-read a file already discussed.
- **R3. Write the stage's declared outputs**, in the stage template.
- **R4. Keep every existing ID.** A new item takes the next free number.
- **R5. Decide everything except D1-D4.** Log each non-obvious choice in
  `brainstorm/decisions.md` as `AUTO`. These are yours: naming, formatting, file
  layout, document structure, wording, and fixes for findings.
- **R6. Record a change to an approved artifact in `brainstorm/changes/<name>/delta.md`.**
  Approved files keep their content.
- **R7. Update `brainstorm/status.json` last**, after the exit checks pass.

## Direction decisions

| ID | Ask when |
|----|----------|
| D1 | The proposal is ready: approve the goals, non-goals and story list |
| D2 | An open question changes behaviour, scope, or a business rule |
| D3 | A story is added, dropped, or reprioritised |
| D4 | The handoff package is ready: approve it for the design phase |

An unstated behaviour is a D2. Ask it.

## Stage map

| # | Stage | Skill |
|---|-------|-------|
| 0 | Setup | `brainstorm:initializing-project` |
| 1 | Proposal | `brainstorm:writing-proposals` |
| 2 | Behaviour spec | `brainstorm:specifying-stories` |
| 3 | Handoff | `brainstorm:packaging-handoff` |

Stage 3 ends Phase 1.

## Supporting skills

Invoke these when their condition fires and the skill is installed. When one is
absent, follow the fallback in the stage skill and continue.

| Condition | Skill |
|-----------|-------|
| Any interview, stage 1 or 2 | `grilling` |
| Stage 1 drafting | `write-spec` |
| The idea is not yet formed | `product-brainstorming` |
| Every artifact, before delivery | `simple-english` (pragmatic mode) |

## Routing

1. Read `brainstorm/status.json`.
2. When `state` is `blocked_on_human`, ask the question in `blocked_reason`, log the
   answer, set `state` to `in_progress`, and continue.
3. Invoke the stage skill for the unit in status.
4. Run the stage's exit checks.
5. When every check clears, advance status, then stop so the human can `/clear`.
6. When a check fails, correct it and run the checks again. After three attempts, set
   `blocked_on_human` with the reason and stop.

A project with no `brainstorm/status.json` starts at `brainstorm:initializing-project`.

## Reference

- **IDs, files, decisions log, deltas**: `references/conventions.md`
- **Language rules for every artifact**: `references/handoff-language.md`
