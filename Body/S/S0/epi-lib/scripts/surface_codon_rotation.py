#!/usr/bin/env python3
"""
surface_codon_rotation.py — Build the full tarot → degree → codon → hexagram rotation matrix.

Source: Idea/Bimba/Map/datasets/mahamaya-deep/relations.json

Coordinate spaces (64 entries each):
  #3-4.0-{suit}-{card}  Superposition codon / tarot expression (suit=1-4, card=0-15)
  #3-3-2-0-{N}          Hexagram nodes (I-Ching, N=1-64)
  #3-4-2-{M}            Tarot card nodes
  #3-2-2-*              RNA codon nodes
  #3-2-1-*              DNA archival codon nodes
  #3-3-4-*              Amino acid nodes

Join key: global index N (1-64) where N = (suit-1)*16 + card + 1
  This aligns superposition codon space with hexagram space.

Output: 64-row matrix, one row per hexagram/tarot-expression pair.

Usage:
  python3 surface_codon_rotation.py
  python3 surface_codon_rotation.py --json
  python3 surface_codon_rotation.py --out matrix.csv
  python3 surface_codon_rotation.py --stats
"""

import json
import csv
import sys
import os
import re
import argparse
from collections import defaultdict

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "..", ".."))
DATASET_PATH = os.path.join(REPO_ROOT, "Idea/Bimba/Map/datasets/mahamaya-deep/relations.json")


def load_relations(path: str) -> list[dict]:
    with open(path, encoding="utf-8-sig") as f:
        return json.load(f)


def tarot_node_to_global(node_id: str) -> int | None:
    """Map '#3-4.0-{suit}-{card}' → global index (1-64)."""
    m = re.match(r"#3-4\.0-(\d+)-(\d+)$", node_id)
    if m:
        suit, card = int(m.group(1)), int(m.group(2))
        return (suit - 1) * 16 + card + 1
    return None


def hex_node_to_global(node_id: str) -> int | None:
    """Map '#3-3-2-0-{N}' → global index N (1-64)."""
    m = re.match(r"#3-3-2-0-(\d+)$", node_id)
    return int(m.group(1)) if m else None


def build_matrix(rels: list[dict]) -> list[dict]:
    """
    Build the 64-row rotation matrix joining:
      #3-4.0-{s}-{c}  --GOVERNS_TAROT_EXPRESSION--> tarot card
      #3-4.0-{s}-{c}  --TRANSLATES_TO------------>  amino acid
      #3-4.0-{s}-{c}  --REFLECTS_DNA_FORM-------->  DNA codon
      #3-3-2-0-{N}    --YIELDS_CODON------------->  RNA codons (positive + negative)
    """
    by_type: dict[str, list[dict]] = defaultdict(list)
    for r in rels:
        rt = r.get("relType", "")
        if rt in {
            "GOVERNS_TAROT_EXPRESSION",
            "TRANSLATES_TO",
            "REFLECTS_DNA_FORM",
            "YIELDS_CODON",
        }:
            by_type[rt].append(r)

    # ── Maps keyed by global index (1-64) from superposition nodes ───────────

    tarot_map: dict[int, dict] = {}
    for r in by_type["GOVERNS_TAROT_EXPRESSION"]:
        n = tarot_node_to_global(r["source"])
        if n is not None:
            tarot_map[n] = {
                "tarot_node": r["target"],
                "card_type": r["relProperties"].get("cardType", ""),
                "symbolic_meaning": r["relProperties"].get("symbolicMeaning", ""),
            }

    aa_map: dict[int, dict] = {}
    for r in by_type["TRANSLATES_TO"]:
        n = tarot_node_to_global(r["source"])
        if n is not None:
            aa_map[n] = {
                "amino_acid": r["relProperties"].get("fullDescription", ""),
                "codon_degeneracy": r["relProperties"].get("codonDegeneracy", ""),
                "translation_type": r["relProperties"].get("translationType", ""),
            }

    dna_map: dict[int, str] = {}
    for r in by_type["REFLECTS_DNA_FORM"]:
        n = tarot_node_to_global(r["source"])
        if n is not None:
            dna_map[n] = r["target"]

    # ── Maps keyed by global index (1-64) from hexagram nodes ───────────────

    rna_map: dict[int, dict] = {}  # N → {positive, negative}
    for r in by_type["YIELDS_CODON"]:
        n = hex_node_to_global(r["source"])
        if n is not None:
            ct = r["relProperties"].get("type", "")
            if n not in rna_map:
                rna_map[n] = {"positive": "", "negative": "", "count": 0}
            rna_map[n]["count"] += 1
            if ct == "positive" and not rna_map[n]["positive"]:
                rna_map[n]["positive"] = r["target"]
            elif ct == "negative" and not rna_map[n]["negative"]:
                rna_map[n]["negative"] = r["target"]

    # ── Build 64 rows (index 1-64) ───────────────────────────────────────────
    rows: list[dict] = []
    for n in range(1, 65):
        suit = (n - 1) // 16 + 1
        card = (n - 1) % 16
        sup_node = f"#3-4.0-{suit}-{card}"
        hex_node = f"#3-3-2-0-{n}"

        te = tarot_map.get(n, {})
        aa = aa_map.get(n, {})
        rna = rna_map.get(n, {})

        rows.append({
            "index": n,
            "suit": suit,
            "card_in_suit": card,
            "sup_node": sup_node,
            "hex_node": hex_node,
            "tarot_node": te.get("tarot_node", ""),
            "card_type": te.get("card_type", ""),
            "symbolic_meaning": te.get("symbolic_meaning", ""),
            "amino_acid": aa.get("amino_acid", ""),
            "codon_degeneracy": aa.get("codon_degeneracy", ""),
            "translation_type": aa.get("translation_type", ""),
            "dna_codon_node": dna_map.get(n, ""),
            "rna_codon_positive": rna.get("positive", ""),
            "rna_codon_negative": rna.get("negative", ""),
            "rna_codon_count": rna.get("count", 0),
        })

    return rows


def print_stats(rows: list[dict], rels: list[dict]) -> None:
    by_type: dict[str, int] = defaultdict(int)
    for r in rels:
        by_type[r.get("relType", "")] += 1

    print("=== Mahamaya Codon Rotation Matrix Stats ===")
    print(f"Total relations in dataset: {len(rels)}")
    print(f"  GOVERNS_TAROT_EXPRESSION : {by_type['GOVERNS_TAROT_EXPRESSION']}")
    print(f"  TRANSLATES_TO            : {by_type['TRANSLATES_TO']}")
    print(f"  REFLECTS_DNA_FORM        : {by_type['REFLECTS_DNA_FORM']}")
    print(f"  YIELDS_CODON             : {by_type['YIELDS_CODON']}")
    print(f"  GOVERNS_DEGREE_ARC       : {by_type['GOVERNS_DEGREE_ARC']}")
    print(f"\nMatrix rows: {len(rows)} (64 hexagram/tarot-expression positions, indexed 1-64)")

    card_types: dict[str, int] = defaultdict(int)
    for r in rows:
        card_types[r["card_type"] or "missing"] += 1
    print("\nCard type distribution:")
    for ct, count in sorted(card_types.items()):
        print(f"  {ct:12}: {count:3}")

    has_tarot = sum(1 for r in rows if r["tarot_node"])
    has_aa    = sum(1 for r in rows if r["amino_acid"])
    has_dna   = sum(1 for r in rows if r["dna_codon_node"])
    has_rna_p = sum(1 for r in rows if r["rna_codon_positive"])
    has_rna_n = sum(1 for r in rows if r["rna_codon_negative"])
    print(f"\nCoverage across 64 positions:")
    print(f"  tarot node       : {has_tarot:2}/64")
    print(f"  amino acid       : {has_aa:2}/64")
    print(f"  DNA codon node   : {has_dna:2}/64")
    print(f"  RNA codon (+)    : {has_rna_p:2}/64")
    print(f"  RNA codon (-)    : {has_rna_n:2}/64")

    print("\nSample rows (idx 1, 2, 11, 33, 64):")
    idx_set = {1, 2, 11, 33, 64}
    for r in rows:
        if r["index"] in idx_set:
            print(f"  [{r['index']:2}] S{r['suit']}c{r['card_in_suit']:2} "
                  f"hex={r['hex_node']:16} tarot={r['tarot_node']:16} "
                  f"[{r['card_type']:8}] aa={r['amino_acid']:20} "
                  f"dna={r['dna_codon_node']:14} rna+={r['rna_codon_positive']}")


def write_csv(rows: list[dict], out_path: str | None) -> None:
    fields = [
        "index", "suit", "card_in_suit", "sup_node", "hex_node",
        "tarot_node", "card_type", "symbolic_meaning",
        "amino_acid", "codon_degeneracy", "translation_type",
        "dna_codon_node", "rna_codon_positive", "rna_codon_negative", "rna_codon_count",
    ]
    if out_path:
        with open(out_path, "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=fields)
            w.writeheader()
            w.writerows(rows)
        print(f"Written {len(rows)} rows to {out_path}", file=sys.stderr)
    else:
        w = csv.DictWriter(sys.stdout, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)


def write_json(rows: list[dict], out_path: str | None) -> None:
    data = json.dumps(rows, indent=2, ensure_ascii=False)
    if out_path:
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(data)
        print(f"Written {len(rows)} rows to {out_path}", file=sys.stderr)
    else:
        print(data)


def main() -> None:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("--json", action="store_true", help="Output as JSON instead of CSV")
    parser.add_argument("--out", metavar="FILE", help="Write output to file (instead of stdout)")
    parser.add_argument("--stats", action="store_true", help="Print summary statistics and coverage")
    parser.add_argument(
        "--dataset",
        default=DATASET_PATH,
        metavar="PATH",
        help="Path to mahamaya-deep/relations.json",
    )
    args = parser.parse_args()

    rels = load_relations(args.dataset)
    rows = build_matrix(rels)

    if args.stats:
        print_stats(rows, rels)
        return

    if args.json:
        write_json(rows, args.out)
    else:
        write_csv(rows, args.out)


if __name__ == "__main__":
    main()
