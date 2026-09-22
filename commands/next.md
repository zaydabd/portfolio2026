---
description: Run the next step of the brainstorm workflow, based on brainstorm/status.json
---

# brainstorm: next

Run one unit of work, then stop.

## Procedure

1. **Load the rules.** Invoke the `brainstorm:using-brainstorm` skill.

2. **Read `brainstorm/status.json`.** When the file is absent, invoke
   `brainstorm:initializing-project` and stop.

3. **When `state` is `blocked_on_human`**, ask the question recorded in
   `blocked_reason` with AskUserQuestion. Log the answer in
   `brainstorm/decisions.md`, set `state` to `in_progress`, then continue.

4. **Announce the unit** in one line: stage number, stage name, unit ID.

5. **Invoke the stage skill** for the `unit` in status:

   | stage | skill |
   |-------|-------|
   | 0 | `brainstorm:initializing-project` |
   | 1 | `brainstorm:writing-proposals` |
   | 2 | `brainstorm:specifying-stories` |
   | 3 | `brainstorm:packaging-handoff` |

6. **Run the exit checks** the skill declares, including
   `python3 "${CLAUDE_PLUGIN_ROOT}/scripts/check.py"` on every artifact written.

7. **On a pass**, update `brainstorm/status.json` to the next unit or stage, then stop
   and tell the human to `/clear` and run `/brainstorm:next` again.

8. **On a failure**, fix and re-check. After three attempts, set `state` to
   `blocked_on_human`, write the reason into `blocked_reason`, and stop.

9. **At stage 3 approval**, report that Phase 1 is complete and name
   `brainstorm/HANDOFF.md` as the document the design phase reads.

## Rules

- One unit per invocation.
- Run every gate the stage declares.
- Update `status.json` last, after the exit checks pass.

$ARGUMENTS
