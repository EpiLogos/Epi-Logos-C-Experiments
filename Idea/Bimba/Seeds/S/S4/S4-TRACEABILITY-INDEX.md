---
coordinate: "S4"
c_4_artifact_role: "seed"
c_1_ct_type: "CT4a"
c_3_ctx_frame: "4.5/0"
c_3_created_at: "2026-04-10T19:00:00Z"
c_0_source_coordinates: ["[[S4]]", "[[S4-S4i-PI-AGENT]]", "[[S4-S4i-PI-SKILLS-AND-PLUGIN-SYSTEM]]", "[[ta-onta-anima-superpowers-vak-integration-spec]]", "[[S4-EXTENSION-ARCHITECTURE]]"]
---

# [[S4]] Traceability Index

## #4 Context

This file records the source corpus used to crystallise [[S4]] (Agent Runtime) in [S4.md](../../World/Types/Coordinates/S/S4/S4.md).

### Primary Canon

| Source | Location | Role in conclusion |
|---|---|---|
| [[S4-S4i-PI-AGENT]] | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/specs/S/S4-S4i-PI-AGENT.md` | Current formal spec; defines [[S4]] as harness-agnostic agent runtime, [[S4']] as ta-onta content |
| [[S4-S4i-PI-SKILLS-AND-PLUGIN-SYSTEM]] | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/specs/S/S4/S4-S4i-PI-SKILLS-AND-PLUGIN-SYSTEM.md` | 7-phase plugin architecture; skill/plugin packaging, manifest format, cache semantics |
| [[ta-onta-anima-superpowers-vak-integration-spec]] | `Idea/Bimba/Seeds/S/Legacy/resources/S/ta-onta-anima-superpowers-vak-integration-spec.md` | CANONICAL [[VAK]] execution language; 6 coordinate layers, agent economic tastes, CT/CF/CP/MEF alignment, Klein topology, Mobius return |
| [[2026-02-23-pi-harness-customization-reference-for-ta-onta]] | `Idea/Bimba/Seeds/S/Legacy/resources/S/2026-02-23-pi-harness-customization-reference-for-ta-onta.md` | PI harness hook seams, extension API, tool registration patterns |
| [[Anima CONTRACT]] | `.pi/extensions/ta-onta/anima/CONTRACT.md` | Architectural contract; 14-agent roster (7 Anima + 7 Aletheia), CF dispatch rules, CFP thread types, CS runtime phases, key invariants |
| [[Anima extension.ts]] | `.pi/extensions/ta-onta/anima/extension.ts` | Live implementation; VAK evaluate, anima_orchestrate, dispatch tools, agent-team/chain/subagent imports, hook wiring |

### Plans

| Source | Location | Role in conclusion |
|---|---|---|
| [[2026-03-06-s4-pi-agent-foundation]] | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-03-06-s4-pi-agent-foundation.md` | Foundation plan; PI install/doctor, extension sync, agent directories, provider/model registry |
| [[2026-03-07-s4-plugin-foundation-phase1-phase2]] | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-03-07-s4-plugin-foundation-phase1-phase2.md` | Plugin phases 1-2; manifest parser, local loading, validation CLI |
| [[2026-04-02-native-pi-epi-agent-convergence]] | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-04-02-native-pi-epi-agent-convergence.md` | PI convergence; identified invalid CLI commands in extensions, PiLaunchMode enum, agent home topology |
| [[2026-04-03-omx-pleroma-claw-runtime-migration]] | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-04-03-omx-pleroma-claw-runtime-migration.md` | Three-substrate architecture (PI → OMX → claw-rust), authority split, migration tasks |

### Cross-Cutting References

| Source | Location | Role in conclusion |
|---|---|---|
| [[S-STACK-INTEGRATION]] | `Idea/Bimba/Seeds/S/Legacy/specs/S/S-STACK-INTEGRATION.md` | Toroidal stack flow S0→S5; [[S4]] positioned at #4 (Context/Agent) |
| [[2026-02-26-epi-logos-canonical-system-plan]] | `Idea/Bimba/Seeds/S/Legacy/resources/S/2026-02-26-epi-logos-canonical-system-plan.md` | Canonical S4 = Gateway/Agent, S4' = VAK System; full module paths |
| [[VAK-SUPERPOWERS-INTEGRATION-SPEC]] | `Idea/Bimba/Seeds/S/Legacy/resources/S/VAK-SUPERPOWERS-INTEGRATION-SPEC.md` | S4-0' through S4-5' full specification; Aletheia function cluster CF codes; dis-closure modes; Constitutional Progeny Principle; Darshana pre-processor |
| [[2026-02-28-coordinate-type-system-and-reflection-families]] | `Idea/Bimba/Seeds/S/Legacy/resources/S/2026-02-28-coordinate-type-system-and-reflection-families.md` | S-family at #3 (Formal/Pattern) in foundational ordering; reflection family canonical ordering |
| [[epi_logos_coordinate_system]] | `docs/resources/updated-ql-mef/epi_logos_coordinate_system.md` | QL coordinate reference |
| [[epi_logos_cheat_sheet]] | `docs/resources/updated-ql-mef/epi_logos_cheat_sheet.md` | QL cheatsheet |
| [[COORDINATE-MAP]] | `Idea/Empty/COORDINATE-MAP.md` | Living coordinate map; S4 sub-coordinates, M-series agent mapping |

### Old Repo / Deprecated

| Source | Location | Role in conclusion |
|---|---|---|
| [[S4]] (deprecated) | `Idea/Bimba/World/s-deprecated/S4.md` | Old form; S4.0-S4.5 inner structure, M4 correspondence, S1 inversion partner |
| [[S4-S4-AGENT-RUNTIME-SYSTEM]] (OLD) | `/Users/admin/Documents/Epi-Logos/Idea/Bimba/Seeds/S/S4/S4-S4-AGENT-RUNTIME-SYSTEM.md` | OLD repo seed (1018 lines); Sanskrit stage mapping, Day execution ground, Python pseudocode. Superseded by current specs. |
| [[S4-X-LEVELS-AGENT-ORCHESTRATION]] (OLD) | `/Users/admin/Documents/Epi-Logos/Idea/Bimba/Seeds/S/S4/S4-X-LEVELS-AGENT-ORCHESTRATION.md` | OLD repo seed (786 lines); agent orchestration levels, early CF mapping. Superseded — CF(4.0/1-4.4/5) now routes to [[Anima]] not [[Psyche]]. |

### Live Code Consulted

| Source | Location | Role |
|---|---|---|
| `epi-cli/src/agent/` | Rust CLI agent module | Implementation truth: install, doctor, spawn, agents, models, auth, extensions, runtime |
| `epi-cli/src/gate/preflight.rs` | Gateway readiness probe | Shared preflight for both `epi agent` and `epi up` |
| `.pi/extensions/ta-onta/anima/S4/` | agent-team.ts, agent-chain.ts, subagent-widget.ts | CFP thread type implementation primitives |
| `.pi/extensions/ta-onta/anima/S4'/agents/` | 7 constitutional agent .md files | Agent definitions (Anima, Nous, Logos, Eros, Mythos, Psyche, Sophia, Techne) |

## #5 Integration

Key conclusions drawn for [[S4]]:

- [[S4]] is the harness-agnostic agent runtime at #4 Lemniscate — not bound to any specific LLM harness
- The [[VAK]] execution language is the canonical operational grammar of [[S4]]/[[S4']] (Anima + Pleroma + Aletheia)
- 14-agent roster is DESIGNED (7 Anima + 7 Aletheia) — [[Aletheia]] is a mode, not a subagent
- Three-layer architecture: Extension (PI-native) → Skills (portable) → Subagents (standard patterns)
- [[S4]] and [[M4]] Nara share #4 correspondence; [[S1]] is the inversion partner (#1 ↔ #4)
- OLD repo CF mapping superseded: CF(4.0/1-4.4/5) → [[Anima]] (not Psyche); [[Psyche]] is at (4.5/0)
- Ta-onta modules relocated from S3-X' to S4-X' (gateway is transport, agent orchestration is S4')

## #0 Ground

Follow-up traceability that may need deeper seeds:

- [[S4.0]] through [[S4.5]] sub-coordinate source mapping (per inner structure)
- Plugin-root packaging authority chain (specs vs plugins/pleroma/ vs _staging/)
- [[claw-rust]] native harness design docs (when created)
