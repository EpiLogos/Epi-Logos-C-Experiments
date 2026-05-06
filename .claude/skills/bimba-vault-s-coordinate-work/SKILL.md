---
name: s-coordinate-work
description: >
  Systematically crystallise the 12 top-level S-coordinate Forms
  (S0-S5 + S0'-S5') by deep-reading source material from both repos,
  deciding canon, writing into Types/ via bimba-vault:world, validating
  via bimba-vault:validate, then graduating to /World ONLY after user
  approval.
---

# S-Coordinate Crystallisation

## Execution Order

```
Phase 1: S4 + S4'   (agent runtime + ta-onta — defines cross-layer thread)
Phase 2: S0 + S0'   (terminal/CLI/C — ground layer)
Phase 3: S1 + S1'   (obsidian vault + content API)
Phase 4: S2 + S2'   (neo4j graph + traversal API)
Phase 5: S3 + S3'   (gateway + gateway API)
Phase 6: S5 + S5'   (integration/sync + pedagogical crystallisation)
```

## Per-Coordinate Workflow

### Step 1: READ — Deep research, no shortcuts

Read ALL sources for this coordinate. Every file listed in the Source Pool below.
Do not skim. Do not summarise from memory. Open and read the actual files.

### Step 2: DECIDE CANON — Flag conflicts

- **Philosophical structure** (QL positions, Sanskrit stages, Bimba-Pratibimba) → old repo World/ files
- **Implementation truth** (current substrate, what's built) → docs/specs/ + live code
- **Design intent** (architectural decisions) → docs/plans/
- **Where sources conflict** → STOP. Present both versions to user. Do not silently choose.

### Step 3: CROSS-POLLINATE FROM S4'

The [[ta-onta]] extensions ARE the operational layer for all S-coordinates.
Every S{N} crystallisation MUST [[wikilink]] to the extension that actualises it:

```markdown
## Cross-Layer Actualisation

[[S0]] terminal operations are actualised by [[Khora]] (S4.0') via vault init,
session lifecycle, and file persistence. [[Hen]] (S4.1') provides the [[S1']]
content API bridge. The [[S3]] gateway is consumed by all six [[ta-onta]]
extensions via RPC — [[Khora]], [[Hen]], [[Pleroma]], [[Chronos]], [[Anima]],
and [[Aletheia]] all register gateway methods.

[[Pleroma]] (S4.2') actualises the [[S4]] skill system. [[Anima]] (S4.4')
runs the agent runtime with constitutional agents ([[Nous]], [[Logos]], [[Eros]],
[[Mythos]], [[Psyche]], [[Sophia]]). [[Aletheia]] (S4.5') provides [[S5]]
reflection via gate checks and session promotion.
```

Every file MUST use `[[wikilinks]]` for ALL coordinate and entity references.
Not prose descriptions — actual `[[links]]`.

### Step 4: WRITE to Types/ — via bimba-vault:world

Invoke the `bimba-vault:world` skill to create folder + canvas + .md:

For S{N}.md:
```
Idea/Bimba/World/Types/Coordinates/S/S{N}/
├── S{N}.canvas    ← MOC index
└── S{N}.md        ← working definition
```

For S{N}'.md:
```
Idea/Bimba/World/Types/Coordinates/S/S'/S{N}'/
├── S{N}'.canvas   ← MOC index
└── S{N}'.md       ← working definition
```

**CT5 template (Möbius synthesis):**

```yaml
---
coordinate: "S4"
c_4_artifact_role: "definition"
c_1_ct_type: "CT5"
c_3_created_at: "2026-04-10T14:00:00Z"
c_0_source_coordinates: ["[[S4-S4i-PI-AGENT]]", "[[S4-EXTENSION-ARCHITECTURE]]"]
s_4_layer_name: "agent-runtime"
s_4_i_ta_onta: "[[ta-onta]]"
---

# [[S4]]: Agent Runtime

> Harness-agnostic agent runtime layer. Currently [[Pi Agent]].

## #5 Integration — What This Layer IS

{Crystallised synthesis. Cross-links via [[wikilinks]] to:
- [[Anima]] (S4.4') runs the agent runtime
- [[Pleroma]] (S4.2') provides the skill library
- Adjacent layers: [[S3]] gateway below, [[S5]] integration above
- M-resonance: [[M4]] Nara (personal interface)}

## #0 Ground — What Returns to Source

{Open questions. Gaps. What sub-coordinates will detail.
Links: [[S4.0]], [[S4.1]], [[S4.2]], [[S4.3]], [[S4.4]], [[S4.5]]
Inverted: [[S4']], [[S4.0']], [[S4.1']], [[S4.2']], [[S4.3']], [[S4.4']], [[S4.5']]}
```

### Step 5: VALIDATE — via bimba-vault:validate

Invoke the `bimba-vault:validate` skill:
- Frontmatter keys all `{family}_{n}_{semantic}` or `{family}_{n}_{i}_{semantic}`?
- `coordinate:` present?
- `c_0_source_coordinates:` is array of `[[wikilinks]]`?
- Unknown keys → ERROR?
- All entity references use `[[wikilinks]]`?
- File in correct Types/ path?

### Step 6: PRESENT TO USER — Graduation requires approval

**DO NOT graduate to /World automatically.**

Present the completed file to the user. Ask:
> "S4.md is ready in Types/Coordinates/S/S4/. Review the content and confirm
> before I graduate it to /World flat."

Only proceed to graduation after explicit user approval.

### Step 7: GRADUATE — via bimba-vault:world

Once user approves, invoke `bimba-vault:world` graduate operation:
1. Move `.md` from `Types/Coordinates/S/...` to `/World/` flat
2. Validate unique name in `/World`
3. Canvas STAYS in Types/ (it's the MOC index)
4. Update `[[wikilinks]]` in other files that referenced the Types/ path

### Step 8: UPDATE TRACKER

Update MOC canvases via `bimba-vault:world`:
```
Types/Types.canvas                          ← master index
Types/Coordinates/S/S.canvas                ← S-family index
Types/Coordinates/S/S{N}/S{N}.canvas        ← stays as coordinate MOC
Types/Coordinates/S/S'/S{N}'/S{N}'.canvas   ← stays as inverted MOC
```

---

## Complete Source Pool

All paths are absolute from `/Users/admin/Documents/Epi-Logos C Experiments/`
unless marked OLD: (which means `/Users/admin/Documents/Epi-Logos/`).

### Phase 1: S4 + S4'

**S4 (Agent Runtime — harness-agnostic, currently Pi Agent)**
| Source | Path | Lines |
|--------|------|-------|
| OLD World | OLD: `Idea/Bimba/World/S4.md` | 70 |
| OLD Seed | OLD: `Idea/Bimba/Seeds/S/S4/S4-S4-AGENT-RUNTIME-SYSTEM.md` | 1,018 |
| OLD Seed | OLD: `Idea/Bimba/Seeds/S/S4/S4-X-LEVELS-AGENT-ORCHESTRATION.md` | 786 |
| Spec | `docs/specs/S/S4-S4i-PI-AGENT.md` | 201 |
| Spec | `docs/specs/S/S4/S4-S4i-PI-SKILLS-AND-PLUGIN-SYSTEM.md` | 841 |
| Plan | `docs/plans/2026-03-06-s4-pi-agent-foundation.md` | 772 |
| Plan | `docs/plans/2026-03-07-s4-plugin-foundation-phase1-phase2.md` | 330 |
| Resource | `docs/resources/S/ta-onta-anima-superpowers-vak-integration-spec.md` | 513 |
| Resource | `docs/resources/S/2026-02-23-pi-harness-customization-reference-for-ta-onta.md` | 425 |
| Live | `.pi/extensions/ta-onta/anima/extension.ts` | 352 |
| Live | `.pi/extensions/ta-onta/anima/CONTRACT.md` | 200 |
| Deprecated | `Idea/Bimba/World/s-deprecated/S4.md` | 70 |

**S4' (Ta-Onta Extension Architecture — 6-class operational API)**
| Source | Path | Lines |
|--------|------|-------|
| OLD World | OLD: `Idea/Bimba/World/S4'.md` | 137 |
| OLD World | OLD: `Idea/Bimba/World/S4'Cx.md` | 362 |
| Spec | `docs/specs/S/S4/S4-EXTENSION-ARCHITECTURE.md` | 418 |
| Spec | `docs/specs/S/S4/S4-TA-ONTA-EXTENSION-SPEC.md` | 919 |
| Spec | `docs/specs/S/S4/S4-NOW-INTEGRATION-AND-ENVIRONMENT.md` | 683 |
| Plan | `docs/plans/2026-03-10-ta-onta-full-implementation.md` | 3,856 |
| Plan | `docs/plans/2026-03-07-s4-prime-pleroma-real-port-plan.md` | 733 |
| Plan | `docs/plans/2026-04-02-native-pi-epi-agent-convergence.md` | 619 |
| Plan | `docs/plans/2026-04-03-omx-pleroma-claw-runtime-migration.md` | 388 |
| Resource | `docs/resources/S/2026-02-24-ta-onta-us003-us010-deep-grounding-implementation.md` | 341 |
| Resource | `docs/resources/S/2026-02-25-ta-onta-full-architecture-conformance-remediation-plan.md` | 299 |
| Prompt | `docs/prompts/ta-onta-dev-session.md` | 299 |
| Live | `.pi/extensions/ta-onta/` (all 6 extension.ts + CONTRACT.md files) | ~3,000+ |
| Deprecated | `Idea/Bimba/World/s-deprecated/S4'.md` | 137 |
| Deprecated | `Idea/Bimba/World/s-deprecated/S4'Cx.md` | 362 |

### Phase 2: S0 + S0'

**S0 (Terminal / CLI / C Library)**
| Source | Path | Lines |
|--------|------|-------|
| OLD World | OLD: `Idea/Bimba/World/S0.md` | ~70 |
| OLD World | OLD: `Idea/Bimba/World/S0'Cx.md` | ~362 |
| Spec | `docs/specs/S/S0-S0i-CLI-CORE.md` | 59 |
| Spec | `docs/specs/S/S0-QV-PIPELINE-AND-PLUGIN.md` | 345 |
| Spec | `docs/specs/S/S_Series_Master_CLI_Architecture.md` | 131 |
| Plan | `docs/plans/2026-03-05-epi-cli-design.md` | 459 |
| Plan | `docs/plans/2026-03-05-epi-cli-expansion.md` | 720 |
| Plan | `docs/plans/2026-03-07-epi-logos-lib-packaging.md` | 720 |
| Plan | `docs/plans/2026-03-07-qv-pipeline-plugin.md` | 1,114 |
| Dev | `docs/dev/S0'/README.md` | 384 |
| Live | `epi-cli/src/` + `epi-lib/` | (Rust + C) |
| Deprecated | `Idea/Bimba/World/s-deprecated/S0.md` | ~70 |

**S0' (QL Type Enforcement API)**
| Source | Path | Lines |
|--------|------|-------|
| OLD World | OLD: `Idea/Bimba/World/S0'.md` | ~137 |
| Dev | `docs/dev/S0'/README.md` | 384 |
| Resource | `docs/resources/S/2026-02-28-coordinate-type-system-and-reflection-families.md` | 606 |
| Live | `.pi/extensions/ta-onta/khora/extension.ts` | 217 |
| Live | `.pi/extensions/ta-onta/khora/CONTRACT.md` | 161 |

### Phase 3: S1 + S1'

**S1 (Obsidian Vault)**
| Source | Path | Lines |
|--------|------|-------|
| OLD World | OLD: `Idea/Bimba/World/S1.md` | ~160 (BEST QUALITY) |
| Spec | `docs/specs/S/S1-S1i-OBSIDIAN.md` | 428 |
| Plan | `docs/plans/2026-03-07-s1-s2-implementation-plan.md` | 2,182 |
| Plan | `docs/plans/2026-03-10-idea-tree-and-ct-templates.md` | 134 |
| Plan | `docs/plans/2026-03-10-world-types-mirror.md` | 94 |
| Resource | `docs/resources/TO-C-Dev-REPO/MOC planning/` | (all files) |
| Resource | `docs/resources/S/2026-02-22-bimba-data-foundation-harmonization.md` | 1,664 |
| Live | `epi-cli/src/vault/` | (Rust) |

**S1' (Content API — monadological mapping)**
| Source | Path | Lines |
|--------|------|-------|
| OLD World | OLD: `Idea/Bimba/World/S1'.md` | ~416 (BEST QUALITY) |
| OLD World | OLD: `Idea/Bimba/World/S1'Cx.md` | ~196 |
| Live | `.pi/extensions/ta-onta/hen/extension.ts` | 333 |
| Live | `.pi/extensions/ta-onta/hen/CONTRACT.md` | 301 |

### Phase 4: S2 + S2'

**S2 (Neo4j Graph)**
| Source | Path | Lines |
|--------|------|-------|
| OLD World | OLD: `Idea/Bimba/World/S2.md` | ~70 |
| Spec | `docs/specs/S/S2-S2i-GRAPH.md` | 576 |
| Plan | `docs/plans/2026-03-07-s1-s2-implementation-plan.md` | 2,182 |
| Plan | `docs/plans/2026-03-08-knowing-graph-convergence-plan.md` | 336 |
| Plan | `docs/plans/2026-03-10-semantic-graph-lifecycle.md` | 175 |
| Resource | `docs/resources/S/2026-02-22-bimba-data-foundation-harmonization.md` | 1,664 |
| Superpowers | `docs/superpowers/specs/2026-04-03-gnostic-rag-anything-migration-design.md` | 247 |
| Superpowers | `docs/superpowers/specs/2026-04-04-neo4j-m-branch-coordinate-schema-population-design.md` | 453 |
| Plan | `docs/plans/2026-04-04-graphiti-unified-temporal-context-service.md` | 1,216 |
| Live | `epi-gnostic/` | (Python) |

**S2' (Graph Traversal API)**
| Source | Path | Lines |
|--------|------|-------|
| OLD World | OLD: `Idea/Bimba/World/S2'.md` | ~137 |
| OLD World | OLD: `Idea/Bimba/World/S2'Cx.md` | ~362 |
| Live | `.pi/extensions/ta-onta/pleroma/extension.ts` | 335 |
| Live | `.pi/extensions/ta-onta/pleroma/CONTRACT.md` | 139 |

### Phase 5: S3 + S3'

**S3 (Gateway)**
| Source | Path | Lines |
|--------|------|-------|
| OLD World | OLD: `Idea/Bimba/World/S3.md` | ~70 |
| Spec | `docs/specs/S/S3-S3i-GATEWAY.md` | 859 |
| Plan | `docs/plans/2026-03-07-s3-gateway-full-implementation.md` | 943 |
| Plan | `docs/plans/2026-03-10-full-gateway-functionality-plan.md` | 724 |
| Plan | `docs/plans/2026-03-07-s3-electron-verification-notes.md` | 76 |
| Dev | `docs/dev/S3/README.md` | 252 |
| Resource | `docs/resources/S/2026-02-11-omnipanel-gateway-parity-plan.md` | 409 |
| Resource | `docs/resources/S/2026-02-17-omnipanel-gateway-state-architecture-plan.md` | 263 |
| Resource | `docs/resources/S/VAK-HANDOVER.md` | 343 |
| Live | `epi-cli/src/gate/` | (Rust) |

**S3' (Gateway API)**
| Source | Path | Lines |
|--------|------|-------|
| OLD World | OLD: `Idea/Bimba/World/S3'.md` | ~137 |
| OLD World | OLD: `Idea/Bimba/World/S3'Cx.md` | ~362 |
| Live | `.pi/extensions/ta-onta/chronos/extension.ts` | 395 |
| Live | `.pi/extensions/ta-onta/chronos/CONTRACT.md` | 179 |

### Phase 6: S5 + S5'

**S5 (Integration / Sync)**
| Source | Path | Lines |
|--------|------|-------|
| OLD World | OLD: `Idea/Bimba/World/S5.md` | ~70 |
| Spec | `docs/specs/S/S5-S5i-SYNC.md` | 179 |
| Resource | `docs/resources/S/2026-02-21-epii-corpus-ingestion-plan.md` | 1,723 |
| Resource | `docs/resources/S/2026-02-21-epii-corpus-ingestion-design.md` | 330 |

**S5' (Pedagogical Crystallisation)**
| Source | Path | Lines |
|--------|------|-------|
| OLD World | OLD: `Idea/Bimba/World/S5'.md` | ~137 |
| OLD World | OLD: `Idea/Bimba/World/S5'Cx.md` | ~362 |
| Live | `.pi/extensions/ta-onta/aletheia/extension.ts` | 912 |
| Live | `.pi/extensions/ta-onta/aletheia/CONTRACT.md` | 260 |

### Cross-Cutting (all phases)

| Source | Path | Lines |
|--------|------|-------|
| Stack integration | `docs/specs/S/S-STACK-INTEGRATION.md` | 172 |
| Canonical system | `docs/resources/S/2026-02-26-epi-logos-canonical-system-plan.md` | 1,661 |
| VAK integration | `docs/resources/S/VAK-SUPERPOWERS-INTEGRATION-SPEC.md` | 2,282 |
| Type system | `docs/resources/S/2026-02-28-coordinate-type-system-and-reflection-families.md` | 606 |
| Coordinate map | OLD: `Idea/Empty/COORDINATE-MAP.md` | 309 |
| Coord semantics | OLD: `Idea/Empty/coordinate-semantics.md` | 243 |
| QL reference | `docs/resources/updated-ql-mef/epi_logos_coordinate_system.md` | 616 |
| QL cheatsheet | `docs/resources/updated-ql-mef/epi_logos_cheat_sheet.md` | 259 |

---

## Skill Cross-References

| Workflow Step | Invoke Skill | What It Does |
|---------------|-------------|-------------|
| Step 4 (Write) | `bimba-vault:world` | Creates folder + canvas + .md in Types/ |
| Step 5 (Validate) | `bimba-vault:validate` | Checks frontmatter, residency, [[wikilinks]] |
| Step 6 (Present) | — | Show file to user, WAIT for approval |
| Step 7 (Graduate) | `bimba-vault:world` | Moves .md to /World flat, canvas stays, updates links |
| Step 8 (Track) | `bimba-vault:world` | Updates MOC canvases at each hierarchy level |
| Future seeds | `bimba-vault:seeds` | When sub-coordinates need CT4a seed files |
| Neo4j work | `bimba-vault:map` | When M-coordinate graph data informs S-layers |
