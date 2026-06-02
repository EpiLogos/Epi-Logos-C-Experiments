# M0' Anuttara Foundation Surface Research Note

**Status:** research note for implementation planning
**Date:** 2026-05-22
**Scope:** [[M0']] as the foundational/ground surface in the [[M']] app. This note intentionally does not try to fully specify [[Anuttara]] itself; it defines the technical surface that can expose, route from, and return to that ground without collapsing it into renderer logic.

## Local Sources Consulted

- `Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md`
- `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md`
- `Idea/Bimba/Seeds/M/M'-PORTAL-SPEC.md`
- `Idea/Bimba/Seeds/M/M'-TAURI-PORT-SPEC.md`
- `Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md`
- `Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md`
- `Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md`
- `Idea/Bimba/Seeds/M/M4'/M4'-SPEC.md`
- `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md`
- `docs/datasets/anuttara-deep/nodes-full-data.json`
- `docs/datasets/anuttara-deep/relations.json`
- `Idea/Bimba/Seeds/M/M0'/Legacy/specs/M/M0-anuttara-language-architecture.md`
- `Idea/Bimba/Seeds/M/M0'/Legacy/plans/CLOCK-AND-NARA-SPECS/12-anuttara-m0-languification.md`
- `Body/S/S0/epi-lib/include/m0.h`
- `Body/S/S0/epi-lib/src/m0.c`
- `Body/S/S0/epi-lib/test/m0/test_m0_init.c`
- `Body/S/S0/epi-lib/test/m0/test_m0_tick12.c`
- `Body/S/S0/epi-lib/test/m0/test_m0_rodata.c`
- `Body/S/S0/epi-lib/test/m0/test_m0_rfactor.c`
- `Body/S/S0/portal-core/tests/kernel_clock_projection.rs`
- `Body/M/epi-tauri/src/services/kernelProjection.ts`
- `Body/M/epi-tauri/src/services/kernelProjection.test.ts`
- `Body/M/epi-tauri/src/services/kernelProfileObservation.ts`
- `Body/M/epi-tauri/src/services/kernelProfileObservation.test.ts`

## M0' Operational Surface Summary

[[M0']] should be built as the full Bimba graph/map subsystem: the place where the user, agent, or developer can select a coordinate and see its canonical graph identity, harmonic profile, source/spec/code/test anchors, pointer-web law, and available routes into the rest of [[M']]. It is the ground surface of the app, but it is not the whole ground itself. The surface should make [[Anuttara]] approachable as coordinate law and traceable evidence while leaving the deeper Anuttara VM/language reality in S0/S2/M5-owned sources.

The primary UI object is a selected coordinate, not a locally computed metaphysical object. For a selected node, M0' should show:

- canonical coordinate, label, designation, status, and source handles from S2 graph law;
- safe `MathemeHarmonicProfile` facts from S0/S3: tick, degree720/360, helix, pitch/ratio role, resonance72, diatonic CF/VAK projection, pointer anchor, and readiness;
- relation summaries for family, mirror, lens, inversion, VAK/CF, R-factor, cross-branch, and source/provenance edges;
- source/spec/code/test anchors, including C runtime and tests where the coordinate has executable representation;
- route buttons into M1'-M5' that preserve the same active coordinate/profile/session state.

The Anuttara dataset reinforces this shape. `nodes-full-data.json` contains 108 Anuttara nodes, with #0 as "Subsystem #0 - The Foundational Void - Proto-Logy - The Ever-Present Origin" and six top-level developments: #0-0 Transcendent Void, #0-1 Emergence of Non-Duality, #0-2 8-fold Zero-Zero, #0-3 Archetypal Number Language, #0-4 Holographic Matrix of Context, and #0-5 Siva-Shakti Unity. `relations.json` contains 1024 relations with many expressive types; M0' should not flatten these into a generic force graph. It should group relation families into usable bands: structural containment, self/meta-pattern, R-factor weaving, archetypal language, cross-branch ground, and return/completion.

The older Anuttara architecture notes are decisive about the boundary: M0 is both a coordinate domain and a depth dimension/substrate for all M1-M5. M0' should expose that duality through progressive disclosure: a public map and inspector first; deeper Anuttara language/canon paths through M5' and source-linked graph expansion second. The landing experience should feel like "ground you can stand on," not "the entire Anuttara doctrine rendered at once."

## Technical Systems / Implementation Concerns

The production implementation should treat S2 as the graph authority. The JSON datasets are research/source material and may be used to seed or validate S2, but the renderer should not ship a private copy of Anuttara topology as its own truth. A practical M0' service contract should return a selected-coordinate projection that combines:

- `node`: canonical coordinate, labels, designations, status, privacy class, and source handles;
- `relations`: typed relation descriptors grouped by provenance and purpose;
- `anchors`: source/spec/code/test/vault handles, not raw private content;
- `profile`: safe public-current `MathemeHarmonicProfile` and readiness;
- `routes`: legal M1'-M5' actions from this node;
- `blockedReasons`: missing graph node, missing profile, blocked private projection, blocked pointer law, pending dataset LUT, or review-pending evidence.

The C runtime makes clear what must not be recomputed in M0'. `m0.h` / `m0.c` define M0 as an HC-anchored, LUT-backed language/runtime ground: a 7-op Vimarsa ISA, fused `Spanda_Discriminator`, 8-fold void arithmetic, 12-fold archetypal LUT with zodiacal/MonoPoly/divine-act/virtue subtables, QL stack, Nara bridge, Siva/Shakti tables, R-factor routes, core relations, unified clock/logos helpers, VAK handlers, and an M5 Logos callback for the #5 -> #0 return. M0' may display these as source-backed facts and expose anchors into them; it should not reimplement the VM, derive codons, calculate private clocks, or invent relation semantics in TypeScript.

The existing tests point to good readiness standards. M0 C tests verify real LUT wiring, root initialization, `tick12`, R-factor route complementarity, CLI dispatch, and registry invariants. `portal-core` tests verify public kernel projection serialization, harmonic profile fields, privacy exclusion of raw bioquaternion/resonance vectors, diatonic CF/VAK projection, bedrock/pointer anchors, and chromatic/rendering invariants. Tauri service tests verify renderer consumers only become available for `safe-public-current-kernel-tick` from `portal-core::KernelProjection`, and Graphiti observation deposits omit protected fields such as `q_b`. M0' tests should follow the same pattern: real contract fixtures from S2/S0/S3 projections, privacy assertions, and no mocked metaphysical behavior.

Concretely, M0' should have three layers of implementation:

- A graph data layer that fetches canonical nodes/relations/source anchors from S2 and never guesses graph law from renderer labels.
- A profile data layer that consumes `projectKernelHarmonicConsumer`-style safe profile state and joins it to the selected coordinate by `pointerAnchor`.
- A presentation layer that renders map, inspector, readiness, and routes, with all "deep Anuttara" detail behind expandable source-backed panels.

Readiness should be explicit. A node can be graph-ready while profile-blocked; profile-ready while pointer-law-incomplete; public-current while private/protected Graphiti handles remain closed; source-traceable while implementation/tests are missing. These are not errors to hide. They are the core operational truth M0' should make visible.

## Integration Seams With M1'-M5'

**M1' relational movement:** M0' supplies the selected coordinate and legal edge set; M1' owns the walk. A route from M0' into M1' should pass coordinate, relation family, pointer descriptors, `(lens, mode)` if present, and the current profile. M0' may preview route availability, but traversal, interval-as-relation, Klein crossing, and graph-walk deposition belong to M1'.

**M2' harmonic/correspondential matrix:** M0' shows which profile and pointer-law facts are attached to a coordinate. M2' renders resonance72, elements, planetary/chakral/correspondence, and cymatic meaning at depth. M0' should expose provenance and readiness, not a local correspondence table.

**M3' clock/cosmos platform:** M0' can show tick, degree720, helix, symbolic address, and pending-LUT state as orientation around the selected node. M3' owns the clock/codon/rotation/wheel surface. If M3 fields are provisional, M0' should say so rather than backfill codon, hexagram, tarot, or planetary mappings locally.

**M4' Nara and Shell 1 ground return:** Shell 1 previews the lived return face: Nara journal, Epii pedagogy/review, and relevant M0' ground-data. The seam should be a small "ground card" or "coordinate return" projection: active coordinate, pointer summary, profile handles, and source route. It must not pull private journal bodies into M0' or canonical S2. M4' can attach public coordinate/profile handles to protected journal events; promotion from lived episode to graph fact remains an Epii/S5' review act.

**M5' IDE and Epii return:** M5' is the main deep-work seam. M0' should be the graph/source doorway into M5', while M5' is where canon, source code, tests, agent runs, review decisions, and promotion gates are edited and governed. Useful routes include: open node in M5-0' Library/Bimba Pedagogy; open source/spec in M5-1' Canon Studio; inspect C/Rust/graph service anchors in M5-2' Backend Studio; inspect map/shell UX in M5-3' Frontend Studio; dispatch/review a graph/profile/task in M5-4' Agentic Control Room; and send terms or formulations to M5-5' Logos Atelier. The `m0_bind_m5_logos` callback is the runtime analogue of this seam: completion in #5 must be able to return to #0 as renewed ground.

M0' therefore participates in both parent shell faces without being swallowed by either. Shell 0 can use selected M0' coordinate data for structural orientation over M1'-M3'. Shell 1 can use selected M0' coordinate data for lived return over M4'/M5'. The full map remains the M0' subsystem page in the 4+2 layer.

## Open Research Questions

- What is the exact S2 API shape for a selected M0' coordinate projection that joins node data, typed relations, source anchors, and pointer-law provenance without leaking private/protected graph facts?
- How should the 65 `M0_CORE_RELATIONS` in C be synchronized with or distinguished from the 1024 Anuttara dataset relations in Neo4j/S2?
- Which relation types should be first-class UI groupings in M0' v1, and which should remain expandable/developer-only until their semantics are reviewed?
- Where should the canonical `source/spec/code/test anchors` be generated: S2 graph ingestion, S1 compiler/vault index, GitNexus-style code intelligence, or an explicit M5' promotion process?
- How should Shell 1's "ground return" card decide which M0' facts are relevant to the current journal/review moment without overloading the daily-driver surface?
- What is the minimal profile field set required before M0' can claim `ready_public_current` for playable graph/audio affordance, especially while `audio_octet`, `nodal_quartet`, richer `depositionAnchor`, and M2/M3 LUT fields are still emerging?
- How much Anuttara pedagogy should live directly in M0' inspector panels versus being routed to M5-0' / M5-1' / M5-5'? The default should be restraint: M0' names and traces; M5' teaches, edits, researches, and promotes.
- Should M0' have an "Anuttara depth mode" for researchers, or should all depth transitions be explicit M5' routes to avoid turning the ground map into an unbounded doctrine browser?
