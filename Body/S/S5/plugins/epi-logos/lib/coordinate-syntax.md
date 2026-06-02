# Coordinate Syntax Reference

## Family Coordinates (72 total)
- Format: `<FAMILY><POSITION>[']`
- Families: C, P, L, S, T, M
- Positions: 0-5
- Inversion: append `'` or `i`
- Examples: M0, S3, C4', P2i, L5', T1

## Raw Psychoids (7)
- `#0` through `#5` — Layer 1 immutable archetypes
- `#` — The inversion operator itself

## Context Frames (7)
- CF(0000), CF(01), CF(012), CF(0123), CF(4x), CF(450), CF(50)

## Weaves (4)
- W0.0, W0.5, W5.0, W5.5

## Sub-Branch Coordinates (~1873 in datasets)
- Format: `#<ROOT>-<path>` or `<FAMILY><ROOT>-<path>`
- Root: 0-5 (maps to M0-M5 branch)
- Family prefix stripped: `M2-1` = `#2-1`
- Arbitrary depth: `#2-1-0`, `#0-3-0/1-0`, `#4.4.3-4.0`
- Dataset source: `Idea/Bimba/Map/datasets/nodes_{branch}.json`

### Special operators in sub-branches

| Operator | Meaning | Valid after | Examples |
|----------|---------|-------------|----------|
| `.` | Lemniscate nesting | position `4` only | `#4.0`, `#4.4.3`, `#1-3-4.0/1` |
| `/` | Non-dual fusion | any position | `0/1` (binary), `0/1/2` (trika), `5/0` (Mobius) |
| `()` | CF nesting (theoretical) | `.` after `4` | `#1-3-4.(0000)` → normalized to `#1-3-4.0000` |

### Lemniscate CF modes as sub-branches
When position 4 nests via `.`, the context frame modes appear as sub-branch paths:
- `4.0000` — Void frame (CF_VOID)
- `4.0/1` — Non-dual binary (CF_BINARY)
- `4.0/1/2` — Trika (CF_TRIKA)
- `4.0/1/2/3` — Quaternal (CF_QUATERNAL)
- `4.4.0-4.4/5` — Fractal doubling (CF_FRACTAL)
- `4.5/0` — Mobius return (CF_MOBIUS)

## Total: 89 top-level + ~1873 sub-branch coordinates
