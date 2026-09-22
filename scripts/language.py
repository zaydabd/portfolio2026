#!/usr/bin/env python3
"""Handoff-language checks derived from the ASD-STE100 subset in
skills/using-brainstorm/references/handoff-language.md.

Each check is mechanical. Anything requiring judgement stays out of this file and
belongs to the `simple-english` skill instead.
"""

import re

# Spans the checks never read: code, identifiers, quoted values, IDs.
RE_CODE = re.compile(r"`[^`]*`")
RE_ID = re.compile(r"\b(?:US|SC|R|G|NFR|DEC|T|ADR)-\d{3}\b")
RE_QUOTED = re.compile(r"[\"'][^\"']{1,80}[\"']")
RE_URL = re.compile(r"https?://\S+")

BANNED_MODALS = re.compile(r"\b(should|would|may|might|could)\b", re.IGNORECASE)
CONTRACTION = re.compile(r"\b\w+['’](?:s|re|ll|ve|d|t|m)\b", re.IGNORECASE)
LATIN = re.compile(r"\b(e\.g\.|i\.e\.|etc\.|viz\.|cf\.)", re.IGNORECASE)
SEMICOLON = re.compile(r";")
PASSIVE = re.compile(
    r"\b(is|are|was|were|be|been|being)\s+(?:\w+ly\s+)?(\w+(?:ed|en))\b", re.IGNORECASE
)
# "and then", "and also" joining two imperatives in one step.
MULTI_INSTRUCTION = re.compile(r",?\s+(?:and then|then)\s+\w+", re.IGNORECASE)

EMPTY_WORDS = re.compile(
    r"\b(simply|just|easily|seamlessly|effortlessly|robust|powerful|"
    r"comprehensive|performant|leverage|utilis[ez]|in order to|prior to|"
    r"as needed|as necessary|it is worth noting|it is important to)\b",
    re.IGNORECASE,
)

# A noun cluster: four or more consecutive capitalised-or-plain nouns is hard to
# detect without a tagger. Approximate with four or more consecutive words that are
# all lowercase, non-stopword, and not verbs ending in common verb suffixes.
DETERMINERS = {
    "the", "a", "an", "this", "these", "those", "that", "each", "every", "its",
    "their", "his", "her", "my", "your", "our", "no", "any", "some",
}

BREAKERS = {
    "of", "for", "in", "on", "to", "and", "or", "with", "by", "from", "at",
    "is", "are", "was", "were", "be", "been", "when", "if", "then", "given",
    "not", "as", "into", "per", "they", "it", "i", "we", "you", "he", "she",
    "shows", "show", "lists", "list", "holds", "hold", "sees", "see", "opens",
    "open", "requests", "request", "checks", "check", "publishes", "publish",
    "sends", "send", "returns", "return", "appears", "appear", "runs", "run",
    "has", "have", "had", "can", "will", "must", "does", "do", "did", "than",
    "more", "less", "before", "after", "until", "while", "so", "because",
}


def strip_untouchable(text):
    """Blank out spans the rules skip, keeping offsets stable."""
    def blank(m):
        return " " * (m.end() - m.start())
    for pattern in (RE_CODE, RE_URL, RE_QUOTED, RE_ID):
        text = pattern.sub(blank, text)
    return text


def word_count(sentence):
    """Count words the way the standard does: a code span, quoted value, number with
    unit, or ID counts as one word."""
    s = RE_CODE.sub(" TOKEN ", sentence)
    s = RE_URL.sub(" TOKEN ", s)
    s = RE_QUOTED.sub(" TOKEN ", s)
    s = RE_ID.sub(" TOKEN ", s)
    s = re.sub(r"[*_#>|\[\]]", " ", s)
    return len([w for w in s.split() if any(ch.isalnum() for ch in w)])


def sentences(text):
    """Split on sentence enders that are not inside an abbreviation."""
    parts = re.split(r"(?<=[.!?])\s+(?=[A-Z(])", text.strip())
    return [p.strip() for p in parts if p.strip()]


def check_line(line, limit, label, path, rep, strict=True):
    """Run every handoff-language rule against one line of prose."""
    clean = strip_untouchable(line)
    if not clean.strip():
        return

    for sentence in sentences(line):
        n = word_count(sentence)
        if n > limit:
            rep.error(path, f"{label}: sentence runs {n} words, limit {limit} — split it: {sentence[:60]}")

    c = clean
    for m in BANNED_MODALS.finditer(c):
        rep.error(path, f"{label}: '{m.group(1)}' is ambiguous — write must, will or can")
    for m in CONTRACTION.finditer(c):
        rep.error(path, f"{label}: contraction '{m.group(0)}' — write it in full")
    for m in LATIN.finditer(c):
        rep.error(path, f"{label}: '{m.group(1)}' — write 'for example', 'that is', or name the items")
    if SEMICOLON.search(c):
        rep.error(path, f"{label}: semicolon — write two sentences")
    for m in EMPTY_WORDS.finditer(c):
        rep.warn(path, f"{label}: '{m.group(1)}' carries no fact — delete it or state the measurable property")
    if strict:
        for m in PASSIVE.finditer(c):
            rep.warn(path, f"{label}: '{m.group(0)}' is passive — name the actor")
        if MULTI_INSTRUCTION.search(c):
            rep.warn(path, f"{label}: two actions in one sentence — split them")

    for cluster in noun_clusters(c):
        rep.warn(path, f"{label}: '{cluster}' runs {len(cluster.split())} words — break it with 'of', 'for' or 'in'")


def noun_clusters(text, limit=3):
    """Find a determiner followed by more than `limit` content words.

    A real noun cluster is introduced by a determiner: "the connection pool timeout
    configuration value". Requiring the determiner keeps subject-verb-object clauses
    out of the results.
    """
    out = []
    for chunk in re.split(r"[.,;:()\[\]]", text):
        words = chunk.split()
        run = None
        for word in words:
            w = re.sub(r"[^A-Za-z-]", "", word).lower()
            if not w:
                continue
            if w in DETERMINERS:
                if run is not None and len(run) > limit:
                    out.append(" ".join(run))
                run = []
                continue
            if run is None:
                continue
            if w in BREAKERS or w.endswith("ing") or w.endswith("ed") or w.endswith("s'"):
                if len(run) > limit:
                    out.append(" ".join(run))
                run = None
                continue
            run.append(word)
        if run is not None and len(run) > limit:
            out.append(" ".join(run))
    return out


def condition_leads(step_text):
    """True when no 'if'/'when' sits after the first clause of the step."""
    clean = strip_untouchable(step_text).strip()
    m = re.search(r"\b(if|when)\b", clean, re.IGNORECASE)
    if not m:
        return True
    return m.start() <= 2
