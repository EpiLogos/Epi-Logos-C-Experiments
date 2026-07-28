#!/usr/bin/env python3
"""Rebuild the M2 deep properties the 2026-07-28 unscoped DETACH DELETE destroyed.

Source of truth: Idea/Bimba/Map/datasets/parashakti-deep/nodes-full-detail.json
(coordinate -> filteredProps, the pre-migration camelCase export).

Target property names are taken from the LIVE consumer — Body/S/S0/epi-cli/
src/gate/graph.rs — not invented here, because the gateway reader is what
defines the contract the app is broken against.

Dry-run by default: prints the join match-rate and a sample. --apply writes.
"""
import argparse
import base64
import json
import re
import urllib.request

REPO = "/Users/admin/Documents/Epi-Logos C Experiments"
DATASET = f"{REPO}/Idea/Bimba/Map/datasets/parashakti-deep/nodes-full-detail.json"
NEO4J = "http://localhost:7474/db/neo4j/tx/commit"
AUTH = base64.b64encode(b"neo4j:password").decode()

# source camelCase key -> target family-keyed property (per gate/graph.rs)
MAPPING = {
    "vedicMantra": "l_2_vedic_mantra",
    "modalSignature": "c_0_modal_signature",
    "spiritualFunction": "l_3_spiritual_function",
    "englishTranslation": "s_4_english_translation",
    "hebrewName": "m_2_4_hebrew_text",
}


def cypher(statements):
    body = json.dumps({"statements": statements}).encode()
    req = urllib.request.Request(
        NEO4J,
        data=body,
        headers={"Content-Type": "application/json", "Authorization": f"Basic {AUTH}"},
    )
    with urllib.request.urlopen(req) as resp:
        out = json.loads(resp.read())
    if out.get("errors"):
        raise SystemExit(f"neo4j errors: {out['errors']}")
    return out["results"]


def to_graph_coord(raw: str) -> str:
    """`#2-5-0/1` -> `M2-5-(0/1)`. The graph parenthesises a `0/1` segment; the
    dataset export does not. Only whole segments are wrapped, never a substring."""
    coord = "M" + raw[1:] if raw.startswith("#") else raw
    return "-".join(f"({seg})" if "/" in seg else seg for seg in coord.split("-"))


def load_rows():
    raw = open(DATASET, encoding="utf-8-sig").read()
    rows = []
    for entry in json.loads(raw, strict=False):
        props = entry.get("filteredProps") or {}
        payload = {
            MAPPING[k]: v
            for k, v in props.items()
            if k in MAPPING and isinstance(v, str) and v.strip()
        }
        if payload:
            rows.append((to_graph_coord(entry["coordinate"]), payload))
    return rows


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true")
    args = ap.parse_args()

    rows = load_rows()
    coords = [c for c, _ in rows]
    print(f"dataset rows carrying restorable properties: {len(rows)}")

    found = cypher([
        {
            "statement": "UNWIND $cs AS c MATCH (n:Bimba {coordinate: c}) "
                         "RETURN c AS coord, labels(n) AS labels",
            "parameters": {"cs": coords},
        }
    ])[0]["data"]
    matched = {r["row"][0] for r in found}
    print(f"coordinates that join to a live node: {len(matched)}/{len(coords)}")
    missing = [c for c in coords if c not in matched]
    if missing:
        print(f"  unmatched sample: {missing[:8]}")

    per_prop = {}
    for coord, payload in rows:
        if coord in matched:
            for target in payload:
                per_prop[target] = per_prop.get(target, 0) + 1
    print("restorable per property (joined only):")
    for target, count in sorted(per_prop.items()):
        print(f"  {target:26} {count}")

    if not args.apply:
        print("\nDRY RUN — pass --apply to write.")
        return

    # Scoped write: every statement names the exact coordinate it touches.
    statements = [
        {
            "statement": "UNWIND $rows AS row MATCH (n:Bimba {coordinate: row.coord}) "
                         "SET n += row.props RETURN count(n) AS updated",
            "parameters": {
                "rows": [
                    {"coord": c, "props": p} for c, p in rows if c in matched
                ]
            },
        }
    ]
    result = cypher(statements)[0]["data"][0]["row"][0]
    print(f"APPLIED — nodes updated: {result}")


if __name__ == "__main__":
    main()
