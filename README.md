# brainstorm

**Phase 1 of delivery: an idea becomes approved documents.**

Claude runs every stage. You make four decisions. Design, UI and build happen in a
separate phase that reads `brainstorm/HANDOFF.md`.

## Install

```bash
/plugin marketplace add /absolute/path/to/brainstorm
/plugin install brainstorm@brainstorm-dev
```

Or run one session without installing:

```bash
claude --plugin-dir /absolute/path/to/brainstorm
```

## Use

```
/brainstorm:next
```

One unit of work runs, then it stops. Run `/clear`, then `/brainstorm:next` again.

## Stages

| # | Stage | Output | Gate |
|---|-------|--------|------|
| 0 | Setup | `CLAUDE.md` glossary, `brainstorm/` scaffolding | none |
| 1 | Proposal | `brainstorm/proposal.md` | **D1** approve scope |
| 2 | Behaviour spec | `brainstorm/specs/US-###.md`, one per story | **D2** behaviour questions |
| 3 | Handoff | `brainstorm/HANDOFF.md` | **D4** approve for design |

**D3** fires whenever a story is added, dropped or reprioritised.

## Your four decisions

| ID | You decide |
|----|------------|
| D1 | The goals, non-goals and story list |
| D2 | Any open question that changes behaviour or a business rule |
| D3 | Adding, dropping or reprioritising a story |
| D4 | Whether the handoff package is ready for design |

Claude decides everything else and logs it in `brainstorm/decisions.md` as `AUTO`.

## Supporting skills

Install these for the best results. Each stage runs without them, using an inline
fallback.

| Skill | Source | Used for |
|-------|--------|----------|
| `grilling` | [mattpocock/skills](https://github.com/mattpocock/skills) | Every interview |
| `write-spec` | [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins) | Proposal depth |
| `product-brainstorming` | anthropics/knowledge-work-plugins | An idea not yet formed |
| `simple-english` | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | Language pass on every artifact |

## Where the determinism comes from

Instructions steer Claude. `scripts/check.py` gates it, and the PostToolUse hook runs
it after every write to an artifact.

**Structure**
- Required sections in every artifact
- IDs unique across the project, never renumbered
- Goals carry a number, threshold or time bound
- Every goal is served by a story, and every story cites a goal
- Every rule carries a scenario, and every scenario cites a defined rule
- Every scenario holds GIVEN, WHEN and THEN, in order
- No unresolved questions or placeholders at a gate
- Every design requirement in the handoff cites the scenario that demands it
- The handoff cites no scenario that a spec does not define

**Handoff language** — the ASD-STE100 subset, so the design phase reads each sentence once
- 20 words per sentence in rules and scenario steps, 25 in prose
- Modals limited to can, will and must
- Conditions lead their sentence
- No contractions, semicolons or Latin abbreviations
- Noun clusters capped at three words
- Passive voice and empty words flagged as warnings

Code spans, quoted values, IDs and product names are never checked or rewritten.

Run it yourself:

```bash
python3 scripts/check.py                          # everything under ./brainstorm
python3 scripts/check.py brainstorm/specs/US-001.md
```

Exit 1 means at least one error.

## Components

```
.claude-plugin/     plugin.json, marketplace.json
commands/next.md    the router: one unit, then stop
hooks/
  session-start     injects using-brainstorm into every session
  validate-artifact PostToolUse: validates an artifact after every write
agents/
  spec-tester.md    adversarial spec review in fresh context
scripts/
  check.py          structure and traceability gate
  language.py       handoff-language rules
skills/             the meta-skill and the four stage skills
```

## Extending it

Add a stage by creating `skills/<gerund-name>/SKILL.md`, adding its row to the stage
map in `skills/using-brainstorm/SKILL.md` and to `commands/next.md`, then adding the
new artifact's rules to `scripts/check.py`. A stage with no checker has no gate.
