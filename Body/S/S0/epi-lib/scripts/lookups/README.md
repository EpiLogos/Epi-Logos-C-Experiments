# Dataset Lookup Scripts

All scripts run from the repo root. They read from `Idea/Bimba/Map/datasets/` and write to stdout.

## Scripts

### `surface_qv_fields.py`
Surface all qv-relevant fields (symbol, completeFormulation, coreNature, operationalEssence,
operationalDynamics, description, quality, etc.) from any dataset or all datasets at once.
Used for: planning `qv_data.c` enrichment, C struct `.formulation`/`.symbol` population.

```bash
# All datasets — all nodes with any qv field
python3 Body/S/S0/epi-lib/scripts/lookups/surface_qv_fields.py --all

# Anuttara #0-3 branch only
python3 Body/S/S0/epi-lib/scripts/lookups/surface_qv_fields.py --all --prefix "#0-3"

# Only nodes with completeFormulation
python3 Body/S/S0/epi-lib/scripts/lookups/surface_qv_fields.py --all --require completeFormulation
```

### `surface_formulations.py`
Surface only the mathematical syntax fields: symbol, completeFormulation, formulationBreakdown.
These are the fields that should go into C struct `.symbol` and `.formulation` string literals.

```bash
# Count coverage across all datasets
python3 Body/S/S0/epi-lib/scripts/lookups/surface_formulations.py --all --count

# Full output for anuttara
python3 Body/S/S0/epi-lib/scripts/lookups/surface_formulations.py Idea/Bimba/Map/datasets/anuttara-deep/nodes-full-data.json
```

### `surface_generation_events.py`
Surface the Mahamaya #3-3 generation event nodes — 184 nodes that encode the binary
matrix tying DNA codons, I-Ching hexagrams, and Tarot degree arcs together.

Key properties: `context` (M1-H1..M3-H56), `upper_Pair_binary` (2-bit), `lower_Pair_binary` (2-bit),
`positive_codon_binary` (3-bit), `negative_codon_binary` (3-bit).

```bash
# Full table (all 184)
python3 Body/S/S0/epi-lib/scripts/lookups/surface_generation_events.py

# M1 subsystem only (64 nodes = I-Ching frame)
python3 Body/S/S0/epi-lib/scripts/lookups/surface_generation_events.py --context M1

# Single hexagram
python3 Body/S/S0/epi-lib/scripts/lookups/surface_generation_events.py --hex H1

# Summary statistics + binary distribution
python3 Body/S/S0/epi-lib/scripts/lookups/surface_generation_events.py --summary

# Export as JSON (for oracle.rs cross-reference)
python3 Body/S/S0/epi-lib/scripts/lookups/surface_generation_events.py --json > /tmp/gen_events.json
```

## Adding New Scripts

Name pattern: `surface_{domain}.py` or `lookup_{domain}.py`
- `surface_*` — reads dataset, outputs matching nodes with properties
- `lookup_*` — focused query for a specific value (e.g. lookup a single coordinate)

Always use `REPO_ROOT = os.path.dirname(...)` relative to the script location so scripts
can be run from any working directory.
