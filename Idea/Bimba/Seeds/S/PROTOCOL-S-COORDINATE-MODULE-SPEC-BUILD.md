---
coordinate: "S"
c_4_artifact_role: "prompt"
c_1_ct_type: "CT1"
c_3_created_at: "2026-04-25T00:00:00Z"
c_3_day_id: "25-04-2026"
c_0_source_coordinates:
  - "[[FLOW 2026 04 25 PI AGENT API AUDIT]]"
  - "[[FLOW 2026 04 25 TS INTERFACE DEFINITIONS]]"
  - "[[FLOW 2026 04 24 PI AGENT API v0.1]]"
  - "[[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]]"
  - "[[FLOW 2026 04 22 SYSTEMS RESIDENCY AND LATTICE NAMING]]"
  - "[[FLOW 2026 04 24 ANIMA EPII ARCHITECTURE]]"
---

# Protocol: S/S' Module Specification Build

## Purpose

Produce one consolidated specification file per S-level (S0 through S5) that maps each module completely — base tech (Sx) through QL augmentation (Sx') — cross-referencing API methods, envelope fields, CLI commands, TS types, old coordinate files, and current implementation state where applicable. These specs then shard into detailed sub-level build documents.

The goal is not only to list methods. The goal is to clarify the living architecture: how the old S-coordinate intuition, the current FLOW architecture, and the real codebase line up; where they disagree; and what future build work must resolve.

## Output Location

`/Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/S/`

One file per level: `S0-SPEC.md`, `S1-SPEC.md`, `S2-SPEC.md`, `S3-SPEC.md`, `S4-SPEC.md`, `S5-SPEC.md`.

At S/S' itself (above 0-5) we place the cross-cutting documents:
- The API spec: `[[FLOW 2026 04 24 PI AGENT API v0.1]]`
- The envelope schema: `[[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]]`
- The TS interfaces: `[[FLOW 2026 04 25 TS INTERFACE DEFINITIONS]]`

## Source Material

### Old files (read for reference, NOT treated as gospel)

The Epi-Logos vault has 90 S-coordinate files at:
`/Users/admin/Documents/Epi-Logos/Idea/Bimba/World/`

Per level, this includes:
- `Sx.md` — top-level base tech definition
- `Sx'.md` — top-level prime/augmentation definition
- `Sx'Cx.md` — C-family orthogonal projection (where it exists)
- `Sx-0.md` through `Sx-5.md` — base subcoordinates
- `Sx-0'.md` through `Sx-5'.md` — prime subcoordinates

The C Experiments repo also has definitions at:
`/Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/World/Types/Coordinates/S/`

These are newer but still partial. Both sets are old data used to inform the new mapping.

### Current canonical architecture (the ground truth)

These files in `/Users/admin/Documents/Epi-Logos C Experiments/Idea/Empty/Present/` define the current architecture:

| File | What it defines |
|---|---|
| `FLOW-2026-04-24-PI-AGENT-API-v0.1.md` | 96 API methods across S/S' |
| `FLOW-2026-04-22-ENVELOPE-FIELD-SCHEMA.md` | 115 fields across 12 layers |
| `FLOW-2026-04-25-TS-INTERFACE-DEFINITIONS.md` | TypeScript types for all methods and envelope |
| `FLOW-2026-04-22-SYSTEMS-RESIDENCY-AND-LATTICE-NAMING.md` | S/S' naming, residency law, decoupled domain principle |
| `FLOW-2026-04-24-ANIMA-EPII-ARCHITECTURE.md` | Two-agent split, S3' temporal runtime, S5 world-return |
| `FLOW-2026-04-25-PI-AGENT-API-AUDIT.md` | Audit findings, gaps, corrections |
| `FLOW-2026-04-24-ORIENTATION.md` | Current-state orientation |
| `FLOW-2026-04-23-TRACK-B-PI-INTEGRATION-AUDIT.md` | Ta-onta implementation audit |

### Current implementation state (read after old files and FLOW docs)

Current code state is a reality check, not the first source of ontology. For each S-level, inspect implementation only after deriving the coordinate mapping from old files and canonical FLOW documents.

Use current implementation to answer:

- What is already wired?
- What command/API names are live today?
- Which live names are pragmatic/operator names rather than final coordinate-native names?
- Which designed methods, envelope fields, or TS types are missing real backing?
- Which tests prove real functionality, and which areas are untested or only scaffolded?

Important: incomplete systems are expected. For example, the gateway's current product/runtime RPC manifest may not yet expose the final coordinate-native `s3.*`/`s3'.*` method names. That is not a reason to collapse the target API into the current implementation. The protocol should surface the split and assign the reconciliation to the proper S-level.

## Constraints

### 1. Old data supports new mapping — do not confuse

The 90 files in `/Users/admin/Documents/Epi-Logos/Idea/Bimba/World/` and the 12 files in the C Experiments `World/Types/Coordinates/S/` are **reference material**. They capture what was understood at the time they were written. The architecture has evolved since. Use them to understand the coordinate structure and subcoordinate breakdown, but do NOT treat their content as current truth. The FLOW documents in `Empty/Present/` are the current canonical architecture.

Each level pass MUST begin with the old S files for that level:

1. `Sx.md`
2. `Sx'.md`
3. `Sx'Cx.md` where it exists
4. `Sx-0.md` through `Sx-5.md`
5. `Sx-0'.md` through `Sx-5'.md`
6. C Experiments `World/Types/Coordinates/S/...` definitions for the same level

The first deliverable in the agent's own reasoning should be a correction map: which old concepts survive, which are renamed, which are re-homed, and which are obsolete.

### 2. One file per level — comprehensive, not scattered

The current S/S' files are scattered and inadequate. Each level has a top-level file, a prime file, a Cx file, and 12 subcoordinate files — but they don't cross-reference the API, the envelope, the CLI, or the TS types. They also don't reflect architectural decisions made in the FLOW documents and later spec passes: Anima/Epii split, S3' temporal runtime, Graphiti as S3' temporal episodic architecture with S5/S5' invocation governance, Gnostic/RAG-Anything as S5 world-return, and S5/S5' as the joint [[M4]] / [[M5]] enactment where [[Nara]] carries user [[Pratibimba]] / [[PASU]] evolution and [[Epii]] carries the reflective developer/user portal.

The goal is to produce ONE file per S-level that maps everything into a single coherent spec. Not to patch 15 scattered files per level.

### 3. Consolidated file THEN shard

First produce the six consolidated specs (S0-SPEC through S5-SPEC). These are the master reference. THEN, from each consolidated spec, produce the detailed sub-level specs that a build session can execute against. Do not skip to sub-level detail before the consolidated view is correct.

### 4. Wikilinks are part of the work

Use rich `[[wikilink]]` references throughout the specs. Do not link only the minimal Sx coordinates.

Each spec should link the relevant:

- S coordinates and subcoordinates: `[[Sx]]`, `[[Sx']]`, `[[Sx.y]]`, `[[Sx.y']]`
- Ta-onta modules: `[[Khora]]`, `[[Hen]]`, `[[Pleroma]]`, `[[Chronos]]`, `[[Anima]]`, `[[Aletheia]]`, `[[Epii]]`
- Constitutional / VAK terms: `[[VAK]]`, `[[CPF]]`, `[[CT]]`, `[[CP]]`, `[[CF]]`, `[[CFP]]`, `[[CS]]`, `[[Nous]]`, `[[Logos]]`, `[[Eros]]`, `[[Mythos]]`, `[[Psyche]]`, `[[Sophia]]`
- System concepts: `[[Bimba]]`, `[[Pratibimba]]`, `[[Quintessential View]]`, `[[Day]]`, `[[NOW]]`, `[[PASU]]`, `[[Kairos]]`, `[[Gnosis]]`, `[[Graphiti]]`, `[[NotebookLM]]`, `[[RAG-Anything]]`, `[[Vimarsa]]`, `[[Nara]]`, `[[M']]`
- API/envelope concepts: `[[Envelope]]`, `[[Runtime Layer]]`, `[[Coordinate Layer]]`, `[[Context Economy]]`, `[[Execution Layer]]`, `[[Episodic Layer]]`, `[[Crystallisation Layer]]`, `[[Improvement Layer]]`

The links should clarify conceptual dependency, not merely decorate text.

### 5. Current code is evidence, not destiny

Where current code is incomplete, scattered, or pragmatically named, record it as current state and assign the design correction to the relevant S-level. Do not treat current command nesting as final ontology.

Examples:

- A live `epi gate graphiti` command can be a temporary compatibility wrapper under [[S3]] while the target architecture makes [[Graphiti]] an [[S3']] temporal episodic runtime/library component; [[S5]] / [[S5']] owns Graphiti invocation, usage, search, and reflective governance.
- A live `epi vault day-init` command can be a filesystem action under [[S1]] while the temporal contract belongs to [[S3']] / [[Chronos]].
- A missing top-level command named in the FLOW docs, such as `epi kbase` or `epi gnostic`, should be recorded as a current-state/API-parity gap and resolved in the appropriate S-level spec, not silently invented.

## Per-Level Spec Structure

Each `Sx-SPEC.md` must contain:

### Preflight. Derivation Notes

Before section A, include a concise derivation/current-state section:

- **Old S-file carry-forward:** what the older Sx/Sx' files get right
- **Corrections / re-homing:** what the FLOW docs supersede
- **Current code reality:** what is live today, if this level has implementation
- **Planning consequence:** what the later shard/build docs must resolve

### A. Sx — Base Technology

- **What it is:** the objective technology at this coordinate (CLI binary, Obsidian vault, Neo4j database, gateway server, PI agent runtime, world-boundary services)
- **Services/binaries/processes:** what runs, on what port, in what language
- **API methods (Sx.*):** every API method homed here with its request/response types
- **Envelope fields populated:** which of the 116 fields this level populates
- **CLI commands:** which `epi` subcommands implement this level
- **Current implementation state:** files/modules/services that exist today; explicit note where code is absent, partial, stubbed, or intentionally future work
- **Internal 0-5 breakdown:** what each subcoordinate (Sx-0 through Sx-5) owns — informed by the old files but mapped fresh

### B. Sx' — QL Augmentation

- **What it is:** how ta-onta / the epi-logos system makes this tech carry the ontology
- **Ta-onta module:** which extension class augments this level (Khora for S0', Hen for S1', Pleroma for S2', Chronos for S3', Anima for S4', Aletheia/Epii for S5')
- **API methods (Sx'.*):** every API method homed here
- **Envelope fields populated:** which fields this augmentation layer populates
- **Sx'Cx projection:** the C-family orthogonal mapping (where applicable)
- **Current implementation state:** extension files, tools, hooks, schemas, or commands that currently embody this prime layer
- **Internal 0-5 breakdown:** what each subcoordinate (Sx-0' through Sx-5') owns

### C. Cross-References

- **Depends on:** which other S-levels this level consumes
- **Consumed by:** which other S-levels consume this level
- **Envelope layers served:** which of the 12 envelope layers this level contributes to
- **Gaps:** what is designed in the API/envelope but has no implementation

### D. Key Architectural Decisions

- Any decisions from the FLOW documents that affect this level
- Any corrections to old subcoordinate definitions
- Resolution of ambiguities (e.g. where old files disagree with current architecture)

## Execution Order

S0 → S1 → S2 → S3 → S4 → S5

Ground up. Each level can reference the ones below it.

For each level, use this working order:

1. Read old S-level files in full.
2. Read the C Experiments S-level type files.
3. Derive the subcoordinate correction map.
4. Re-read the relevant FLOW/API/envelope/TS sections.
5. Draft the consolidated spec and planning consequences.
6. Only then inspect current code state for that level.
7. Add current-state/gap notes without letting incomplete code override canonical architecture.

S0/S0' is both first and last: it is the ground command substrate now, and the return surface where all later S1-S5 decisions become executable, testable, and auditable. Therefore S0 must record present command reality, while later specs decide which command/API surfaces need to be promoted, renamed, aliased, or retired.

## Level Summary (for orientation)

| Level | Sx (Base Tech) | Sx' (QL Augmentation) |
|---|---|---|
| S0 | `epi-cli` binary, shell, CLI command tree | Khora: CLI contract, preferred-tools, bootstrap |
| S1 | Obsidian vault (`/Idea`), filesystem | Hen: compiler spine, CT templates, frontmatter law, S1'Cx type-to-form |
| S2 | Neo4j + Redis raw substrate | Coordinate-aware graph law, retrieval envelopes, cache law |
| S3 | Gateway (port 18794), SpacetimeDB | Chronos: temporal contract, Day/NOW, Kairos, Redis context, presence |
| S4 | PI agent runtime, ta-onta package | Anima: VAK, CF routing, team composition, Psyche, constitutional agents |
| S5 | World-boundary services and usage surfaces: Gnostic (RAG-Anything), Graphiti invocation/search/governance over the S3' episodic runtime, external APIs, Bimba navigation, M' functions, Nara/M4 personal operator field | Epii: gnosis governance, MEF lenses, QL evaluation, kbase, review inbox for Anima/Aletheia outputs and human validation gates, autoresearch as Epii's dynamic improvement spine |

## What This Protocol Does NOT Cover

- Implementation code — specs describe what to build, not the code itself
- Patching old World files — the consolidated specs replace them conceptually; updating the World files is a separate task
- The C, P, T, M, L coordinate families — this protocol is S/S' only
