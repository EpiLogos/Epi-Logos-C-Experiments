# Spec Amendment: portal-core Shared Crate

**Date:** 2026-05-12
**Amends:** 2026-05-09-epi-tauri-port-design.md (Part II, III, XII)
**Authority:** Handover brief override — "surface, don't rewrite"

---

## Decision

The mathematical modules in `epi-cli` (clock state, quaternion composition, Hopf fibration,
oracle/codon classification, rotational states, transcription chain, aspect computation,
Spanda quantization) are **canonical implementations** and MUST NOT be rewritten in epi-tauri.

Instead, a new shared crate `portal-core` extracts the pure-math types and functions from
`epi-cli` so both `epi-cli` and `epi-tauri` consume them as a single source of truth.

## Architecture

```
portal-core (Body/S/S0/portal-core/)
├── Pure types: PortalClockState, KairosState, PlanetState, OracleFaces,
│   CodonClass, ActiveCodon, PlanetaryAspect, WalkMode, WalkType
├── Quaternion math: quat_mul, quat_normalize, derive_walk_mode, derive_bifurcation
├── Spanda: spanda_invert, quantize_to_spanda_substage
├── Hopf: hopf_project, hopf_fiber, validate_quaternion_unity
├── Codon: classify_codon, wc_anticodon, codon_sequence, codon_to_amino_acid
├── Rotational: generate_rotational_states, RotationalState, pair matrix
├── Transcription: DEGREE_TO_HEXAGRAM, TranscriptionStep, walk chain, ORF extraction
├── Oracle LUTs: COMP/MOVE/RES matrices, PipDecanEntry, planet/sign/element constants
├── Aspect: compute_aspects (pure math on &mut PortalClockState)
└── State mutations: update_from_cast, update_kairos_full, update_quintessence_quaternion
    (pure math — consumers provide their own concurrency wrappers)
```

## Dependency Graph

```
portal-core  (serde only — no Arc, no Mutex, no I/O)
  ↑                        ↑
  │                        │
epi-cli                epi-tauri
(Arc<Mutex<>>)         (tokio::sync::Mutex)
(filesystem I/O)       (Tauri state management)
(Python/kerykeion)     (frontend events)
```

## What stays in epi-cli

- `SharedClockState` type alias (`Arc<Mutex<PortalClockState>>`)
- `new_shared_clock_state()` — identity loading, kairos sync, micro-orbit persistence
- All `nara` domain modules (identity, wind, transform, pratibimba, lens, medicine, logos)
- Python/kerykeion invocation (`run_kerykeion_natal`, `run_kerykeion_current`)
- Micro-orbit file persistence (`save_micro_orbit`, `load_micro_orbit`)
- TUI rendering code

## What stays in epi-tauri

- Tauri-specific `AppState` with `tokio::sync::Mutex<PortalClockState>`
- Event emission via `app.emit()`
- WebSocket gateway client
- Neo4j graph wrapper
- Frontend service clients

## Impact on Wave Structure

- **T5** becomes "Wire portal-core into epi-tauri clock module" (already retitled)
- No clock math implementation needed in epi-tauri — just import and surface
- All T15a/T15b rendering uses portal-core types directly
- epi-cli migration to portal-core can happen incrementally (not blocking epi-tauri)

## Test Coverage

portal-core ships with 32 unit tests covering all extracted modules.
