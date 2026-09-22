---
name: writing-proposals
description: This skill should be used when the user asks to "write a proposal", "start a new feature", "scope this idea", "what are we building", "turn this idea into a proposal", or when brainstorm/status.json shows stage 1. It interviews the human about an idea and produces brainstorm/proposal.md with measurable goals, non-goals, non-functional requirements and a prioritised story list.
---

# Writing a proposal

Stage 1. An idea becomes the scope document every later stage reads. It holds what
and why. Design, UI and implementation belong to later phases.

<HARD-GATE>
Present the goals, non-goals and story list, ask D1 with AskUserQuestion, and hold
stage 2 until the human approves the written proposal.
</HARD-GATE>

## Inputs

The human's idea, 1-5 lines. `CLAUDE.md` for the glossary, roles and conventions.

## Output

`brainstorm/proposal.md`, from `assets/proposal-template.md`.

## Steps

Copy this checklist and mark each item as it completes:

```
Stage 1 progress:
- [ ] 1 Form the idea
- [ ] 2 Interview
- [ ] 3 Draft
- [ ] 4 Self-review
- [ ] 5 Language pass
- [ ] 6 Run check.py
- [ ] 7 D1 gate
```

### 1. Form the idea

When the human states a problem area rather than a thing to build, invoke
`product-brainstorming` first and converge on a direction. When the idea already
names what it is and who it serves, continue to step 2.

### 2. Interview

Invoke `grilling`. It maps the decisions as a tree and asks each round's frontier with
a recommended answer per question. Without that skill, ask in rounds: number each
question, give your recommended answer, and wait for the answers before the next round.

Invoke `write-spec` for the question set it carries on problem framing, target users,
success metrics, constraints and prior art.

The frontier is empty when each of these is settled:

| Area | Settled when |
|------|--------------|
| Problem | Who carries it today, and how it shows up |
| Users and roles | Every role named, including admins, support and external systems |
| Success | Each goal carries a number, a threshold, or a time bound |
| Scope edges | The excluded items are named, each with its reason |
| Non-functional | Volume, latency, security, accessibility and availability each answered |
| Constraints | Deadlines, systems to integrate with, and platform limits named |
| Failure | The behaviour when an external part is slow or down |

Find facts yourself. Put decisions to the human.

Raise the roles, the half-finished states, and the second attempt when the human has
not raised them.

### 3. Draft

Fill `assets/proposal-template.md`. Keep its sections, their names and their order.

The checker enforces these:

- A goal reads `G-###: <statement>` and carries a number, threshold or time bound.
  "Onboarding completes in under 3 minutes" passes. "Faster onboarding" fails.
- An NFR reads `NFR-###: <statement>`.
- A story reads `US-### | P1 | <one line>`, priority P1 to P3.
- Every story cites the goals it serves.
- The Open questions section is empty at exit.
- Angle-bracket placeholders, TBD and TODO are absent.

Story sizing: one story covers one behaviour a user states in a sentence. A story
carrying more than six rules is two stories.

### 4. Self-review

Read the draft fresh and correct it in place:

- A goal that names a feature becomes an outcome.
- A story that names a screen, a technology or a database loses that detail.
- A goal with no story gains one, or moves to non-goals.
- A story serving no goal moves to non-goals.
- An assumption the human never stated becomes an open question.

### 5. Language pass

Invoke `simple-english` in pragmatic mode. Its rules keep each sentence readable in
one pass for the design phase. The brainstorm subset lives in
`../using-brainstorm/references/handoff-language.md`.

Use the glossary in `CLAUDE.md` for every domain term.

### 6. Run check.py

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/scripts/check.py" brainstorm/proposal.md
```

Correct each error and run it again until it passes. Act on each warning, or state in
one line why the warning stands.

### 7. D1 gate

Present the goals, the non-goals and the story list with priorities. The human reads
the file for the rest. Ask with AskUserQuestion, offering approve, change the story
list, or change the goals. Log the answer in `brainstorm/decisions.md` as `HUMAN | D1`.

On approval, set `brainstorm/status.json` to stage 2, `unit` set to the first P1 story.

## Exit checks

- `check.py` passes
- Every goal carries a number, threshold or time bound
- Every goal is served by at least one story, and every story serves at least one goal
- Every area in the step 2 table is settled
- Open questions is empty
- D1 logged in `decisions.md`

## Next

Tell the human to `/clear` and run `/brainstorm:next` for the first story.
