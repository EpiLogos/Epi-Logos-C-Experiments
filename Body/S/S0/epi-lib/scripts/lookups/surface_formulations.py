#!/usr/bin/env python3
"""
surface_formulations.py
========================
Surface completeFormulation, symbol, and formulationBreakdown from any dataset.
These are the mathematical syntax strings that should populate C struct .formulation
and .symbol fields, and inform qv_data.c entries.

Priority for C struct / qv sourcing:
  1. completeFormulation  — full mathematical syntax
  2. symbol               — the operator/symbol string
  3. formulationBreakdown — detailed parse
  (use surface_qv_fields.py for the fuller coreNature/essence fields)

Usage:
    # One dataset, all nodes with completeFormulation
    python3 surface_formulations.py Idea/Bimba/Map/datasets/anuttara-deep/nodes-full-data.json

    # All datasets
    python3 surface_formulations.py --all

    # Only specific prefix
    python3 surface_formulations.py --all --prefix "#0-3"

    # Count coverage
    python3 surface_formulations.py --all --count
"""
import json, sys, os, argparse

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "..", ".."))

ALL_DATASETS = [
    ("anuttara",   "Idea/Bimba/Map/datasets/anuttara-deep/nodes-full-data.json"),
    ("paramasiva", "Idea/Bimba/Map/datasets/paramasiva-deep/nodes-full-detail.json"),
    ("parashakti", "Idea/Bimba/Map/datasets/parashakti-deep/nodes-full-detail.json"),
    ("mahamaya",   "Idea/Bimba/Map/datasets/mahamaya-deep/nodes-full-detail.json"),
    ("nara",       "Idea/Bimba/Map/datasets/nara-deep/nodes-full-detail.json"),
    ("epii",       "Idea/Bimba/Map/datasets/epii-deep/nodes-full-details.json"),
]

FORM_FIELDS = ["symbol", "completeFormulation", "formulationBreakdown"]


def load_json(path):
    with open(path, "rb") as f:
        raw = f.read().decode("utf-8-sig")
    return json.loads(raw, strict=False)


def surface(data, prefix=None, count_only=False):
    found = 0
    for n in data:
        coord = n.get("coordinate", "?")
        if prefix and not str(coord).startswith(prefix):
            continue
        props = n.get("filteredProps", {})
        hits = {k: props[k] for k in FORM_FIELDS if k in props}
        if not hits:
            continue
        found += 1
        if not count_only:
            name = props.get("name", "")
            print(f"\n=== {coord}  [{name}] ===")
            for k in FORM_FIELDS:
                v = hits.get(k)
                if v is not None:
                    print(f"  [{k}] {str(v)[:400]}")
    return found


def main():
    parser = argparse.ArgumentParser(description="Surface mathematical formulation fields")
    parser.add_argument("file", nargs="?", help="Path to dataset JSON (relative to repo root)")
    parser.add_argument("--all", action="store_true", help="Process all deep datasets")
    parser.add_argument("--prefix", help="Filter to coordinates starting with this prefix")
    parser.add_argument("--count", action="store_true", help="Only show counts, not content")
    args = parser.parse_args()

    if args.all:
        total = 0
        for name, rel_path in ALL_DATASETS:
            path = os.path.join(REPO_ROOT, rel_path)
            if not os.path.exists(path):
                print(f"[{name}] NOT FOUND")
                continue
            data = load_json(path)
            n_nodes = len(data)
            if not args.count:
                print(f"\n{'='*60}")
                print(f"DATASET: {name} ({n_nodes} nodes)")
                print(f"{'='*60}")
            found = surface(data, prefix=args.prefix, count_only=args.count)
            total += found
            if args.count:
                # Per-field breakdown
                counts = {k: sum(1 for n in data if k in n.get("filteredProps",{})) for k in FORM_FIELDS}
                print(f"{name:<12} ({n_nodes:>4} nodes)  formulation:{counts['completeFormulation']:>4}  symbol:{counts['symbol']:>4}  breakdown:{counts['formulationBreakdown']:>4}")
        if args.count:
            print(f"\nTotal nodes with any formulation field: {total}")
    elif args.file:
        path = args.file if os.path.isabs(args.file) else os.path.join(REPO_ROOT, args.file)
        data = load_json(path)
        surface(data, prefix=args.prefix, count_only=args.count)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
