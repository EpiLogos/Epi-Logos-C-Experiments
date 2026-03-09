# HC Zod Schema Design: Holographic Coordinate in TypeScript

**Status:** Approved
**Date:** 2026-03-07
**Purpose:** Propagate the C HC struct (128 bytes) to a canonical TypeScript Zod schema package in epi-cli, serving as the single source of truth for Pi agent extensions, Obsidian frontmatter validation, and Neo4j node typing.

---

## Problem

The HC struct in C (`include/ontology.h`) is the universal coordinate container — 128 bytes encoding identity, a 12-fold pointer web, execution, and payload. Three downstream systems need this shape in TypeScript:

1. **Pi agent extensions** — runtime coordinate handling, context frame dispatch
2. **Obsidian vault** — frontmatter validation (126 canonical keys)
3. **Neo4j graph** — node property typing, relationship contracts

Existing TS types in `.pi/extensions/s_i/modules/` evolved organically across `ql_types`, `ql_obsidian`, and `ql_graph` without a shared root schema. This creates drift between C truth and TS consumption.

## Solution: Concentric Ring Zod Schemas

Located at `epi-cli/schemas/` as a self-contained TypeScript package (`@epi-logos/ql-schema`), publishable to npm or importable directly by Pi extensions.

### Ring Architecture

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

### Ring 1: HCIdentity (8-byte kernel)

The irreducible identity shared by every system. Maps directly to the first 8 bytes of the C struct.

```typescript
// Enums
CoordFamily:  "C" | "P" | "L" | "S" | "T" | "M" | "NONE"
CoordLayer:   "PSYCHOID" | "WEAVE" | "CONTEXT_FRAME" | "COORDINATE" | "VAK"
TopoMode:     "ZERO_SPHERE" | "TORUS" | "LEMNISCATE" | "KLEIN"

// Schema
HCIdentity = {
  bimbaCoordinate: string,    // PK: "#", "#0"-"#5", "M4", "CF_TRIKA", etc.
  qlPosition:      0-5 | 255, // 0xFF = Hash node
  family:          CoordFamily,
  inversionState:  0 | 1,
  flags:           number,     // 8-bit flags byte (0x21 = BIMBA)
  weaveState:      number,     // 0.0, 0.5, 5.0, 5.5
}
```

### Ring 2: HCCoordinate (identity + 12-fold pointer web)

Adds the intra-openness-to links. In C these are 12 pointers (96 bytes). In TS they're optional string references to other coordinates.

```typescript
HCCoordinate = HCIdentity & {
  // 6 base family links
  c:   string | null,  // Category family ref
  p:   string | null,  // Position family ref
  l:   string | null,  // Lens family ref
  s:   string | null,  // Stack family ref
  t:   string | null,  // Thought family ref
  m:   string | null,  // Map/Subsystem family ref
  // 6 reflective/contextual links
  cpf: string | null,  // Category-Position-Frame
  ct:  string | null,  // Context-Time
  cp:  string | null,  // Context-Position
  cf:  string | null,  // Context-Frame (#4 anchor)
  cfp: string | null,  // Context-Frame-Position
  cs:  string | null,  // Context-Sequence
}
```

### Ring 3: HCNode (storage shape — Neo4j + Obsidian)

Adds all properties needed for persistent storage. This is the schema that Neo4j `BimbaCoordinate` nodes and Obsidian frontmatter validate against.

```typescript
HCNode = HCCoordinate & {
  uuid:            string,        // UUID v5 deterministic
  name:            string,
  layer:           CoordLayer,
  topoMode:        TopoMode,
  essence:         string | null, // Pithy self-description (S0' compression)
  description:     string | null,
  vaultPath:       string | null, // Obsidian file path
  semanticEmbedding: number[] | null, // Vector (768/1536/3072 dims)
  createdAt:       string | null, // ISO 8601
  updatedAt:       string | null,
}
```

### Ring 4: HCRuntime (execution shape — Pi agent)

Adds the execution layer for Pi agent runtime. Maps to the `invoke_process` function pointer and `payload` union in C.

```typescript
HCRuntime = HCNode & {
  // Execution context
  contextFrame:    ContextFrame | null,
  disclosureLevel: DisclosureLevel,
  mode:            "day" | "night",
  sessionId:       string | null,
  // Payload (discriminated union)
  payload:
    | { type: "meaning",  value: string }
    | { type: "process",  value: Record<string, unknown> }
    | { type: "instance", value: string }  // instance ID
    | { type: "vector",   value: number[] }
    | null,
}
```

### Supporting Enum Schemas

```typescript
ContextFrame: "CF_VOID" | "CF_BINARY" | "CF_TRIKA" | "CF_QUATERNAL" | "CF_FRACTAL" | "CF_SYNTHESIS" | "CF_MOBIUS"
DisclosureLevel: "UuidOnly" | "Identity" | "Summary" | "Content" | "Connected" | "Complete"
VakCoord: "CPF" | "CT" | "CP" | "CF" | "CFP" | "CS"
RelationType: (51 canonical types from ql_schema.ts, e.g., "P_0_LINKS_TO", "T_5_CRYSTALLIZED_TO")
FrontmatterKey: (126 canonical keys validated by regex pattern)
```

### Coordinate Validator

Port the Rust `CoordinateArrayParser::parse_one` logic to Zod `.refine()`:
- `#` (hash alone)
- `#0`-`#5` (psychoids)
- `Weave_*` (4 weave nodes)
- `CF_*` (7 context frames)
- `{F}{0-5}` and `{F}{0-5}'` (72 family coordinates)
- `CPF|CT|CP|CF|CFP|CS` (6 VAK)

### Frontmatter Schema

A Zod schema that validates Obsidian YAML frontmatter against canonical keys:
- Pattern: `{coord}_{n}_{semantic}` where coord ∈ {c,p,l,s,t,m}, n ∈ 0-5
- Special keys: `artifact_role`, `ctx_type`, `session_id`, `day_id`, `now_id`, etc.
- Rejects deprecated patterns: `coordinate`, `pos_*`, `bimba_coordinate`

### Neo4j Node Schema

Zod schema for validating Neo4j node properties before write:
- Required: `bimbaCoordinate`, `uuid`, `name`, `family`, `layer`
- Uses `HCNode` as the base with `.pick()` / `.partial()` for query results at different disclosure levels

## Package Structure

```
epi-cli/schemas/
├── package.json          (@epi-logos/ql-schema)
├── tsconfig.json
├── src/
│   ├── index.ts          (barrel export)
│   ├── enums.ts          (CoordFamily, CoordLayer, TopoMode, ContextFrame, etc.)
│   ├── identity.ts       (Ring 1: HCIdentity)
│   ├── coordinate.ts     (Ring 2: HCCoordinate)
│   ├── node.ts           (Ring 3: HCNode)
│   ├── runtime.ts        (Ring 4: HCRuntime)
│   ├── validator.ts      (coordinate string validation)
│   ├── frontmatter.ts    (126-key frontmatter schema)
│   ├── relations.ts      (51 canonical relation types)
│   └── constants.ts      (FAMILIES, PSYCHOID_NAMES, CF_NAMES, etc.)
├── tests/
│   ├── identity.test.ts
│   ├── coordinate.test.ts
│   ├── node.test.ts
│   ├── runtime.test.ts
│   ├── validator.test.ts
│   └── frontmatter.test.ts
└── dist/                 (compiled output)
```

## Non-Goals

- Not replacing the existing `.pi/extensions/` TS types in this task — that's a future migration
- Not generating Zod from C headers automatically — manual correspondence with test verification
- Not adding runtime execution logic — schemas only, no business logic

## Verification Strategy

- Unit tests for every ring: valid/invalid inputs, edge cases
- Cross-check tests: ensure Zod schema accepts all 96 seed coordinates from `seed.rs`
- Regression tests: validate against the 126 canonical frontmatter keys
- Type inference tests: ensure `z.infer<typeof HCNode>` produces correct TS types
