# Track 10 T0 Integration Decision Gate ADR Bundle

This bundle is the build gate for [[10-cross-cutting-integration-and-milestones]] T0. It does not resolve the open architecture register by decree. It names the prototype that must resolve or explicitly defer each blocking decision before dependent tracks may harden implementation.

## VAK Baseline

| Layer | Coordinate | Meaning for this tranche |
| --- | --- | --- |
| CPF | `C2` | Cross-track implementation control work scoped to the active plan set rather than user-final canon validation. |
| CT | `CT4b` | Integration execution that binds readiness facts, owner-track seams, and dependent-track consequences into one dispatchable package. |
| CP | `CP4` | Operational control of the tranche rather than a final synthesis or user-validation act. |
| CF | `(4.0/1-4.4/5)` | The live VAK route classifies this as Anima-style dispatch work across the reflective lattice, not a Sophia-only closure. |
| CFP | `CFP0` | The tranche is a common control-plane artifact reused across tracks rather than a single downstream product surface. |
| CS | `Day` | Readiness is evaluated against present, local, mock-free execution conditions. |

## ADR Status Semantics

| Status | Meaning | Downstream behavior |
| --- | --- | --- |
| `prototype-required` | No implementation default may be treated as production until the prototype command passes. | Dependent tasks may define seams and blockers only. |
| `default-with-fallback` | A safe default exists, but the fallback policy must be recorded before downstream code relies on it. | Dependent tasks may implement against the seam and must preserve fallback readiness. |
| `implementation-owner-required` | The named owner track must produce the schema/API decision. | Dependent tracks must show typed readiness blockers. |
| `user-final-validation-required` | The user must validate policy/copy/behavior before production authority. | Implement deposit-only, read-only, or local-only behavior until validated. |

## Blocking ADRs

### ADR-T10-PRD-01 - Theia runtime mode

- **Decision source:** [[11-open-architectural-decisions]] `PRD-01`.
- **Owner track:** Track 05.
- **Blocked tracks:** 01, 05, 06, 07, 08, 10.
- **Status:** `prototype-required`.
- **Prototype command:** `cd Body/M/epi-tauri && pnpm test:e2e -- --grep "@theia-runtime"` once Track 05 adds the prototype spec.
- **Pass criterion:** A Tauri v2 app opens `/body`, summons a real Theia workbench, activates at least one readiness contribution, and proves worker, IndexedDB, CSP, WebSocket, and Tauri IPC compatibility.
- **Fallback policy:** If direct browser-mode assets fail, use a Tauri-supervised localhost Theia browser-mode server. Electron sidecar remains a last resort and must be marked degraded.

### ADR-T10-PRD-02 - Single versus multi-webview persistence

- **Decision source:** [[11-open-architectural-decisions]] `PRD-02`.
- **Owner track:** Track 05.
- **Blocked tracks:** 05, 06, 08, 10.
- **Status:** `prototype-required`.
- **Prototype command:** `cd Body/M/epi-tauri && pnpm test:e2e -- --grep "@surface-persistence"` once Track 05 adds the prototype spec.
- **Pass criterion:** `/body` and Theia share one profile generation, one session key, and one bridge subscription identity while IDE summon/close preserves `/body` state.
- **Fallback policy:** If multi-webview fails, use single-webview navigation with a persisted restore contract and explicit readiness downgrade for background behavior.

### ADR-T10-PRD-03 - Kernel bridge host boundary

- **Decision source:** [[11-open-architectural-decisions]] `PRD-03`.
- **Owner track:** Track 01 with Track 03 and Track 05 consumers.
- **Blocked tracks:** 01, 03, 05, 06, 07, 08, 09, 10.
- **Status:** `default-with-fallback`.
- **Prototype command:** `cargo test --manifest-path Body/S/epi-kernel-contract/Cargo.toml` plus the Track 01 bridge fanout test once added.
- **Pass criterion:** One long-lived bridge source fans out to a `/body` lite consumer, a Theia test extension, and an M5-4 capability reader without duplicate backend subscriptions.
- **Fallback policy:** Prefer a Tauri singleton service with Theia-native adapters. If Track 01 temporarily hosts bridge logic in Theia, `/body` must show `bridge_host_pending` readiness until singleton fanout is proven.

### ADR-T10-IOD-01 - Gateway and SpaceTimeDB multiplexing

- **Decision source:** [[11-open-architectural-decisions]] `IOD-01`.
- **Owner track:** Track 03.
- **Blocked tracks:** 01, 03, 05, 06, 07, 08, 10.
- **Status:** `implementation-owner-required`.
- **Prototype command:** `cargo test --manifest-path Body/S/S3/gateway-contract/Cargo.toml` and the native SpaceTimeDB subscription test once Track 03 exposes it.
- **Pass criterion:** Clients observe one ordered, versioned stream contract with reconnect, resync, gap, and readiness events; no frontend binds directly to divergent stream semantics.
- **Fallback policy:** Temporary dual sockets are allowed only behind one app-level manager and must report `stream_topology_degraded`.

### ADR-T10-IOD-02 - SpaceTimeDB auth/RLS privacy discipline

- **Decision source:** [[11-open-architectural-decisions]] `IOD-02`.
- **Owner track:** Track 03 with Track 04 privacy review.
- **Blocked tracks:** 03, 04, 05, 06, 08, 10.
- **Status:** `implementation-owner-required`.
- **Prototype command:** `cargo test --manifest-path Body/S/S3/epi-spacetime-module/Cargo.toml` once auth/privacy tests are added.
- **Pass criterion:** Protected bodies and private profile material never enter shared SpaceTimeDB rows; rows carry opaque handles, profile generation references, or public quaternionic state only.
- **Fallback policy:** Until proven, protected flows remain local-only and any shared-cosmos table is marked `privacy_boundary_unproven`.

### ADR-T10-IOD-04 - Profile schema versioning

- **Decision source:** [[11-open-architectural-decisions]] `IOD-04`.
- **Owner track:** Track 01.
- **Blocked tracks:** 01, 05, 06, 07, 08, 10.
- **Status:** `implementation-owner-required`.
- **Prototype command:** `cargo test --manifest-path Body/S/S0/portal-core/Cargo.toml` and `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml kernel_api_envelope_contract` when the profile fixture lane is present.
- **Pass criterion:** `MathemeHarmonicProfile` emits a versioned profile with canonical field names, bounded compatibility projection, privacy class, readiness, and generation id.
- **Fallback policy:** Consumers expecting unavailable profile fields must render typed readiness blockers instead of renderer-local aliases.

### ADR-T10-IOD-05 - S2 canonical root mapping

- **Decision source:** [[11-open-architectural-decisions]] `IOD-05`.
- **Owner track:** Track 02.
- **Blocked tracks:** 02, 05, 06, 07, 08, 10.
- **Status:** `implementation-owner-required`.
- **Prototype command:** `cargo test --manifest-path Body/S/S2/graph-schema/Cargo.toml` plus the Track 02 live graph-services root-resolution test.
- **Pass criterion:** `#`, `#0..#5`, and `M0..M5` resolve through one coordinate-native graph contract with explicit alias/provenance handling.
- **Fallback policy:** Graph consumers may display source provenance and blockers, but must not invent local coordinate law.

### ADR-T10-IOD-09 - S5 persisted-state shape

- **Decision source:** [[11-open-architectural-decisions]] `IOD-09`.
- **Owner track:** Track 04.
- **Blocked tracks:** 04, 05, 06, 07, 08, 09, 10.
- **Status:** `implementation-owner-required`.
- **Prototype command:** `cargo test --manifest-path Body/S/S5/epii-review-core/Cargo.toml` and `cargo test --manifest-path Body/S/S5/epii-agent-core/Cargo.toml` once persisted fixtures are wired.
- **Pass criterion:** Candidate, route queue, review item, governance gate, evidence envelope, dry-run promotion plan, source metadata, and frontend-safe DTOs persist and reload from real storage.
- **Fallback policy:** M5-4 may deposit draft evidence only; no operational approval, rejection, promotion, or mutation authority is production until persisted state is proven.

## Cross-Track Consumption Gate

Every dependent tranche must link back to this bundle and record:

- The ADR ids it consumes.
- The owner-track command that proved each consumed decision.
- The readiness field used when a decision is unresolved.
- The fallback behavior visible to `/body`, Theia, extension, plugin, or agent consumers.

Track 05 T0/T2, Track 03 T1/T3, Track 01 T5/T6, Track 02 T0/T3, and Track 04 T0/T2 are the first required consumers.
