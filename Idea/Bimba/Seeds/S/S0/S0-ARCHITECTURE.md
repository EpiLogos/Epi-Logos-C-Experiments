---
title: "S0 Terminal — Total Shape, Substrate Map, Membrane Contract, M' Dependency Map & Modularisation Findings"
coordinate: "S0 / S0'"
status: "canonical-architecture-spec"
created: 2026-06-03
authority_relation: "Domain authority for the S0 stack — the executable kernel membrane. `S0-SPEC.md` and `S0'-SPEC.md` are the canonical narrative seeds; this document supplies the load-bearing substrate map, modularisation findings, and M' dependency surface for cycle-3 architectural reconciliation. Where they disagree, the seed specs hold for prose intent; this doc is authoritative for code-grounded substrate claims and concrete refactor proposals."
depends_on:
  - "[[S0-SPEC]]"
  - "[[S0'-SPEC]]"
  - "[[S0-SHARD-INDEX]]"
  - "[[S0-HARMONIC-POINTER-WEB36-SPEC]]"
  - "[[S0-CODON-ROTATION-PROJECTION-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
  - "[[M1-2-ANANDA-VORTEX-ARCHITECTURE]]"
  - "[[wave-b-kernel-bridge-matrix]]"
related_tranches:
  - "10.x — kernel-bridge profile contract (every row consumes S0)"
  - "13-s-sprime-modularity-and-s0-membrane-cleanup (legacy m-prime track)"
  - "16-cross-cutting-closures (CL(4,2) four-scale audit, KleinFlipEvent enum, BedrockProvenanceHandle)"
  - "11-theia-shell-surface-hosting (kernel-bridge extension consumes S0)"
m_prime_consumers:
  - "Every M' surface consumes S0"
  - "Body/M/epi-theia/extensions/kernel-bridge (single typed boundary)"
  - "Body/M/epi-theia/extensions/kernel-bridge-readiness (nine-state taxonomy)"
  - "Body/M/epi-theia/extensions/m0-anuttara..m5-epii (read MathemeHarmonicProfile via bridge)"
  - "Body/M/epi-tauri (deprecated; same KernelTemporalProjection contract)"
---

# S0 Architecture — The Executable Membrane Spine

## 0. Frame

**S0 is the executable kernel membrane.** It is both first and last: first because every higher S/S' coordinate must become executable here, last because every incomplete higher-layer system eventually returns to S0 as command shape, runtime method, test harness, bootstrap surface, and audit trail ([S0-SPEC.md:27](S0-SPEC.md)). It is the deepest substrate the rest of the stack stands on — the C `.rodata` matheme bedrock, the Rust `MathemeHarmonicProfile` projection, the `epi-cli` operator surface, the `KernelBridgeRuntime` JSON edge, and the `epi-kernel-contract` parent-role typed envelope.

S0 is **not** the top-layer kernel owner. Kernel/profile bridge facts that span S0, S3, S5, and M' are jointly owned (S0-SPEC §"Canonical Source Lock", lines 561-574). S0 owns command executability, typed mirrors, approval-aware process execution, profile projection, and audit return. It does not own vault, graph, gateway, agent, or review domain law — those live in S1–S5.

This document gives the total shape: substrate map per sub-coordinate, profile-bus + kernel-bridge contracts, M' dependency map, concrete modularisation findings (with file:line scope and refactor proposals), and the boundary contracts that hold the membrane together.

**Anti-greenfield posture (binding):** `Body/S/S0/{epi-cli, portal-core, epi-lib}` and `Body/S/epi-kernel-contract` are all landed substrate. Every proposal below is phrased *consume as-is*, *audit/verify*, *extend a named field/contract*, or *refactor/modularise/cleanup with named scope*. First-build is only invoked for genuine integration blockers (klein_flip emit, ananda_vortex field, KleinFlipEvent enum) and for tightening the C/Rust FFI surface.

---

## 1. The Six Sub-Coordinates

The S0 stack realises the QL 0-5 internally as a sub-coordinate ring. Verified against the actual `Body/S/S0/` layout, the live `S0-SHARD-INDEX.md`, and the prime-side `S0'-SPEC.md` submodules table (lines 22-31):

| Sub-coord | Role | Substrate home |
|---|---|---|
| **S0-0 / S0-0'** | Bootstrap, env, preferred-tool law, `.codex` agent installation, configuration ground | `Body/S/S0/epi-cli/build.rs`, `Body/S/S0/epi-cli/.epi/`, `Body/S/S4/ta-onta/S4-0p-khora/S0'/system-select.ts`, `epi-cli/src/main.rs:128-215` runtime parse |
| **S0-1 / S0-1'** | `epi-lib` — C kernel: pointer-web, `m0.h..m5.h`, `.rodata` LUTs, `kernel.h` bioquaternion algebra | `Body/S/S0/epi-lib/include/*.h`, `Body/S/S0/epi-lib/src/*.c` (12 files, 7021 LOC), `m1.h` 853 LOC, `m3.h` 983 LOC are the largest |
| **S0-2 / S0-2'** | `portal-core` — Rust kernel: `MathemeHarmonicProfile`, `KernelProjection`, `KernelTemporalProjection`, `PersonalIdentityProfile`, codon rotation, Spanda, Hopf | `Body/S/S0/portal-core/src/*.rs` (19 files, 4472 LOC), `kernel.rs` is 1266 LOC (the matheme spine), `nara_journal.rs` is 466 LOC |
| **S0-3 / S0-3'** | `epi-cli` — CLI + TUI + portal: kernel-bridge runtime, gateway server, agent dispatch, profile/portal command, ratatui-hypertile workspace | `Body/S/S0/epi-cli/src/{main.rs, lib.rs, gate, portal, tui, agent, nara, profile, core}` — single binary `epi`, ~36 700 LOC across 100+ files |
| **S0-4 / S0-4'** | `epi-kernel-contract` — parent-role typed envelope: `KernelTickEnvelope`, `TrajectoryDeposit`, `AnuttaraDiagnostic`, `PhysicalPoleState`, `MentalPoleState` | `Body/S/epi-kernel-contract/src/*.rs` (8 files, 2184 LOC, sibling-to-S0, depends on `portal-core`) |
| **S0-5 / S0-5'** | Membrane synthesis — bootstrap return, audit, `epi up`, portal surface registry, parity manifest | `epi-cli/src/up.rs:1-328`, `portal/registry.rs:1-97`, `portal/surfaces.rs:1-1175`, `gate/parity.rs:1-750`, `tests/kernel_*` |

**Anti-greenfield note:** all six sub-coordinates are landed. The architectural work proposed below is modularisation (split monoliths), typed-surface tightening (klein_flip, ananda_vortex, KleinFlipEvent enum), and contract closure (cycle-3 ledger rows 10.x, 16.x) — not rebuild.

The bimba↔prime relation at S0:
- **S0** is the membrane outward — the substrate that exposes process, file, stream, and binary surfaces to the world.
- **S0'** is the membrane inward — the reflective contract that tells every S/S' caller *how* to address S0 without hard-coding local machine assumptions ([S0-SPEC.md:302-313](S0-SPEC.md)).

`epi-lib` (C), `portal-core` (Rust), `epi-cli` (Rust binary), and `epi-kernel-contract` (Rust shapes) together form a four-layer stack with one FFI boundary (C → Rust at `epi-cli/src/ffi/mod.rs:1-567`) and one async transport boundary (Rust → Theia at `epi-cli/src/gate/kernel_bridge_runtime.rs:1-805`).

---

## 2. Substrate Map

### 2.1 S0-1 — `epi-lib` (the C kernel substrate)

13 source files, 14 headers, total ~12 160 LOC under `Body/S/S0/epi-lib/`. The `.rodata` matheme is the deepest substrate the whole stack sits on.

| File | LOC | Role | Citation |
|---|---:|---|---|
| `include/m0.h` | 568 | M0 Anuttara — psychoid #0..#5, raw archetype constants | `Body/S/S0/epi-lib/include/m0.h:1-568` |
| `include/m1.h` | **853** | M1 Paramaśiva — 12×12 Ananda matrices, ring quaternions, Cl(4,2) basis, Spanda↔Ananda parallel-track invariant | `Body/S/S0/epi-lib/include/m1.h:551-756` (vortex spine) |
| `include/m2.h` | 642 | M2 Paraśakti — 72-name LUT, planetary keplerian velocity LUT | `Body/S/S0/epi-lib/include/m2.h:1-642` |
| `include/m3.h` | **983** | M3 Mahāmāyā — 64-codon LUT, hexagram lattice, clock_lut | `Body/S/S0/epi-lib/include/m3.h:1-983` |
| `include/m4.h` | 772 | M4 Nara — personal-identity quaternion, Vāma classifier | `Body/S/S0/epi-lib/include/m4.h:1-772` |
| `include/m5.h` | 309 | M5 Epii — review/orchestration contract | `Body/S/S0/epi-lib/include/m5.h:1-309` |
| `include/kernel.h` | 89 | bioquaternion + 12-epogdoon tick primitives | [Body/S/S0/epi-lib/include/kernel.h:1-89](Body/S/S0/epi-lib/include/kernel.h) |
| `include/pointer_web.h` | 143 | 36-fold Bedrock7→Web36→CF7 pointer ontology | `Body/S/S0/epi-lib/include/pointer_web.h:1-143` |
| `include/psychoid_numbers.h` | 135 | #0..#5 raw archetype api | `Body/S/S0/epi-lib/include/psychoid_numbers.h:1-135` |
| `include/ontology.h` | 337 | Coordinate struct, 16-fold intra-openness | `Body/S/S0/epi-lib/include/ontology.h:1-337` |
| `include/vak.h` | 106 | VAK address types (Vāk-evaluator C-side) | `Body/S/S0/epi-lib/include/vak.h:1-106` |
| `include/arena.h` | 63 | Coordinate arena allocator | `Body/S/S0/epi-lib/include/arena.h:1-63` |
| `include/engine.h` | 139 | Engine driver header | `Body/S/S0/epi-lib/include/engine.h:1-139` |
| `src/m0.c` | **831** | M0 implementation | `Body/S/S0/epi-lib/src/m0.c:1-831` |
| `src/m1.c` | 436 | M1 implementation — six 12×12 Ananda matrices nibble-packed | `Body/S/S0/epi-lib/src/m1.c:22-114` |
| `src/m2.c` | **1092** | M2 implementation — 72-axis address algebra | `Body/S/S0/epi-lib/src/m2.c:1-1092` |
| `src/m3.c` | **1042** | M3 implementation — codon/hexagram | `Body/S/S0/epi-lib/src/m3.c:1-1042` |
| `src/m3_clock_lut.c` | 749 | M3 clock LUT data | `Body/S/S0/epi-lib/src/m3_clock_lut.c:1-749` |
| `src/m4.c` | 673 | M4 implementation — personal identity | `Body/S/S0/epi-lib/src/m4.c:1-673` |
| `src/m5.c` | 309 | M5 implementation | `Body/S/S0/epi-lib/src/m5.c:1-309` |
| `src/pointer_web.c` | 387 | Pointer web algorithms | `Body/S/S0/epi-lib/src/pointer_web.c:1-387` |
| `src/psychoid_numbers.c` | 363 | Psychoid implementation | `Body/S/S0/epi-lib/src/psychoid_numbers.c:1-363` |
| `src/qv_data.c` | 212 | Quintessential View data | `Body/S/S0/epi-lib/src/qv_data.c:1-212` |
| `src/kernel.c` | 178 | bioquaternion kernel impl | `Body/S/S0/epi-lib/src/kernel.c:1-178` |
| `src/main.c` | 306 | epi-lib standalone entrypoint | `Body/S/S0/epi-lib/src/main.c:1-306` |
| `src/families.c` | 150 | Family-coordinate impl (P/S/T/M/L/C) | `Body/S/S0/epi-lib/src/families.c:1-150` |
| `src/arena.c` | 71 | Arena allocator | `Body/S/S0/epi-lib/src/arena.c:1-71` |
| `src/engine.c` | 222 | Engine driver | `Body/S/S0/epi-lib/src/engine.c:1-222` |

**Key load-bearing C surfaces:**

- **Bioquaternion + 12-epogdoon tick** ([Body/S/S0/epi-lib/include/kernel.h:37-87](Body/S/S0/epi-lib/include/kernel.h)) — the `Kernel_Tick`, `Kernel_Bioquaternion`, `Kernel_Phase`, `Kernel_Element` enum mirror exactly into `portal-core::kernel.rs:26-121`. The C struct field order is the contract; the Rust struct is bit-for-bit derivable.
- **The six 12×12 Ananda matrices** at `m1.c:22-114` — 432 bytes of `.rodata` carrying the entire M1-2 vortex. Accessor `get_ananda_harmonic(mat, row, col)` at `m1.h:60-68` is O(1) bitwise nibble extraction. *Cited and detailed in [`M1-2-ANANDA-VORTEX-ARCHITECTURE.md`](../../M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md) §2.1.*
- **Spanda↔Ananda parallel-track invariant** at `m1.h:735-756` — 6 `_Static_assert`s wire the harmonic principle into compile-time. This is the deepest C-side correctness guarantee in the whole stack.
- **`RING_QUATERNION_LUT[12]`** at `m1.h:551-564` and **`CL42_BASIS[6]`** at `m1.h:629-636` — the Cl(4,2) algebra ground (signature 4(+1)+2(-1) = +2). Cross-cutting Tranche 16 §16.4 owns the four-scale audit memo.
- **DR_RING_MAHAMAYA / DR_RING_PARASHAKTI** at `m1.c:122-123` — the two diagonal vortex tracks, 64-bit doubling vs 72-name tripling, the substrate's own streamline data.

The C side is **stable, well-documented, generated-from-CSV substrate**. The largest files (m3.h, m2.h, m0.h) carry dataset payloads that are appropriately co-located with the algorithm — splitting them would harm cache locality of LUT lookups. No C-side modularisation is proposed except the surface-tightening at §5 below.

### 2.2 S0-2 — `portal-core` (the Rust kernel substrate)

19 source files, 4472 LOC. This is the Rust mirror of the C kernel plus the matheme harmonic profile projection — the single shared spine every M' surface consumes ([wave-b-kernel-bridge-matrix.md:31](Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/wave-b-kernel-bridge-matrix.md)).

| File | LOC | Role | Citation |
|---|---:|---|---|
| `kernel.rs` | **1266** | `MathemeHarmonicProfile` + 18 projection structs + `KernelTick` + `KernelProjection` + `KernelTemporalProjection` | [Body/S/S0/portal-core/src/kernel.rs:346-465](Body/S/S0/portal-core/src/kernel.rs) — struct + `from_tick` constructor |
| `events.rs` | 522 | `KleinFlipEvent`, `MPrimePerformanceEvent`, `RelationDescriptor`, `KernelProfileObservationEvent` | `Body/S/S0/portal-core/src/events.rs:35,80` `klein_flip: bool` fields |
| `nara_journal.rs` | 466 | `NaraJournalDocument`, `NaraJournalParser`, activity/observation events | `Body/S/S0/portal-core/src/nara_journal.rs:1-466` |
| `personal_identity.rs` | 403 | `PersonalIdentityProfile`, `KerykeionNatalChart`, `PERSONAL_RESONANCE_MAJOR_THRESHOLD` | [Body/S/S0/portal-core/src/personal_identity.rs:11-75](Body/S/S0/portal-core/src/personal_identity.rs) |
| `types.rs` | 256 | shared types | `Body/S/S0/portal-core/src/types.rs:1-256` |
| `state.rs` | 231 | `update_from_cast`, `sync_kernel_projection`, `update_kairos_full` | `Body/S/S0/portal-core/src/state.rs:1-231` |
| `codon_rotation_projection.rs` | 211 | `CodonRotationProjection`, `MathemeLensMode` (84-state landscape), `CODON_ROTATION_SURFACE_COUNT=472` | `Body/S/S0/portal-core/src/codon_rotation_projection.rs:1-211` |
| `rotational.rs` | 164 | rotational state generation | `Body/S/S0/portal-core/src/rotational.rs:1-164` |
| `mahamaya.rs` | 160 | M3 codec — hexagram + nucleotide address algebra | `Body/S/S0/portal-core/src/mahamaya.rs:1-160` |
| `oracle_lut.rs` | 157 | tarot/oracle LUT | `Body/S/S0/portal-core/src/oracle_lut.rs:1-157` |
| `transcription.rs` | 150 | DNA/RNA transcription state | `Body/S/S0/portal-core/src/transcription.rs:1-150` |
| `quaternion.rs` | 119 | `Quaternion` type — the single Cl(4,2) primitive (Tranche 16 audit target) | `Body/S/S0/portal-core/src/quaternion.rs:1-119` |
| `codon.rs` | 88 | `classify_codon`, `wc_anticodon`, codon→amino acid | `Body/S/S0/portal-core/src/codon.rs:1-88` |
| `aspect.rs` | 63 | astrological aspect computation | `Body/S/S0/portal-core/src/aspect.rs:1-63` |
| `hopf.rs` | 62 | Hopf bundle: `hopf_project`, `hopf_fiber`, quaternion-unity validation | `Body/S/S0/portal-core/src/hopf.rs:1-62` |
| `vak_address.rs` | 58 | VAK address: `CfPosition`, `CpfState`, `CsField` | `Body/S/S0/portal-core/src/vak_address.rs:1-58` |
| `lib.rs` | 41 | crate root + re-export façade | [Body/S/S0/portal-core/src/lib.rs:1-41](Body/S/S0/portal-core/src/lib.rs) |
| `spanda.rs` | 41 | `quantize_to_spanda_substage`, `spanda_invert` | `Body/S/S0/portal-core/src/spanda.rs:1-41` |
| `harmonic_profile.rs` | 14 | public re-export façade for the M' contract | [Body/S/S0/portal-core/src/harmonic_profile.rs:1-14](Body/S/S0/portal-core/src/harmonic_profile.rs) |
| `parashakti/` (subdir) | ~ | Vimarsha reading: `audio_octet`, `nodal_quartet` | `Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs:1-80` |

**Key Rust load-bearing surfaces:**

- **`MathemeHarmonicProfile`** at [kernel.rs:344-387](Body/S/S0/portal-core/src/kernel.rs) — the canonical 32-field struct that braids tick, helix, position, lens-mode, resonance72, audio octet, nodal quartet, codon rotation, q_cosmic, conjugate-form character, bedrock projection, pointer anchor, context-frames, and optional s2/s3 anchors. Every M' Theia extension narrows this opaque payload to its own slice.
- **`KernelTemporalProjection`** at [kernel.rs:200-249](Body/S/S0/portal-core/src/kernel.rs) — the safe-public-current projection, owned by S3' and consumed by `epi-cli portal` and the M' clock surface. Privacy class hard-coded at `kernel.rs:217` to `"safe-public-current-kernel-tick"`.
- **`KleinFlipEvent` / `RelationDescriptor.klein_flip`** at `events.rs:35, 80` — the bool field that propagates through the relation descriptor → performance event chain.
- **`PersonalIdentityProfile`** at `personal_identity.rs:11-403` — the Kerykeion natal chart (10-planet LUT) + personal resonance scoring, **NOT** transmitted through the public profile bus (privacy class `protected-local-derived`).

### 2.3 S0-3 — `epi-cli` (the operator + runtime substrate)

The single Rust binary `epi`. Cargo manifest at [Body/S/S0/epi-cli/Cargo.toml:1-99](Body/S/S0/epi-cli/Cargo.toml). Workspace dependency edges: depends on `portal-core`, `epi-kernel-contract`, six S1/S2/S3/S5 sibling crates.

Top-level command tree at [Body/S/S0/epi-cli/src/main.rs:22-126](Body/S/S0/epi-cli/src/main.rs): 17 command families (Core, Vault, Graph, Gate, Agent, Sync, Sesh, Vimarsa, Book, Notebook, Techne, App, Up, Code, Nara, Profile, Portal). Module surface at [Body/S/S0/epi-cli/src/lib.rs:1-32](Body/S/S0/epi-cli/src/lib.rs).

Five largest sub-modules (each is a major architectural surface, not a leaf):

1. **`gate/server.rs`** — **3235 LOC** — gateway WebSocket runtime, method dispatch, session bookkeeping. *Modularisation candidate, see §5.*
2. **`core/mod.rs`** — **2485 LOC** — `epi core` coordinate-system command surface, pointer-web walk, quintessential view, knowing overlays. *Modularisation candidate.*
3. **`nara/oracle.rs`** — **2203 LOC** — oracle command implementation. *Modularisation candidate.*
4. **`tui/mod.rs`** — 1207 LOC — TUI rendering core.
5. **`portal/surfaces.rs`** — 1175 LOC — portal surface registry (the operator-facing parity manifest).
6. **`nara/medicine.rs`** — 1271 LOC — Nara medicine module.
7. **`portal/clock_state.rs`** — 1078 LOC — clock state synchronisation.

Sub-module groups by domain:

| Group | Files | LOC | Role |
|---|---:|---:|---|
| `gate/` | 48 | ~11 600 | gateway server, kernel-bridge runtime, sessions, channels, parity, secrets, wizard, S3-side adapters |
| `nara/` | 14 | ~8 200 | Nara personal-dialogical commands: clock, identity, kairos, lens, logos, medicine, oracle, pratibimba, rotational, transcription, transform, weights, wind (Kerykeion bridge) |
| `agent/` | 27 | ~5 200 | PI agent runtime, hooks, plugins, sessions, subagents, teams, roster, codex/claw runtimes |
| `portal/` | 9 | ~5 200 | ratatui-hypertile workspace, runtime state, surfaces registry, clock renderer, persist, topology |
| `tui/` | 3 | ~2 050 | TUI rendering, knowing overlay, title bar |
| `ffi/` | 7 | ~1 200 | C↔Rust FFI: HolographicCoordinate, kernel, m1, m2, nara, role_names, tagged-pointer |
| `core/` | 4 | ~2 700 | `epi core` surface, knowing/, overlay, write-gate |
| `profile/` | 1 | 506 | `epi profile show / pointer / codon / readiness` |
| top-level | 3 | 574 | lib.rs, main.rs, up.rs |
| `vault/`, `graph/`, `techne/`, etc. | various | ~5 000 | per-domain command dispatchers (S1/S2/S5 mirrors) |

**The `KernelBridgeRuntime`** at [Body/S/S0/epi-cli/src/gate/kernel_bridge_runtime.rs:1-805](Body/S/S0/epi-cli/src/gate/kernel_bridge_runtime.rs) is the load-bearing async boundary. It defines:

- `KernelBridgeSubscriber` ([kernel_bridge_runtime.rs:47-53](Body/S/S0/epi-cli/src/gate/kernel_bridge_runtime.rs)) — typed subscription, profile mode (lite/full).
- `KernelBridgeCachedProfile` (kernel_bridge_runtime.rs:55-64) — wraps `Value` (intentionally opaque per M-extension narrowing policy).
- `KernelBridgeRuntimeEvent` (kernel_bridge_runtime.rs:75-84) — four kinds: ConnectionStatus, Readiness, Profile, Observability.
- `KernelBridgeCapabilityRequest/Receipt` (kernel_bridge_runtime.rs:100-122) — dispatched through S3 gateway WebSocket, returns typed receipt with VAK context + provenance handles.
- `m1_performance_event_from_profile` at `kernel_bridge_runtime.rs:580-646` — the M1 performance-event JSON serialiser the Theia surface consumes.

**The portal surface registry** at [Body/S/S0/epi-cli/src/portal/registry.rs:1-97](Body/S/S0/epi-cli/src/portal/registry.rs) (small but architectural) and `portal/surfaces.rs:1-1175` is the operator-facing parity manifest — every gateway method, extension tool, package manifest, PI agent contract method, capability gate, and registered TUI plugin becomes inspectable here (S0-SPEC.md:133).

### 2.4 S0-4 — `epi-kernel-contract` (the parent-role typed envelope)

Sibling crate at `Body/S/epi-kernel-contract/` (NOT under `Body/S/S0/`). Depends on `portal-core`. Public surface re-exports portal-core types plus eight contract modules:

| Module | LOC | Surface |
|---|---:|---|
| `lib.rs` | 71 | re-export façade ([Body/S/epi-kernel-contract/src/lib.rs:27-71](Body/S/epi-kernel-contract/src/lib.rs)) |
| `analysis.rs` | 234 | `DominantPosition`, `PrehensiveExtractions`, `ResonanceAnalysis` |
| `constraint.rs` | 292 | `ConstraintRegistryEntry`, `ConstraintSeverity`, `ConstraintViolation`, `VerifierReport` |
| `deposit.rs` | 268 | `TrajectoryDeposit`, `TrajectoryDepositRef`, `TrajectoryElement` — graphiti episodic memory typed shape (#4.4.4.4-{anchor}) |
| `diagnostic.rs` | 402 | `AnuttaraDiagnostic`, `AnuttaraExpression`, `AnuttaraParseError` |
| `envelope.rs` | 325 | `KernelTickEnvelope`, `ENVELOPE_COORDINATE_OWNER`, `ENVELOPE_PRIVACY_CLASS` |
| `ingestion.rs` | 236 | `IngestionSession`, `IngestionStatus` |
| `poles.rs` | 356 | `PhysicalPoleState`, `MentalPoleState`, `ChakralActivation`, `CodonClockCell`, `LensWeights12`, `NaraArticulation`, `TorusPoint`, `VerifierOutcome`, `WindingNumber` |

Per [`lib.rs:1-26`](Body/S/epi-kernel-contract/src/lib.rs) — *"The crate intentionally holds shapes plus invariant constructors, not algorithm implementations. Algorithms over these shapes live in portal-core (math) and in the per-S subsystem crates."* This separation is correct and load-bearing.

### 2.5 S0-0 / S0-5 — Bootstrap and Return

- **Bootstrap (S0-0):** `Body/S/S0/epi-cli/build.rs:1-58` (C compilation), `Body/S/S0/epi-cli/.epi/` (agent installation), `Body/S/S4/ta-onta/S4-0p-khora/S0'/preferred-tools.json` and `system-select.ts` (preferred-tool law). The `.codex` and dotenv handling are routed through `gate/secrets.rs:1-119` (provider posture: env / 1password / varlock).
- **Return (S0-5):** `epi up` at `Body/S/S0/epi-cli/src/up.rs:1-328` orchestrates the full-stack bootstrap return; `portal/surfaces.rs` is the operator-facing return; `gate/parity.rs:1-750` is the parity-manifest classifier.

---

## 3. M' Dependency Map

**S0 is the universal substrate.** Every M' Theia extension consumes the same `MathemeHarmonicProfile` through the single typed `KernelBridgeAPI`. The M' shell consumed-contract closure is documented in `S0-SPEC.md:37-65` and matrix-verified in `wave-b-kernel-bridge-matrix.md:1-131`.

### 3.1 Bridge architecture

```
S0 substrate                       Async edge                    Theia consumer
─────────────────────             ─────────────────             ─────────────────────
portal-core::                                                   kernel-bridge/
  MathemeHarmonicProfile  ───>    KernelBridgeRuntime      ───> common/types.ts
  (kernel.rs:344-387)             (kernel_bridge_runtime.rs)    (M' opaque payload)
                                          ↓
                                    JSON over WebSocket
                                          ↓
epi-cli::gate::server   <───>     S3 gateway
  (3235 LOC)                      (gateway-contract crate)
```

The single Theia frontend/backend extension pair at `Body/M/epi-theia/extensions/kernel-bridge/` is the **only** consumer of S0 from M' code. No M-extension may import raw S0 clients (Track 07 T0 contract preflight enforced). All capability dispatches go through `KernelBridgeAPI.invokeCapability(request)` whose `request.method` resolves at the gateway.

### 3.2 Per-M'-surface dependency

Cross-referenced against the eight M' architecture docs and the Wave-A reconciliation matrices:

| M' surface | S0 sub-coordinate consumed | Specific contract |
|---|---|---|
| **M0' Anuttara** (`epi-theia/extensions/m0-anuttara`) | S0-2 portal-core (psychoid bedrock projection) | `MathemeBedrockProjection` at `kernel.rs:811-843`; `MathemePointerAnchorProjection` at `kernel.rs:845-886` |
| **M1' Paramaśiva** (`epi-theia/extensions/m1-paramasiva`) | S0-1 epi-lib (Ananda matrices) + S0-2 portal-core (q_cosmic, codon_rotation, klein_flip) + S0-3 epi-cli (M1 performance event) | `m1.h:71-91` matrix decls; `kernel.rs:373` `codon_rotation_projection`; `events.rs:80` `klein_flip`; `kernel_bridge_runtime.rs:588-646` `m1_performance_event_from_profile` |
| **M2' Paraśakti** (`epi-theia/extensions/m2-parashakti`) | S0-2 portal-core (`resonance72`, `audio_octet`, `nodal_quartet`) | `kernel.rs:366-368`; `MathemeResonance72Projection` at `kernel.rs:603-628`; six-axes-of-72 decoder is M2 extension work |
| **M3' Mahāmāyā** (`epi-theia/extensions/m3-mahamaya`) | S0-2 portal-core (`mahamaya` binary projection) + S0-1 epi-lib (m3.h hexagram LUT) | `kernel.rs:371-372` `binary`/`mahamaya` aliases; `MathemeBinaryProjection` at `kernel.rs:738-809`; `mahamaya.rs:1-160` codec |
| **M4' Nara** (`epi-theia/extensions/m4-nara`) | S0-2 portal-core (`personal_identity` derived but never raw) + S0-3 epi-cli/nara (Kerykeion wind, kairos, identity, oracle, medicine) | `personal_identity.rs:1-403`; `nara/wind.rs:1-277` (Kerykeion bridge); `kernel.rs:486-490` resonance attach |
| **M5' Epii** (`epi-theia/extensions/m5-epii`) | S0-4 epi-kernel-contract (`KernelTickEnvelope`, `TrajectoryDeposit`, `VerifierReport`) | `lib.rs:60-72` re-exports; `deposit.rs:1-268`; `constraint.rs:1-292` |
| **Integrated 1-2-3 Cosmic Engine** (`epi-theia/extensions/plugin-integrated-1-2-3`) | S0-2 + S0-4 (`PhysicalPoleState`) | `epi-kernel-contract/src/poles.rs:1-356` |
| **Integrated 4-5-0 Recognition** (`epi-theia/extensions/plugin-integrated-4-5-0`) | S0-2 + S0-4 (`MentalPoleState`, `VerifierOutcome`) | `epi-kernel-contract/src/poles.rs:1-356` |
| **Kernel-bridge** (extension itself) | S0-3 epi-cli runtime + S0-2 portal-core profile | `kernel_bridge_runtime.rs:1-805` |
| **Kernel-bridge-readiness** | S0-3 epi-cli (`KernelBridgeRuntimeSnapshot.readiness`) | `kernel_bridge_runtime.rs:135-149` |
| **OmniPanel shell** (`epi-theia/extensions/omnipanel-shell`) | S0-3 epi-cli (`invokeCapability`, command dispatch) | the only Theia surface (outside kernel-bridge) allowed to call invokeCapability |
| **Body-lite-surface** (shell `1`) | NOTHING (intent-only) | typed `CrossLayoutIntent` payloads; never calls `invokeCapability` |

### 3.3 Cycle-3 ledger rows touching S0

Pulled from `10-kernel-bridge-profile-contract.md` and `16-cross-cutting-closures.md`:

- **Tranche 10.2** — land `klein_flip` field on `MathemeHarmonicProfile` at `kernel.rs:344-387` and emit at `kernel_bridge_runtime.rs:615-622`. Currently CODE-PENDING.
- **Tranche 10.4** — `s2_anchor`/`s3_anchor` audit: optional `MathemeFutureAnchor` fields at `kernel.rs:384-386` currently always `None`. Decision needed: populate or remove.
- **Tranche 10.7** — Cl(4,2) four-scale audit (consolidated with M1 02.7 + M3 04.7).
- **Tranche 10.8** — `depositionAnchor`: typed field vs bridge-synthesized DTO (DR-KB-2).
- **Tranche 10.9** — planetary projection LUT cardinality (DR-KB-1).
- **Tranche 10.10** — `ananda_vortex: AnandaVortexProjection` field land on `MathemeHarmonicProfile` (M1-2 vortex window).
- **Tranche 16.x cross-cutting** — `KleinFlipEvent` enum exhaustive variants (`M1TritoneCrossing`, `M2CymaticValenceInvert`, `M3CodonRotationCross`) at `events.rs`; `BedrockProvenanceHandle` field on the profile.
- **Tranche 13-s-sprime-modularity-and-s0-membrane-cleanup** (legacy m-prime track) — names the S0 monolith/membrane cleanup directly.

---

## 4. Contract Surface

### 4.1 What S0 exposes outward (the membrane contract)

S0's outward membrane has four canonical surfaces:

1. **The `epi` binary** (S0-1' command law) — typed CLI: `epi core`, `epi vault`, `epi graph`, `epi gate`, `epi agent`, `epi nara`, `epi portal`, `epi profile`, `epi up`, etc. ([main.rs:22-126](Body/S/S0/epi-cli/src/main.rs))
2. **The `KernelBridgeRuntime` JSON edge** (S0-3' transport) — `KernelBridgeRuntimeEvent` variants, `KernelBridgeCapabilityRequest/Receipt` ([kernel_bridge_runtime.rs:75-122](Body/S/S0/epi-cli/src/gate/kernel_bridge_runtime.rs))
3. **The gateway WebSocket method namespace** (S0-3' transport over S3) — `METHOD_NAMES`, `EVENT_NAMES` re-exported from `epi-s3-gateway-contract` ([gate/parity.rs:1-5](Body/S/S0/epi-cli/src/gate/parity.rs))
4. **The S0-4 typed parent-role contract** — `KernelTickEnvelope`, `TrajectoryDeposit`, `AnuttaraDiagnostic`, `PhysicalPoleState`, `MentalPoleState` (re-exported from `portal-core` via `epi-kernel-contract`)

### 4.2 What S0 exposes inward (between sub-coordinates)

- **C → Rust FFI** at `Body/S/S0/epi-cli/src/ffi/mod.rs:1-567`: `HolographicCoordinate`, `HcBedrockRef`, `HcBedrockWeb7`, `HcPointerRef`, `HcPointerWeb36`, kernel/m1/m2/nara/role_names/tagged-pointer wrappers.
- **portal-core → epi-cli**: via crate dependency at `epi-cli/Cargo.toml:46`. Re-export pattern: `epi-cli/src/lib.rs:1-32` does not re-export portal-core; consumers `use portal_core::...` directly.
- **portal-core → epi-kernel-contract**: re-export façade at `epi-kernel-contract/src/lib.rs:27-50` lifts ~60 portal-core types into the parent-role namespace.

### 4.3 What should be exposed but isn't — the load-bearing gaps

| Gap | Location | Tranche | Impact |
|---|---|---|---|
| `klein_flip: bool` field on `MathemeHarmonicProfile` | `kernel.rs:344-387` | 10.2 | Personal scale Klein flip can't propagate to M' surfaces; M1 performance bridge emits it as opaque payload |
| `ananda_vortex: AnandaVortexProjection` field | `kernel.rs:344-387` | 10.10 | M1-2 vortex renderer must re-derive from raw `tick12 + position6 + helix + lens_mode` (violates "windows onto writes" pattern) |
| `bedrock_link: BedrockProvenanceHandle` field | `kernel.rs:344-387` | 16.x | Readiness ledger can't render bedrock_link inline without re-deriving |
| `pattern_packet_handle: PatternPacketHandle` field | `kernel.rs:344-387` + `nara_journal.rs` | 16.x | M4/M5 + Integrated 4-5-0 surfaces can't address NaraPatternPacket uniformly |
| `s2_anchor`/`s3_anchor` populator | `kernel.rs:384-386` | 10.4 | Optional fields always `None` — pending decision |
| `KleinFlipEvent` exhaustive enum variants | `events.rs` | 16.x | Currently only `bool` on `RelationDescriptor`; need `M1TritoneCrossing`/`M2CymaticValenceInvert`/`M3CodonRotationCross` for exhaustive match at bridge subscribers |
| Tuning-aware MIDI/MPE/MTS-ESP audio bridge types | not present | M2 3.7 (out of S0 scope but flagged) | M2 surface consumes audio_octet but no tuning carrier yet |
| `MathemeHarmonicProfileBoundary` per-extension narrowing types | `Body/M/epi-theia/extensions/.../profile.ts` | Mn extension tranches | Currently `payload: Record<string, unknown>` (opaque by policy); narrowing is M-extension owned, not S0 |
| Tarot minor/shadow LUTs | `kernel.rs:794-795` `tarot_minor_id` always `None`, `amino_acid_code: None` | M3 dataset closure | Out of S0 scope; bridge transports opaque |

---

## 5. Code Cleanup + Modularisation Findings

The findings below are concrete and prioritised. Each names the file, current shape, proposed refactor, benefit, and blast radius (risk to M' consumers).

### 5.1 [HIGH-PRIORITY] Split `epi-cli/src/gate/server.rs` (3235 LOC monolith)

**Current shape:** Single file at `Body/S/S0/epi-cli/src/gate/server.rs` housing the gateway WebSocket runtime, method dispatch, session bookkeeping, response framing, and integration glue across 48 sibling `gate/*` modules.

**Proposed refactor:**
- `gate/server/mod.rs` — public surface, server bootstrap (≤300 LOC)
- `gate/server/dispatch.rs` — method routing table (the giant `match method.as_str()` block)
- `gate/server/websocket.rs` — connection lifecycle, frame handling
- `gate/server/method_envelope.rs` — request/response envelope construction
- `gate/server/subscription.rs` — subscription fan-out (currently inline)
- `gate/server/observability.rs` — metric and audit emit

**Benefit:** brings the largest file in `epi-cli` under 500 LOC per unit; isolates the dispatch table (the most-edited code path) from connection-handling; makes future per-method contract tests addressable.

**Blast radius:** LOW — file boundary is internal to `gate/` module; no external consumer (Theia or otherwise) imports specific items. Verify: `cargo check -p epi-cli && cargo test -p epi-cli --tests gate_*` passes.

### 5.2 [HIGH-PRIORITY] Split `epi-cli/src/core/mod.rs` (2485 LOC)

**Current shape:** Single `mod.rs` for the entire `epi core` coordinate-system command surface — pointer-web walk, quintessential view, knowing overlays, help dispatch.

**Proposed refactor:**
- `core/mod.rs` — `CoreCmd` enum + `dispatch` (≤200 LOC)
- `core/pointer_web.rs` — pointer-web traversal commands
- `core/walk.rs` — coordinate walk
- `core/quintessential_view.rs` — QV command
- `core/help.rs` — `help_dispatch` (currently `core::help_dispatch` at `main.rs:211`)
- `core/knowing/` already exists as subdir — extract overlay tie-ins here

**Benefit:** the `epi core` surface is the primary teaching/operator surface for the coordinate system; splitting it makes the coordinate-grammar code addressable without sifting through 2500 lines.

**Blast radius:** LOW — `main.rs:134-137,211` calls `core::dispatch` and `core::help_dispatch`; both can remain at `core/mod.rs`.

### 5.3 [HIGH-PRIORITY] Split `portal-core/src/kernel.rs` (1266 LOC)

**Current shape:** Single file housing 21 projection structs (`MathemeHarmonicProfile` + 20 sub-projections), `KernelTick`, `KernelProjection`, `KernelTemporalProjection`, `KernelResonanceObservation`, plus 12 free functions.

**Proposed refactor:**
- `kernel/mod.rs` — re-export façade (≤80 LOC)
- `kernel/tick.rs` — `KernelTick`, `KernelPhase`, `KernelElement`, `HarmonicPulse`, `kernel_tick_from_epogdoon`
- `kernel/projection.rs` — `KernelProjection`, `BioQuaternionState`, `EnergyDecomposition`, `ResonanceVector72`
- `kernel/temporal.rs` — `KernelTemporalProjection`, `KernelTemporalTick`, `KernelTemporalPulse`, `KernelTemporalEnergy`
- `kernel/profile.rs` — `MathemeHarmonicProfile`, `MathemeProfileProvenance`, `MathemeProfileCompatibility`, `MathemeTickAddress`, `MathemeFutureAnchor`
- `kernel/projections/{chromatic,diatonic,elemental,planetary_chakral,binary,bedrock,pointer_anchor,context_frame_web,resonance72}.rs` — one file per `Matheme*Projection`
- `kernel/observation.rs` — `KernelResonanceObservation`, `kernel_resonance_index`, `tritone_square_for_lens`, `kernel_resonance_square_emphasis`, `kernel_energy_evaluate`
- `kernel/atoms.rs` — note-name, pitch-class, mirror-square helpers

**Benefit:** the existing `harmonic_profile.rs` façade ([Body/S/S0/portal-core/src/harmonic_profile.rs:1-14](Body/S/S0/portal-core/src/harmonic_profile.rs)) already signals intent ("the contract is being split out incrementally"); this is the named completion. Each `Matheme*Projection` becomes locatable. Test surface per-projection becomes possible.

**Blast radius:** MEDIUM — all M' Theia surfaces consume `MathemeHarmonicProfile` via JSON, not via Rust import; but `epi-cli`, `epi-tauri`, and `epi-kernel-contract` import portal-core types directly. The `lib.rs:21-41` re-export façade (`pub use kernel::*`) preserves the public surface; refactor is module-internal. Verify: `cargo check -p portal-core -p epi-cli -p epi-kernel-contract && cargo test -p portal-core`.

### 5.4 [MEDIUM-PRIORITY] Split `epi-cli/src/nara/oracle.rs` (2203 LOC) and `nara/medicine.rs` (1271 LOC)

**Current shape:** `oracle.rs` and `medicine.rs` are the largest leaf files in the `nara/` group; together with `lens.rs` (744), `identity.rs` (726), `mod.rs` (625), `weights.rs` (444), `kairos.rs` (387), `transcription.rs` (316), `rotational.rs` (299), `wind.rs` (277), `transform.rs` (275), `pratibimba.rs` (241), `logos.rs` (229), `clock.rs` (106) the `nara/` directory is 8200 LOC.

**Proposed refactor (oracle.rs):**
- `nara/oracle/mod.rs` — `OracleCmd` enum + dispatch
- `nara/oracle/draw.rs` — card draw + interpretation
- `nara/oracle/payload.rs` — typed oracle payload (currently `nara_oracle_payload.rs` test exists)
- `nara/oracle/cycle.rs` — multi-draw cycle
- `nara/oracle/render.rs` — TUI render

**Proposed refactor (medicine.rs):**
- `nara/medicine/mod.rs` — `MedicineCmd` enum + dispatch
- `nara/medicine/lookup.rs` — symbol → medicine lookup
- `nara/medicine/render.rs`
- `nara/medicine/contract.rs` — typed contract

**Benefit:** the Nara surface is the most user-facing single-binary command — addressability of medicine/oracle code paths matters for end-user trust.

**Blast radius:** LOW — internal to `nara/`. `epi nara medicine`/`epi nara oracle` CLI surface unchanged.

### 5.5 [MEDIUM-PRIORITY] Tighten the C↔Rust FFI surface

**Current shape:** `Body/S/S0/epi-cli/src/ffi/mod.rs:1-567` exposes raw `repr(C)` mirrors with `*mut HolographicCoordinate` raw pointers and `unsafe extern "C" fn` invocation callbacks. The Rust side has no opaque-handle abstraction; consumers (`epi-cli/src/core/*.rs`) hold raw pointers across logical scope boundaries.

**Proposed refactor:**
- Introduce `ffi::EpiLib` opaque handle ([Body/S/S0/epi-cli/src/ffi/mod.rs](Body/S/S0/epi-cli/src/ffi/mod.rs) already has this at `EpiLib::new()`; expand its method surface)
- Convert `*mut HolographicCoordinate` into `CoordHandle(NonZeroU64)` indexed through the `EpiLib`'s internal arena
- Force all C-arena access through the handle — eliminates raw pointer escape
- Add `#[deny(clippy::missing_safety_doc)]` to `ffi/` and document every `unsafe extern "C" fn`
- Land the existing `ffi_role_name_contract.rs` test pattern across `ffi/m1.rs`, `ffi/m2.rs`, `ffi/nara.rs`, `ffi/kernel.rs`

**Benefit:** the C kernel is `.rodata`-stable; the FFI surface is the most common source of soundness bugs. Opaque handles eliminate use-after-free and double-free at compile time.

**Blast radius:** MEDIUM — `core/mod.rs:2485 LOC` and `portal/mod.rs` are the heaviest FFI consumers; refactor must preserve `EpiLib::new()` → `CoreCmd` dispatch flow. Verify: `cargo test -p epi-cli --test ffi_*`.

### 5.6 [MEDIUM-PRIORITY] Tighten the kernel-bridge JSON edge

**Current shape:** `Body/S/S0/epi-cli/src/gate/kernel_bridge_runtime.rs:580-646` `m1_performance_event_from_profile` builds JSON from `MathemeHarmonicProfile` using `serde_json::json!` macros. `KernelBridgeCachedProfile.profile: Value` ([kernel_bridge_runtime.rs:55-64](Body/S/S0/epi-cli/src/gate/kernel_bridge_runtime.rs)) is intentionally opaque per M-extension policy.

**Proposed refactor:**
- Add typed `KernelBridgeProfileJsonShape` struct (separate from `MathemeHarmonicProfile`) that names every JSON-emitted field
- Use `From<&MathemeHarmonicProfile>` impl as the single serialiser
- Migrate `m1_performance_event_from_profile` to emit `KernelBridgePerformanceEventJsonShape` typed shape
- Land `klein_flip` field at `kernel.rs:344-387` and emit at the serialiser (closes Tranche 10.2)
- Add `KleinFlipEvent` enum (3 variants) at `events.rs` (closes Tranche 16.x KleinFlipEvent row)
- Add `BedrockProvenanceHandle` field (closes Tranche 16.x bedrock_link row)

**Benefit:** the bridge is the only S0↔M' contract surface; typed JSON shapes give contract-tests something to assert against beyond opaque `Value`. The `Body/S/S0/epi-cli/tests/kernel_bridge_runtime_contract.rs` test already exists — give it a typed surface to verify.

**Blast radius:** MEDIUM — the JSON shape is consumed by every M' Theia extension. Migration must be additive (add fields, never remove). Verify: `cargo test -p epi-cli --test kernel_bridge_runtime_contract` + Theia side `pnpm test --filter=@epi/kernel-bridge-tests`.

### 5.7 [MEDIUM-PRIORITY] Split `portal-core/src/events.rs` (522 LOC)

**Current shape:** Single file with `KleinFlipEvent`, `RelationDescriptor`, `MPrimePerformanceEvent`, `KernelProfileObservationEvent`, `PersonalResonanceObservationEvent`, `NaraActivityEvent`, `NaraSymbolicObservation`, `NaraObservationKind`, `NaraEmotionalValenceHint`, `ActivityStateEffect`, `EventPrivacyClass`, `RelationFamily`.

**Proposed refactor:**
- `events/mod.rs` — re-export façade
- `events/klein_flip.rs` — `KleinFlipEvent` (currently bool; should be 3-variant enum per Tranche 16.x)
- `events/relation.rs` — `RelationDescriptor`, `RelationFamily`
- `events/performance.rs` — `MPrimePerformanceEvent`
- `events/observation.rs` — `KernelProfileObservationEvent`, `PersonalResonanceObservationEvent`
- `events/nara.rs` — `NaraActivityEvent`, `NaraSymbolicObservation`, `NaraObservationKind`, `NaraEmotionalValenceHint`, `ActivityStateEffect`
- `events/privacy.rs` — `EventPrivacyClass`

**Benefit:** each event family has its own privacy class, lifecycle, and consumer set; splitting makes those policies addressable per-file.

**Blast radius:** LOW — `lib.rs:25` already uses `pub use events::*`. Re-export façade preserves public surface.

### 5.8 [LOW-PRIORITY] Consolidate `portal-core` LUT files

**Current shape:** `oracle_lut.rs` (157), `mahamaya.rs` (160), `transcription.rs` (150), `rotational.rs` (164) are leaf LUT files. Codon and amino-acid LUTs are in `codon.rs`. Planet velocity LUT is inline in `personal_identity.rs:11-15`.

**Proposed refactor:**
- `portal-core/src/luts/` subdir
- `luts/codon.rs`, `luts/oracle.rs`, `luts/mahamaya.rs`, `luts/transcription.rs`, `luts/rotational.rs`, `luts/planet_keplerian.rs`
- Extract `PLANET_KEPLERIAN_VELOCITY` from `personal_identity.rs:13-15` to `luts/planet_keplerian.rs` (mirrors the C-side LUT in `m2.h`)

**Benefit:** LUT data is conceptually distinct from algorithm — co-location aids discoverability and makes LUT-regeneration scripts (`Body/S/S0/epi-lib/scripts/gen_*.py`) match Rust-side layout.

**Blast radius:** LOW — internal reorganisation only.

### 5.9 [LOW-PRIORITY] Workspace organisation: promote `epi-kernel-contract` clarity

**Current shape:** `epi-kernel-contract` lives at `Body/S/epi-kernel-contract/` (sibling-to-S0). Its `Cargo.toml:13` depends on `portal-core = { path = "../S0/portal-core" }`. The crate re-exports ~60 portal-core types via `lib.rs:27-50`.

**Proposed refactor:**
- Document the cross-coordinate dependency explicitly in `epi-kernel-contract/README.md` (currently undocumented; the crate lives "above" S0 in the contract sense but "beside" it in the filesystem)
- Audit re-export façade: 60 types is large; split into `contract::shapes`, `contract::projections`, `contract::events` to mirror portal-core organisation

**Benefit:** the crate's positional ambiguity ("sibling-to-S0, parent-role across S") is currently invisible; explicit documentation closes the gap.

**Blast radius:** LOW — documentation + module organisation only.

### 5.10 [LOW-PRIORITY] Tighten `KernelBridgeCachedProfile.profile: Value` policy

**Current shape:** [`kernel_bridge_runtime.rs:55-64`](Body/S/S0/epi-cli/src/gate/kernel_bridge_runtime.rs) uses `Value` (opaque JSON) by intentional policy per [`Body/M/epi-theia/extensions/kernel-bridge/.../profile.ts:9-11`](Body/M/epi-theia/extensions/kernel-bridge) comment.

**Proposed action:** leave as-is — policy correct (per matrix `wave-b-kernel-bridge-matrix.md:71`). Record finding: this is *not* a refactor target; per-extension narrowing is owned by M-extension tranches (M1/M2/M3/M4/M5 surface tranches in Waves A).

### 5.11 Test coverage gaps

Inventory of S0 test files at `Body/S/S0/epi-cli/tests/` (~70 files) shows strong gateway/agent/nara coverage. Gaps:

- **`gate/server.rs` per-method dispatch** — no per-method contract test exists for the 3235-LOC dispatch table. After §5.1 split, each method should land a `gate_server_method_<name>.rs` contract test.
- **`core/` knowing overlay** — only `core_knowing.rs` exists; the 2485-LOC `core/mod.rs` has thin coverage of `epi core` walk/pointer-web traversal.
- **Round-trip JSON schema test for `MathemeHarmonicProfile`** — no test asserts that `serde_json::to_string` → `serde_json::from_str` is identity (important for cross-language Theia consumers).
- **`KernelBridgeRuntime` lifecycle** — `kernel_bridge_runtime_contract.rs` exists but does not exercise the full subscribe → replay → fan-out → unsubscribe path.

---

## 6. Boundary Contracts

### 6.1 What S0 produces (outbound)

| Producer | Consumer | Contract |
|---|---|---|
| `portal-core::KernelTick` | every M' surface (via bridge) | `kernel.rs:113-121` |
| `portal-core::MathemeHarmonicProfile` | every M' surface | `kernel.rs:344-387` (32 fields) |
| `portal-core::KernelTemporalProjection` | `epi-cli portal`, M' clock surface | `kernel.rs:200-249` privacy `safe-public-current-kernel-tick` |
| `portal-core::PersonalIdentityProfile` | `epi-cli/src/nara/identity.rs`, M4 surface (via bridge, with `personal_identity` projection narrowed) | `personal_identity.rs:1-403` privacy `protected-local-derived` |
| `epi-kernel-contract::KernelTickEnvelope` | S5 review, S4 verifier | `epi-kernel-contract/src/envelope.rs:1-325` |
| `epi-kernel-contract::TrajectoryDeposit` | graphiti episodic memory (#4.4.4.4-{anchor}) | `epi-kernel-contract/src/deposit.rs:1-268` |
| `epi-kernel-contract::AnuttaraDiagnostic` | M0' verifier surface | `epi-kernel-contract/src/diagnostic.rs:1-402` |
| `epi-kernel-contract::PhysicalPoleState` | Integrated 1-2-3 plugin | `epi-kernel-contract/src/poles.rs:1-356` |
| `epi-kernel-contract::MentalPoleState` | Integrated 4-5-0 plugin | `epi-kernel-contract/src/poles.rs:1-356` |
| `epi-cli` METHOD_NAMES (via gateway-contract) | every M-extension via `invokeCapability` | `epi-cli/src/gate/parity.rs:1-5` |

### 6.2 What S0 consumes (inbound)

S0 has no S-level upstream dependency ([S0-SPEC.md:445](S0-SPEC.md)) — it is the ground. But it does consume:

- **OS shell/process APIs** (libc, std::process)
- **Khora preferred-tools contract** at `Body/S/S4/ta-onta/S4-0p-khora/S0'/preferred-tools.json` (S4 owns the tool-law authority, S0 invokes it)
- **Workspace cargo deps**: S1 hen-compiler, S2 graph-schema/graph-services, S3 gateway/gateway-contract/graphiti-runtime/redis-context, S5 kbase-core/epii-review-core/epii-autoresearch-core/epii-agent-core ([epi-cli/Cargo.toml:46-58](Body/S/S0/epi-cli/Cargo.toml))
- **External Rust crates**: clap, ratatui, ratatui-hypertile, crossterm, tokio, neo4rs, redis, reqwest, blake3, sha2, argon2, chacha20poly1305

The membrane character is: S0 hosts the operator command surface for S1-S5, but each Sn crate owns its own service law. S0's cargo edges to S1-S5 crates are *thin dispatch layers*, not domain re-implementations.

### 6.3 The `S0' surface registry` contract

The portal surface registry at `Body/S/S0/epi-cli/src/portal/registry.rs:1-97` + `portal/surfaces.rs:1-1175` (per S0-SPEC §"Portal clarification" line 133) is the operator-facing **parity manifest**: every gateway method + extension tool + package manifest + PI agent contract + capability gate + registered TUI plugin becomes inspectable. This is S0' authority — the reflective contract over S0's executable surface. M-extensions, future desktop/Tauri mirror, and the CLI all should consume this registry rather than maintaining parallel settings models.

---

## 7. Theia Integration Points

Per `S0-SPEC.md:39-58` and `wave-b-kernel-bridge-matrix.md:7-23`, the M'-Theia shell consumes S0 through exactly four typed surfaces:

| Theia surface | S0 home | Contract |
|---|---|---|
| `KernelBridgeAPI.cachedProfile` / `onProfile` | `portal-core::MathemeHarmonicProfile` (cached at bridge) | typed mirror `Body/M/epi-theia/extensions/kernel-bridge/src/common/types.ts:1-210`; payload boundary kept opaque per policy |
| `kernel-bridge-readiness` extension + 9-state taxonomy | `KernelBridgeRuntime::readiness_event` ([kernel_bridge_runtime.rs:135-149](Body/S/S0/epi-cli/src/gate/kernel_bridge_runtime.rs)) | states: `bridge_unavailable`, `profile_missing_field`, `s2_graph_blocked`, `s3_subscription_blocked`, `s5_review_blocked`, `authority_payload_missing`, `privacy_blocked`, `degraded_but_readable`, `ready_public_current` |
| `KernelBridgeAPI.invokeCapability` → `KernelBridgeCapabilityReceipt` | S0 methods reached via `request.method` through gateway WebSocket | `kernel_bridge_runtime.rs:100-122` |
| `KernelBridgeAPI.connectionStatus` / `onConnectionChange` | `kernel-bridge-backend-service::notifyConnectionStatus` over `EPI_GATEWAY_URL` | `kernel_bridge_runtime.rs:124-133` |

### 7.1 Additional bridge methods + contract types needed

To close cycle-3 ledger:

1. **`klein_flip: boolean` on `KernelBridgePerformanceEvent`** (mirrors `events.rs:80` + closes Tranche 10.2). Add to `Body/M/epi-theia/extensions/kernel-bridge/src/common/types.ts` after S0 emit lands.
2. **`anandaVortex: AnandaVortexProjection`** typed shape (Tranche 10.10). Mirrors S0 field; consumed by M1-2 played-torus renderer (DR-M1-2 ratified, Bevy/wgpu extension).
3. **`bedrockLink: BedrockProvenanceHandle`** typed shape (Tranche 16.x). Required by readiness ledger inline-render discipline (Tranche 15.6 provenance discipline).
4. **`patternPacketHandle: PatternPacketHandle`** typed shape (Tranche 16.x). Required across M4-Nara, M5-Epii, Integrated 4-5-0 plugin.
5. **`KleinFlipEvent` discriminated union (3 variants)** — `M1TritoneCrossing | M2CymaticValenceInvert | M3CodonRotationCross`. Required for exhaustive `switch` at bridge subscribers (Tranche 16.x).
6. **`depositionAnchor`** typed surface — DR-KB-2 decides whether it's a typed `MathemeHarmonicProfile` field or a bridge-synthesized DTO. Currently synthesized at `kernel_bridge_runtime.rs:625-631`.

### 7.2 The `OmniPanel ↔ S0` boundary

`Body/M/epi-theia/extensions/omnipanel-shell` (per S0-SPEC §"Shell 1 flow-input vs / operator/debug separation", lines 56-60) is the **only** Theia surface (outside kernel-bridge itself) allowed to call `invokeCapability`. It owns command catalog, capability invocation, deep-link routing, debug/observability commands. `body-lite-surface` (shell `1`) is intent-only: routes typed `CrossLayoutIntent` payloads, never reads raw gateway streams, never calls invokeCapability. The privacy-class scan at `body-lite-surface.test.mjs` (29/29 passing as of 2026-06-02) is the negative-test floor that prevents operator/debug payload classes masquerading as Nara flow artifacts.

---

## 8. Anti-Greenfield Audit

| Status | Items |
|---|---|
| **LANDED, consume as-is** | All four crates (epi-lib, portal-core, epi-cli, epi-kernel-contract). The `MathemeHarmonicProfile` struct and its 21 projection sub-structs. The C-side `m0.h..m5.h` headers and `.rodata` LUTs. The Khora preferred-tools contract. The kernel-bridge runtime + Theia extension pair. The 9-state readiness taxonomy. The 70+ test files at `epi-cli/tests/`. |
| **LANDED, audit/verify** | The Cl(4,2) four-scale audit (Tranche 16.4) — `Body/S/S0/portal-core/src/quaternion.rs:1-119` is the single primitive but the audit memo at `plan.runs/cct-8-cl42-four-scale-audit.md` needs writing. The `s2_anchor`/`s3_anchor` populator decision (Tranche 10.4) — optional fields currently always `None`. The portal surface registry parity manifest. |
| **LANDED, extend a named field** | `klein_flip` field on `MathemeHarmonicProfile` (Tranche 10.2). `ananda_vortex` projection field (Tranche 10.10). `BedrockProvenanceHandle` field (Tranche 16.x). `PatternPacketHandle` field (Tranche 16.x). |
| **LANDED, refactor/modularise with named scope** | `gate/server.rs` 3235→6 files (§5.1). `core/mod.rs` 2485→5 files (§5.2). `kernel.rs` 1266→9+ files (§5.3). `nara/oracle.rs` + `medicine.rs` (§5.4). FFI opaque-handle tightening (§5.5). Kernel-bridge JSON edge typed shapes (§5.6). `events.rs` 522→7 files (§5.7). LUT consolidation (§5.8). |
| **First-build (genuine integration blockers ONLY)** | `KleinFlipEvent` discriminated-union enum at `events.rs` — currently bool-only; needs 3-variant enum per Tranche 16.x. `KernelBridgePerformanceEventJsonShape` typed struct (§5.6). No greenfield rebuild of any sub-coordinate. |

**No forbidden inventions detected:** no local pitch/clock fork, no LUT fork (Rust LUTs are generated from C LUTs via `epi-lib/scripts/gen_*.py`), no graph-inference at S0 (graph-services is S2's authority), no side-by-side composition. S0' portal registry is *consumed* as the single registry, not duplicated.

---

## 9. Test Criteria (concrete acceptance commands)

| Sub-coord | Acceptance command | What it verifies |
|---|---|---|
| S0-1 epi-lib | `cd Body/S/S0/epi-lib && make test` (verify Makefile target) | C kernel + matheme verifier passes |
| S0-2 portal-core | `cargo test -p portal-core` | 9 existing tests at `Body/S/S0/portal-core/tests/` pass |
| S0-2 portal-core profile contract | `cargo test -p portal-core --test track_01_t2_profile_contract` | `MathemeHarmonicProfile` round-trip + invariants |
| S0-3 epi-cli kernel-bridge | `cargo test -p epi-cli --test kernel_bridge_runtime_contract` | bridge subscribe/replay/fan-out lifecycle |
| S0-3 epi-cli gate temporal | `cargo test -p epi-cli --test gate_temporal_context` | S3' temporal projection mirror |
| S0-3 epi-cli FFI | `cargo test -p epi-cli --test kernel_ffi_contract` and `--test ffi_role_name_contract` | C↔Rust FFI soundness |
| S0-3 epi-cli portal | `cargo test -p epi-cli --tests gate_*` (subscription, tick health, runtime state) | portal runtime state consistency |
| S0-3 epi-cli Nara | `cargo test -p epi-cli --test nara_identity_contract --test nara_oracle_payload --test nara_medicine_contract` | typed payload + identity + medicine contracts |
| S0-4 epi-kernel-contract | `cargo test -p epi-kernel-contract` | typed shapes invariants |
| S0-5 epi up | `cargo test -p epi-cli --tests up_*` (if present) + manual `epi up` smoke | bootstrap return surface |
| Cross-stack | `cargo check -p portal-core -p epi-cli -p epi-kernel-contract -p epi-s3-gateway -p epi-s4-...` | workspace coherence |
| Cycle-3 closure (10.2) | After `klein_flip` lands: `cargo test -p portal-core --test klein_flip_personal_scale_propagation && cargo test -p epi-cli --test kernel_bridge_runtime_contract` | klein_flip propagates correctly |
| Cycle-3 closure (10.10) | After `ananda_vortex` lands: `cargo test -p portal-core --test ananda_vortex_projection_round_trip && grep -n ananda_vortex Body/S/S0/portal-core/src/kernel.rs` | M1-2 vortex window addressable |

---

## 10. Cross-Cutting Findings (items that touch the cycle-3 ledger)

### 10.1 New tranches to enrich

| Existing tranche | Enrichment from this audit |
|---|---|
| **Tranche 10.2 (klein_flip)** | Add §5.6 typed JSON shape proposal — close klein_flip + KleinFlipEvent enum + JSON edge tightening together |
| **Tranche 10.10 (ananda_vortex)** | Land typed projection per `M1-2-ANANDA-VORTEX-ARCHITECTURE.md §4.3`; serialise through new typed JSON edge |
| **Tranche 13 (legacy m-prime, S0 monolith cleanup)** | Promote into cycle-3: explicit refactor rows §5.1, §5.2, §5.3, §5.4, §5.7 with named file splits + verification commands |
| **Tranche 16.4 (CL(4,2) audit)** | Add memo content: single quaternion primitive at `quaternion.rs:1-119`; consumers: `kernel.rs` ring quaternions, M3 codon rotation, M4 personal q_cosmic vs q_personal, M4 Kerykeion natal chart |
| **Tranche 16.x (BedrockProvenanceHandle)** | Land typed field on `MathemeHarmonicProfile`; add `MathemeBedrockProjection.bedrock_link` integration point |

### 10.2 New tranches needed

| Proposed tranche | Scope |
|---|---|
| **S0-T1 — Split `gate/server.rs`** | §5.1 — 3235 LOC → 6 files; verification: `cargo test --tests gate_*` |
| **S0-T2 — Split `core/mod.rs`** | §5.2 — 2485 LOC → 5 files; verification: `cargo test --test core_knowing` + new per-command tests |
| **S0-T3 — Split `portal-core::kernel.rs`** | §5.3 — 1266 LOC → 9+ files behind existing `harmonic_profile.rs` façade; verification: workspace `cargo check` + existing portal-core tests |
| **S0-T4 — FFI opaque-handle tightening** | §5.5 — convert raw pointers to `CoordHandle(NonZeroU64)`; verification: `cargo test --test ffi_*` |
| **S0-T5 — Kernel-bridge typed JSON shape** | §5.6 — `KernelBridgeProfileJsonShape` + `KernelBridgePerformanceEventJsonShape`; closes Tranche 10.2 + 16.x cleanly |
| **S0-T6 — Split `events.rs`** | §5.7 — 7-file split; lands `KleinFlipEvent` enum with 3 variants in `events/klein_flip.rs` |
| **S0-T7 — Round-trip JSON schema test** | §5.11 — assert `serde_json` identity for `MathemeHarmonicProfile`; protect Theia consumers |

### 10.3 Decision register entries surfaced

- **DR-S0-1 (new):** `epi-kernel-contract` workspace location — keep sibling-to-S0 at `Body/S/epi-kernel-contract/` or promote to `Body/S/S0/epi-kernel-contract/` or `Body/S/contract/`? Current location is positionally ambiguous (per §5.9).
- **DR-S0-2 (new):** Per-method dispatch tests for `gate/server.rs` — required as part of §5.1 split, or as standalone landing tranche?
- **DR-S0-3 (new):** `KernelBridgeCachedProfile.profile: Value` — confirm leave-as-is policy (§5.10) or do per-extension narrowing tranches by Mn surface?

### 10.4 Orphan audit findings

- **No orphan S0 substrate detected.** Every Body file maps to a spec, a sibling shard, or a known sub-coordinate.
- **`epi-cli/src/gate/bootstrap.rs` is empty (1 LOC), `chat.rs` (12 LOC), `events.rs` (1 LOC), `protocol.rs` (4 LOC), `runs.rs` (1 LOC), `runtime.rs` (3 LOC), `subagents.rs` (4 LOC), `transcripts.rs` (3 LOC), `workspace.rs` (1 LOC).** These are placeholder files. Decision: remove or land real content; flag for §5.1 refactor sweep.

### 10.5 Profile-bus + kernel-bridge extension gaps (consolidated)

Eight named extensions needed on the profile bus + bridge to close cycle-3:

1. `klein_flip: bool` — Tranche 10.2
2. `ananda_vortex: AnandaVortexProjection` — Tranche 10.10
3. `bedrock_link: BedrockProvenanceHandle` — Tranche 16.x
4. `pattern_packet_handle: PatternPacketHandle` — Tranche 16.x
5. `s2_anchor` / `s3_anchor` populate-or-remove — Tranche 10.4
6. `KleinFlipEvent` 3-variant enum — Tranche 16.x
7. `depositionAnchor` typed vs DTO — DR-KB-2
8. Planet LUT cardinality — DR-KB-1

All eight close at S0; all eight surface to M' via the typed bridge edge proposed in §5.6.

---

## Closing

S0 is the executable membrane spine — the deepest substrate the rest of the Epi-Logos C Experiments stack stands on. It is well-landed: four crates, ~21 000 LOC of Rust, ~12 000 LOC of C, 100+ test files, a single typed Theia bridge, a 9-state readiness taxonomy, and a parity manifest portal registry. The architectural work is not rebuild — it is **modularisation under explicit named scope** (§5.1–§5.8) and **typed-surface tightening** (§5.6, §7.1) closing the eight named bridge extensions (§10.5). The bimba↔prime distinction is intact: S0 is the executable ground (process, file, stream, binary), S0' is the reflective contract (preferred-tools, command grammar, parity manifest, kernel mirror, return artifacts). Every M' surface consumes through the single kernel-bridge boundary; no orphan substrate detected; no greenfield invention required.
