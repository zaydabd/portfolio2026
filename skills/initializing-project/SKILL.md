---
name: initializing-project
description: This skill should be used when the user asks to "set up brainstorm", "initialise the workflow", "start a brainstorm project", "add brainstorm to this project", or when a brainstorm stage is requested in a project that holds no brainstorm/status.json. It captures the domain vocabulary and document conventions, then creates the Phase 1 scaffolding.
---

# Initialising a brainstorm project

Stage 0. Runs once per project. Captures the language the documents will use, so
every later stage names things the same way.

## Inputs

The human's answers. Any existing `CLAUDE.md`, glossary, or client documentation in
the project.

## Outputs

```
CLAUDE.md                domain vocabulary and document conventions
brainstorm/status.json
brainstorm/decisions.md
brainstorm/specs/          (empty)
brainstorm/changes/        (empty)
brainstorm/archive/        (empty)
```

## Steps

Copy this checklist and mark each item as it completes:

```
Stage 0 progress:
- [ ] 1 Read what the project already holds
- [ ] 2 Interview for the vocabulary
- [ ] 3 Write CLAUDE.md
- [ ] 4 Create the scaffolding
- [ ] 5 Validate
```

### 1. Read what the project already holds

Read any `CLAUDE.md`, `README.md`, glossary, or client document present. Collect the
terms already in use. An existing `CLAUDE.md` keeps its content: add a `## brainstorm`
section to it.

### 2. Interview for the vocabulary

Invoke `grilling` and run it against the questions below. Without that skill, ask the
same questions in rounds: number each one, give a recommended answer, and wait.

Settle each of these:

| Area | What to capture |
|------|-----------------|
| Domain terms | The 10-30 nouns this domain uses, each with one definition |
| Term choices | Where two words name one thing, the word that wins |
| Roles | Every actor, including admins, support and external systems |
| Client conventions | Names, spellings and formats the client requires |
| Document home | Where these documents live and who reads them |
| Handoff reader | Who receives Phase 1 output, and what they already know |

Ask about the terms already used in two ways in the material from step 1.

### 3. Write CLAUDE.md

Include what the documents need and the project cannot show:

- The glossary: one term, one definition, one spelling
- The roles and what each one does
- Client conventions and required formats
- Terms this project forbids, each with its replacement

Leave out anything a reader derives from the documents themselves.

End the file with:

```markdown
## brainstorm

This project runs Phase 1 of the brainstorm workflow: idea to approved documents.
Follow the `brainstorm:using-brainstorm` skill. Artifacts live in `brainstorm/`.
A change to an approved artifact goes in `brainstorm/changes/<name>/delta.md`.
Design and UI happen in a separate phase that consumes `brainstorm/HANDOFF.md`.
```

### 4. Create the scaffolding

```bash
mkdir -p brainstorm/specs brainstorm/changes brainstorm/archive
```

`brainstorm/status.json`:

```json
{
  "stage": 1,
  "unit": null,
  "state": "in_progress",
  "blocked_reason": "",
  "completed": { "stages": [0], "stories": [] }
}
```

`brainstorm/decisions.md`:

```markdown
# Decision log

Format: `ID | WHO | TYPE | DATE | DECISION | Reason: ... | Affects: ...`

- DEC-001 | HUMAN | -- | <today> | Adopted brainstorm Phase 1 | Reason: documents need staged gates | Affects: all stages
```

### 5. Validate

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/scripts/check.py" brainstorm/status.json
```

## Exit checks

- `CLAUDE.md` holds a glossary with at least one definition per term
- Every term the glossary names has exactly one definition and one spelling
- `brainstorm/status.json` passes `check.py`
- `brainstorm/decisions.md` holds at least one entry
- The three folders exist

## Human gate

None. The interview collects the answers.

## Next

Report the glossary size and the roles captured, in three lines. Tell the human to
`/clear` and run `/brainstorm:next` for stage 1.
