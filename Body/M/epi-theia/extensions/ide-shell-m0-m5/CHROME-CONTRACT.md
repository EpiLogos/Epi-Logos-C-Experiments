# IDE Shell M0/M5 Chrome Contract

This file is the single source of truth for the `ide-shell-m0-m5` chrome partition. Any tranche that touches the M0/M5 IDE shell must audit and extend this contract; it must not rebuild the chrome from a greenfield surface.

## 1. Three Partitions

The unified chrome has three categories:

| Category | Surfaces | Ownership |
| --- | --- | --- |
| M0' chrome | `bimba-graph-viewer`, `canon-studio`, `coordinate-tree` | Coordinate-rooted navigation, canonical read surfaces, and governed-route write initiation per DR-M0-1. |
| M5' chrome | `logos-atelier`, `evidence-pane`, `review-pane`, `autoresearch-pane`, `agentic-control-room` | Governance write surfaces, review state, autoresearch state, and agentic evidence. |
| shared infrastructure | `bridge-gate` | Kernel-bridge readiness, nine-id readiness taxonomy, and per-binding inline rendering. |

`bridge-gate` is not optional chrome. It is the shared boundary that every M0' chrome and M5' chrome widget crosses before rendering live bridge-bound content.

## 2. Per-Widget Slot Assignment

The `activity-bar slot` names below are the stable layout handles used by the deep IDE descriptor and cross-layout intent restoration.

| Widget id | Slot | Contract category |
| --- | --- | --- |
| `pratibimba.ide-shell.coordinate-tree` | activity-bar left; slot `coordinate-tree` | M0' chrome |
| `pratibimba.ide-shell.bimba-graph-viewer` | activity-bar left; slot `bimba-graph-viewer` | M0' chrome |
| `pratibimba.ide-shell.canon-studio` | activity-bar left plus main editor; slot `canon-studio` | M0' chrome |
| `pratibimba.ide-shell.logos-atelier` | main editor; slot `logos-atelier` | M5' chrome |
| `pratibimba.ide-shell.agentic-control-room` | main editor; slot `agentic-control-room` | M5' chrome |
| `pratibimba.ide-shell.evidence-pane` | right sidebar; slot `evidence-pane` | M5' chrome |
| `pratibimba.ide-shell.review-pane` | right sidebar; slot `review-pane` | M5' chrome |
| `pratibimba.ide-shell.autoresearch-pane` | right sidebar; slot `autoresearch-pane` | M5' chrome |
| `bridge-gate` | per-binding inline readiness wrapper | shared infrastructure |
| `backend-studio` | activity-bar left; `ide-deep` only | first-build allowance |
| `smart-connections` | activity-bar left; `ide-deep` only | first-build allowance |

Backend Studio and Smart Connections are allowed first-build stubs only. They do not change the eight-widget M0/M5 chrome partition until they receive explicit contract rows and ownership decisions.

## 3. SharedBridgeAdapter as Only Network

`SharedBridgeAdapter` is the only network primitive for this chrome. Widgets may call bridge-facing gateway methods through the injected adapter, but they must not open WebSockets, fetch S2/S3/S5 endpoints directly, allocate alternate persistence channels, or import runtime packages that bypass the adapter.

| Widget | Gateway obligations |
| --- | --- |
| `coordinate-tree` | Read coordinate context and profile tick data through `SharedBridgeAdapter`; no local coordinate authority. |
| `bimba-graph-viewer` | Read graph nodes/subgraphs through `SharedBridgeAdapter`; no direct S2 graph import. When map traversal lands on a Bimba coordinate, render the M5-0' library surface inside the same graph chrome from `bimba_coordinate` plus `bimba_resonances` tags; do not add standalone graph-viewer packages or generic graph/file/agent view modes. |
| `canon-studio` | Open canonical artifacts from bridge-provided intent context; writes route through governed M5/vault bridge paths only. |
| `logos-atelier` | Request governance write intents through bridge-mediated commands; no local mutation of graph canon. |
| `evidence-pane` | Consume bridge-delivered evidence envelopes after privacy gating. |
| `review-pane` | Consume bridge-delivered review state after privacy gating. |
| `autoresearch-pane` | Consume bridge-delivered autoresearch receipts and evidence handles; no direct research backend calls. |
| `agentic-control-room` | Consume kernel-bridge runtime events, readiness state, capability matrix data, and Pi axiom-translation history (`s5'.epii.axiom_translation_history`) through adapter-backed services. Axiom translation renders only as the `PiAxiomTranslationInspector` sub-pane inside ACR, never as a standalone widget. |
| `bridge-gate` | Render readiness state from the adapter/kernel bridge boundary and pass only ready or explicitly degraded bindings through. |

Forbidden direct imports include raw S2 graph clients, raw S3 subscription clients, raw S5 review clients, Graphiti body stores, Nara body stores, profile stores outside kernel-bridge, alternate bridge clients, direct gateway WebSockets, and direct persistence writers.

## 4. M0/M5 Governance Flow

M0' chrome reads on the left: coordinate tree, Bimba graph viewer, and Canon Studio expose coordinate-rooted navigation and canonical read state.

M5' chrome writes through governance: Logos Atelier, Evidence Pane, Review Pane, Autoresearch Pane, and Agentic Control Room own the governance write and agentic evidence surfaces. The invariant is `mutatesGraphCanon: false` for every renderer. Renderers may request governed actions; they must not mutate graph canon locally.

The Möbius write-back grammar is: M0' selects and reads a coordinate; M5' reviews, evidences, and governs write intent; the bridge returns readiness/provenance; M0' re-renders from the next public profile tick.

The Klein library seam is coordinate-tagged, not mode-tagged: map traversal
selects the coordinate, and the Library/Gnostic namespace surfaces beneath that
selection through direct `bimba_coordinate` and classified `bimba_resonances`
fields.

## 5. ide-shell vs OmniPanel Split

DR-WC-IS-1 is resolved as GOVERNANCE PRIMARY in `ide-shell-m0-m5`: full governance, review, and evidence work belongs here.

DR-WC-IS-2 is resolved as AGENTIC PRIMARY for abbreviated OmniPanel click-through: OmniPanel may display shortened state and route intent, but the deep render and governing action surface belongs in the IDE shell.

DR-WC-IS-3 remains a cross-layout obligation: every intent target exposed by this package must route into the same widget id and preserve coordinate, privacy, profile-generation, and provenance fields.

## 6. Bridge-Gate Readiness Primitive

`kernel-bridge` readiness is the only readiness primitive. Widgets must not invent parallel readiness enums, placeholder-ready states, or local demo fallbacks.

`bridge-gate` renders the nine-id readiness taxonomy inline for each binding:

- `bridge_unavailable`
- `profile_missing_field`
- `s2_graph_blocked`
- `s3_subscription_blocked`
- `s5_review_blocked`
- `authority_payload_missing`
- `privacy_blocked`
- `degraded_but_readable`
- `ready_public_current`

Each binding renders its own readiness state where the blocked or degraded data would otherwise appear. Global banners may summarize, but they do not replace per-binding inline rendering.

## 7. Privacy and Profile Tick

The privacy gate is non-bypassable. Every payload must pass `isPrivacySafe()` before a widget commits it to state, render output, status-bar fields, persisted editor content, or bridge-emitted evidence. Forbidden privacy classes are refused even when the payload arrives through a trusted bridge path.

Profile-tick re-render contract: widgets subscribe through the shared bridge/profile tick path, equivalent to `useProfileTick()` in React surfaces. A changed profile generation invalidates coordinate reads, evidence rows, review summaries, autoresearch receipts, and agentic control room state derived from the previous generation.

Status-bar shared fields may display only coordinate, profile generation, readiness id, and privacy-safe provenance handles. They must not surface protected text, private body payloads, raw Graphiti/Nara fields, or unredacted evidence bodies.

## 8. DR Cross-Reference

- DR-M0-1: coordinate-rooted navigation and governed-route write initiation.
- DR-M5-1: governance write and agentic evidence ownership.
- DR-MP-1, DR-MP-2, DR-MP-3: shared bridge/profile/privacy constraints.
- DR-WC-IS-1: ide-shell is GOVERNANCE PRIMARY.
- DR-WC-IS-2: OmniPanel is AGENTIC PRIMARY only for abbreviated routing and click-through.
- DR-WC-IS-3: cross-layout intent targets preserve widget id and provenance obligations.
- DR-IG-1: bridge-gate readiness and inline degraded rendering.
- DR-TS-1: profile-tick re-render and status-bar field discipline.

## 9. First-Build Allowances

Allowed first-build work in this contract:

- Activity-bar contribution wiring for the eight owned widgets.
- Backend Studio, `ide-deep` only, until it receives a full partition row.
- Smart Connections stub, `ide-deep` only, until it receives a full partition row.
- PrivacyDropFeed, when fed only by privacy-safe bridge events and dropped-count metadata.
- `CHROME-CONTRACT.md` itself.

Anti-greenfield rule: audit-extend, never rebuild. New chrome work must cite the relevant section here, preserve `SharedBridgeAdapter` as the only network primitive, preserve `kernel-bridge` readiness as the only readiness primitive, and preserve the M0'/M5'/shared partition unless a later decision record explicitly changes it.
