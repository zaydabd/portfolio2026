# Handoff language

Phase 1 writes for a reader who cannot ask questions: the design phase, weeks later,
with no memory of the conversation. These rules keep a sentence readable in one pass.

They are the ASD-STE100 subset that `check.py` enforces. For the full 53 rules,
invoke the `simple-english` skill in pragmatic mode before delivering an artifact.
That skill is the source of truth; this file lists only what the checker gates.

## Limits by section

| Section | Limit |
|---------|-------|
| Scenario steps, rules, story lines | 20 words per sentence |
| Prose sections (problem, summary, notes) | 25 words per sentence |
| Any paragraph | 6 sentences |
| Multi-word noun | 3 words |

## Enforced rules

- **One instruction per sentence.** Two actions become two sentences.
- **Condition first.** "If the order is unpaid, cancel it."
- **Modals: can, will, must.** A requirement is `must`. A possibility is `can`.
- **One item, one name.** A concept keeps the same word across every artifact.
- **Active voice**, with the actor named.
- **Complete grammar.** Keep articles and keep "that".
- **Full words** in place of contractions, semicolons, and Latin abbreviations.
  Write "for example" and "that is"; name the items in place of "etc.".

## Untouchable

The checker skips these, and so does any rewrite:

- Code spans, identifiers, file paths, CLI flags
- Quoted values and error strings
- IDs such as `US-001`, `SC-014`, `NFR-002`
- Product, client and system names

## Words that carry no fact

Delete these, or replace them with the measurable property:

- simply, just, easily, seamlessly, effortlessly
- robust, powerful, comprehensive, performant
- it is worth noting that, it is important to
- leverage, utilize → use
- in order to → to
- prior to → before
- as needed, as necessary → state the condition
