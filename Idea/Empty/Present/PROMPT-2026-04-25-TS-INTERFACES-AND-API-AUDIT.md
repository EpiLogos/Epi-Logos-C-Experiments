---
coordinate: "S4'"
c_4_artifact_role: "prompt"
c_1_ct_type: "CT1"
c_3_created_at: "2026-04-25T00:00:00Z"
c_3_day_id: "25-04-2026"
c_0_source_coordinates:
  - "[[FLOW 2026 04 24 ANIMA EPII ARCHITECTURE]]"
  - "[[FLOW 2026 04 24 PI AGENT API v0.1]]"
  - "[[FLOW 2026 04 24 ORIENTATION]]"
  - "[[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]]"
  - "[[FLOW 2026 04 22 SYSTEMS RESIDENCY AND LATTICE NAMING]]"
---

# Session Prompt: TS Interfaces and API Audit

## Context

Yesterday we made three architectural decisions that are now canonical:

1. **Anima/Epii split** — two separate PI agent instances. Anima (S4') handles orchestration. Epii (S5') is the knowledge oracle and user's representative. Aletheia stays at S4-5' as UX membrane. See `[[FLOW 2026 04 24 ANIMA EPII ARCHITECTURE]]`.

2. **S3' as unified temporal runtime** — Redis (unified), Graphiti/episodic, SpacetimeDB, Kairos all live at S3'. Agents subscribe as clients. S2' is now purely the knowledge graph.

3. **PI Agent API v0.1** — 96 coordinate-typed methods across all S/S' layers. Full spec at `[[FLOW 2026 04 24 PI AGENT API v0.1]]`. This is the typed surface both agents, the CLI, and the app all use.

The orientation file is `[[FLOW 2026 04 24 ORIENTATION]]` — read it first, then the three documents above.

## Task 1: Audit the API Document

Read `Idea/Empty/Present/FLOW-2026-04-24-PI-AGENT-API-v0.1.md` critically against:

- The 115-field envelope schema (`[[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]]`) — does every field have an API method that populates it? Are there gaps?
- The S/S' residency and naming law (`[[FLOW 2026 04 22 SYSTEMS RESIDENCY AND LATTICE NAMING]]`) — do the coordinate homes match? Did any methods land at the wrong coordinate?
- The current ta-onta tool inventory (audit in `[[FLOW 2026 04 23 TRACK B PI INTEGRATION AUDIT]]`) — which existing tools map cleanly to API methods? Which are orphaned? Which API methods have no existing implementation at all?
- The Anima/Epii split (`[[FLOW 2026 04 24 ANIMA EPII ARCHITECTURE]]`) — does the API properly separate what's Anima-native vs Epii-native vs shared temporal runtime?
- The S1'Cx type-to-form system — does the `s1'.type/form/canvas` API surface correctly represent the C0-C5 manifestation cycle?
- The kbase/bkmr surface — does `s5'.kbase.*` properly cover the context pooling that feeds Psyche's lived-environs?

Produce a versioned audit document: `FLOW-2026-04-25-PI-AGENT-API-AUDIT.md` with findings, corrections, and any missing methods. Update the API spec to v0.2 inline if corrections are small, or produce a v0.2 file if they're structural.

## Task 2: Build the TS Interfaces

Using the audited API spec, produce the TypeScript interface definitions as a FLOW document: `FLOW-2026-04-25-TS-INTERFACE-DEFINITIONS.md`. This is NOT implementation code yet — it's the canonical type definitions that both Anima and Epii will import.

Organise by S/S' coordinate pair:

- `S0Types` / `S0PrimeTypes` — CLI ground
- `S1Types` / `S1PrimeTypes` — vault and compiler spine (including S1'Cx type-to-form types)
- `S2Types` / `S2PrimeTypes` — knowledge graph
- `S3Types` / `S3PrimeTypes` — temporal runtime (the largest — session, Redis, episodic, kairos, presence, events)
- `S4Types` / `S4PrimeTypes` — agent operations (VAK, team, CS, thought routing, context assembly)
- `S5Types` / `S5PrimeTypes` — knowledge oracle (Bimba, M' functions, MEF lenses, kbase, improvement, gnosis governance, pedagogy)
- `EnvelopeTypes` — the 12-layer envelope struct assembling fields from all coordinate types
- `SharedTypes` — coordinate primitives, QL types, modal structures, wire frame types

For each type module:
- Request types (method params)
- Response types (method returns)
- Event payload types (for temporal subscriptions)
- Domain model types (BimbaNode, Episode, KairosSnapshot, etc.)

Cross-reference every type against the envelope field schema — the TS interfaces ARE the typed expression of the 115 fields.

## Task 3: Assess Next Moves

With the audit and interfaces done, assess what's actually needed to start building:

- What's the minimal viable path to two PI instances connecting to the gateway?
- Which API methods already have epi-cli implementations and just need the typed wrapper?
- Which methods need new Rust code in the gateway?
- Which methods are Epii-native TS that doesn't exist yet?
- What's the first thing to build that proves the architecture works end-to-end?

Produce a prioritised next-moves list, not a full implementation plan. The goal is to identify the thinnest vertical slice that exercises: connect with agent_id → temporal subscription → one cross-agent query → one shared episodic write.

## Read Order

1. `Idea/Empty/Present/FLOW-2026-04-24-ORIENTATION.md`
2. `Idea/Empty/Present/FLOW-2026-04-24-ANIMA-EPII-ARCHITECTURE.md`
3. `Idea/Empty/Present/FLOW-2026-04-24-PI-AGENT-API-v0.1.md`
4. `Idea/Empty/Present/FLOW-2026-04-22-ENVELOPE-FIELD-SCHEMA.md`
5. `Idea/Empty/Present/FLOW-2026-04-22-SYSTEMS-RESIDENCY-AND-LATTICE-NAMING.md`
6. `Idea/Empty/Present/FLOW-2026-04-23-TRACK-B-PI-INTEGRATION-AUDIT.md`
7. `Idea/Bimba/World/Types/Coordinates/S/S'/S5'/S5'.md` (updated S5' definition)
8. `Idea/Bimba/World/Types/Coordinates/S/S'/S4'/S4'.md` (S4' with ta-onta detail)
9. `Idea/Bimba/World/S1'Cx.md` (type-to-form system)
