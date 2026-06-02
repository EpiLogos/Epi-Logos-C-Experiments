#!/usr/bin/env python3
"""
gen_codon_fixtures.py — Extract nucleotide n/p charges from #3-2-{1..4} in mahamaya dataset.
Source: mahamaya-deep/nodes-full-detail.json
Emits: epi-lib/test/fixtures/nara_clock/codon_charges.json
"""
import json, os, re

REPO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "..", ".."))
MAHAMAYA = os.path.join(REPO, "Idea/Bimba/Map/datasets/mahamaya-deep/nodes-full-detail.json")

with open(MAHAMAYA, "rb") as f:
    raw = f.read().decode("utf-8-sig")
data = json.loads(raw, strict=False)

charge_fields = ["integral_pp", "integral_nn", "integral_pn", "integral_np"]
nucleotides = {}

for node in data:
    coord = node.get("coordinate", "")
    if re.match(r"^#3-2-[1-4]$", coord):
        props = node.get("filteredProps", {})
        entry = {"coordinate": coord, "name": props.get("name", "")}
        for field in charge_fields:
            if field in props:
                entry[field] = props[field]
        nucleotides[coord] = entry
        print(f"  {coord} ({entry.get('name','')}): "
              + " ".join(f"{f}={entry.get(f,'?')}" for f in charge_fields))

assert len(nucleotides) == 4, f"Expected 4 nucleotides, got {len(nucleotides)}"

# Verify known Adenine values
a = nucleotides.get("#3-2-1", {})
assert a.get("integral_pp") == 84,  f"Adenine pp={a.get('integral_pp')}"
assert a.get("integral_nn") == -36, f"Adenine nn={a.get('integral_nn')}"

FIXTURE_DIR = os.path.join(REPO, "epi-lib", "test", "fixtures", "nara_clock")
os.makedirs(FIXTURE_DIR, exist_ok=True)
path = os.path.join(FIXTURE_DIR, "codon_charges.json")
with open(path, "w") as f:
    json.dump({"nucleotides": nucleotides}, f, indent=2)
print(f"Written: {path} ({len(nucleotides)} nucleotides)")
