# Handoff: <project or feature name>

**Phase 1 complete.** Approved <date>. Design and UI start from this document.

## What this is

<Three sentences. The problem, who it serves, what Phase 1 settled.>

## Glossary

| Term | Meaning |
|------|---------|
| <term> | <the one definition this project uses> |

## Actors

| Actor | Does |
|-------|------|
| <role> | <what this role does in the product> |

## Goals

| ID | Goal | Stories |
|----|------|---------|
| G-001 | <measurable outcome> | US-001, US-002 |

## Stories and scenarios

### US-001 <title>

<One line: the behaviour this story covers.>

| Scenario | Covers | Outcome the user sees |
|----------|--------|-----------------------|
| SC-001 | <the case> | <the observable result> |

Full detail: `brainstorm/specs/US-001.md`

## What design must cover

### Journeys

- <actor>: <the ordered steps the scenarios imply> [SC-001, SC-002]

### States each surface must handle

| Surface | States | Demanded by |
|---------|--------|-------------|
| <the thing the user works with> | <default, empty, rejected, at-limit> | SC-001, SC-003 |

### Information shown

| Where | Values | From |
|-------|--------|------|
| <the surface> | <the nouns and values the scenarios name> | SC-001 |

### Rejections and limits

| Case | What the user sees | From |
|------|--------------------|------|
| <the rejected action> | <the message or state> | SC-004 |

## Non-functional requirements

| ID | Requirement | Affects design |
|----|-------------|----------------|
| NFR-001 | <the requirement> | <what it constrains> |

## Constraints

- <deadline, system, or platform limit that shapes the design>

## Out of scope

- <excluded item>: <reason>

## Decisions already made

| ID | Decision | Reason |
|----|----------|--------|
| DEC-001 | <what was settled> | <why> |

## Open items

- <anything unresolved, and who owns it>

<!--
Replace every angle-bracket placeholder before saving.
Each design requirement cites the scenario that demands it.
Screens, layouts and components belong to the design phase, not this document.
-->
