# Track 01 - Kernel Bridge And S0 Foundation

This track turns S0/S0' into the load-bearing substrate for M5-2, not optional backend plumbing. The outcome is a typed, tested kernel/profile/CLI/library bridge that M5-3 surfaces can consume through the Theia/Tauri `kernel-bridge`, and that M5-4 agents can use as bounded capabilities across profile, pointer, readiness, command, and observability coordinates.

## Goal

Build the S0 foundation and kernel bridge as the first stable runtime seam between the S-family stack and the M' surfaces:

- Complete and harden S0 kernel authority in `Body/S/S0/epi-lib`, `Body/S/S0/portal-core`, and `Body/S/S0/epi-cli`.
- Make `MathemeHarmonicProfile` the single public-current profile contract for tick, pointer, Vimarsha-read audio bus, codon-rotation, privacy, readiness, and provenance fields.
- Expose S0' CLI/library access through stable schemas and gateway methods so `/` surfaces, Tauri commands, Theia extensions, and agents do not rederive kernel semantics.
- Define and implement the `kernel-bridge` as the shared M5-2 access point consumed by M5-3 Theia/Tauri surfaces and M5-4 agentic mediation.
- Preserve source-of-truth boundaries: S0 computes kernel/pointer/profile law; S2 certifies graph pointer/provenance law; S3 owns temporal/session/deposition projection; S4/S5 own bounded agent/review execution.

## Source Specs

- [[m5-prime-system-shape-and-tauri-ide-canon]] - `Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md`, section 1.2 "M5-2 = S-family; M5-3 = M'-family; M5-4 = operational-capacities + agentic mediation", section 5 "The kernel-bridge foundational extension", section 8 "Implementation milestones", section 9 "Open implementation questions". This is the authority that M5-2 is the S-stack and that `kernel-bridge` is the M5-3/M5-4 access point into it.
- [[M'-SYSTEM-SPEC]] - `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md`, "Shell vs Subsystem Architecture", "The Shell 0/1 Split IS the (0/1) Inversionary Parent", "Musical Instrument Ramification", "Required Shared Profile", "Harmonic Clock Integration Plan". This is the authority for the shared `MathemeHarmonicProfile` and for not allowing M' renderers to invent private clock/profile/codon mappings.
- [[M'-TAURI-PORT-SPEC]] - `Idea/Bimba/Seeds/M/M'-TAURI-PORT-SPEC.md`, "Port Architecture", "Harmonic Profile Architecture Amendment", "S0' Command / Config / Readiness Membrane", "Current-State Gap Table", "Testing Contract". This is the authority for typed clients, readiness separation, and real local gateway/S2/S3 tests.
- [[M'-PORTAL-SPEC]] - `Idea/Bimba/Seeds/M/M'-PORTAL-SPEC.md`, "Shared Runtime Law", "`/` Surface", "Agentic Execution / Inbox", "Implementation Rule". This is the authority that TUI and desktop mirror logical contracts, not widgets, and that `/` dispatches CLI/gateway/typed service calls instead of forking backend behavior.
- [[S0-HARMONIC-POINTER-WEB36-SPEC]] - `Idea/Bimba/Seeds/S/S0/S0-HARMONIC-POINTER-WEB36-SPEC.md`, section A "Intent", section D "Canonical 36 Shape", section E "Seven Context Frames Are Overlay", section G "C Contract Shape", section H "Build Path", section J "Boundaries". This is the authority for Bedrock7, PointerWeb36, CF7, compact C descriptors, and real C arena/family-linked tests.
- [[S0-CODON-ROTATION-PROJECTION-SPEC]] - `Idea/Bimba/Seeds/S/S0/S0-CODON-ROTATION-PROJECTION-SPEC.md`, "Purpose", "Cardinality Law", "Forward Map", "Reverse Map", "q_cosmic", "Tests". This is the authority for the 84-to-472 `(lens, mode) <-> (codon, rotation)` projection living in `portal-core`.
- [[S0-S0i-CLI-CORE]] - `Idea/Bimba/Seeds/S/S0/S0'/Legacy/specs/S/S0-S0i-CLI-CORE.md`, "Current State", "Kernel / QL Meta-Layer", "Reflected M0' / M1' Contract". This is the authority that S0/S0' is the executable kernel/CLI/lib ground and the upstream profile contract for graph, torus, clock, Nara, and Epii surfaces.
- [[2026-05-19-kernel-mprime-harmonic-clock-integration-plan]] - `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-05-19-kernel-mprime-harmonic-clock-integration-plan.md`, "Current Implementation Baseline", "Tranche Order". This is supporting execution context for current profile fields and prior tranche sequencing.
- [[2026-05-31-theia-ide-shell-and-m-plugin-architecture]] - `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-05-31-theia-ide-shell-and-m-plugin-architecture.md`, section 4 "The kernel-bridge foundational extension", section 8.1 "Shared kernel-bridge instance", section 11 "Phase-1 implementation tranches", section 12 "Success criteria". This is supporting M5-3 consumer context, not a substitute for this S0/M5-2 track.

Current implementation surfaces observed for this plan:

- `Body/S/S0/epi-lib/include/pointer_web.h`, `Body/S/S0/epi-lib/src/pointer_web.c`, `Body/S/S0/epi-lib/test/infrastructure/test_pointer_web.c`
- `Body/S/S0/portal-core/src/kernel.rs`, `Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs`, `Body/S/S0/portal-core/src/codon_rotation_projection.rs`, `Body/S/S0/portal-core/src/events.rs`, `Body/S/S0/portal-core/src/nara_journal.rs`, `Body/S/S0/portal-core/src/personal_identity.rs`
- `Body/S/S0/epi-cli/src/gate/spacetimedb_bridge.rs`, `Body/S/S0/epi-cli/src/ffi/mod.rs`, `Body/S/S0/epi-cli/schemas/src/coordinate.ts`
- `Body/S/S0/portal-core/tests/m_prime_shared_contracts.rs`, `Body/S/S0/portal-core/tests/vimarsha_reading.rs`, `Body/S/S0/epi-cli/tests/pointer_web_ffi_contract.rs`, `Body/S/S0/epi-cli/tests/gate_spacetimedb_bridge.rs`

## Architectural Keystones

- **S0 Kernel Authority:** S0 owns executable Bedrock7, PointerWeb36, CF7, tick, harmonic profile, codon-rotation projection, and public-current profile serialization. Consumers must call S0/S0' contracts; they must not rederive these semantics in renderer or agent code.
- **Profile-First Bridge:** `MathemeHarmonicProfile` is the bridge artifact. It carries current tick, helix, position, chromatic/diatonic projection, resonance72, Vimarsha-read `audio_octet`, `nodal_quartet`, M3/codon projection, `q_cosmic`, privacy class, bedrock, pointer anchor, context-frame projection, optional VAK address, and eventually S2/S3 anchors.
- **C Authority, Rust Mirror, TS Validation:** C remains the low-level relation-law authority where specified; Rust `portal-core` exposes safe profile/event structures; TypeScript schemas validate bridge payloads. TypeScript may validate and cache, not invent.
- **S0' Command Membrane:** CLI, TUI, `/`, Tauri commands, and Theia `kernel-bridge` all reach S-family capabilities through S0' command/gateway/session contracts, preserving the M'-PORTAL rule that widget surfaces do not fork backend behavior.
- **Lite/Full Bridge Modes:** The same bridge instance supports lite mode for the 0/1 surface and full mode for Theia IDE/plugin surfaces. Lite receives current tick/profile/readiness/agent dispatch handles; full receives expanded SpaceTimeDB tables, traces, audio bus, event stream, and observability feeds.
- **Readiness Is Capability, Not Health:** Readiness distinguishes raw service connectivity from usable bounded capability: kernel profile availability, S2 law availability, S3 deposition availability, Graphiti/privacy class availability, pending dataset LUTs, and protected projection blocks.
- **Agent-Bounded Capabilities:** M5-4 agents receive typed bridge capabilities: read current safe profile, inspect pointer/context-frame metadata, invoke bounded gateway RPC methods, subscribe to observability events, and deposit review evidence. They do not receive raw private Nara bodies or unrestricted shell/kernel access.
- **Observability As A First-Class Stream:** Kernel traces, profile observations, bridge connection state, readiness transitions, and cross-surface relation events are emitted as structured events suitable for Epii/autoresearch surfacing, not ad hoc logs.
- **Real Functionality Tests Only:** Tests must allocate real C coordinates, call real FFI, serialize real `portal-core` profiles, run real CLI/gateway code paths, and connect to local gateway/SpaceTimeDB test services where integration claims require them. Pure mock-only tests are explicitly out of scope.

## Tranches

1. **Tranche 0 - Baseline Contract Inventory**

   Deliverables:

   - Record the current S0 contract surface across C, Rust, CLI, and TS schemas without changing implementation behavior.
   - Produce a checked-in contract inventory for future implementers, either as test fixtures or as generated docs under the implementation-owned package in the relevant future tranche.
   - Identify which current fields are authoritative, transitional, compatibility-only, or blocked by S2/S3/S5 ownership.
   - Freeze at least one safe public-current profile JSON fixture generated from real `portal-core::MathemeHarmonicProfile::from_tick`, including pointer, context-frame, codon-rotation, audio, privacy, and VAK fields when present.

   Verification:

   - Run `cargo test --manifest-path Body/S/S0/portal-core/Cargo.toml`.
   - Run the existing C pointer-web test target or the repository's C test wrapper that includes `Body/S/S0/epi-lib/test/infrastructure/test_pointer_web.c`.
   - Run `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml pointer_web_ffi_contract kernel_api_envelope_contract`.
   - The generated fixture must be produced by real `portal-core` code in the test or fixture-generation path, not handwritten JSON.

2. **Tranche 1 - C Pointer Authority And FFI Hardening**

   Deliverables:

   - Complete or verify `HC_BedrockWeb7`, `HC_PointerWeb36`, and `HC_ContextFrameWeb7` as stable C contracts over real `Holographic_Coordinate` instances.
   - Preserve the hot coordinate size constraint from [[S0-HARMONIC-POINTER-WEB36-SPEC]] sections B and H: `sizeof(Holographic_Coordinate) == 128`.
   - Ensure FFI in `Body/S/S0/epi-cli/src/ffi/mod.rs` exposes Bedrock7, PointerWeb36, and CF7 without Rust rederiving private relation semantics.
   - Add stable enum/string mapping boundaries so TS schemas can validate relation roles, interval roles, ratio roles, helices, ring names, and CF labels.

   Verification:

   - C tests allocate real arenas and family-linked coordinates via `arena_init`, `families_init`, `families_crosslink`, and `families_wire_reflective`.
   - C tests prove 36 refs as three 12-rings, six bimba plus six pratibimba per ring, separate inversion/mirror/Mobius return roles, first-class 12 MEF lens anchors, and CF7 overlay not mutating the 36 count.
   - Rust FFI tests prove the same behavior through statically linked `libepilogos`, including pointer tag decoding and no widened coordinate struct.
   - No tests may satisfy this tranche with string-only coordinate generation or mocked pointer refs.

3. **Tranche 2 - `MathemeHarmonicProfile` Completion And Versioning**

   Deliverables:

   - Finalize `portal-core::MathemeHarmonicProfile` as the public-current S0 profile shape for M5-3/M5-4 consumption.
   - Carry these fields explicitly: tick address, phase, `tick12`, `degree720`, `degree360`, `su2Layer`, `position6`, helix, ratio role, `MathemeLensMode`, chromatic profile, diatonic CF/VAK context, resonance72, `audio_octet[8]`, `nodal_quartet[4]`, elements, planetary-chakral projection, M3/codon projection, `codonRotationProjection`, `qCosmic`, optional personal resonance score, conjugate form character, privacy class, Bedrock7 projection, PointerWeb36 anchor, CF7 projection, optional `VakAddress`, and nullable future S2/S3 anchors.
   - Add profile schema version and provenance fields if the consuming bridge needs migration-safe decoding.
   - Keep protected-local material out of the public profile: raw `q_b`, raw `q_p`, protected natal data, journal bodies, raw Graphiti episode bodies, and private resonance vectors.
   - Clarify compatibility aliases between current `binary` and eventual `mahamaya` field names so M3' consumers do not fork behavior during migration.

   Verification:

   - `portal-core` tests cover all 12 tick states, bimba/pratibimba helix identity, X/X' partner, X+Y=5 mirror, ratio role, pointer anchor cardinality, CF7 projection, and safe privacy serialization.
   - `portal-core` tests cover all 84 `(lens, mode)` Vimarsha reading cells and prove deterministic positive `audio_octet` plus four valid nodal constraints.
   - Codon-rotation tests prove 472 surface cells, 24 dual codons x 8 rotations, 40 non-dual codons x 7 rotations, full 84 forward mappings, reverse mapping, and `q_cosmic` normalization.
   - Serialization tests assert public-current profile JSON contains required bridge fields and excludes protected fields.

4. **Tranche 3 - S0' CLI, Schema, And Gateway Profile Surface**

   Deliverables:

   - Expose current profile, pointer web, CF7, codon-rotation projection, and readiness through stable S0' CLI/library entry points.
   - Add or complete commands in `Body/S/S0/epi-cli` for profile inspection, selected-coordinate pointer inspection, and bridge-readiness inspection.
   - Extend `Body/S/S0/epi-cli/schemas` to validate the profile, pointer, event, readiness, and bridge-capability payloads consumed by Tauri/Theia.
   - Ensure gateway-facing profile methods use existing S3 ownership boundaries and do not create a parallel session authority inside S0.

   Verification:

   - CLI integration tests invoke the actual compiled `epi` binary or library path against statically linked `portal-core`/`epi-lib` behavior.
   - Schema tests parse profile JSON produced by the real CLI/gateway path, not handwritten fixtures alone.
   - Gateway contract tests assert canonical session identifiers, profile generation, privacy class, and computation source survive the CLI -> gateway -> JSON envelope path.
   - Readiness tests distinguish at least raw service health, kernel profile availability, S2 pointer-law availability, S3 deposition availability, pending LUT, and private projection block.

5. **Tranche 4 - SpaceTimeDB Projection And Resync Bridge**

   Deliverables:

   - Extend `Body/S/S0/epi-cli/src/gate/spacetimedb_bridge.rs` or its successor bridge module so native SpaceTimeDB WebSocket subscriptions can carry kernel/profile/session projection updates needed by `kernel-bridge`.
   - Preserve HTTP SQL polling fallback while making native WebSocket mode the preferred path where configured.
   - Define the table/subscription set for lite mode and full mode: current profile/world clock/session surface for lite; profile, presence, shared archetype/coincidence events, kernel traces, temporal context, and observability events for full.
   - Add resync semantics: connection lost, reconnecting, stale profile, resynced profile generation, and degraded-but-subscribable states.
   - Surface bridge readiness as capability facts rather than a single boolean.

   Verification:

   - Tests run against a real local gateway test service and a real local SpaceTimeDB dev instance or repository-provided integration harness that exercises reducer calls and WebSocket subscription frames.
   - Native WebSocket tests prove profile/session updates hydrate the same temporal context shape as HTTP fallback.
   - Reconnection tests prove stale state is marked, subscribers are not silently fed old profile generations as current, and resync emits a new generation.
   - Privacy tests prove SpaceTimeDB public projection does not hydrate protected profile hash detail, protected layer masks, raw Nara bodies, or private identity data.

6. **Tranche 5 - Kernel Bridge Contract Package**

   Deliverables:

   - Create the shared TypeScript contract consumed by `/body` and `/pratibimba/system`: profile types, bridge events, readiness taxonomy, connection status, subscription mode, gateway RPC envelope, capability manifest, and observability events.
   - Prefer generated or schema-validated types from the S0' schema package so Theia/Tauri cannot drift from Rust payloads.
   - Define the public `KernelBridgeAPI` shape with events for profile, world clock, presence, shared archetype events, kernel traces, audio bus, cymatic field input/state if retained, connection status, gateway RPC dispatch, and observability stream.
   - Define strict capability names for M5-4 agent usage, including read-only profile/pointer inspection and bounded gateway RPC invocation.

   Verification:

   - TS schema tests parse live JSON produced by `portal-core`/`epi-cli` tests.
   - Cross-package tests prove `/body` profile clients and Theia bridge clients import the same contract definitions.
   - Contract tests reject renderer-local fields that are not present in the S0/S0'/S3 payload.
   - Capability tests reject unauthorized gateway method names and protected-private payloads before dispatch.

7. **Tranche 6 - `kernel-bridge` Runtime MVP**

   Deliverables:

   - Implement the Theia-native `kernel-bridge` extension as the first-loaded IDE extension, while preserving the option for a Tauri-owned shared service if the Theia/Tauri prototype requires it.
   - Implement lite/full subscription modes over the S0'/gateway/SpaceTimeDB contract from Tranches 3-5.
   - Publish the bridge API through Theia dependency injection and expose a Tauri-accessible adapter for the 0/1 surface.
   - Implement connection-state UI/status data without making downstream extensions handle reconnection logic.
   - Cache the latest safe profile and replay it to late subscribers with generation and staleness metadata.

   Verification:

   - A minimal real downstream test extension subscribes to the bridge and receives current profile, readiness, and connection-state events from the local gateway/SpaceTimeDB path.
   - A `/body` test client consumes lite mode and receives the same profile generation as the IDE test extension.
   - Tests prove one shared subscription source fans out to multiple consumers without each consumer opening its own SpaceTimeDB/gateway subscription.
   - Failure tests stop and restart the local projection service and prove downstream clients receive disconnected, reconnecting, and resynced states in order.

8. **Tranche 7 - Agentic Capability And Observability Feed**

   Deliverables:

   - Expose bridge capabilities required by M5-4 agents: `readCurrentProfile`, `readPointerAnchor`, `readReadiness`, `subscribeObservability`, `invokeGatewayRpc`, `depositKernelObservation`, and `requestReviewEvidence`.
   - Encode VAK/CF metadata from the profile/context-frame layer so agentic routing can see current CF/agent/function labels without reinterpreting the harmonic profile. Carry the canonical-prefix VAK keys (CPF/CT/CP/CF/CFP/CS) on every bridge artifact that crosses the M5-4 boundary — sessions.patch RPC envelopes carry `vak_address` (C1 chip, commit `19fbc8fc`); kernel observations, capability invocations, and review-deposit envelopes all carry the canonical-prefix keys end-to-end so downstream S5 surfacing pipelines (Track 04 Tranche 8 Epii-on-Epii pattern detector) can detect Möbius-seam drift, dispatch-tool mismatch, and capability-matrix violations against `Body/S/S4/plugins/pleroma/capability-matrix.json`.
   - Emit structured observability events for connection transitions, profile generation changes, kernel profile observations, relation traversal events, readiness blockers, rejected capability invocations, and VAK route lineage (the sequence of `vak_evaluate -> anima_orchestrate -> dispatch_X` decisions and their `upstream_required` validation). Every event records the canonical-prefix VAK keys of the originating invocation so cross-cycle continuity (Track 04's `Khora compose → execution → Moirai rehear → Sophia witness → Aletheia routes → Epii recompose` traversal) is observable.
   - Route review/evidence deposits to governed S5/S5' endpoints through gateway methods, not direct filesystem or graph writes. The `epi gate dispatch anima-invoke` CLI surface (D3 chip, commit `419aac5`) is the gateway-facing dispatch boundary; bridge capabilities reach Anima through it rather than reinventing the dispatch envelope.

   Verification:

   - Agent contract tests invoke bridge capabilities through the same gateway/auth boundary used by production clients, including the `epi gate dispatch anima-invoke` surface.
   - Tests prove bounded methods cannot access protected Nara raw bodies, private identity hashes beyond handles, or unrestricted CLI/shell commands.
   - Tests prove every bridge artifact crossing the M5-4 boundary carries canonical-prefix VAK keys (CPF/CT/CP/CF/CFP/CS); missing keys cause typed rejection at the gateway, not silent acceptance.
   - Observability tests produce real bridge events from profile and connection changes, then assert Epii/autoresearch consumers receive typed events with source, generation, privacy, provenance, and VAK route lineage (the `vak_evaluate -> anima_orchestrate -> dispatch_X` decision chain). Tests assert the three-way parity test (`test_agent_capability_gates_anima_tools_matches_anima_md_tools`) remains green against any new event-emitting capability.
   - Review-deposit tests prove evidence includes profile generation, pointer/context-frame anchor, session/DAY/NOW handle, canonical-prefix VAK keys, command lineage, and test output handle where applicable.

9. **Tranche 8 - End-To-End S0-To-Surface Acceptance Slice**

   Deliverables:

   - Demonstrate one local end-to-end slice: S0 computes profile -> S0' CLI/gateway exposes it -> SpaceTimeDB projection publishes it -> `kernel-bridge` receives it -> `/body` lite client and Theia full client consume the same generation -> M5-4 agent capability reads it and deposits review evidence.
   - Produce an operator readiness report that explains any missing S2/S3/S5 dependencies as explicit blockers, not silent degraded behavior.
   - Document the supported migration path from legacy clock/profile consumers to the shared bridge contract.

   Verification:

   - E2E test starts required local services, drives a profile tick change, and asserts the same profile generation and privacy class across CLI, gateway, projection, bridge, lite client, full client, and agent capability reader.
   - E2E test records at least one real `KernelProfileObservationEvent` or equivalent review evidence event with no protected data leakage.
   - E2E test proves renderer/client code does not compute tick, codon, pointer, or CF values independently by comparing consumed values against S0/S0' payloads.
   - Final acceptance requires all tests from Tranches 1-7 to pass in the implementation branch.

## Dependencies

- **Track 01 internal order:** C pointer authority precedes Rust profile completion; profile completion precedes CLI/gateway exposure; CLI/gateway exposure precedes SpaceTimeDB projection; projection and schemas precede Theia/Tauri bridge runtime; bridge runtime precedes M5-4 agent capability mediation.
- **M5-3 Theia/Tauri surface track:** Needs the contract package and `kernel-bridge` API from this track before individual M-extensions or `/body` lite mode can consume live profile data safely.
- **S2 pointer/graph track:** Needed for final `pointerAnchor` certification, coordinate relation provenance, namespace-aware graph anchors, and configurable correspondence law. Track 01 can expose S0 pointer anchors before S2 certification, but must label uncertified anchors honestly.
- **S3 gateway/SpaceTimeDB/session track:** Needed for production deposition anchors, DAY/NOW/session binding, SpaceTimeDB table schema, native subscription lifecycle, and Graphiti protected-local projection handles.
- **S4/S5 agent/review track:** Needed for governed capability auth, review inbox deposit methods, agent run lineage, and Epii/autoresearch consumption of bridge observability.
- **M2/M3 data authority:** Needed for dataset-backed Tarot/amino/correspondence LUT provenance. Until materialized, profile fields must preserve `pending-dataset-lut` or equivalent honest readiness state.
- **M4/Nara privacy track:** Needed for protected-local identity and journal projection classes. Track 01 must keep public-current profile fields safe even before M4 surfaces are complete.
- **Theia/Tauri architectural prototype:** Needed to decide whether `kernel-bridge` lives purely as a Theia extension, a Tauri-owned singleton service with Theia adapter, or a hybrid. The API contract should be stable across that decision.

## Open Decisions

- **Bridge host boundary:** Should the long-lived shared bridge instance be owned by Theia, by the Tauri Rust process, or by a Tauri service with Theia and `/body` adapters? The canon says foundational Theia extension, while section 5.4 requires the 0/1 surface and IDE to share one instance in the same Tauri app process.
- **Theia deployment shape:** The Theia browser-mode-in-Tauri-webview prototype must confirm whether the bridge can run entirely in webview JS or needs a local service/process boundary.
- **Profile versioning:** The specs name the profile fields but do not yet define a formal schema version, migration policy, or compatibility window for `binary` vs future `mahamaya` naming.
- **S2/S3 anchor timing:** `pointerAnchor` has an S0 current shape, while final certification and `depositionAnchor` depend on S2/S3. The implementation must decide whether these are nullable fields, readiness-blocked fields, or separate anchor sub-objects.
- **SpaceTimeDB schema source:** The exact table names and reducer contracts for profile/world-clock/presence/shared-archetype/coincidence/kernel-trace streams are referenced in canon, but this track still needs the definitive SpaceTimeDB schema source before implementation.
- **Audio bus ownership wording:** Current specs say the kernel exposes profile fields and that M2-1' Vimarsha reading produces `audio_octet`/`nodal_quartet`, while current `portal-core` houses the Vimarsha function. The engineering boundary should be documented as "S0/portal-core implementation of the M2-1' reading function" or moved if another track owns it.
- **Cymatic field derivation in bridge:** The Theia plan suggests the bridge derives cymatic field state from audio bus and personal/cosmic inputs. S0 boundaries say S0 does not own UI rendering or audio synthesis except through harmonic metadata. Decide whether bridge emits raw inputs only or a typed derived cymatic-state contract owned by M2/M4.
- **Capability auth:** The exact auth model for M5-4 agent bridge capabilities is not settled. The bridge needs method-level allowlists, privacy checks, and session lineage before agents can use it operationally.
- **Real integration harness:** The plan requires real local gateway/SpaceTimeDB integration tests. If the repo lacks a reproducible dev harness, create that harness before claiming native projection readiness.

## Success Criteria

- S0 can compute Bedrock7, PointerWeb36, CF7, tick, profile, Vimarsha-read audio bus, codon-rotation, and `q_cosmic` through real C/Rust code with tests over actual data structures.
- S0' exposes profile, pointer, context-frame, readiness, and bounded gateway surfaces through CLI/library/schema contracts consumed by TUI, Tauri, Theia, and agents.
- `MathemeHarmonicProfile` is the only public-current profile contract used by M5-3 surfaces; no renderer or Theia extension reimplements tick, pointer, CF, codon, or audio-bus derivation.
- The `kernel-bridge` provides one shared lite/full subscription layer with cache, reconnection, readiness, status, and observability streams.
- M5-4 agents can use typed bridge capabilities with privacy, auth, session lineage, and review evidence boundaries.
- Readiness reports distinguish health from usable capability and surface S2/S3/S5/pending-LUT/privacy blockers explicitly.
- End-to-end tests prove a real profile generation flows from S0 through S0'/gateway/projection/bridge to `/body`, Theia, and agent capability consumers without private data leakage.
- All verification for this track uses real functionality: C arena/family-linked coordinates, Rust profile/event serialization, actual FFI, compiled CLI/gateway paths, and local integration services where external projection behavior is claimed.
