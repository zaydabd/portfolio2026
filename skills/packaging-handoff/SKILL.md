---
name: packaging-handoff
description: This skill should be used when the user asks to "package the handoff", "prepare for design", "hand this to the design phase", "close out phase 1", "what does design need", or when brainstorm/status.json shows stage 3. It assembles the approved proposal and specs into brainstorm/HANDOFF.md, the single document the design and UI phase consumes.
---

# Packaging the handoff

Stage 3. Phase 1 ends here. The approved documents become one package a designer
opens cold, weeks later, and works from without asking a question.

<HARD-GATE>
Package only approved artifacts. A story whose spec has not passed stage 2 stays out
of the package, and its absence is listed.

Present the package and ask D4 before marking Phase 1 done.
</HARD-GATE>

## Inputs

- `brainstorm/proposal.md`
- every file in `brainstorm/specs/`
- `brainstorm/decisions.md`
- `CLAUDE.md` for the glossary and roles

## Output

`brainstorm/HANDOFF.md`, from `assets/handoff-template.md`.

## Steps

Copy this checklist and mark each item as it completes:

```
Stage 3 progress:
- [ ] 1 Merge pending deltas
- [ ] 2 Build the index
- [ ] 3 Derive what design decides
- [ ] 4 Write the package
- [ ] 5 Language pass
- [ ] 6 Run check.py
- [ ] 7 D4 gate
```

### 1. Merge pending deltas

Merge each approved delta in `brainstorm/changes/` into its artifact, then move the
folder to `brainstorm/archive/`. List any delta that remains unapproved in the package
as an open item.

### 2. Build the index

Produce the traceability table: each goal, the stories serving it, and the scenarios
under each story. A goal with no story, or a story with no spec, appears as a gap.

### 3. Derive what design decides

Read every scenario and extract, per story, the material a designer needs:

| Extract | From |
|---------|------|
| Actors | The roles in each GIVEN |
| Journeys | The order the scenarios imply for one actor |
| States a screen must cover | Each distinct THEN outcome, including rejections |
| Information shown | The nouns and values each THEN names |
| Rejections and limits | The failure and boundary scenarios |
| Volume and performance bounds | The NFRs |
| Accessibility bar | The NFRs |

State each as a requirement on the design, and leave the screens to the design phase.
"The result page covers published, pending and not-authorised" is a requirement.
"A tab strip at the top" is a design decision.

### 4. Write the package

Fill `assets/handoff-template.md`. Keep its sections, their names and their order.

The package stands alone: a designer reads it without the proposal, the specs, or
this conversation. Cite the spec IDs so the detail stays reachable.

### 5. Language pass

Invoke `simple-english` in pragmatic mode. Prose sections hold to 25 words per
sentence. The brainstorm subset lives in
`../using-brainstorm/references/handoff-language.md`.

### 6. Run check.py

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/scripts/check.py"
```

This runs across every artifact and reports cross-file gaps. Correct each error and
run it again until it passes.

### 7. D4 gate

Present the counts: goals, stories, scenarios, open items. Ask with AskUserQuestion,
offering approve for design, fix a gap first, or add a story. Log the answer as
`HUMAN | D4`.

On approval, set `state` to `done` in `brainstorm/status.json`.

## Exit checks

- `check.py` passes across every artifact
- Every goal traces to at least one scenario
- Every story in the proposal carries an approved spec, or appears in Out of scope
- Every screen-state requirement cites the scenario that demands it
- `brainstorm/changes/` holds no merged delta
- D4 logged in `decisions.md`

## Next

Report the file path and the counts in two lines. Phase 2, design and UI, reads
`brainstorm/HANDOFF.md` and the specs it cites.
