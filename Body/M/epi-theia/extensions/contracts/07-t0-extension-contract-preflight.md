# Track 07 T0 Extension Contract Preflight

This contract package is the implementation-control artifact for `07.T0` under `Body/M/epi-theia/extensions/`. It defines the six individual M-extension packages before any UI code lands, binds them to the shared `KernelBridgeAPI` boundary, and records the readiness discipline later tranches must obey.

## VAK Baseline

Live `epi agent vak evaluate --json "Extension Contract Preflight"` result:

| Layer | Coordinate | Meaning for this tranche |
| --- | --- | --- |
| CPF | `C2` | Contract-control work inside the active implementation program. |
| CT | `CT4b` | Cross-track operational packaging that prepares downstream execution rather than resolving canon by fiat. |
| CP | `CP4` | A concrete implementation-control tranche, not a final synthesis surface. |
| CF | `(4.0/1-4.4/5)` | This is Anima-style dispatch work across the reflective lattice. |
| CFP | `CFP0` | One shared preflight contract reused by all six extensions and Track 08 composition. |
| CS | `Day` | Truth is grounded in current local repo state and real upstream readiness evidence. |

## Shared Rules

- All six extensions depend on one shared bridge adapter over `KernelBridgeAPI`.
- No individual extension may import raw S0/S2/S3/S5 clients, raw SpaceTimeDB SDKs, or direct graph/review stores.
- All blocked or degraded states must render typed readiness instead of guessed defaults.
- Track 07 exports individual capabilities only; Track 08 owns integrated composition and multi-surface choreography.

## Readiness Taxonomy

- `bridge_unavailable`
- `profile_missing_field`
- `s2_graph_blocked`
- `s3_subscription_blocked`
- `s5_review_blocked`
- `authority_payload_missing`
- `privacy_blocked`
- `degraded_but_readable`
- `ready_public_current`

Readiness evidence requirements for every blocked or degraded state live in [07-t0-readiness-capture-requirements.json](</Users/admin/Documents/Epi-Logos C Experiments/Body/M/epi-theia/extensions/test/fixtures/07-t0-readiness-capture-requirements.json>). They deliberately name the owner-track command that must produce the payload instead of inventing handwritten bridge JSON before the bridge runtime exists.

## Command And Route Convention

- `m0.openCoordinate`
- `m1.startWalk`
- `m2.openMeaningPacket`
- `m3.openCodon`
- `m4.openArtifact`
- `m5.openReview`

Each command family reserves:

- `.readOnly` for safe inspect-only entry
- `.depositOnly` for evidence or request creation without mutation authority

Route scheme: `epi-logos://ide/<extension>/<surface>?...`

## Extension Inventory

The machine-readable authority is [07-t0-extension-contract-preflight.json](</Users/admin/Documents/Epi-Logos C Experiments/Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.json>). Highlights:

- `m0-anuttara`: language-map, OWL/SHACL inspector, R-virtue panel; reads S2 provenance and deposits review/evidence only through bridge methods.
- `m1-paramasiva`: clock/walk instrument, topology view, audio-bus inspector; consumes profile and audio bus exactly, never generates substrate-law locally.
- `m2-parashakti`: meaning packet, cymatic engine, correspondence browser; depends on proven correspondence payloads and honest missing-authority handling.
- `m3-mahamaya`: codon wheel, projection view, trace overlay; consumes backend codon projection and scalar refs only.
- `m4-nara`: DayContainer, Graphiti browser, personal field; protected-local handles only, with explicit privacy and consent gating.
- `m5-epii`: review queue, spine-state inspector, meta-conversation; dry-run/governed review state only until S5 mutation law lands.

## First-Slice Blockers

- Track 01 owns profile generation, pointer anchors, bridge readiness, bounded capability surfaces, and profile-field completeness.
- Track 02 owns coordinate-native graph law, provenance, correspondence payloads, codon/scalar libraries, and graph-derived readiness.
- Track 03 owns one client-facing stream, session/DAY-NOW handles, world-clock, Kerykeion/Graphiti service paths, and privacy-safe shared-cosmos transport.
- Track 04 owns persisted review/improve state, consent records, review/evidence DTOs, and governance gates.
- Track 05 still owns the shell-vs-individual split and the Tauri/Theia runtime boundary that determines activation and deep-link hosting.

## Validation

Run:

```bash
node Body/M/epi-theia/extensions/scripts/validate-extension-contract-preflight.mjs
node --test Body/M/epi-theia/extensions/test/validate-extension-contract-preflight.test.mjs
```

The validator enforces:

- the six-extension inventory shape
- the shared readiness taxonomy
- the no-inline-fake-payload rule for blocked/degraded readiness capture requirements
- forbidden direct-import checks when real extension package code appears later
