# Track 08 T0 Composition Contract Preflight

This contract package is the implementation-control artifact for `08.T0` under `Body/M/epi-theia/extensions/contracts` and the corresponding shared composition module at `Body/M/epi-theia/shared`. It defines what each Track 07 individual extension is expected to contribute when composed into the two integrated plugins, the fixture payload requirements drawn from Tracks 01–04, and the compatibility matrix that names ownership and absent-state readiness.

## VAK Baseline

Live `epi agent vak evaluate --json "Composition Contract Inventory And Fixture Capture"`:

| Layer | Coordinate | Meaning for this tranche |
| --- | --- | --- |
| CPF | `C2` | Contract-control work inside the active implementation program. |
| CT  | `CT4b` | Cross-track operational packaging that prepares downstream execution. |
| CP  | `CP4` | Implementation-control tranche, not a final synthesis surface. |
| CF  | `(0/1/2)` | Composition is dialectical synthesis between Track 07 individual extensions and the integrated plugins. |
| CFP | `CFP0` | One shared preflight contract reused by both integrated plugins. |
| CS  | `Day`  | Grounded in current local repo state and real upstream readiness. |

## Relationship To 07.T0

Track 08 **inherits** 07.T0's `KernelBridgeAPI` adapter, forbidden-import set, and readiness taxonomy. It does NOT introduce a parallel bridge, a second forbidden-import list, or a divergent readiness vocabulary. The composition contract shapes (`IntegratedSurfaceContribution`, `IntegratedViewPart`, `IntegratedMiniInspector`, `IntegratedEvidenceProducer`, `IntegratedLayoutClaim`, `IntegratedReadiness`) live at `Body/M/epi-theia/shared` and are imported by both integrated plugins and the `ide-shell-m0-m5` chrome extension.

See `08-t0-composition-contract-preflight.json` for the machine-readable contract, fixture requirements, compatibility matrix, and open decisions.

## Integrated Plugins

- **`plugin-integrated-1-2-3`** — Cosmic Engine composition (M1 + M2 + M3). Single profile stream. Carries `137 = 64 + 72 + 1` at the M1/M2/M3 cosmic spine. M0 stays as prior ground unless canon decision DCC-01 says otherwise.
- **`plugin-integrated-4-5-0`** — Privacy-first composition (M4 + M5 + M0). Jiva-is-Siva recognition surface. Protected-local M4 body NEVER enters this composition — only Graphiti-handle-style opaque references plus S5 review evidence.

## Shared Rules

- Both plugins consume S0/S2/S3/S5 only through the **same shared `KernelBridgeAPI` adapter** declared by 07.T0.
- No integrated plugin imports raw `Body/S/S0`, `Body/S/S2`, `Body/S/S3`, `Body/S/S5`, `@clockworklabs/spacetimedb-sdk`, `neo4j-driver`, `redis`, `portal-core`, or `epii-review-core` — the same forbidden-import set as 07.T0.
- Composition orchestration is owned by `Body/M/epi-theia/shared` (favoured over per-plugin or ide-shell ownership) to avoid divergent layout arbitration.
- Per-extension UI internals are Track 07-owned and **explicitly out of scope** for Track 08.
- M4 protected-local body never crosses the public bridge; recognition surfaces consume Graphiti protected handles only.

## Fixture Payloads

| Upstream | Payload | Source of truth |
| --- | --- | --- |
| S0 (Track 01) | `MathemeHarmonicProfile` safe public-current | `Body/S/S0/portal-core/contract-inventory/baseline-profile.json` (real-code generated) |
| S0 (Track 01) | `KernelTemporalProjection` | `Body/S/S0/epi-cli/tests/kernel_api_envelope_contract.rs` |
| S0 (Track 01) | `PointerWeb36` | `Body/S/S0/epi-cli/tests/pointer_web_ffi_contract.rs` |
| S2 (Track 02) | Filtered subgraph by namespace | `Body/S/S2/graph-services/tests/graph_api_contract.rs` |
| S2 (Track 02) | Registered relationship set | `Body/S/S2/graph-schema/contract-inventory/track-02-authority-drift.json` |
| S3 (Track 03) | `world_clock` / `pratibimba_presence` deltas | Blocked until Track 03 T3 native WebSocket lands |
| S3 (Track 03) | Session/DAY/NOW handle | `epi gate session.patch` RPC (carries `vak_address` per commit `19fbc8fc`) |
| S4 (Track 09) | Mediation envelope + gateway methods | `Body/S/S5/epii-agent/agent-contract.json` + `Body/S/S5/epii-agent/contract-ledger/track-09-preflight.json` |
| S5 (Track 04) | Review DTO / autoresearch route queue | Blocked until Track 04 T6-T7 |

Fixture tests **must** parse payloads captured from real upstream services or upstream contract tests. Handwritten happy-path JSON alone is not accepted as readiness evidence.

## Verification

The preflight validator at `Body/M/epi-theia/extensions/test/validate-composition-contract-preflight.test.mjs` asserts:

- Both integrated plugins are present with the expected extension contributors.
- All six required contract shapes are declared with the required-fields set.
- The readiness taxonomy matches 07.T0 (no divergent vocabulary).
- Forbidden imports inherit from 07.T0 exactly.
- The compatibility matrix marks Track 07 per-extension internals as out of scope.

Run with `node --test Body/M/epi-theia/extensions/test/validate-composition-contract-preflight.test.mjs`.
