# brainstorm conventions

## Contents
- File layout
- ID scheme and traceability
- status.json
- decisions.md
- Change deltas

## File layout

Phase 1 artifacts live under `brainstorm/` in the project root.

```
CLAUDE.md                  domain vocabulary and document conventions
brainstorm/
  status.json              progress; the source of truth for "what next"
  decisions.md             decision log (HUMAN and AUTO)
  proposal.md              stage 1
  specs/US-###.md          stage 2, one file per story
  HANDOFF.md               stage 3, the package the design phase consumes
  changes/<name>/delta.md  changes to approved artifacts
  archive/                 merged change folders
```

## ID scheme and traceability

| Prefix | Lives in | Means |
|--------|----------|-------|
| `G-###` | proposal.md | Goal, measurable |
| `NFR-###` | proposal.md | Non-functional requirement |
| `US-###` | proposal.md, specs/ | User story |
| `R-###` | specs/US-###.md | Business rule |
| `SC-###` | specs/US-###.md | Scenario |
| `DEC-###` | decisions.md | Logged decision |

The chain: `G-###` → `US-###` → `R-###` → `SC-###`.

Rules:

- Scenario IDs stay unique across the project, not per file.
- Every `R-###` has at least one `SC-###`.
- Every `US-###` serves at least one `G-###`.
- Every `G-###` has at least one `US-###`.
- A retired item keeps its ID. New items take the next free number.

## status.json

```json
{
  "stage": 2,
  "unit": "US-003",
  "state": "in_progress",
  "blocked_reason": "",
  "completed": {
    "stages": [0, 1],
    "stories": ["US-001", "US-002"]
  }
}
```

`state` is `in_progress`, `blocked_on_human`, or `done`.
`unit` holds the story ID, or `null` for a whole-project stage.
When `state` is `blocked_on_human`, `blocked_reason` holds the decision ID and the
question text, so a fresh session asks it again without the original context.

## decisions.md

One line per decision, append only:

```
- DEC-012 | HUMAN | D2 | 2026-09-21 | A withdrawn student sees the archived result | Reason: registry confirmed | Affects: SC-014
- DEC-013 | AUTO  | --  | 2026-09-21 | Lists show 20 items per page | Reason: CLAUDE.md convention | Affects: SC-009
```

Fields: ID, who decided, decision type (`--` for AUTO), date, the decision, the
reason, what it affects.

Log a `HUMAN` entry as soon as the human answers. Log an `AUTO` entry for any choice
a reviewer could question.

## Change deltas

An approved artifact keeps its content. A change goes in
`brainstorm/changes/<short-name>/delta.md`:

```markdown
# Delta: <short-name>

## Reason
<one or two lines>

## ADDED
### SC-021 <title>  [rule: R-004]
- GIVEN ...
- WHEN ...
- THEN ...

## MODIFIED
### SC-014 <title>
- Was: THEN the list shows 20 items
- Now: THEN the list shows 50 items

## REMOVED
- SC-009 (superseded by SC-021)
```

Then:

1. A change to behaviour or scope is D2 or D3. Ask first.
2. Re-run the stages the traceability chain links to the changed IDs.
3. At handoff, merge the delta into the artifacts and move the folder to
   `brainstorm/archive/`.
