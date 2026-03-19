#!/usr/bin/env python3
"""
surface_qv_fields.py
====================
Surface all qv-relevant fields (formulation, symbol, essence, nature, etc.)
from any dataset JSON file or across all deep datasets at once.

Usage:
    # Single dataset
    python3 surface_qv_fields.py docs/datasets/anuttara-deep/nodes-full-data.json

    # All deep datasets
    python3 surface_qv_fields.py --all

    # Filter to specific coordinate prefix
    python3 surface_qv_fields.py --all --prefix "#0-3"

    # Only show nodes that have completeFormulation
    python3 surface_qv_fields.py --all --require completeFormulation
"""
import json, sys, os, argparse

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

ALL_DATASETS = [
    ("anuttara",   "docs/datasets/anuttara-deep/nodes-full-data.json"),
    ("paramasiva", "docs/datasets/paramasiva-deep/nodes-full-detail.json"),
    ("parashakti", "docs/datasets/parashakti-deep/nodes-full-detail.json"),
    ("mahamaya",   "docs/datasets/mahamaya-deep/nodes-full-detail.json"),
    ("nara",       "docs/datasets/nara-deep/nodes-full-detail.json"),
    ("epii",       "docs/datasets/epii-deep/nodes-full-details.json"),
]

# Fields in priority order for qv_data.c / C struct sourcing
QV_FIELDS = [
    "symbol",
    "completeFormulation",
    "formulationBreakdown",
    "coreNature",
    "operationalEssence",
    "operationalDynamics",
    "description",
    "quality",
    "primaryDesignation",
    "architecturalFunction",
    "keyPrinciples",
    "resonances",
]


def load_json(path):
    with open(path, "rb") as f:
        raw = f.read().decode("utf-8-sig")
    return json.loads(raw, strict=False)


def surface(data, prefix=None, require=None):
    for n in data:
        coord = n.get("coordinate", "?")
        if prefix and not str(coord).startswith(prefix):
            continue
        props = n.get("filteredProps", {})
        hits = {k: props[k] for k in QV_FIELDS if k in props}
        if require and require not in hits:
            continue
        if hits:
            name = props.get("name", "")
            print(f"\n=== {coord}  [{name}] ===")
            for k in QV_FIELDS:
                v = hits.get(k)
                if v is not None:
                    val = str(v)
                    if len(val) > 300:
                        val = val[:297] + "..."
                    print(f"  [{k}]\n    {val}")


def main():
    parser = argparse.ArgumentParser(description="Surface qv fields from dataset JSON")
    parser.add_argument("file", nargs="?", help="Path to dataset JSON (relative to repo root)")
    parser.add_argument("--all", action="store_true", help="Process all deep datasets")
    parser.add_argument("--prefix", help="Filter to coordinates starting with this prefix")
    parser.add_argument("--require", help="Only show nodes that have this specific field")
    args = parser.parse_args()

    if args.all:
        for name, rel_path in ALL_DATASETS:
            path = os.path.join(REPO_ROOT, rel_path)
            if not os.path.exists(path):
                print(f"\n[{name}] NOT FOUND: {path}")
                continue
            data = load_json(path)
            print(f"\n{'='*60}")
            print(f"DATASET: {name} ({len(data)} nodes)  path={rel_path}")
            print(f"{'='*60}")
            surface(data, prefix=args.prefix, require=args.require)
    elif args.file:
        path = args.file if os.path.isabs(args.file) else os.path.join(REPO_ROOT, args.file)
        data = load_json(path)
        surface(data, prefix=args.prefix, require=args.require)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
