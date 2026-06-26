#!/usr/bin/env python3
"""Fetch Bimba datasets from Neo4j and save as JSON files.

Also emits the Track 48 `.base` snapshot artifacts (§13.E) — the static
read-side reflection the Theia BasesView's `StaticBasesSource` consumes. The
snapshot is a C5 reflection of the projected Map node files captured at a
`c_3_projected_at` instant; it is derived from the `map-index` frontmatter of
the projected Map tree (no Neo4j needed), so:

    python3 fetch_bimba.py snapshot   # emit snapshots only (offline)
    python3 fetch_bimba.py            # fetch datasets from Neo4j + emit snapshots
"""

import json
import sys
import urllib.request
import urllib.error
import base64
import datetime
import os

NEO4J_URL = "http://localhost:7475/db/neo4j/tx/commit"
NEO4J_USER = "neo4j"
NEO4J_PASS = "password"
OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
# Map root (parent of datasets/) holds the 1018 projected node files; the
# `.base` snapshots land beside them under `snapshots/` (BASES_SNAPSHOT_ROOT).
MAP_ROOT = os.path.dirname(OUTPUT_DIR)
SNAPSHOT_DIR = os.path.join(MAP_ROOT, "snapshots")

def run_query(cypher):
    payload = json.dumps({"statements": [{"statement": cypher}]}).encode("utf-8")
    creds = base64.b64encode(f"{NEO4J_USER}:{NEO4J_PASS}".encode()).decode()
    req = urllib.request.Request(
        NEO4J_URL,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Basic {creds}",
        },
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def flatten_results(raw):
    """Convert Neo4j REST response to list of dicts."""
    results = raw.get("results", [])
    if not results:
        return []
    columns = results[0]["columns"]
    rows = []
    for row in results[0]["data"]:
        rows.append(dict(zip(columns, row["row"])))
    return rows

NODE_QUERY = """
MATCH (n) WHERE n.bimbaCoordinate STARTS WITH '{branch}'
RETURN n.bimbaCoordinate AS coordinate, n.name AS name, n.coreNature AS coreNature,
       n.completeFormulation AS formulation, n.description AS description,
       n.operationalEssence AS essence, n.internalStructure AS structure
ORDER BY n.bimbaCoordinate
"""

REL_QUERY = """
MATCH (n)-[r]->(m)
WHERE n.bimbaCoordinate STARTS WITH '{branch}'
RETURN n.bimbaCoordinate AS source, type(r) AS type, m.bimbaCoordinate AS target
ORDER BY n.bimbaCoordinate
"""

BRANCHES = [
    ("0", "anuttara"),
    ("1", "paramasiva"),
    ("2", "parashakti"),
    ("3", "mahamaya"),
    ("4", "nara"),
    ("5", "epii"),
]

FOUNDATION_QUERY = """
MATCH (n)-[r]->(m)
WHERE n.bimbaCoordinate IN ['#0', '#1', '#2', '#3', '#4', '#5']
  AND m.bimbaCoordinate IN ['#0', '#1', '#2', '#3', '#4', '#5']
RETURN n.bimbaCoordinate AS source, type(r) AS type, m.bimbaCoordinate AS target
"""

def save(filename, data):
    path = os.path.join(OUTPUT_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"  Saved {len(data)} records → {filename}")

# ---------------------------------------------------------------------------
# Track 48 §13.E — `.base` snapshot emission (static BasesView source)
# ---------------------------------------------------------------------------

def parse_scalar(rest):
    """Parse one flat frontmatter scalar/inline-list value (stdlib only)."""
    if rest == "":
        return ""
    if rest.startswith("[") or rest.startswith("{"):
        try:
            return json.loads(rest)
        except (ValueError, json.JSONDecodeError):
            return rest
    if (rest.startswith('"') and rest.endswith('"')) or (
        rest.startswith("'") and rest.endswith("'")
    ):
        return rest[1:-1]
    if rest in ("true", "false"):
        return rest == "true"
    return rest


def parse_frontmatter(text):
    """Extract the flat YAML frontmatter block of a Map node note as a dict.

    The projected Map notes carry only top-level keys, so a minimal line parser
    suffices and keeps this script stdlib-only (no PyYAML dependency)."""
    if not text.startswith("---"):
        return None
    end = text.find("\n---", 3)
    if end == -1:
        return None
    block = text[3:end].strip("\n")
    fm = {}
    for line in block.split("\n"):
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        # Frontmatter here is flat; skip any indented continuation lines.
        if line[0] in (" ", "\t") or ":" not in line:
            continue
        key, _, rest = line.partition(":")
        fm[key.strip()] = parse_scalar(rest.strip())
    return fm


def collect_map_index_rows(map_root):
    """Walk the Map tree, returning the frontmatter dict of every `map-index`
    note (coordinate-keyed rows for the base snapshot)."""
    rows = []
    for dirpath, _dirs, files in os.walk(map_root):
        # Skip the datasets/ + snapshots/ sidecars — only node notes count.
        if dirpath == OUTPUT_DIR or dirpath.startswith(OUTPUT_DIR + os.sep):
            continue
        if dirpath == SNAPSHOT_DIR:
            continue
        for name in files:
            if not name.endswith(".md"):
                continue
            with open(os.path.join(dirpath, name), encoding="utf-8") as f:
                fm = parse_frontmatter(f.read())
            if not fm or fm.get("c_4_artifact_role") != "map-index":
                continue
            if not fm.get("coordinate"):
                continue
            rows.append(fm)
    rows.sort(key=lambda r: r.get("coordinate", ""))
    return rows


def branch_of(coordinate):
    """Top-level branch slug for a coordinate, e.g. 'M2-1' -> 'M2'."""
    if len(coordinate) >= 2 and coordinate[0] == "M" and coordinate[1].isdigit():
        return coordinate[:2]
    return None


def write_snapshot(slug, scope, rows):
    """Emit one `{slug}.base.json` snapshot the StaticBasesSource reads.

    Shape: `{ rows: [...] }` plus C5-reflection provenance — `coerceRows`
    extracts the `rows` array and joins on each row's `coordinate`."""
    if not os.path.isdir(SNAPSHOT_DIR):
        os.makedirs(SNAPSHOT_DIR, exist_ok=True)
    projected_at = max(
        (r.get("c_3_projected_at", "") for r in rows),
        default="",
    ) or datetime.date.today().isoformat()
    snapshot = {
        "coordinate": scope or "Map",
        "c_4_artifact_role": "base-view",
        "c_3_projected_from": "Idea/Bimba/Map",
        "c_3_projected_at": projected_at,
        "row_count": len(rows),
        "rows": rows,
    }
    path = os.path.join(SNAPSHOT_DIR, f"{slug}.base.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(snapshot, f, indent=2, ensure_ascii=False)
    print(f"  Snapshot {len(rows):>4} rows → snapshots/{slug}.base.json")


def emit_base_snapshots():
    """Build the static `.base` snapshots: one whole-map (`all`) plus one per
    M-branch, so the BasesView's default + coordinate-scoped paths resolve."""
    print("\n[base] Emitting `.base` snapshots (Track 48 §13.E)")
    rows = collect_map_index_rows(MAP_ROOT)
    if not rows:
        print("  No map-index notes found — nothing to snapshot.")
        return
    # Whole-map snapshot — the StaticBasesSource default (`all.base.json`).
    write_snapshot("all", "", rows)
    # Per-branch snapshots — scope slug == coordinate prefix (hyphens kept).
    branches = {}
    for r in rows:
        b = branch_of(r["coordinate"])
        if b:
            branches.setdefault(b, []).append(r)
    for slug in sorted(branches):
        write_snapshot(slug, slug, branches[slug])


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "snapshot":
        # Offline path: emit snapshots from the projected Map notes only.
        emit_base_snapshots()
        print("\nDone. Base snapshots saved.")
        sys.exit(0)

    print("Fetching Bimba datasets from Neo4j...\n")

    for num, name in BRANCHES:
        branch = f"#{num}"

        print(f"[{branch}] {name.capitalize()} — node data")
        raw = run_query(NODE_QUERY.format(branch=branch))
        rows = flatten_results(raw)
        save(f"nodes_{name}.json", rows)

        print(f"[{branch}] {name.capitalize()} — relationships")
        raw = run_query(REL_QUERY.format(branch=branch))
        rows = flatten_results(raw)
        save(f"relations_{name}.json", rows)

    print("\n[root] Full foundation relationships (#0–#5 trunk)")
    raw = run_query(FOUNDATION_QUERY)
    rows = flatten_results(raw)
    save("relations_foundation.json", rows)

    emit_base_snapshots()

    print("\nDone. All datasets saved.")
