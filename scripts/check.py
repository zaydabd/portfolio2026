#!/usr/bin/env python3
"""Validate brainstorm artifacts.

Usage:
    python3 check.py <path>...     validate the named files
    python3 check.py               validate every artifact under ./brainstorm

Exit codes:
    0  all checks passed (warnings may still be printed)
    1  at least one error
    2  bad invocation
"""

import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import language

PROPOSAL_SECTIONS = [
    "Problem",
    "Users",
    "Goals",
    "Non-goals",
    "Non-functional requirements",
    "Constraints",
    "Stories",
    "Open questions",
]

SPEC_SECTIONS = ["Rules", "Scenarios", "Assumptions", "Questions"]

HANDOFF_SECTIONS = [
    "What this is",
    "Glossary",
    "Actors",
    "Goals",
    "Stories and scenarios",
    "What design must cover",
    "Non-functional requirements",
    "Constraints",
    "Out of scope",
    "Decisions already made",
    "Open items",
]

RE_GOAL = re.compile(r"^\s*-\s*\*{0,2}(G-\d{3})\*{0,2}\s*[:|]\s*(.+)$")
RE_NFR = re.compile(r"^\s*-\s*\*{0,2}(NFR-\d{3})\*{0,2}\s*[:|]\s*(.+)$")
RE_STORY = re.compile(r"^\s*-\s*\*{0,2}(US-\d{3})\*{0,2}\s*\|\s*(P[123])\s*\|\s*(.+)$")
RE_RULE = re.compile(r"^\s*-\s*\*{0,2}(R-\d{3})\*{0,2}\s*[:|]\s*(.+)$")
RE_SCENARIO = re.compile(r"^###\s+(SC-\d{3})\s+(.+?)\s*\[rule:\s*(R-\d{3})\]\s*$")
RE_STEP = re.compile(r"^\s*-\s*\*{0,2}(GIVEN|WHEN|THEN|AND)\*{0,2}\s+(.+)$")
RE_NEEDS = re.compile(r"\[NEEDS DECISION[^\]]*\]", re.IGNORECASE)
RE_PLACEHOLDER = re.compile(r"\b(TBD|TODO|FIXME|XXX|<[a-z][a-z ]*>)\b", re.IGNORECASE)

# A THEN that only describes internal state is not observable.
UNOBSERVABLE = re.compile(
    r"\b(database|db|table|record is (?:saved|stored|written)|cache|"
    r"variable|flag is set|state is updated|memory|internal)\b",
    re.IGNORECASE,
)

MEASURABLE = re.compile(
    r"(\d|\bpercent\b|%|\bwithin\b|\bunder\b|\bat least\b|\bat most\b|"
    r"\bno more than\b|\bfewer than\b|\bper\b)",
    re.IGNORECASE,
)


class Report:
    def __init__(self):
        self.errors = []
        self.warnings = []

    def error(self, path, msg):
        self.errors.append(f"ERROR {path}: {msg}")

    def warn(self, path, msg):
        self.warnings.append(f"WARN  {path}: {msg}")

    def ok(self):
        return not self.errors

    def emit(self):
        for line in self.errors + self.warnings:
            print(line)
        if self.ok() and not self.warnings:
            print("OK")


def sections(text):
    """Map top-level '## Heading' to its body lines."""
    out, current = {}, None
    for line in text.splitlines():
        m = re.match(r"^##\s+(.+?)\s*$", line)
        if m:
            current = m.group(1).strip()
            out[current] = []
        elif current is not None:
            out[current].append(line)
    return out


def find_section(secs, wanted):
    for name, body in secs.items():
        if name.lower().startswith(wanted.lower()):
            return name, body
    return None, None


def check_proposal(path, text, rep):
    secs = sections(text)

    for wanted in PROPOSAL_SECTIONS:
        name, _ = find_section(secs, wanted)
        if name is None:
            rep.error(path, f"missing section '## {wanted}'")

    _, goals_body = find_section(secs, "Goals")
    goals = []
    if goals_body:
        for line in goals_body:
            m = RE_GOAL.match(line)
            if m:
                goals.append(m.group(1))
                if not MEASURABLE.search(m.group(2)):
                    rep.error(
                        path,
                        f"{m.group(1)} is not measurable — add a number, "
                        f"threshold or time bound: {m.group(2)[:60]}",
                    )
            elif line.strip().startswith("-"):
                rep.error(path, f"goal line is not 'G-###: text': {line.strip()[:60]}")
    if not goals:
        rep.error(path, "no goals found; expected at least one 'G-###: ...' line")

    _, nfr_body = find_section(secs, "Non-functional")
    nfrs = [m.group(1) for line in (nfr_body or []) if (m := RE_NFR.match(line))]
    if not nfrs:
        rep.warn(path, "no NFR-### lines; confirm performance/security/accessibility are truly out of scope")

    _, stories_body = find_section(secs, "Stories")
    stories = []
    if stories_body:
        for line in stories_body:
            m = RE_STORY.match(line)
            if m:
                stories.append(m.group(1))
            elif line.strip().startswith("-"):
                rep.error(
                    path,
                    f"story line is not 'US-### | P1 | text': {line.strip()[:60]}",
                )
    if not stories:
        rep.error(path, "no stories found; expected at least one 'US-### | P# | ...' line")

    dupes = {i for i in stories if stories.count(i) > 1}
    for d in sorted(dupes):
        rep.error(path, f"duplicate story ID {d}")

    _, oq_body = find_section(secs, "Open questions")
    if oq_body and RE_NEEDS.search("\n".join(oq_body)):
        rep.error(path, "open questions remain — resolve every [NEEDS DECISION] before the D1 gate")

    for dupe in duplicate_ids(goals + nfrs):
        rep.error(path, f"duplicate ID {dupe}")

    body_no_open = "\n".join(
        l for name, b in secs.items() if not name.lower().startswith("open questions") for l in b
    )
    for m in RE_PLACEHOLDER.finditer(body_no_open):
        rep.error(path, f"placeholder left in the document: {m.group(0)}")

    # Handoff language. Prose sections take 25 words; ID'd lines take 20.
    for name, body in secs.items():
        if name.lower().startswith("open questions"):
            continue
        tight = name.lower().startswith(("goals", "stories", "non-functional"))
        limit = 20 if tight else 25
        for line in body:
            if line.strip().startswith(("|", "<!--", "-->", "```")):
                continue
            language.check_line(line, limit, name, path, rep, strict=tight)

    # Every story cites a goal, and every goal is served.
    served = set()
    for line in (stories_body or []):
        m = RE_STORY.match(line)
        if not m:
            continue
        cites = re.findall(r"G-\d{3}", line)
        if not cites:
            rep.error(path, f"{m.group(1)} cites no goal — add [serves: G-###]")
        served.update(cites)
    for g in goals:
        if g not in served:
            rep.error(path, f"{g} is served by no story")
    for g in sorted(served - set(goals)):
        rep.error(path, f"a story cites {g}, which is not defined in Goals")


def check_spec(path, text, rep):
    fname = os.path.basename(path)
    m = re.match(r"^(US-\d{3})\.md$", fname)
    if not m:
        rep.error(path, "spec filename must be US-###.md")
        story_id = None
    else:
        story_id = m.group(1)

    title = next((l for l in text.splitlines() if l.startswith("# ")), "")
    if story_id and story_id not in title:
        rep.error(path, f"title must start with '# {story_id}:'")

    secs = sections(text)
    for wanted in SPEC_SECTIONS:
        name, _ = find_section(secs, wanted)
        if name is None:
            rep.error(path, f"missing section '## {wanted}'")

    _, rules_body = find_section(secs, "Rules")
    rules = []
    if rules_body:
        for line in rules_body:
            rm = RE_RULE.match(line)
            if rm:
                rules.append(rm.group(1))
            elif line.strip().startswith("-"):
                rep.error(path, f"rule line is not 'R-###: text': {line.strip()[:60]}")
    if not rules:
        rep.error(path, "no rules found; expected at least one 'R-###: ...' line")

    scenarios, cited_rules = parse_scenarios(path, text, rep)
    if not scenarios:
        rep.error(path, "no scenarios found; expected '### SC-### <title> [rule: R-###]'")

    for r in rules:
        if r not in cited_rules:
            rep.error(path, f"{r} has no scenario illustrating it")
    for r in sorted(set(cited_rules) - set(rules)):
        rep.error(path, f"scenario cites {r}, which is not defined in Rules")

    for dupe in duplicate_ids(rules + [s["id"] for s in scenarios]):
        rep.error(path, f"duplicate ID {dupe}")

    _, q_body = find_section(secs, "Questions")
    if q_body and any(l.strip().startswith("-") for l in q_body):
        rep.error(path, "Questions section must be empty before this spec is approved")

    for m2 in RE_PLACEHOLDER.finditer(text):
        rep.error(path, f"placeholder left in the document: {m2.group(0)}")

    for line in (rules_body or []):
        if RE_RULE.match(line):
            language.check_line(line, 20, "rule", path, rep)

    return scenarios


def parse_scenarios(path, text, rep):
    scenarios, cited = [], []
    current = None
    for line in text.splitlines():
        sm = RE_SCENARIO.match(line)
        if sm:
            if current:
                validate_scenario(path, current, rep)
                scenarios.append(current)
            current = {
                "id": sm.group(1),
                "title": sm.group(2),
                "rule": sm.group(3),
                "steps": [],
            }
            cited.append(sm.group(3))
            continue
        if line.startswith("###"):
            if current:
                validate_scenario(path, current, rep)
                scenarios.append(current)
                current = None
            if re.match(r"^###\s+SC-", line):
                rep.error(
                    path,
                    f"scenario heading is malformed, expected "
                    f"'### SC-### <title> [rule: R-###]': {line.strip()[:70]}",
                )
            continue
        if current is not None:
            stm = RE_STEP.match(line)
            if stm:
                current["steps"].append((stm.group(1).upper(), stm.group(2)))
    if current:
        validate_scenario(path, current, rep)
        scenarios.append(current)
    return scenarios, cited


def validate_scenario(path, sc, rep):
    kinds = [k for k, _ in sc["steps"]]
    label = sc["id"]
    for required in ("GIVEN", "WHEN", "THEN"):
        if required not in kinds:
            rep.error(path, f"{label} has no {required} step")
    if len(sc["steps"]) > 6:
        rep.warn(path, f"{label} has {len(sc['steps'])} steps; 3-5 keeps a scenario readable")
    if kinds and kinds[0] != "GIVEN":
        rep.error(path, f"{label} must start with GIVEN")
    for kind, txt in sc["steps"]:
        language.check_line(txt, 20, f"{label} {kind}", path, rep)
        if kind in ("WHEN", "THEN") and not language.condition_leads(txt):
            rep.error(
                path,
                f"{label} {kind}: move the condition to the front — "
                f"\"If <condition>, <action>\": {txt[:60]}",
            )
        if kind == "THEN" and UNOBSERVABLE.search(txt):
            rep.warn(
                path,
                f"{label} THEN may not be observable — state what the user or "
                f"caller sees: {txt[:60]}",
            )


def duplicate_ids(ids):
    seen, dupes = set(), set()
    for i in ids:
        if i in seen:
            dupes.add(i)
        seen.add(i)
    return sorted(dupes)


def check_handoff(path, text, rep):
    secs = sections(text)
    for wanted in HANDOFF_SECTIONS:
        name, _ = find_section(secs, wanted)
        if name is None:
            rep.error(path, f"missing section '## {wanted}'")

    for m in RE_PLACEHOLDER.finditer(text):
        rep.error(path, f"placeholder left in the document: {m.group(0)}")

    name, body = find_section(secs, "What design must cover")
    if body:
        joined = "\n".join(body)
        for row in [l for l in body if l.strip().startswith("|")]:
            if row.strip().startswith(("|---", "| ---")) or "Demanded by" in row or "From" in row:
                continue
            if not re.search(r"SC-\d{3}", row):
                rep.error(
                    path,
                    f"design requirement cites no scenario — add the SC-### that demands it: {row.strip()[:60]}",
                )

    for sec_name, body in secs.items():
        if sec_name.lower().startswith(("glossary", "actors", "decisions", "open items")):
            continue
        for line in body:
            if line.strip().startswith(("|", "<!--", "-->", "```")):
                continue
            language.check_line(line, 25, sec_name, path, rep, strict=False)

    return re.findall(r"SC-\d{3}", text)


def check_status(path, text, rep):
    try:
        data = json.loads(text)
    except json.JSONDecodeError as exc:
        rep.error(path, f"invalid JSON: {exc}")
        return
    for field in ("stage", "unit", "state", "completed"):
        if field not in data:
            rep.error(path, f"missing field '{field}'")
    if not isinstance(data.get("stage"), int):
        rep.error(path, "'stage' must be an integer")
    if data.get("state") not in ("in_progress", "blocked_on_human", "done"):
        rep.error(path, "'state' must be in_progress, blocked_on_human or done")
    if data.get("state") == "blocked_on_human" and not data.get("blocked_reason"):
        rep.error(path, "'blocked_reason' is required when state is blocked_on_human")
    completed = data.get("completed")
    if not isinstance(completed, dict):
        rep.error(path, "'completed' must be an object with stages, stories and tasks")


def cross_check(spec_dir, per_file_scenarios, rep):
    """Scenario IDs must be unique across every spec file."""
    seen = {}
    for path, scenarios in per_file_scenarios.items():
        for sc in scenarios:
            if sc["id"] in seen:
                rep.error(path, f"{sc['id']} already used in {seen[sc['id']]}")
            else:
                seen[sc["id"]] = os.path.basename(path)


def collect_default():
    root = os.path.join(os.getcwd(), "brainstorm")
    if not os.path.isdir(root):
        print("ERROR: no ./brainstorm directory; run from the project root", file=sys.stderr)
        sys.exit(2)
    paths = []
    for name in ("proposal.md", "status.json", "HANDOFF.md"):
        p = os.path.join(root, name)
        if os.path.exists(p):
            paths.append(p)
    spec_dir = os.path.join(root, "specs")
    if os.path.isdir(spec_dir):
        paths += sorted(
            os.path.join(spec_dir, f) for f in os.listdir(spec_dir) if f.endswith(".md")
        )
    return paths


def main(argv):
    paths = argv[1:] or collect_default()
    if not paths:
        print("Nothing to check.")
        return 0

    rep = Report()
    per_file_scenarios = {}
    handoff_scenarios = None
    handoff_path = None

    for path in paths:
        if not os.path.exists(path):
            rep.error(path, "file not found")
            continue
        with open(path, encoding="utf-8") as fh:
            text = fh.read()
        base = os.path.basename(path)
        if base == "proposal.md":
            check_proposal(path, text, rep)
        elif base == "status.json":
            check_status(path, text, rep)
        elif base == "HANDOFF.md":
            handoff_scenarios = check_handoff(path, text, rep)
            handoff_path = path
        elif re.match(r"^US-\d{3}\.md$", base) or "/specs/" in path.replace("\\", "/"):
            per_file_scenarios[path] = check_spec(path, text, rep)
        else:
            rep.warn(path, "not a recognised brainstorm artifact; skipped")

    if len(per_file_scenarios) > 1:
        cross_check(None, per_file_scenarios, rep)

    if handoff_scenarios is not None and per_file_scenarios:
        defined = {sc["id"] for scs in per_file_scenarios.values() for sc in scs}
        for cited in sorted(set(handoff_scenarios)):
            if cited not in defined:
                rep.error(handoff_path, f"cites {cited}, which no spec defines")

    rep.emit()
    return 0 if rep.ok() else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
