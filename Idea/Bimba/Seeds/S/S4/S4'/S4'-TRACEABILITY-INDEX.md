---
coordinate: "S4'"
c_4_artifact_role: "seed"
c_1_ct_type: "CT4a"
c_3_ctx_frame: "4.5/0"
c_3_created_at: "2026-04-10T19:00:00Z"
c_0_source_coordinates: ["[[S4']]", "[[S4-EXTENSION-ARCHITECTURE]]", "[[S4-TA-ONTA-EXTENSION-SPEC]]", "[[S4-NOW-INTEGRATION-AND-ENVIRONMENT]]", "[[ta-onta-anima-superpowers-vak-integration-spec]]"]
---

# [[S4']] Traceability Index

## #4 Context

This file records the source corpus used to crystallise [[S4']] (Ta-Onta Extension Architecture) in [S4'.md](../../World/Types/Coordinates/S/S'/S4'/S4'.md).

### Primary Canon

| Source | Location | Role in conclusion |
|---|---|---|
| [[S4-EXTENSION-ARCHITECTURE]] | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/specs/S/S4/S4-EXTENSION-ARCHITECTURE.md` | Canonical architecture spec; "Named Functions, Not Separate Systems"; 6-class model; relocation from S3-X' to S4-X' |
| [[S4-TA-ONTA-EXTENSION-SPEC]] | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/specs/S/S4/S4-TA-ONTA-EXTENSION-SPEC.md` | Full extension spec; [[Darshana]] pre-processor; dis-closure modes; collapsible state machine |
| [[S4-NOW-INTEGRATION-AND-ENVIRONMENT]] | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/specs/S/S4/S4-NOW-INTEGRATION-AND-ENVIRONMENT.md` | [[NOW]] as bounded execution identity; session-scoped Gnosis notebooks; bootstrap sequence; vault filesystem lifecycle; environment variable propagation; 1Password/varlock secrets |
| [[ta-onta-anima-superpowers-vak-integration-spec]] | `Idea/Bimba/Seeds/S/Legacy/resources/S/ta-onta-anima-superpowers-vak-integration-spec.md` | CANONICAL [[VAK]] execution language; CPF/CT/CP/CF/CFP/CS as typed transition calculus; Ouroboros/Ralph master regimes; Klein topology |
| [[VAK-SUPERPOWERS-INTEGRATION-SPEC]] | `Idea/Bimba/Seeds/S/Legacy/resources/S/VAK-SUPERPOWERS-INTEGRATION-SPEC.md` | Full S4-0' through S4-5' specification; CT template archetypes with CT4a/CT4b distinction; agent economic tastes; Aletheia function clusters with CF codes; Constitutional Progeny Principle; Rupa identity injection |

### Plans

| Source | Location | Role in conclusion |
|---|---|---|
| [[2026-03-10-ta-onta-full-implementation]] | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-03-10-ta-onta-full-implementation.md` | CANONICAL implementation plan (3856 lines); all 6 extensions phase-by-phase; hook seams; tool registrations; dependency graph |
| [[2026-03-07-s4-prime-pleroma-real-port-plan]] | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-03-07-s4-prime-pleroma-real-port-plan.md` | Pleroma real port; bounded primitives, Techne subagent, damage control |
| [[2026-04-02-native-pi-epi-agent-convergence]] | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-04-02-native-pi-epi-agent-convergence.md` | Invalid CLI command audit; vault contact must be CLI-only; agent home topology |
| [[2026-04-03-omx-pleroma-claw-runtime-migration]] | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-04-03-omx-pleroma-claw-runtime-migration.md` | Three-substrate architecture; authority split; plugins/pleroma/ as lasting authoring surface |
| [[2026-04-04-graphiti-unified-temporal-context-service]] | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-04-04-graphiti-unified-temporal-context-service.md` | Three temporal axes (calendar/astrological/spanda); decan boundary events; kairos snapshot fields; Redis NOW cache; episode data model |

### Resources

| Source | Location | Role in conclusion |
|---|---|---|
| [[2026-02-24-ta-onta-us003-us010-deep-grounding-implementation]] | `Idea/Bimba/Seeds/S/Legacy/resources/S/2026-02-24-ta-onta-us003-us010-deep-grounding-implementation.md` | Deep grounding for US003-US010 user stories |
| [[2026-02-25-ta-onta-full-architecture-conformance-remediation-plan]] | `Idea/Bimba/Seeds/S/Legacy/resources/S/2026-02-25-ta-onta-full-architecture-conformance-remediation-plan.md` | Architecture conformance remediation across all 6 extensions |
| [[ta-onta-dev-session]] | `docs/prompts/ta-onta-dev-session.md` | Developer onboarding prompt; extension structure, tool patterns, session workflow |
| [[S4-4'-GOAL-PRELUDE-SPEC]] | `Idea/Bimba/Seeds/S/S4/S4'/S4-4'-GOAL-PRELUDE-SPEC.md` | `/goal` as dialogical VAK discovery surface; NOW-bound prelude artifact; transition boundary to GoalSpec, Chronos, Aletheia, and Epii |

### Live Code — All 6 Extension Classes

| Extension | extension.ts | CONTRACT.md | Key findings |
|---|---|---|---|
| [[Khora]] (S4-0') | `.pi/extensions/ta-onta/khora/extension.ts` | `khora/CONTRACT.md` | 6 tools; bootstrap sequence; session lifecycle hooks; sync queue stub |
| [[Hen]] (S4-1') | `.pi/extensions/ta-onta/hen/extension.ts` | `hen/CONTRACT.md` | 10 tools; CT templates; 126 frontmatter keys; graph_query honest stub |
| [[Pleroma]] (S4-2') | `.pi/extensions/ta-onta/pleroma/extension.ts` | `pleroma/CONTRACT.md` | 7 primitives + 11 Techne tools; cmux surface management; themeMap |
| [[Chronos]] (S4-3') | `.pi/extensions/ta-onta/chronos/extension.ts` | `chronos/CONTRACT.md` | 10 tools (CONTRACT stale — lists only 5); kairos fetch/status; decan_check; Graphiti day arcs |
| [[Anima]] (S4-4') | `.pi/extensions/ta-onta/anima/extension.ts` | `anima/CONTRACT.md` | 8 tools; VAK evaluate; CF dispatch; CFP thread types; agent-team/chain/subagent |
| [[Aletheia]] (S4-5') | `.pi/extensions/ta-onta/aletheia/extension.ts` | `aletheia/CONTRACT.md` | 8+ tools; Gnosis pipeline; thought routing; crystallisation; SEED refresh; 6 gates |

### Pleroma Plugin Infrastructure

| Tier | Location | Role |
|---|---|---|
| Specification | `.pi/extensions/ta-onta/pleroma/` | Semantic authority — CONTRACT.md, extension.ts, S2/S2'/M |
| Executable Plugin | `plugins/pleroma/` | Claude Code plugin — plugin.json, 20+ skills, 7 agents, hooks, evals |
| Staging | `_staging/pleroma-skills/`, `_staging/pleroma-evals/`, `_staging/pleroma-hooks/` | WIP holding — atomic + orchestration skills awaiting phase integration |
| Authority Matrix | `Idea/Bimba/Seeds/S/Legacy/specs/S/S4/2026-04-03-omx-pleroma-claw-authority-matrix.md` | Formal authority assignment |
| Port Matrix | `Idea/Bimba/Seeds/S/Legacy/specs/S/S4/2026-04-03-omx-pleroma-port-matrix.md` | Skill migration tracking |
| Bundle Test | `epi-cli/tests/pleroma_bundle.rs` | Validates plugin manifest, skills, agents, hooks present |

### Chronos Kairos Sources

| Source | Location | Role |
|---|---|---|
| kairos.rs | `epi-cli/src/vault/kairos.rs` | Rust CLI: kairos_status, kairos_fetch, kairos_show; 7-planet natal via kerykeion |
| kairos-python-adapter.ts | `.pi/extensions/ta-onta/chronos/S3'/kairos-python-adapter.ts` | Three temporal modes (natal/realtime/kairotic); FR-3 compliance; KairosResult interface |
| Graphiti temporal spec | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-04-04-graphiti-unified-temporal-context-service.md` | Decan boundaries as episodic events; Redis cache; 3 temporal axes |

### Old Repo / Deprecated

| Source | Location | Role in conclusion |
|---|---|---|
| [[S4']] (deprecated) | `Idea/Bimba/World/s-deprecated/S4'.md` | Old form; originally "Moltbot Gateway" at port 18789 with S3-X' plugins |
| [[S4'Cx]] (deprecated) | `Idea/Bimba/World/s-deprecated/S4'Cx.md` | S4'Cx C-level mapping (CPF/CT/CP/CF/CFP/CS → S4.0'-S4.5'); confirmed as orthogonal projection |
| [[S4']] (OLD repo) | `/Users/admin/Documents/Epi-Logos/Idea/Bimba/World/S4'.md` | Identical to deprecated copy |
| [[S4'Cx]] (OLD repo) | `/Users/admin/Documents/Epi-Logos/Idea/Bimba/World/S4'Cx.md` | Identical to deprecated copy |

## #5 Integration

Key conclusions drawn for [[S4']]:

- [[S4']] IS the [[ta-onta]] extension package — six named functions, not separate systems
- Each extension folds its corresponding S-layer (Khora=S0, Hen=S1, Pleroma=S2, Chronos=S3, Anima=S4, Aletheia=S5)
- The [[S4'Cx]] and ta-onta mappings are orthogonal projections: C-level vertical (CPF/CT/CP/CF/CFP/CS) and S-level horizontal (Khora through Aletheia)
- Ta-onta modules relocated from S3-X' to S4-X' (canonical since C Experiments repo)
- [[Pleroma]] has a three-tier delivery architecture (specification → plugin → staging) — no duplication
- [[Chronos]] integrates [[Kairos]] via 3 temporal modes; decan boundary checking is a first-class [[Graphiti]] event
- [[Aletheia]] is a MODE of [[Sophia]]/[[Psyche]]/[[Anima]]; 7 function clusters have assigned CF codes
- [[Chronos]] CONTRACT.md tool table is stale (lists 5 tools, extension.ts registers 10)
- `kairos.rs` computes 7 planets; Graphiti spec expects 10 (mod-10). Outer planets pending.
- CT4a (integration-preview, `(4.5/0)`) was missing from initial crystallisation; now included
- `/goal` belongs first to [[S4.4']] as a NOW-bound `GoalPrelude` discovery artifact. [[Chronos]] schedules only confirmed `GoalSpec` references, while [[Aletheia]] and [[Epii]] govern disclosure, review, autoresearch, and promotion after execution material exists.

## #0 Ground

Follow-up traceability that may need deeper seeds:

- Per-extension traceability indexes (S4-0' through S4-5' individually)
- [[OneContext]] integration details (cross-session memory tracking)
- [[WebMCP]] skill suite (techne-webmcp-bridge/call/context/watch)
- Full CT template invocation spec (all 7 types with frontmatter schemas)
- Aletheia gate architecture provenance (6 gates, SKILL.md authority chain)
