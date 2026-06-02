# epi-lib Build/Generation Scripts

These Python scripts generate C lookup tables and fixture data from the canonical
datasets stored at `Idea/Bimba/Map/datasets/`. They belong alongside the C library
code (`epi-lib`) they support.

## Scripts

| Script | Purpose |
|--------|---------|
| `gen_ananda_luts.py` | Generate Ananda #1-2 matrix fixtures (mod 10 / mod 12) |
| `gen_codon_fixtures.py` | Extract nucleotide n/p charges from mahamaya dataset |
| `gen_planet_fixtures.py` | Emit canonical mod-10 planet ordering + EarthBody spec |
| `surface_codon_rotation.py` | Build tarot-to-degree-to-codon-to-hexagram rotation matrix |

### `lookups/` subdirectory

| Script | Purpose |
|--------|---------|
| `lookups/surface_qv_fields.py` | Surface qv-relevant fields from any dataset |
| `lookups/surface_formulations.py` | Surface mathematical syntax fields for C struct population |
| `lookups/surface_generation_events.py` | Surface Mahamaya #3-3 generation event binary matrix |

## Running

All scripts can be run from the repo root:

```bash
python3 Body/S/S0/epi-lib/scripts/gen_ananda_luts.py
python3 Body/S/S0/epi-lib/scripts/surface_codon_rotation.py --stats
python3 Body/S/S0/epi-lib/scripts/lookups/surface_qv_fields.py --all
```

## Outputs

- Fixture generators write JSON to `epi-lib/test/fixtures/nara_clock/`
- Surface scripts write to stdout (redirect with `>` for file output)
