---
name: seeds
description: >
  Manage long-form coordinate specs and definitions in
  /Idea/Bimba/Seeds/. Translate specs from /docs into seed files,
  enrich Forms in /World from mature seeds, and maintain the
  Seeds to World data flow.
---

# Bimba Vault: Seeds Management

## Scope

All operations within:
```
/Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/
```

## Structure

```
/Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/
├── C/                    # Category family seeds
│   ├── C0.md ... C5.md
│   ├── C0'.md ... C5'.md
│   └── [sub-coordinate seeds]
├── P/                    # Position family seeds
├── S/                    # Stack family seeds
│   ├── S0.md ... S5.md
│   ├── S0'.md ... S5'.md
│   └── [S0-0.md, S1-2.md, etc.]
├── T/                    # Thought family seeds
├── L/                    # Lens family seeds
└── M/                    # Subsystem family seeds
    ├── M0.md ... M5.md
    └── [deep M-branch seeds]
```

Seeds are **long-form coordinate definitions** — the detailed specs that underlie
the crystallised Forms in /World. A seed for S4 might be 400 lines covering every
sub-coordinate, the API contract, the implementation status, the philosophical
grounding. The corresponding Form `S4.md` in /World is the 50-100 line synthesis.

## Seed Template: CT4a (Integration Preview)

Seeds use the **CT4a** template — context frame CF(4.5/0), Möbius triadic.
This is NOT the full #0-#5 cycle. Seeds are integration-previews: they situate,
synthesise, and return to ground.

```yaml
---
coordinate: "S4"
c_4_artifact_role: "seed"
c_1_ct_type: "CT4a"
c_3_ctx_frame: "4.5/0"
c_3_created_at: "2026-04-10T14:00:00Z"
c_0_source_coordinates: []
---

# {Coordinate Name}

## #4 Context

What situates this coordinate? What gives it contour?

- Where it sits in the stack/family hierarchy
- What sub-coordinates it contains (X.0-X.5)
- Current implementation status
- Philosophical grounding
- API contracts and operations

## #5 Integration

What synthesis is imminent? What crystallises here?

- The quintessence of this coordinate
- How it integrates with adjacent coordinates
- What the Form in /World should capture

## #0 Ground

What returns to source? What seeds the next cycle?

- Open questions
- Gaps between spec and implementation
- Links to related seeds and specs
```

## Operations

### 1. Create/Update Seed

Write a seed definition at the correct family path using CT4a structure.

### 2. Translate Spec to Seed

Given a spec from `/Users/admin/Documents/Epi-Logos C Experiments/docs/specs/` or
`/Users/admin/Documents/Epi-Logos C Experiments/docs/plans/`:

1. Read the spec fully
2. Identify which coordinate(s) it addresses
3. Extract coordinate-relevant content
4. Create/update the corresponding seed file(s) in Seeds/{Family}/
5. Reformat into CT4a structure (#4 Context, #5 Integration, #0 Ground)
6. Add `c_0_source_coordinates:` linking back to the spec path
7. Add wikilinks to all referenced coordinates

### 3. Seeds → World Enrichment

When a seed is mature (all three CT4a sections substantive):

1. Check if corresponding work exists in `/World/Types/` hierarchy
2. If not, create the entity in the appropriate Types/ folder (use `bimba-vault:world` skill)
3. If a Form already exists flat in /World, update it with new insights
4. The Form = SYNTHESIS (shorter, crystallised). The Seed = DETAIL (comprehensive, reference-grade).

### 4. Validate Seed

Same frontmatter key law as all vault files:
- `{family}_{n}_{semantic}` format
- `{family}_{n}_{i}_{semantic}` for inverted coordinates
- `{family}_{n}_{sub_n}_{semantic}` for sub-coordinates
- `coordinate:` bare key present
- Unknown keys → ERROR
- All entity references use `[[wikilinks]]`

## Reference Files

The old repo has better-quality originals for many seeds:
```
/Users/admin/Documents/Epi-Logos/Idea/Bimba/World/S*.md
/Users/admin/Documents/Epi-Logos/Idea/Bimba/World/L*.md
/Users/admin/Documents/Epi-Logos/Idea/Bimba/World/P*.md
```

When creating or updating seeds, cross-reference these for clarity that
may have been lost in degraded translations to the new repo.
