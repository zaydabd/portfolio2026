---
name: specifying-stories
description: This skill should be used when the user asks to "spec this story", "write the behaviour spec", "write the acceptance criteria", "write Given/When/Then for US-###", "example map this", or when brainstorm/status.json shows stage 2. It turns one user story into brainstorm/specs/US-###.md with business rules and observable Given/When/Then scenarios, then reviews it with a fresh subagent.
---

# Specifying a story

Stage 2. One story becomes the behaviour contract the design phase reads. It holds
what the system does. Screens, layouts and technology belong to later phases.

<HARD-GATE>
Spec one story per session.

Ask D2 for any open question that changes behaviour, scope or a business rule, and
hold the story until the human answers. Every later phase inherits this answer.

The spec is finished when its Questions section is empty.
</HARD-GATE>

## Inputs

- `brainstorm/proposal.md` for the story line, the NFRs and the constraints
- `brainstorm/specs/` for the next free ID and for consistency
- `CLAUDE.md` for the glossary and roles

## Output

`brainstorm/specs/US-###.md`, from `assets/spec-template.md`.

## Steps

Copy this checklist and mark each item as it completes:

```
Stage 2 progress (US-###):
- [ ] 1 Map rules and examples
- [ ] 2 Settle the questions
- [ ] 3 Write the spec
- [ ] 4 Adversarial review
- [ ] 5 Language pass
- [ ] 6 Run check.py
- [ ] 7 Advance status
```

### 1. Map rules and examples

Work in chat. Produce three lists for this story:

- **Rules**: the constraints that hold. One sentence each. A rule joined by "and"
  becomes two rules.
- **Examples**: concrete cases per rule, with real values. Each rule earns a happy
  case, a boundary case and a failure case.
- **Questions**: the cases whose correct outcome nobody has stated.

Ask each rule what happens at zero, at the limit, past the limit, on the second
attempt, when two users act at once, when the actor lacks permission, and when the
thing was removed midway. Record each answer that is a guess as a question.

A story producing more than six rules is two stories: raise D3.

### 2. Settle the questions

| Kind | Action |
|------|--------|
| Changes behaviour, scope or a rule | **D2**: ask the human, then log `HUMAN \| D2` |
| Format, naming, or a convention `CLAUDE.md` settles | Decide it, log `AUTO`, list it under Assumptions |

Invoke `grilling` to put the D2 frontier to the human as one round of numbered
questions, each with a recommended answer. Without that skill, ask them the same way.

The frontier is empty when no rule, boundary or failure case rests on a guess.

### 3. Write the spec

Fill `assets/spec-template.md`. Keep its sections, their names and their order.

The checker enforces these:

- A rule reads `R-###: <statement>`.
- A scenario heading reads `### SC-### <title>  [rule: R-###]`.
- A scenario holds GIVEN, then WHEN, then THEN.
- `SC-###` numbers stay unique across the project. Continue from the highest in
  `brainstorm/specs/`.
- Every rule carries at least one scenario, and every scenario cites a defined rule.
- Questions is empty.
- Angle-bracket placeholders, TBD and TODO are absent.

These the checker cannot enforce:

- **THEN states something observable**: what a person sees, or what a caller receives.
  "The order appears in the pending list" is observable. "The record is saved" is not.
- **Values are concrete**: "a basket of 3 items totalling RM 120".
- **The words are behaviour**: roles, actions and outcomes. Screens, buttons,
  endpoints, tables and frameworks belong to the design phase.
- **One behaviour per scenario**: a second WHEN starts a second scenario.
- Use AND to continue a GIVEN, a WHEN or a THEN.

### 4. Adversarial review

Dispatch the `spec-tester` subagent against the file. It reads in fresh context, the
way the design phase will.

Correct each gap it reports on coverage, missing cases or ambiguity. A behaviour
question it raises that nobody has answered returns to step 2 as D2.

### 5. Language pass

Invoke `simple-english` in pragmatic mode. Scenario steps and rules hold to 20 words.
The brainstorm subset lives in `../using-brainstorm/references/handoff-language.md`.

Name every domain term the way `CLAUDE.md` names it.

### 6. Run check.py

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/scripts/check.py" brainstorm/specs/US-###.md
```

Correct each error and run it again until it passes. Act on each warning, or state in
one line why the warning stands.

### 7. Advance status

Add the story to `completed.stories`. Set `unit` to the next unspecified story by
priority. When every story carries a spec, move to stage 3.

## Exit checks

- `check.py` passes
- `spec-tester` reports no coverage or correctness gaps
- Every rule carries a happy case, a boundary case and a failure case
- Every THEN states something observable
- Questions is empty, and every assumption cites a `DEC-###`
- Every D2 answer is logged

## Next

Tell the human to `/clear` and run `/brainstorm:next` for the next story.
