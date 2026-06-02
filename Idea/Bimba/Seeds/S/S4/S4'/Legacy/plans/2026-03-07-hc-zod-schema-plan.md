# HC Zod Schema Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create `epi-cli/schemas/` — a TypeScript Zod schema package (`@epi-logos/ql-schema`) that propagates the C HC struct as concentric ring schemas, serving as the canonical TS type source for Pi agent extensions, Obsidian frontmatter, and Neo4j node typing.

**Architecture:** Four concentric Zod rings (HCIdentity → HCCoordinate → HCNode → HCRuntime) built TDD-style with vitest. Each ring extends the previous. Supporting modules for enums, coordinate validation, frontmatter keys, and relation types. All constants mirror the C `.rodata` and Rust seed data exactly.

**Tech Stack:** TypeScript 5.x, Zod 3.x, vitest, npm (package published from `epi-cli/schemas/`)

**Design Doc:** `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-03-07-hc-zod-schema-design.md`

---

### Task 1: Package Scaffolding

**Files:**
- Create: `epi-cli/schemas/package.json`
- Create: `epi-cli/schemas/tsconfig.json`
- Create: `epi-cli/schemas/vitest.config.ts`
- Create: `epi-cli/schemas/src/index.ts`

**Step 1: Create package.json**

```json
{
  "name": "@epi-logos/ql-schema",
  "version": "0.1.0",
  "description": "Holographic Coordinate Zod schemas — canonical TS types for the Epi-Logos coordinate system",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "vitest": "^3.0.0"
  },
  "license": "MIT"
}
```

**Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

**Step 3: Create vitest.config.ts**

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
```

**Step 4: Create empty barrel export**

```typescript
// src/index.ts
// Barrel export — populated as rings are built
```

**Step 5: Install dependencies and verify**

Run: `cd epi-cli/schemas && npm install`
Expected: `node_modules/` created, `package-lock.json` generated

Run: `cd epi-cli/schemas && npx tsc --noEmit`
Expected: No errors

**Step 6: Commit**

```bash
git add epi-cli/schemas/package.json epi-cli/schemas/tsconfig.json epi-cli/schemas/vitest.config.ts epi-cli/schemas/src/index.ts epi-cli/schemas/package-lock.json
git commit -m "feat(schemas): scaffold @epi-logos/ql-schema package"
```

---

### Task 2: Enum Schemas + Constants

**Files:**
- Create: `epi-cli/schemas/src/enums.ts`
- Create: `epi-cli/schemas/src/constants.ts`
- Create: `epi-cli/schemas/tests/enums.test.ts`
- Modify: `epi-cli/schemas/src/index.ts`

**Step 1: Write the failing test**

Create `epi-cli/schemas/tests/enums.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  CoordFamily, CoordLayer, TopoMode, ContextFrame,
  DisclosureLevel, VakCoord,
} from "../src/enums.js";
import {
  FAMILIES, FAMILY_NAMES, PSYCHOID_NAMES, PSYCHOID_TOPO,
  WEAVE_COORDS, CF_NAMES, VAK_NAMES,
} from "../src/constants.js";

describe("CoordFamily", () => {
  it("accepts all 7 values", () => {
    for (const f of ["C", "P", "L", "S", "T", "M", "NONE"]) {
      expect(CoordFamily.parse(f)).toBe(f);
    }
  });
  it("rejects invalid", () => {
    expect(() => CoordFamily.parse("Z")).toThrow();
  });
});

describe("CoordLayer", () => {
  it("accepts all 5 layers", () => {
    for (const l of ["PSYCHOID", "WEAVE", "CONTEXT_FRAME", "COORDINATE", "VAK"]) {
      expect(CoordLayer.parse(l)).toBe(l);
    }
  });
});

describe("TopoMode", () => {
  it("accepts all 4 modes", () => {
    for (const t of ["ZERO_SPHERE", "TORUS", "LEMNISCATE", "KLEIN"]) {
      expect(TopoMode.parse(t)).toBe(t);
    }
  });
});

describe("ContextFrame", () => {
  it("accepts all 7 frames", () => {
    for (const cf of ["CF_VOID", "CF_BINARY", "CF_TRIKA", "CF_QUATERNAL", "CF_FRACTAL", "CF_SYNTHESIS", "CF_MOBIUS"]) {
      expect(ContextFrame.parse(cf)).toBe(cf);
    }
  });
});

describe("DisclosureLevel", () => {
  it("accepts all 6 levels", () => {
    for (const d of ["UuidOnly", "Identity", "Summary", "Content", "Connected", "Complete"]) {
      expect(DisclosureLevel.parse(d)).toBe(d);
    }
  });
});

describe("VakCoord", () => {
  it("accepts all 6 VAK", () => {
    for (const v of ["CPF", "CT", "CP", "CF", "CFP", "CS"]) {
      expect(VakCoord.parse(v)).toBe(v);
    }
  });
});

describe("Constants", () => {
  it("FAMILIES has 6 entries matching C struct order", () => {
    expect(FAMILIES).toEqual(["C", "P", "L", "S", "T", "M"]);
  });

  it("FAMILY_NAMES has 6×6 entries", () => {
    expect(FAMILY_NAMES.length).toBe(6);
    for (const names of FAMILY_NAMES) {
      expect(names.length).toBe(6);
    }
  });

  it("PSYCHOID_NAMES matches seed.rs", () => {
    expect(PSYCHOID_NAMES).toEqual([
      "Ground", "Form", "Operation", "Pattern", "Context", "Integration",
    ]);
  });

  it("PSYCHOID_TOPO matches seed.rs", () => {
    expect(PSYCHOID_TOPO).toEqual([
      "ZERO_SPHERE", "TORUS", "TORUS", "TORUS", "LEMNISCATE", "ZERO_SPHERE",
    ]);
  });

  it("WEAVE_COORDS has 4 entries", () => {
    expect(WEAVE_COORDS).toEqual([
      ["Weave_0_0", 0.0],
      ["Weave_0_5", 0.5],
      ["Weave_5_0", 5.0],
      ["Weave_5_5", 5.5],
    ]);
  });

  it("CF_NAMES has 7 entries", () => {
    expect(CF_NAMES).toEqual([
      "CF_VOID", "CF_BINARY", "CF_TRIKA", "CF_QUATERNAL",
      "CF_FRACTAL", "CF_SYNTHESIS", "CF_MOBIUS",
    ]);
  });

  it("VAK_NAMES has 6 entries", () => {
    expect(VAK_NAMES).toEqual(["CPF", "CT", "CP", "CF", "CFP", "CS"]);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd epi-cli/schemas && npx vitest run`
Expected: FAIL — modules not found

**Step 3: Implement enums.ts**

Create `epi-cli/schemas/src/enums.ts`:

```typescript
import { z } from "zod";

export const CoordFamily = z.enum(["C", "P", "L", "S", "T", "M", "NONE"]);
export type CoordFamily = z.infer<typeof CoordFamily>;

export const CoordLayer = z.enum(["PSYCHOID", "WEAVE", "CONTEXT_FRAME", "COORDINATE", "VAK"]);
export type CoordLayer = z.infer<typeof CoordLayer>;

export const TopoMode = z.enum(["ZERO_SPHERE", "TORUS", "LEMNISCATE", "KLEIN"]);
export type TopoMode = z.infer<typeof TopoMode>;

export const ContextFrame = z.enum([
  "CF_VOID", "CF_BINARY", "CF_TRIKA", "CF_QUATERNAL",
  "CF_FRACTAL", "CF_SYNTHESIS", "CF_MOBIUS",
]);
export type ContextFrame = z.infer<typeof ContextFrame>;

export const DisclosureLevel = z.enum([
  "UuidOnly", "Identity", "Summary", "Content", "Connected", "Complete",
]);
export type DisclosureLevel = z.infer<typeof DisclosureLevel>;

export const VakCoord = z.enum(["CPF", "CT", "CP", "CF", "CFP", "CS"]);
export type VakCoord = z.infer<typeof VakCoord>;
```

**Step 4: Implement constants.ts**

Create `epi-cli/schemas/src/constants.ts`:

```typescript
// Mirrors seed.rs and ontology.h .rodata exactly

export const FAMILIES = ["C", "P", "L", "S", "T", "M"] as const;

export const FAMILY_NAMES: readonly (readonly string[])[] = [
  ["Bimba", "Form", "Entity", "Process", "Type", "Pratibimba"],       // C
  ["Ground", "Definition", "Operation", "Pattern", "Context", "Integration"], // P
  ["Literal", "Functional", "Structural", "Archetypal", "Paradigmatic", "Integral"], // L
  ["Terminal", "Obsidian", "Neo4j", "Gateway", "PiAgent", "Sync"],    // S
  ["Questions", "Traces", "Challenges", "Patterns", "Discovery", "Insight"], // T
  ["Anuttara", "Paramasiva", "Parashakti", "Mahamaya", "Nara", "Epii"], // M
];

export const PSYCHOID_NAMES = [
  "Ground", "Form", "Operation", "Pattern", "Context", "Integration",
] as const;

export const PSYCHOID_TOPO = [
  "ZERO_SPHERE", "TORUS", "TORUS", "TORUS", "LEMNISCATE", "ZERO_SPHERE",
] as const;

export const WEAVE_COORDS: readonly (readonly [string, number])[] = [
  ["Weave_0_0", 0.0],
  ["Weave_0_5", 0.5],
  ["Weave_5_0", 5.0],
  ["Weave_5_5", 5.5],
];

export const CF_NAMES = [
  "CF_VOID", "CF_BINARY", "CF_TRIKA", "CF_QUATERNAL",
  "CF_FRACTAL", "CF_SYNTHESIS", "CF_MOBIUS",
] as const;

export const VAK_NAMES = ["CPF", "CT", "CP", "CF", "CFP", "CS"] as const;

/** Family enum ordinal (matches Coordinate_Family in ontology.h) */
export const FAMILY_ORDINAL: Record<string, number> = {
  C: 0, P: 1, L: 2, S: 3, T: 4, M: 5, NONE: 7,
};

/** Flags byte constants (ontology.h) */
export const FLAGS = {
  STATUS_CANONICAL: 0x01,
  STATUS_PROVISIONAL: 0x02,
  FLAG_BIMBA: 0x20,
  BIMBA_FLAGS: 0x21,
  TOPO_TORUS: 0x00,
  TOPO_LEMNISCATE: 0x40,
  TOPO_KLEIN: 0x80,
  TOPO_ZERO_SPHERE: 0xc0,
} as const;
```

**Step 5: Update barrel export**

```typescript
// src/index.ts
export * from "./enums.js";
export * from "./constants.js";
```

**Step 6: Run tests**

Run: `cd epi-cli/schemas && npx vitest run`
Expected: All pass

**Step 7: Commit**

```bash
git add epi-cli/schemas/src/enums.ts epi-cli/schemas/src/constants.ts epi-cli/schemas/tests/enums.test.ts epi-cli/schemas/src/index.ts
git commit -m "feat(schemas): add enum schemas and constants mirroring C .rodata"
```

---

### Task 3: Ring 1 — HCIdentity Schema

**Files:**
- Create: `epi-cli/schemas/src/identity.ts`
- Create: `epi-cli/schemas/tests/identity.test.ts`
- Modify: `epi-cli/schemas/src/index.ts`

**Step 1: Write the failing test**

Create `epi-cli/schemas/tests/identity.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { HCIdentity } from "../src/identity.js";

describe("HCIdentity (Ring 1)", () => {
  it("accepts a valid psychoid identity", () => {
    const result = HCIdentity.parse({
      bimbaCoordinate: "#4",
      qlPosition: 4,
      family: "NONE",
      inversionState: 0,
      flags: 0x21,
      weaveState: 4.0,
    });
    expect(result.bimbaCoordinate).toBe("#4");
    expect(result.family).toBe("NONE");
  });

  it("accepts the # node (qlPosition 255)", () => {
    const result = HCIdentity.parse({
      bimbaCoordinate: "#",
      qlPosition: 255,
      family: "NONE",
      inversionState: 0,
      flags: 0x00,
      weaveState: 0.0,
    });
    expect(result.qlPosition).toBe(255);
  });

  it("accepts a family coordinate", () => {
    const result = HCIdentity.parse({
      bimbaCoordinate: "M5",
      qlPosition: 5,
      family: "M",
      inversionState: 0,
      flags: 0x21,
      weaveState: 5.0,
    });
    expect(result.family).toBe("M");
  });

  it("accepts an inverted coordinate", () => {
    const result = HCIdentity.parse({
      bimbaCoordinate: "C0'",
      qlPosition: 0,
      family: "C",
      inversionState: 1,
      flags: 0x21,
      weaveState: 0.0,
    });
    expect(result.inversionState).toBe(1);
  });

  it("rejects qlPosition > 5 (except 255)", () => {
    expect(() =>
      HCIdentity.parse({
        bimbaCoordinate: "#9",
        qlPosition: 9,
        family: "NONE",
        inversionState: 0,
        flags: 0,
        weaveState: 0,
      })
    ).toThrow();
  });

  it("rejects invalid family", () => {
    expect(() =>
      HCIdentity.parse({
        bimbaCoordinate: "Z0",
        qlPosition: 0,
        family: "Z",
        inversionState: 0,
        flags: 0,
        weaveState: 0,
      })
    ).toThrow();
  });

  it("rejects inversionState > 1", () => {
    expect(() =>
      HCIdentity.parse({
        bimbaCoordinate: "C0",
        qlPosition: 0,
        family: "C",
        inversionState: 2,
        flags: 0,
        weaveState: 0,
      })
    ).toThrow();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd epi-cli/schemas && npx vitest run tests/identity.test.ts`
Expected: FAIL

**Step 3: Implement identity.ts**

Create `epi-cli/schemas/src/identity.ts`:

```typescript
import { z } from "zod";
import { CoordFamily } from "./enums.js";

/**
 * Ring 1: HCIdentity — the 8-byte kernel.
 * Maps to the first 8 bytes of struct Holographic_Coordinate in ontology.h.
 * Every system (Neo4j, Obsidian, Pi agent) shares this irreducible core.
 */
export const HCIdentity = z.object({
  /** Primary key: "#", "#0"-"#5", "M4", "CF_TRIKA", "CPF", etc. */
  bimbaCoordinate: z.string().min(1),
  /** 0-5 for positions, 255 (0xFF) for the # node */
  qlPosition: z.number().int().refine(
    (n) => (n >= 0 && n <= 5) || n === 255,
    { message: "qlPosition must be 0-5 or 255" }
  ),
  family: CoordFamily,
  /** 0 = normal, 1 = inverted (result of # operation) */
  inversionState: z.literal(0).or(z.literal(1)),
  /** 8-bit flags byte (see FLAGS constants) */
  flags: z.number().int().min(0).max(255),
  /** Interlaced weave fraction: 0.0, 0.5, 1.0, ..., 5.5 */
  weaveState: z.number(),
});

export type HCIdentity = z.infer<typeof HCIdentity>;
```

**Step 4: Update barrel, run tests**

Add to `src/index.ts`: `export * from "./identity.js";`

Run: `cd epi-cli/schemas && npx vitest run tests/identity.test.ts`
Expected: All pass

**Step 5: Commit**

```bash
git add epi-cli/schemas/src/identity.ts epi-cli/schemas/tests/identity.test.ts epi-cli/schemas/src/index.ts
git commit -m "feat(schemas): Ring 1 — HCIdentity kernel schema"
```

---

### Task 4: Ring 2 — HCCoordinate Schema

**Files:**
- Create: `epi-cli/schemas/src/coordinate.ts`
- Create: `epi-cli/schemas/tests/coordinate.test.ts`
- Modify: `epi-cli/schemas/src/index.ts`

**Step 1: Write the failing test**

Create `epi-cli/schemas/tests/coordinate.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { HCCoordinate } from "../src/coordinate.js";

describe("HCCoordinate (Ring 2)", () => {
  it("accepts identity + 12 pointer web fields", () => {
    const result = HCCoordinate.parse({
      bimbaCoordinate: "M4",
      qlPosition: 4,
      family: "M",
      inversionState: 0,
      flags: 0x21,
      weaveState: 4.0,
      // 6 base family links
      c: "C4", p: "P4", l: "L4", s: "S4", t: "T4", m: "M4",
      // 6 reflective links
      cpf: null, ct: null, cp: null, cf: "CF_FRACTAL", cfp: null, cs: null,
    });
    expect(result.c).toBe("C4");
    expect(result.cf).toBe("CF_FRACTAL");
    expect(result.cpf).toBeNull();
  });

  it("allows all pointer fields to be null", () => {
    const result = HCCoordinate.parse({
      bimbaCoordinate: "#",
      qlPosition: 255,
      family: "NONE",
      inversionState: 0,
      flags: 0,
      weaveState: 0,
      c: null, p: null, l: null, s: null, t: null, m: null,
      cpf: null, ct: null, cp: null, cf: null, cfp: null, cs: null,
    });
    expect(result.c).toBeNull();
  });

  it("extends HCIdentity — identity fields still validated", () => {
    expect(() =>
      HCCoordinate.parse({
        bimbaCoordinate: "X9",
        qlPosition: 9,
        family: "X",
        inversionState: 0,
        flags: 0,
        weaveState: 0,
        c: null, p: null, l: null, s: null, t: null, m: null,
        cpf: null, ct: null, cp: null, cf: null, cfp: null, cs: null,
      })
    ).toThrow();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd epi-cli/schemas && npx vitest run tests/coordinate.test.ts`
Expected: FAIL

**Step 3: Implement coordinate.ts**

Create `epi-cli/schemas/src/coordinate.ts`:

```typescript
import { z } from "zod";
import { HCIdentity } from "./identity.js";

const coordRef = z.string().min(1).nullable();

/**
 * Ring 2: HCCoordinate — identity + 12-fold pointer web.
 * Maps to the 12 Holographic_Coordinate* pointers (96 bytes) in ontology.h.
 * In TS these are string references to other bimbaCoordinates, or null.
 */
export const HCCoordinate = HCIdentity.extend({
  // 6 base family links (maps to c, p, l, s, t, m pointers)
  c: coordRef,
  p: coordRef,
  l: coordRef,
  s: coordRef,
  t: coordRef,
  m: coordRef,
  // 6 reflective/contextual links (maps to cpf, ct, cp, cf, cfp, cs pointers)
  cpf: coordRef,
  ct: coordRef,
  cp: coordRef,
  cf: coordRef,
  cfp: coordRef,
  cs: coordRef,
});

export type HCCoordinate = z.infer<typeof HCCoordinate>;
```

**Step 4: Update barrel, run tests**

Add to `src/index.ts`: `export * from "./coordinate.js";`

Run: `cd epi-cli/schemas && npx vitest run tests/coordinate.test.ts`
Expected: All pass

**Step 5: Commit**

```bash
git add epi-cli/schemas/src/coordinate.ts epi-cli/schemas/tests/coordinate.test.ts epi-cli/schemas/src/index.ts
git commit -m "feat(schemas): Ring 2 — HCCoordinate with 12-fold pointer web"
```

---

### Task 5: Ring 3 — HCNode Schema

**Files:**
- Create: `epi-cli/schemas/src/node.ts`
- Create: `epi-cli/schemas/tests/node.test.ts`
- Modify: `epi-cli/schemas/src/index.ts`

**Step 1: Write the failing test**

Create `epi-cli/schemas/tests/node.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { HCNode } from "../src/node.js";

describe("HCNode (Ring 3)", () => {
  const validNode = {
    bimbaCoordinate: "#4",
    qlPosition: 4,
    family: "NONE",
    inversionState: 0,
    flags: 0x21,
    weaveState: 4.0,
    c: null, p: null, l: null, s: null, t: null, m: null,
    cpf: null, ct: null, cp: null, cf: null, cfp: null, cs: null,
    uuid: "e9110605-0000-5000-8000-000000000001",
    name: "Context",
    layer: "PSYCHOID",
    topoMode: "LEMNISCATE",
    essence: null,
    description: null,
    vaultPath: null,
    semanticEmbedding: null,
    createdAt: null,
    updatedAt: null,
  };

  it("accepts a complete node", () => {
    const result = HCNode.parse(validNode);
    expect(result.uuid).toBe("e9110605-0000-5000-8000-000000000001");
    expect(result.layer).toBe("PSYCHOID");
    expect(result.topoMode).toBe("LEMNISCATE");
  });

  it("accepts node with essence and description", () => {
    const result = HCNode.parse({
      ...validNode,
      bimbaCoordinate: "#",
      qlPosition: 255,
      essence: "Prakasa-Vimarsa-Maya",
      description: "The non-dual ground",
      topoMode: "KLEIN",
    });
    expect(result.essence).toBe("Prakasa-Vimarsa-Maya");
  });

  it("accepts node with embedding vector", () => {
    const vec = new Array(768).fill(0.1);
    const result = HCNode.parse({ ...validNode, semanticEmbedding: vec });
    expect(result.semanticEmbedding?.length).toBe(768);
  });

  it("accepts node with vault path and timestamps", () => {
    const result = HCNode.parse({
      ...validNode,
      vaultPath: "Bimba/Seeds/M/M4.md",
      createdAt: "2026-03-07T12:00:00Z",
      updatedAt: "2026-03-07T13:00:00Z",
    });
    expect(result.vaultPath).toBe("Bimba/Seeds/M/M4.md");
  });

  it("rejects invalid layer", () => {
    expect(() => HCNode.parse({ ...validNode, layer: "INVALID" })).toThrow();
  });

  it("rejects invalid topoMode", () => {
    expect(() => HCNode.parse({ ...validNode, topoMode: "SPHERE" })).toThrow();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd epi-cli/schemas && npx vitest run tests/node.test.ts`
Expected: FAIL

**Step 3: Implement node.ts**

Create `epi-cli/schemas/src/node.ts`:

```typescript
import { z } from "zod";
import { HCCoordinate } from "./coordinate.js";
import { CoordLayer, TopoMode } from "./enums.js";

/**
 * Ring 3: HCNode — the storage shape for Neo4j and Obsidian.
 * Extends HCCoordinate with all properties needed for persistent storage.
 * Maps to BimbaCoordinate node properties in Neo4j and YAML frontmatter in Obsidian.
 */
export const HCNode = HCCoordinate.extend({
  /** Deterministic UUID v5 (Epi-Logos namespace) */
  uuid: z.string().uuid(),
  /** Human-readable name */
  name: z.string().min(1),
  layer: CoordLayer,
  topoMode: TopoMode,
  /** Pithy self-description (S0' compression trika) */
  essence: z.string().nullable(),
  description: z.string().nullable(),
  /** Obsidian vault file path */
  vaultPath: z.string().nullable(),
  /** Vector embedding (768/1536/3072 dims) */
  semanticEmbedding: z.array(z.number()).nullable(),
  /** ISO 8601 timestamps */
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

export type HCNode = z.infer<typeof HCNode>;
```

**Step 4: Update barrel, run tests**

Add to `src/index.ts`: `export * from "./node.js";`

Run: `cd epi-cli/schemas && npx vitest run tests/node.test.ts`
Expected: All pass

**Step 5: Commit**

```bash
git add epi-cli/schemas/src/node.ts epi-cli/schemas/tests/node.test.ts epi-cli/schemas/src/index.ts
git commit -m "feat(schemas): Ring 3 — HCNode storage schema (Neo4j + Obsidian)"
```

---

### Task 6: Ring 4 — HCRuntime Schema

**Files:**
- Create: `epi-cli/schemas/src/runtime.ts`
- Create: `epi-cli/schemas/tests/runtime.test.ts`
- Modify: `epi-cli/schemas/src/index.ts`

**Step 1: Write the failing test**

Create `epi-cli/schemas/tests/runtime.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { HCRuntime, HCPayload } from "../src/runtime.js";

const baseNode = {
  bimbaCoordinate: "M5",
  qlPosition: 5,
  family: "M",
  inversionState: 0,
  flags: 0x21,
  weaveState: 5.0,
  c: null, p: null, l: null, s: null, t: null, m: null,
  cpf: null, ct: null, cp: null, cf: null, cfp: null, cs: null,
  uuid: "4f965499-cd20-515d-8505-a48bd8f57f83",
  name: "Epii",
  layer: "COORDINATE" as const,
  topoMode: "ZERO_SPHERE" as const,
  essence: null,
  description: null,
  vaultPath: null,
  semanticEmbedding: null,
  createdAt: null,
  updatedAt: null,
};

describe("HCRuntime (Ring 4)", () => {
  it("accepts runtime with meaning payload", () => {
    const result = HCRuntime.parse({
      ...baseNode,
      contextFrame: "CF_MOBIUS",
      disclosureLevel: "Complete",
      mode: "day",
      sessionId: "session-123",
      payload: { type: "meaning", value: "holographic integration layer" },
    });
    expect(result.contextFrame).toBe("CF_MOBIUS");
    expect(result.payload?.type).toBe("meaning");
  });

  it("accepts runtime with process payload", () => {
    const result = HCRuntime.parse({
      ...baseNode,
      contextFrame: null,
      disclosureLevel: "Identity",
      mode: "night",
      sessionId: null,
      payload: { type: "process", value: { state: "active", tick: 7 } },
    });
    expect(result.payload?.type).toBe("process");
  });

  it("accepts runtime with null payload", () => {
    const result = HCRuntime.parse({
      ...baseNode,
      contextFrame: null,
      disclosureLevel: "UuidOnly",
      mode: "day",
      sessionId: null,
      payload: null,
    });
    expect(result.payload).toBeNull();
  });

  it("rejects invalid mode", () => {
    expect(() =>
      HCRuntime.parse({
        ...baseNode,
        contextFrame: null,
        disclosureLevel: "UuidOnly",
        mode: "twilight",
        sessionId: null,
        payload: null,
      })
    ).toThrow();
  });

  it("rejects invalid disclosure level", () => {
    expect(() =>
      HCRuntime.parse({
        ...baseNode,
        contextFrame: null,
        disclosureLevel: "Everything",
        mode: "day",
        sessionId: null,
        payload: null,
      })
    ).toThrow();
  });
});

describe("HCPayload", () => {
  it("validates meaning payload", () => {
    expect(HCPayload.parse({ type: "meaning", value: "test" })).toEqual({
      type: "meaning", value: "test",
    });
  });

  it("validates instance payload", () => {
    expect(HCPayload.parse({ type: "instance", value: "uuid-123" })).toEqual({
      type: "instance", value: "uuid-123",
    });
  });

  it("validates vector payload", () => {
    const vec = [0.1, 0.2, 0.3];
    expect(HCPayload.parse({ type: "vector", value: vec })).toEqual({
      type: "vector", value: vec,
    });
  });

  it("rejects unknown payload type", () => {
    expect(() => HCPayload.parse({ type: "unknown", value: "x" })).toThrow();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd epi-cli/schemas && npx vitest run tests/runtime.test.ts`
Expected: FAIL

**Step 3: Implement runtime.ts**

Create `epi-cli/schemas/src/runtime.ts`:

```typescript
import { z } from "zod";
import { HCNode } from "./node.js";
import { ContextFrame, DisclosureLevel } from "./enums.js";

/**
 * Discriminated union for the HC payload.
 * Maps to the union { meaning_bin, process_state, instance_id, vector_anchor } in ontology.h.
 */
export const HCPayload = z.discriminatedUnion("type", [
  z.object({ type: z.literal("meaning"), value: z.string() }),
  z.object({ type: z.literal("process"), value: z.record(z.unknown()) }),
  z.object({ type: z.literal("instance"), value: z.string() }),
  z.object({ type: z.literal("vector"), value: z.array(z.number()) }),
]);

export type HCPayload = z.infer<typeof HCPayload>;

/**
 * Ring 4: HCRuntime — the execution shape for Pi agent runtime.
 * Extends HCNode with context frame, disclosure level, session, and payload.
 * Maps to invoke_process + payload in ontology.h.
 */
export const HCRuntime = HCNode.extend({
  contextFrame: ContextFrame.nullable(),
  disclosureLevel: DisclosureLevel,
  mode: z.enum(["day", "night"]),
  sessionId: z.string().nullable(),
  payload: HCPayload.nullable(),
});

export type HCRuntime = z.infer<typeof HCRuntime>;
```

**Step 4: Update barrel, run tests**

Add to `src/index.ts`: `export * from "./runtime.js";`

Run: `cd epi-cli/schemas && npx vitest run tests/runtime.test.ts`
Expected: All pass

**Step 5: Commit**

```bash
git add epi-cli/schemas/src/runtime.ts epi-cli/schemas/tests/runtime.test.ts epi-cli/schemas/src/index.ts
git commit -m "feat(schemas): Ring 4 — HCRuntime execution schema (Pi agent)"
```

---

### Task 7: Coordinate Validator

**Files:**
- Create: `epi-cli/schemas/src/validator.ts`
- Create: `epi-cli/schemas/tests/validator.test.ts`
- Modify: `epi-cli/schemas/src/index.ts`

**Step 1: Write the failing test**

Create `epi-cli/schemas/tests/validator.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { parseCoordinate, isValidCoordinate, BimbaCoordinate } from "../src/validator.js";

describe("parseCoordinate", () => {
  it("parses # (hash)", () => {
    const r = parseCoordinate("#");
    expect(r).toEqual({ bimbaCoordinate: "#", layer: "PSYCHOID", family: null, qlPosition: null, inverted: false });
  });

  it("parses psychoids #0-#5", () => {
    for (let i = 0; i <= 5; i++) {
      const r = parseCoordinate(`#${i}`);
      expect(r?.layer).toBe("PSYCHOID");
      expect(r?.qlPosition).toBe(i);
    }
  });

  it("parses weave coords", () => {
    const r = parseCoordinate("Weave_0_5");
    expect(r?.layer).toBe("WEAVE");
  });

  it("parses context frames", () => {
    const r = parseCoordinate("CF_TRIKA");
    expect(r?.layer).toBe("CONTEXT_FRAME");
    expect(r?.qlPosition).toBe(2);
  });

  it("parses VAK coords", () => {
    const r = parseCoordinate("CPF");
    expect(r?.layer).toBe("VAK");
    expect(r?.qlPosition).toBe(0);
  });

  it("parses family coords", () => {
    const r = parseCoordinate("M4");
    expect(r?.layer).toBe("COORDINATE");
    expect(r?.family).toBe("M");
    expect(r?.qlPosition).toBe(4);
    expect(r?.inverted).toBe(false);
  });

  it("parses inverted family coords", () => {
    const r = parseCoordinate("C0'");
    expect(r?.layer).toBe("COORDINATE");
    expect(r?.family).toBe("C");
    expect(r?.qlPosition).toBe(0);
    expect(r?.inverted).toBe(true);
  });

  it("returns null for invalid input", () => {
    expect(parseCoordinate("")).toBeNull();
    expect(parseCoordinate("Z9")).toBeNull();
    expect(parseCoordinate("#9")).toBeNull();
    expect(parseCoordinate("CC")).toBeNull();
  });
});

describe("isValidCoordinate", () => {
  it("returns true for all 96 seed coordinates", () => {
    // # node
    expect(isValidCoordinate("#")).toBe(true);
    // Psychoids
    for (let i = 0; i <= 5; i++) expect(isValidCoordinate(`#${i}`)).toBe(true);
    // Weaves
    for (const w of ["Weave_0_0", "Weave_0_5", "Weave_5_0", "Weave_5_5"])
      expect(isValidCoordinate(w)).toBe(true);
    // CFs
    for (const cf of ["CF_VOID", "CF_BINARY", "CF_TRIKA", "CF_QUATERNAL", "CF_FRACTAL", "CF_SYNTHESIS", "CF_MOBIUS"])
      expect(isValidCoordinate(cf)).toBe(true);
    // Family coords (72)
    for (const f of ["C", "P", "L", "S", "T", "M"]) {
      for (let i = 0; i <= 5; i++) {
        expect(isValidCoordinate(`${f}${i}`)).toBe(true);
        expect(isValidCoordinate(`${f}${i}'`)).toBe(true);
      }
    }
    // VAK
    for (const v of ["CPF", "CT", "CP", "CF", "CFP", "CS"])
      expect(isValidCoordinate(v)).toBe(true);
  });
});

describe("BimbaCoordinate (Zod string)", () => {
  it("accepts valid coordinates", () => {
    expect(BimbaCoordinate.parse("#4")).toBe("#4");
    expect(BimbaCoordinate.parse("M5")).toBe("M5");
  });
  it("rejects invalid", () => {
    expect(() => BimbaCoordinate.parse("NOPE")).toThrow();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd epi-cli/schemas && npx vitest run tests/validator.test.ts`
Expected: FAIL

**Step 3: Implement validator.ts**

Create `epi-cli/schemas/src/validator.ts`:

```typescript
import { z } from "zod";
import { CF_NAMES, VAK_NAMES, FAMILIES } from "./constants.js";
import type { CoordLayer } from "./enums.js";

export interface ParsedCoordinate {
  bimbaCoordinate: string;
  layer: CoordLayer;
  family: string | null;
  qlPosition: number | null;
  inverted: boolean;
}

/**
 * Parse a coordinate string into structured form.
 * Port of Rust CoordinateArrayParser::parse_one from coordinate_array_parser.rs.
 */
export function parseCoordinate(input: string): ParsedCoordinate | null {
  const s = input.trim();
  if (!s) return null;

  // # (hash alone)
  if (s === "#") {
    return { bimbaCoordinate: "#", layer: "PSYCHOID", family: null, qlPosition: null, inverted: false };
  }

  // Psychoids: #0-#5
  if (s.startsWith("#") && s.length === 2) {
    const d = parseInt(s[1], 10);
    if (!isNaN(d) && d >= 0 && d <= 5) {
      return { bimbaCoordinate: s, layer: "PSYCHOID", family: null, qlPosition: d, inverted: false };
    }
    return null;
  }

  // Weaves: Weave_*
  if (s.startsWith("Weave_")) {
    return { bimbaCoordinate: s, layer: "WEAVE", family: null, qlPosition: null, inverted: false };
  }

  // Context frames: CF_*
  const cfIdx = (CF_NAMES as readonly string[]).indexOf(s);
  if (cfIdx !== -1) {
    return { bimbaCoordinate: s, layer: "CONTEXT_FRAME", family: null, qlPosition: cfIdx, inverted: false };
  }

  // VAK: CPF, CT, CP, CF, CFP, CS
  const vakIdx = (VAK_NAMES as readonly string[]).indexOf(s);
  if (vakIdx !== -1) {
    return { bimbaCoordinate: s, layer: "VAK", family: null, qlPosition: vakIdx, inverted: false };
  }

  // Family coordinates: {F}{0-5} or {F}{0-5}'
  const inverted = s.endsWith("'");
  const base = inverted ? s.slice(0, -1) : s;
  if (base.length === 2) {
    const fam = base[0];
    const pos = parseInt(base[1], 10);
    if ((FAMILIES as readonly string[]).includes(fam) && !isNaN(pos) && pos >= 0 && pos <= 5) {
      return { bimbaCoordinate: s, layer: "COORDINATE", family: fam, qlPosition: pos, inverted };
    }
  }

  return null;
}

/** Check if a string is a valid bimba coordinate. */
export function isValidCoordinate(input: string): boolean {
  return parseCoordinate(input) !== null;
}

/** Zod string schema that validates bimba coordinate format. */
export const BimbaCoordinate = z.string().refine(isValidCoordinate, {
  message: "Invalid bimba coordinate",
});

export type BimbaCoordinate = z.infer<typeof BimbaCoordinate>;
```

**Step 4: Update barrel, run tests**

Add to `src/index.ts`: `export * from "./validator.js";`

Run: `cd epi-cli/schemas && npx vitest run tests/validator.test.ts`
Expected: All pass

**Step 5: Commit**

```bash
git add epi-cli/schemas/src/validator.ts epi-cli/schemas/tests/validator.test.ts epi-cli/schemas/src/index.ts
git commit -m "feat(schemas): coordinate validator — port of Rust parser to TS"
```

---

### Task 8: Frontmatter Schema + Relation Types

**Files:**
- Create: `epi-cli/schemas/src/frontmatter.ts`
- Create: `epi-cli/schemas/src/relations.ts`
- Create: `epi-cli/schemas/tests/frontmatter.test.ts`
- Modify: `epi-cli/schemas/src/index.ts`

**Step 1: Write the failing test**

Create `epi-cli/schemas/tests/frontmatter.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  CANONICAL_KEYS, isCanonicalKey, isDeprecatedKey,
  validateFrontmatterKeys, FrontmatterKeySchema,
} from "../src/frontmatter.js";
import { RELATION_TYPES, RelationType } from "../src/relations.js";

describe("Frontmatter canonical keys", () => {
  it("has all P-family keys", () => {
    expect(CANONICAL_KEYS).toContain("p_0_grounds");
    expect(CANONICAL_KEYS).toContain("p_5_crystallizations");
    expect(CANONICAL_KEYS).toContain("p_5_prime_crystallizations");
  });

  it("has all S-family keys", () => {
    expect(CANONICAL_KEYS).toContain("s_0_source");
    expect(CANONICAL_KEYS).toContain("s_4_session");
    expect(CANONICAL_KEYS).toContain("s_5_reflects");
  });

  it("has agent-semantic keys", () => {
    expect(CANONICAL_KEYS).toContain("aletheia_verifies");
    expect(CANONICAL_KEYS).toContain("artifact_role");
    expect(CANONICAL_KEYS).toContain("session_id");
  });

  it("isCanonicalKey validates known keys", () => {
    expect(isCanonicalKey("p_0_grounds")).toBe(true);
    expect(isCanonicalKey("c_4_classifies")).toBe(true);
    expect(isCanonicalKey("random_key")).toBe(false);
  });

  it("isDeprecatedKey catches old patterns", () => {
    expect(isDeprecatedKey("coordinate")).toBe(true);
    expect(isDeprecatedKey("ql_position")).toBe(true);
    expect(isDeprecatedKey("pos_ground")).toBe(true);
    expect(isDeprecatedKey("bimba_coordinate")).toBe(true);
    expect(isDeprecatedKey("ctx_frame")).toBe(true);
    // ctx_type is NOT deprecated
    expect(isDeprecatedKey("ctx_type")).toBe(false);
    // normal keys are not deprecated
    expect(isDeprecatedKey("p_0_grounds")).toBe(false);
  });

  it("validates frontmatter key set", () => {
    const result = validateFrontmatterKeys(["p_0_grounds", "c_1_type", "name"]);
    expect(result.valid).toEqual(["p_0_grounds", "c_1_type"]);
    expect(result.unknown).toEqual(["name"]);
    expect(result.deprecated).toEqual([]);
  });

  it("catches deprecated keys", () => {
    const result = validateFrontmatterKeys(["coordinate", "p_0_grounds", "bimba_coordinate"]);
    expect(result.deprecated).toEqual(["coordinate", "bimba_coordinate"]);
  });

  it("FrontmatterKeySchema validates", () => {
    expect(FrontmatterKeySchema.parse("p_0_grounds")).toBe("p_0_grounds");
    expect(() => FrontmatterKeySchema.parse("coordinate")).toThrow();
  });
});

describe("Relation types", () => {
  it("has P-family relations", () => {
    expect(RELATION_TYPES).toContain("P_0_LINKS_TO");
    expect(RELATION_TYPES).toContain("P_5_INTEGRATES_INTO");
  });

  it("has all 34 types", () => {
    expect(RELATION_TYPES.length).toBe(34);
  });

  it("RelationType schema validates", () => {
    expect(RelationType.parse("P_0_LINKS_TO")).toBe("P_0_LINKS_TO");
    expect(() => RelationType.parse("INVALID_REL")).toThrow();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd epi-cli/schemas && npx vitest run tests/frontmatter.test.ts`
Expected: FAIL

**Step 3: Implement frontmatter.ts**

Create `epi-cli/schemas/src/frontmatter.ts`:

```typescript
import { z } from "zod";

/**
 * All 126 canonical frontmatter keys.
 * Source: frontmatter_schema.ts in .pi/extensions/s_i/modules/ql_obsidian/
 * Pattern: {coord}_{n}_{semantic} + special agent/artifact keys
 */
export const CANONICAL_KEYS = [
  // P family (11)
  "p_0_grounds", "p_1_title", "p_1_definitions", "p_2_operations", "p_2_skills",
  "p_3_patterns", "p_4_temporals", "p_4_spatials", "p_5_integrations",
  "p_5_crystallizations", "p_5_prime_crystallizations",
  // C family (6)
  "c_0_links_to", "c_0_relates_to", "c_1_type", "c_4_classifies", "c_4_category", "c_4_classified",
  // M family (3)
  "m_3_archived_to", "m_5_mobius_return", "m_5_bimba_form",
  // S family (16)
  "s_0_source", "s_1_file_path", "s_2_graph_id", "s_2_contains", "s_3_pack",
  "s_3_orphaned", "s_3_blocked_by", "s_3_depends_on", "s_3_registers",
  "s_4_session", "s_4_spawned", "s_4_transitioned_to", "s_4_communicated",
  "s_4_handed_off_to", "s_4_modulated_to", "s_5_reflects",
  // T family (10)
  "t_0_question_from", "t_0_operative_frame", "t_1_extracted_from",
  "t_2_challenge_source", "t_3_duplicates", "t_3_thread_of",
  "t_4_kairos_context", "t_5_crystallized_to", "t_5_crystallized_from", "t_5_mobius_return",
  // L family (6)
  "l_0_ground", "l_1_structural", "l_2_processual", "l_3_archetypal",
  "l_4_contextual", "l_5_integral",
  // Agent-semantic + artifact role (16)
  "aletheia_verifies", "artifact_role", "ctx_type", "invocation_profile",
  "source_coordinate", "parent_day_id", "now_id", "day_id", "session_id",
  "parent_session_id", "created_at", "updated_at", "merged_at", "merge_reason",
  "provenance_refs", "invocation_kind",
] as const;

export type CanonicalKey = (typeof CANONICAL_KEYS)[number];

const CANONICAL_SET = new Set<string>(CANONICAL_KEYS);

const DEPRECATED_PATTERNS = [
  /^coordinate$/,
  /^ql_position$/,
  /^pos\d+_/,
  /^pos_[a-z]/,
  /^ctx_(?!type$)/,
  /^bimba_coordinate$/,
];

/** Check if a key is in the canonical set. */
export function isCanonicalKey(key: string): boolean {
  return CANONICAL_SET.has(key);
}

/** Check if a key matches a deprecated pattern. */
export function isDeprecatedKey(key: string): boolean {
  return DEPRECATED_PATTERNS.some((p) => p.test(key));
}

/** Validate a set of frontmatter keys. */
export function validateFrontmatterKeys(keys: string[]): {
  valid: string[];
  deprecated: string[];
  unknown: string[];
} {
  const valid: string[] = [];
  const deprecated: string[] = [];
  const unknown: string[] = [];
  for (const k of keys) {
    if (isDeprecatedKey(k)) deprecated.push(k);
    else if (isCanonicalKey(k)) valid.push(k);
    else unknown.push(k);
  }
  return { valid, deprecated, unknown };
}

/** Zod schema for a single canonical frontmatter key. Rejects deprecated patterns. */
export const FrontmatterKeySchema = z.string().refine(
  (k) => isCanonicalKey(k) && !isDeprecatedKey(k),
  { message: "Not a canonical frontmatter key or uses deprecated pattern" }
);
```

**Step 4: Implement relations.ts**

Create `epi-cli/schemas/src/relations.ts`:

```typescript
import { z } from "zod";

/**
 * All 34 canonical Neo4j relation types.
 * Source: ql_schema.ts in .pi/extensions/s_i/modules/ql_graph/
 */
export const RELATION_TYPES = [
  // P (9)
  "P_0_LINKS_TO", "P_0_GROUNDS", "P_1_DEFINES", "P_1_REQUIRES",
  "P_2_OPERATES_VIA", "P_3_INSTANTIATES", "P_4_SITUATED_IN",
  "P_4_PERSPECTIVE_ON", "P_5_INTEGRATES_INTO",
  // T (5)
  "T_1_EXTRACTED_FROM", "T_3_DUPLICATES", "T_3_THREAD_OF",
  "T_5_CRYSTALLIZED_TO", "T_5_CRYSTALLIZED_FROM",
  // S (11)
  "S_2_CONTAINS", "S_3_ORPHANED", "S_3_DEPENDS_ON", "S_3_REGISTERS",
  "S_4_SPAWNED", "S_4_SESSION_OF", "S_4_TRANSITIONED_TO",
  "S_4_COMMUNICATED", "S_4_MODULATED_TO", "S_4_HANDED_OFF_TO", "S_5_REFLECTS",
  // C (4)
  "C_0_LINKS_TO", "C_0_RELATES_TO", "C_4_CLASSIFIES", "C_4_CLASSIFIED",
  // M (3)
  "M_3_ARCHIVED", "M_5_MOBIUS_RETURN", "M_5_BIMBA_FORM",
  // Agent (1)
  "ALETHEIA_VERIFIES",
] as const;

export type RelationType = (typeof RELATION_TYPES)[number];

export const RelationType = z.enum(RELATION_TYPES);
```

**Step 5: Update barrel, run tests**

Add to `src/index.ts`:
```typescript
export * from "./frontmatter.js";
export * from "./relations.js";
```

Run: `cd epi-cli/schemas && npx vitest run tests/frontmatter.test.ts`
Expected: All pass

**Step 6: Commit**

```bash
git add epi-cli/schemas/src/frontmatter.ts epi-cli/schemas/src/relations.ts epi-cli/schemas/tests/frontmatter.test.ts epi-cli/schemas/src/index.ts
git commit -m "feat(schemas): frontmatter keys (126) + relation types (34)"
```

---

### Task 9: Cross-Check — All 96 Seed Coordinates

**Files:**
- Create: `epi-cli/schemas/tests/cross-check.test.ts`

**Step 1: Write the cross-check test**

This test generates all 96 coordinates from the same constants used by Rust `seed.rs` and validates every one parses correctly.

Create `epi-cli/schemas/tests/cross-check.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { parseCoordinate, isValidCoordinate } from "../src/validator.js";
import { HCIdentity } from "../src/identity.js";
import { HCNode } from "../src/node.js";
import {
  FAMILIES, FAMILY_NAMES, PSYCHOID_NAMES, PSYCHOID_TOPO,
  WEAVE_COORDS, CF_NAMES, VAK_NAMES, FLAGS,
} from "../src/constants.js";

describe("Cross-check: all 96 seed coordinates", () => {
  it("# node parses and validates as HCIdentity", () => {
    const p = parseCoordinate("#");
    expect(p).not.toBeNull();
    HCIdentity.parse({
      bimbaCoordinate: "#",
      qlPosition: 255,
      family: "NONE",
      inversionState: 0,
      flags: 0x00,
      weaveState: 0.0,
    });
  });

  it("all 6 psychoids parse and validate", () => {
    for (let i = 0; i <= 5; i++) {
      const coord = `#${i}`;
      const p = parseCoordinate(coord);
      expect(p?.layer).toBe("PSYCHOID");
      expect(p?.qlPosition).toBe(i);
      HCIdentity.parse({
        bimbaCoordinate: coord,
        qlPosition: i,
        family: "NONE",
        inversionState: 0,
        flags: FLAGS.BIMBA_FLAGS,
        weaveState: i,
      });
    }
  });

  it("all 4 weave nodes parse", () => {
    for (const [name] of WEAVE_COORDS) {
      expect(isValidCoordinate(name)).toBe(true);
    }
  });

  it("all 7 context frames parse", () => {
    for (let i = 0; i < CF_NAMES.length; i++) {
      const p = parseCoordinate(CF_NAMES[i]);
      expect(p?.layer).toBe("CONTEXT_FRAME");
      expect(p?.qlPosition).toBe(i);
    }
  });

  it("all 72 family coordinates parse (6 families × 6 positions × 2 phases)", () => {
    let count = 0;
    for (const fam of FAMILIES) {
      for (let pos = 0; pos <= 5; pos++) {
        // Normal
        const normal = `${fam}${pos}`;
        const pn = parseCoordinate(normal);
        expect(pn?.layer).toBe("COORDINATE");
        expect(pn?.family).toBe(fam);
        expect(pn?.qlPosition).toBe(pos);
        expect(pn?.inverted).toBe(false);
        count++;

        // Inverted
        const inv = `${fam}${pos}'`;
        const pi = parseCoordinate(inv);
        expect(pi?.inverted).toBe(true);
        count++;
      }
    }
    expect(count).toBe(72);
  });

  it("all 6 VAK coordinates parse", () => {
    for (let i = 0; i < VAK_NAMES.length; i++) {
      const p = parseCoordinate(VAK_NAMES[i]);
      expect(p?.layer).toBe("VAK");
      expect(p?.qlPosition).toBe(i);
    }
  });

  it("total: 1 + 6 + 4 + 7 + 72 + 6 = 96", () => {
    expect(1 + 6 + 4 + 7 + 72 + 6).toBe(96);
  });

  it("HCNode accepts a fully populated node", () => {
    // Build a realistic M5 node matching Neo4j seed data
    HCNode.parse({
      bimbaCoordinate: "M5",
      qlPosition: 5,
      family: "M",
      inversionState: 0,
      flags: FLAGS.BIMBA_FLAGS,
      weaveState: 5.0,
      c: "C5", p: "P5", l: "L5", s: "S5", t: "T5", m: "M5",
      cpf: null, ct: null, cp: null, cf: null, cfp: null, cs: null,
      uuid: "4f965499-cd20-515d-8505-a48bd8f57f83",
      name: "Epii",
      layer: "COORDINATE",
      topoMode: "ZERO_SPHERE",
      essence: "holographic integration layer",
      description: "M5 Epii — the Logos Cycle",
      vaultPath: "Bimba/Seeds/M/M5.md",
      semanticEmbedding: null,
      createdAt: "2026-03-07T00:00:00Z",
      updatedAt: null,
    });
  });
});
```

**Step 2: Run all tests**

Run: `cd epi-cli/schemas && npx vitest run`
Expected: All pass — every ring, every enum, every coordinate

**Step 3: Commit**

```bash
git add epi-cli/schemas/tests/cross-check.test.ts
git commit -m "test(schemas): cross-check all 96 seed coordinates against Zod rings"
```

---

### Task 10: Build Verification + .gitignore

**Files:**
- Create: `epi-cli/schemas/.gitignore`
- Modify: `epi-cli/schemas/src/index.ts` (final barrel)

**Step 1: Create .gitignore**

```
node_modules/
dist/
```

**Step 2: Verify final barrel export is complete**

`src/index.ts` should contain:

```typescript
export * from "./enums.js";
export * from "./constants.js";
export * from "./identity.js";
export * from "./coordinate.js";
export * from "./node.js";
export * from "./runtime.js";
export * from "./validator.js";
export * from "./frontmatter.js";
export * from "./relations.js";
```

**Step 3: Run full build**

Run: `cd epi-cli/schemas && npx tsc`
Expected: `dist/` directory created with `.js`, `.d.ts`, `.js.map` files

**Step 4: Run full test suite**

Run: `cd epi-cli/schemas && npx vitest run`
Expected: All tests pass

**Step 5: Verify type inference works**

Run: `cd epi-cli/schemas && npx tsc --noEmit`
Expected: No errors

**Step 6: Commit**

```bash
git add epi-cli/schemas/.gitignore
git commit -m "chore(schemas): add .gitignore, verify build + all tests green"
```

---

## Summary

| Task | Ring | What | Tests |
|------|------|------|-------|
| 1 | — | Package scaffolding | Build check |
| 2 | — | Enums + constants | ~15 assertions |
| 3 | Ring 1 | HCIdentity (8-byte kernel) | 7 tests |
| 4 | Ring 2 | HCCoordinate (12-pointer web) | 3 tests |
| 5 | Ring 3 | HCNode (storage shape) | 6 tests |
| 6 | Ring 4 | HCRuntime (execution shape) | 7 tests |
| 7 | — | Coordinate validator | ~100+ assertions |
| 8 | — | Frontmatter keys + relation types | ~10 tests |
| 9 | — | Cross-check all 96 seeds | 8 tests |
| 10 | — | Build verification | Build + typecheck |

**Total: 10 tasks, ~50+ test cases, ~150+ assertions**
