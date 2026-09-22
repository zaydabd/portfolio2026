# US-###: <story title>

**Story**: As a <role>, I want <capability>, so that <reason>.
**Priority**: P<1-3>
**Covers goals**: G-###

## Rules

- R-001: <one constraint that must hold; no stacked conditions>
- R-002: <one constraint>

## Scenarios

### SC-001 <what this case shows>  [rule: R-001]
- GIVEN <a known starting state, with concrete values>
- WHEN <one action or event>
- THEN <what the user sees or the caller receives>

### SC-002 <the boundary case>  [rule: R-001]
- GIVEN <state at the limit>
- WHEN <the same action>
- THEN <the observable outcome>
- AND <a second observable outcome>

### SC-003 <the failure case>  [rule: R-002]
- GIVEN <state that makes the action invalid>
- WHEN <the action>
- THEN <the rejection the user sees, and what is unchanged>

## Assumptions

- <decision taken without the human, in one line> (DEC-###)

## Questions

<!--
Every entry here is a blocker. Resolve each one as D2 (ask the human) or as an
AUTO decision moved into Assumptions. This section must be empty before approval.
Remove every angle-bracket placeholder before saving.
-->
