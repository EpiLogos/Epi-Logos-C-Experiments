# @epi-logos/ql-schema

**Canonical TypeScript Zod schemas for the Epi-Logos Holographic Coordinate system.**

This package propagates the C `Holographic_Coordinate` struct (128 bytes, defined in `include/ontology.h`) to TypeScript as composable Zod schemas. It is the **single source of truth** for TS types consumed by:

- **Pi agent extensions** (S4') — runtime coordinate handling, context frame dispatch
- **Obsidian vault tooling** (S1') — frontmatter validation against 68 canonical keys
- **Neo4j graph layer** (S2') — node property typing, 34 canonical relation types
- **Electron app** (4.5/0) — type-safe coordinate rendering

This is a **foundation package** — it provides schemas and validation, not business logic. Higher-level systems import these types to ensure structural alignment with the C engine.

## Concentric Ring Architecture

The schemas are organized as four concentric rings, each extending the previous:

```
┌─────────────────────────────────────────────────┐
│  HCRuntime          (Ring 4 — Pi agent)         │
│  ┌─────────────────────────────────────────────┐ │
│  │  HCNode          (Ring 3 — Neo4j/Obsidian)  │ │
│  │  ┌─────────────────────────────────────────┐ │ │
│  │  │  HCCoordinate  (Ring 2 — structural)    │ │ │
│  │  │  ┌─────────────────────────────────────┐ │ │ │
│  │  │  │  HCIdentity  (Ring 1 — kernel)      │ │ │ │
│  │  │  └─────────────────────────────────────┘ │ │ │
│  │  └─────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

| Ring | Schema | C Equivalent | Use Case |
|------|--------|-------------|----------|
| **1** | `HCIdentity` | First 8 bytes (identity block) | Universal — every system needs this |
| **2** | `HCCoordinate` | + 12 pointers (96 bytes) | Structural — coordinate relationships |
| **3** | `HCNode` | + storage properties | Persistent — Neo4j nodes, Obsidian frontmatter |
| **4** | `HCRuntime` | + `invoke_process` + `payload` | Execution — Pi agent runtime |

Pick the ring that matches your consumption level. A Neo4j query result validates against `HCNode`. A Pi agent context envelope validates against `HCRuntime`. A simple coordinate reference only needs `HCIdentity`.

## Usage

```typescript
import {
  HCIdentity, HCCoordinate, HCNode, HCRuntime,
  CoordFamily, CoordLayer, TopoMode, ContextFrame,
  parseCoordinate, isValidCoordinate, BimbaCoordinate,
  CANONICAL_KEYS, isCanonicalKey, isDeprecatedKey,
  RELATION_TYPES, RelationType,
  FAMILIES, FAMILY_NAMES, PSYCHOID_NAMES, CF_NAMES, VAK_NAMES, FLAGS,
} from "@epi-logos/ql-schema";

// Validate a coordinate string
const parsed = parseCoordinate("M4");
// → { bimbaCoordinate: "M4", layer: "COORDINATE", family: "M", qlPosition: 4, inverted: false }

// Validate a Neo4j node
const node = HCNode.parse({
  bimbaCoordinate: "M5",
  qlPosition: 5,
  family: "M",
  inversionState: 0,
  flags: 0x21,
  weaveState: 5.0,
  c: "C5", p: "P5", l: "L5", s: "S5", t: "T5", m: "M5",
  cpf: null, ct: null, cp: null, cf: null, cfp: null, cs: null,
  uuid: "4f965499-cd20-515d-8505-a48bd8f57f83",
  name: "Epii",
  layer: "COORDINATE",
  topoMode: "ZERO_SPHERE",
  essence: "holographic integration layer",
  description: null,
  vaultPath: "Bimba/Seeds/M/M5.md",
  semanticEmbedding: null,
  createdAt: null,
  updatedAt: null,
});

// Type inference works automatically
type Node = typeof node; // fully typed

// Validate frontmatter keys
isCanonicalKey("p_0_grounds");   // true
isDeprecatedKey("coordinate");    // true — use bimbaCoordinate instead
isDeprecatedKey("pos_ground");    // true — use {coord}_{n}_{semantic} format
```

## Coordinate Notation

The validator accepts all 96 seed coordinates from the Epi-Logos coordinate space:

| Layer | Format | Examples | Count |
|-------|--------|---------|-------|
| **Psychoid** | `#`, `#0`-`#5` | `#`, `#4` | 7 |
| **Weave** | `Weave_X_Y` | `Weave_0_0`, `Weave_5_5` | 4 |
| **Context Frame** | `CF_*` | `CF_VOID`, `CF_TRIKA`, `CF_MOBIUS` | 7 |
| **Family** | `{F}{0-5}` or `{F}{0-5}'` | `M4`, `C0'`, `P5` | 72 |
| **VAK** | Reflective names | `CPF`, `CT`, `CP`, `CF`, `CFP`, `CS` | 6 |
| | | **Total** | **96** |

Families: **C** (Category), **P** (Position), **L** (Lens), **S** (Stack), **T** (Thought), **M** (Subsystem)

## Mapping to C Struct

```c
// include/ontology.h — 128 bytes exactly
struct Holographic_Coordinate {
    // Ring 1: HCIdentity (8 bytes)
    uint8_t  ql_position;        // → qlPosition
    uint8_t  family;             // → family (CoordFamily enum)
    uint8_t  inversion_state;    // → inversionState (0 | 1)
    uint8_t  flags;              // → flags (FLAGS.BIMBA_FLAGS = 0x21)
    float    weave_state;        // → weaveState

    // Ring 2: HCCoordinate (96 bytes — 12 pointers)
    float*   semantic_embedding; // → semanticEmbedding (Ring 3)
    HC*      c, p, l, s, t, m;  // → c, p, l, s, t, m (string refs)
    HC*      cpf, ct, cp, cf, cfp, cs; // → cpf, ct, cp, cf, cfp, cs

    // Ring 4: HCRuntime (16 bytes)
    void     (*invoke_process)(); // → contextFrame + disclosureLevel + mode
    union    payload;             // → payload (discriminated union)
};
```

## Build

```bash
npm install
npm test        # vitest — 69 tests
npm run build   # tsc → dist/
```

## Related

- `include/ontology.h` — C struct definition (128 bytes, _Static_assert verified)
- `epi-cli/src/graph/seed.rs` — Rust seeder (96 nodes + 187 relationships into Neo4j)
- `epi-cli/src/graph/coordinate_array_parser.rs` — Rust coordinate parser (TS validator is a port)
- `.pi/extensions/s_i/modules/ql_types/` — Existing Pi extension types (to be migrated to consume this package)
- `docs/plans/2026-03-07-hc-zod-schema-design.md` — Design document
