#!/usr/bin/env python3
"""
surface_generation_events.py
=============================
Surface the Mahamaya #3-3 generation event nodes — the binary matrix that ties
together the DNA codon system, I-Ching hexagrams, and Tarot degree arcs.

These 184 nodes are the structural core of Mahamaya's transcription engine.
Each node has:
  - bimbaCoordinate: the canonical coordinate (computable from binary structure)
  - context:         "M1-H{n}" | "M2-H{n}" | "M3-H{n}" — subsystem + hexagram
  - upper_Pair_binary:   2-bit string (00/01/10/11) — upper trigram pair
  - lower_Pair_binary:   2-bit string (00/01/10/11) — lower trigram pair
  - positive_codon_binary: 3-bit string (000-111) — yang/positive codon
  - negative_codon_binary: 3-bit string (000-111) — yin/negative codon

The upper+lower pair (2+2=4 bits) defines the hexagram pair structure.
The pos/neg codon (3 bits each) is the DNA base triplet encoding.
All relations (YIELDS_CODON, USES_Pair, RESOLVES_TO) can be computed from
the bimbaCoordinate binary representation alone.

Usage:
    # All 184 generation events
    python3 surface_generation_events.py

    # Filter by context subsystem
    python3 surface_generation_events.py --context M1

    # Show full detail for one
    python3 surface_generation_events.py --context M1 --hex H1

    # Export as JSON for cross-referencing with oracle.rs
    python3 surface_generation_events.py --json > generation_events.json
"""
import json, sys, os, argparse

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "..", ".."))
MAHAMAYA_NODES = os.path.join(REPO_ROOT, "Idea/Bimba/Map/datasets/mahamaya-deep/nodes-full-detail.json")
MAHAMAYA_RELS  = os.path.join(REPO_ROOT, "Idea/Bimba/Map/datasets/mahamaya-deep/relations.json")

BINARY_FIELDS = [
    "bimbaCoordinate", "context",
    "upper_Pair_binary", "lower_Pair_binary",
    "positive_codon_binary", "negative_codon_binary",
]
RICH_FIELDS = [
    "tarotCorrespondence", "tarotArchetype",
    "planetaryRulership", "elementalQuality", "chakraResonance",
    "biologicalFunction", "aminoAcid", "aminoAcidCode",
    "archetypeQuality", "consciousnessSignature",
    "description", "coreNature",
]


def load_json(path):
    with open(path, "rb") as f:
        raw = f.read().decode("utf-8-sig")
    return json.loads(raw, strict=False)


def get_gen_events(data):
    return [
        n for n in data
        if str(n.get("coordinate", "")).startswith("#3-3")
        and "context" in n.get("filteredProps", {})
        and "upper_Pair_binary" in n.get("filteredProps", {})
    ]


def binary_to_int(b):
    try:
        return int(str(b), 2)
    except:
        return -1


def main():
    parser = argparse.ArgumentParser(description="Surface Mahamaya generation event binary matrix")
    parser.add_argument("--context", help="Filter by context subsystem prefix: M1, M2, or M3")
    parser.add_argument("--hex", help="Filter by hexagram: H1..H64")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    parser.add_argument("--summary", action="store_true", help="Show summary statistics only")
    args = parser.parse_args()

    data = load_json(MAHAMAYA_NODES)
    events = get_gen_events(data)

    # Apply filters
    if args.context:
        events = [n for n in events if n["filteredProps"]["context"].startswith(args.context)]
    if args.hex:
        hex_str = args.hex if args.hex.startswith("H") else f"H{args.hex}"
        events = [n for n in events if n["filteredProps"]["context"].endswith(f"-{hex_str}")]

    if args.summary:
        by_ctx = {}
        for n in events:
            ctx = n["filteredProps"]["context"].split("-")[0]
            by_ctx[ctx] = by_ctx.get(ctx, 0) + 1
        print(f"Total generation events: {len(events)}")
        for k, v in sorted(by_ctx.items()):
            print(f"  {k}: {v}")
        # Binary value distribution
        print("\nBinary distribution (upper_Pair × lower_Pair frequency):")
        pairs = {}
        for n in events:
            p = n["filteredProps"]
            key = (p.get("upper_Pair_binary","?"), p.get("lower_Pair_binary","?"))
            pairs[key] = pairs.get(key, 0) + 1
        for (u, l), c in sorted(pairs.items()):
            print(f"  upper={u} lower={l}: {c}  (int: {binary_to_int(u)},{binary_to_int(l)})")
        return

    if args.json:
        out = []
        for n in events:
            p = n["filteredProps"]
            entry = {k: p.get(k) for k in BINARY_FIELDS + RICH_FIELDS if p.get(k) is not None}
            entry["coordinate"] = n.get("coordinate")
            out.append(entry)
        print(json.dumps(out, indent=2, ensure_ascii=False))
        return

    # Default: human-readable table
    print(f"{'Coord':<20} {'Context':<10} {'Upper':<6} {'Lower':<6} {'Pos':<5} {'Neg':<5}  {'Tarot / Planet / Element'}")
    print("-" * 100)
    for n in sorted(events, key=lambda x: x["filteredProps"].get("context", "")):
        p = n["filteredProps"]
        coord = n.get("coordinate", "?")
        ctx   = p.get("context", "?")
        ub    = p.get("upper_Pair_binary", "?")
        lb    = p.get("lower_Pair_binary", "?")
        pos   = p.get("positive_codon_binary", "?")
        neg   = p.get("negative_codon_binary", "?")
        tarot  = p.get("tarotCorrespondence", "")
        planet = p.get("planetaryRulership", "")
        elem   = p.get("elementalQuality", "")
        aa     = p.get("aminoAcid", "")
        note = "  ".join(filter(None, [tarot, planet, elem, aa]))
        print(f"{coord:<20} {ctx:<10} {ub:<6} {lb:<6} {pos:<5} {neg:<5}  {note[:60]}")


if __name__ == "__main__":
    main()
