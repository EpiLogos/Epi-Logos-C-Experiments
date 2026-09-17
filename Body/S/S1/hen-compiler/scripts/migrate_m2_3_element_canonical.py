#!/usr/bin/env python3
"""Migrate M2-3 decan node element fields to L2' canonical element IDs.

Task 05.T5.16 — L2' canonical element-ID harmonisation across the M-stack.

THE element-bearing lens is L2' (Idea/Bimba/World/L2'.md). Its six inner
positions define the one authoritative element ordering:

    0=Aether  1=Earth  2=Water  3=Air  4=Fire  5=Salt

The parashakti-deep dataset stores element values as *strings* on the 12
decan-group nodes under coordinate #2-3-{1..4}-{0..2}. This migration:

  1. Normalises any non-canonical element NAME to the L2' canon — in
     particular renames "Mineral" -> "Salt" per the Tria Prima / Three
     Principles canon (and Ether/Quintessence/Spirit/Akasha -> "Aether").
  2. Attaches an explicit ``element_canonical_id`` (0-5) alongside each
     ``element`` field, so downstream runtime no longer has to guess which of
     the historical orderings a value belongs to.

It edits ONLY the element string fields (``element`` and
``zodiacalData_element``) of nodes whose coordinate begins with ``#2-3``.

It NEVER rewrites the ``coordinate`` / ``bimbaCoordinate`` strings. The
``#2-3-1 = Fire``, ``#2-3-2 = Earth``, ``#2-3-3 = Air``, ``#2-3-4 = Water``
branch naming is a graph-coordinate convention, not an element ID, and is
left untouched.

The file is edited as raw text (not re-serialised JSON) to preserve its exact
formatting, BOM, and intentionally-unescaped control characters. The change is
idempotent: re-running updates existing ``element_canonical_id`` values in
place rather than duplicating them.

Usage:
    migrate_m2_3_element_canonical.py [PATH] [--apply]

Default is a DRY RUN: it prints a unified diff of the proposed changes and
exits without writing. Pass --apply to write the changes back to PATH.
"""

from __future__ import annotations

import argparse
import difflib
import re
import sys
from pathlib import Path

# Repo-relative default to the canonical dataset.
DEFAULT_PATH = (
    Path(__file__).resolve().parents[5]
    / "Idea/Bimba/Map/datasets/parashakti-deep/nodes-full-detail.json"
)

COORDINATE_PREFIX = "#2-3"

# L2' canonical element name -> canonical id.
NAME_TO_ID = {
    "Aether": 0,
    "Earth": 1,
    "Water": 2,
    "Air": 3,
    "Fire": 4,
    "Salt": 5,
}

# Non-canonical element names -> their canonical L2' name (case-insensitive).
# "Mineral" -> "Salt" is the Tria Prima body-principle rename.
RENAME_MAP = {
    "mineral": "Salt",
    "ether": "Aether",
    "aether": "Aether",
    "quintessence": "Aether",
    "spirit": "Aether",
    "akasha": "Aether",
    "earth": "Earth",
    "water": "Water",
    "air": "Air",
    "fire": "Fire",
    "salt": "Salt",
}

# Matches `"coordinate": "..."` — the first key of every node object.
_COORD_RE = re.compile(r'"coordinate":\s*"(?P<coord>[^"]*)"')

# Primary element field, optionally followed by an existing canonical-id line.
# Note: `"element":` cannot match inside `"zodiacalData_element":` because the
# char preceding `element` there is `_`, not the opening quote.
_ELEMENT_RE = re.compile(
    r'(?P<indent>[ \t]*)"element": "(?P<val>[^"]*)",\n'
    r'(?P<existing>[ \t]*"element_canonical_id": [0-9]+,\n)?'
)

# zodiacalData_element field — value only (rename, no id sibling).
_ZOD_ELEMENT_RE = re.compile(r'"zodiacalData_element": "(?P<val>[^"]*)"')


def _canonical_name(raw: str) -> str | None:
    """Map a raw element string to its canonical L2' name, or None if unknown."""
    return RENAME_MAP.get(raw.strip().lower())


def _coord_spans(text: str) -> list[tuple[int, str]]:
    """Return [(start_offset, coordinate), ...] sorted by offset."""
    return [(m.start(), m.group("coord")) for m in _COORD_RE.finditer(text)]


def _coord_at(spans: list[tuple[int, str]], offset: int) -> str:
    """Coordinate of the node enclosing `offset` (nearest preceding coordinate)."""
    coord = ""
    for start, c in spans:
        if start <= offset:
            coord = c
        else:
            break
    return coord


def migrate_text(text: str) -> tuple[str, list[str]]:
    """Return (new_text, change_log) for the in-memory migration."""
    spans = _coord_spans(text)
    changes: list[str] = []

    def in_scope(offset: int) -> bool:
        return _coord_at(spans, offset).startswith(COORDINATE_PREFIX)

    def element_sub(m: re.Match[str]) -> str:
        if not in_scope(m.start()):
            return m.group(0)
        coord = _coord_at(spans, m.start())
        indent = m.group("indent")
        raw = m.group("val")
        canon = _canonical_name(raw)
        if canon is None:
            changes.append(f"WARN {coord}: unknown element {raw!r} — left as-is, no id")
            return m.group(0)
        cid = NAME_TO_ID[canon]
        if canon != raw:
            changes.append(f"{coord}: element {raw!r} -> {canon!r}")
        had_id = m.group("existing") is not None
        if not had_id:
            changes.append(f"{coord}: + element_canonical_id = {cid}")
        elif f": {cid},\n" not in m.group("existing"):
            changes.append(f"{coord}: element_canonical_id -> {cid}")
        return (
            f'{indent}"element": "{canon}",\n'
            f'{indent}"element_canonical_id": {cid},\n'
        )

    def zod_sub(m: re.Match[str]) -> str:
        if not in_scope(m.start()):
            return m.group(0)
        coord = _coord_at(spans, m.start())
        raw = m.group("val")
        canon = _canonical_name(raw)
        if canon is None or canon == raw:
            return m.group(0)
        changes.append(f"{coord}: zodiacalData_element {raw!r} -> {canon!r}")
        return f'"zodiacalData_element": "{canon}"'

    new_text = _ELEMENT_RE.sub(element_sub, text)
    new_text = _ZOD_ELEMENT_RE.sub(zod_sub, new_text)
    return new_text, changes


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "path",
        nargs="?",
        type=Path,
        default=DEFAULT_PATH,
        help="nodes-full-detail.json to migrate (default: parashakti-deep dataset)",
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="write changes back to PATH (default: dry-run diff only)",
    )
    args = parser.parse_args(argv)

    path: Path = args.path
    if not path.exists():
        print(f"error: file not found: {path}", file=sys.stderr)
        return 2

    # Read as plain utf-8 to preserve the leading BOM verbatim on round-trip.
    original = path.read_text(encoding="utf-8")
    migrated, changes = migrate_text(original)

    if migrated == original:
        print(f"No changes: {path} already canonical ({len(changes)} notes).")
        for c in changes:
            print(f"  {c}")
        return 0

    print(f"Proposed M2-3 element changes for {path}:")
    for c in changes:
        print(f"  {c}")
    print()

    diff = difflib.unified_diff(
        original.splitlines(keepends=True),
        migrated.splitlines(keepends=True),
        fromfile=f"{path} (current)",
        tofile=f"{path} (canonical)",
        n=2,
    )
    sys.stdout.writelines(diff)

    if args.apply:
        path.write_text(migrated, encoding="utf-8")
        print(f"\nAPPLIED: wrote {path}")
    else:
        print("\nDRY RUN — no files written. Re-run with --apply to write.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
