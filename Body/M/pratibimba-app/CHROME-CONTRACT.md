# Pratibimba-App Chrome Contract — M0'/M5'/shared Partition

**Coordinate:** M' (carrier chrome partition law — rerun 28.T28.1)
**Residency:** `Body/M/pratibimba-app/CHROME-CONTRACT.md`
**Position:** #4 — Context/Type (the chrome partition IS the type law of the carrier's surfaces)
**Actualises:** SC-I-1 + SC-I-2 + SC-I-4 of `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/28-ide-shell-chrome-deep.md`, remapped from the frozen Theia contract `Body/M/epi-theia/extensions/ide-shell-m0-m5/CHROME-CONTRACT.md` (structure + capability inventory are LAW; Theia plumbing is dead) onto the carrier's real chrome.
**Public surface:** the §2 surface table (machine-parsed by `src/chromeContract.test.ts`), the §6 nine-id readiness taxonomy, the §5 CrossLayoutIntent envelope field list.
**Does NOT own:** pane bodies (their tranches), gateway protocol (`Body/S/S3/gateway-contract`), vault law (S1/Hen), kernel computation (`Body/S/S0/portal-core`), the OmniPanel tab manifest values (`src/panes/omni/omnipanelRuntime.ts` owns `OMNIPANEL_TABS`; this contract must stay in parity with it, not the reverse).
**Contract:** this file. Validator: `src/chromeContract.test.ts` (vitest; parses this file against the live registry in `src/App.tsx` + `OMNIPANEL_TABS`).

This file is the single source of truth for the pratibimba-app chrome partition. The carrier's chrome is **one system** — one flexlayout shell over two faces (0 cosmic / 1 personal), one command registry, one gateway client, one readiness/provenance discipline — partitioned into **three categories**. Any tranche that touches the carrier chrome must audit and extend this contract; it must not rebuild the chrome from a greenfield surface.

Provenance: carrier translation of the frozen `ide-shell-m0-m5/CHROME-CONTRACT.md` (read, verified against the live App shell 2026-07-12). The Theia widget-id inventory survives below as the **capability lineage** column; Theia activity-bar slots and Inversify wiring translate to the carrier's face/border/tabset reality.

## 1. Three Partitions

| Category | Role | Ownership |
| --- | --- | --- |
| M0' chrome | READS | Coordinate-rooted navigation, canonical/kernel read surfaces, and governed-route write **initiation** per DR-M0-1. Includes the personal vault surfaces whose write-backs stay inside the S1 Present journal scope — journal law, never graph-canon writes. |
| M5' chrome | GOVERNANCE | Governance write routing, agentic dispatch, review state, evidence, autoresearch state, and the Atelier command surface. Every canon-affecting intent routes here before anything is written. |
| shared infrastructure | READINESS + SHELL | Readiness/provenance primitives, the profile-tick re-render seam, status strip, command palette, and the gateway/diagnostics folds. Consumed by both partitions; owns no domain content. |

The readiness primitive (§6) is not optional chrome. It is the shared boundary every M0' and M5' surface crosses before rendering live gateway-bound content — today via the provenance store + `ProvenanceBadge`, as the nine-id per-binding gate once 28.11 lands.

## 2. Per-Surface Mount Assignment

Surface ids are the carrier's **flexlayout component keys** (`App.tsx::factory`) — the stable layout handles used by saved-layout restoration and cross-layout intent routing; they are the carrier analogue of the frozen Theia widget ids. Non-tab shell chrome carries kebab-case ids. Status vocabulary: `live` (factory-mounted, body landed) · `pending-fold` (factory-mounted, honest pending pane, body owned by its tranche) · `pending` (declared here doc-ahead; NOT yet in the factory — landing it means flipping this row, the validator enforces) · `legacy` (factory redirect for stale saved layouts) · `shell` (live non-tab chrome).

| Surface id | Mount | Partition | Status | Renderer / owner | Carries (frozen lineage) |
| --- | --- | --- | --- | --- | --- |
| `bimbaGraph` | face 0 `cosmic-main` tab "Bimba" | M0' chrome | live | `GraphExplorerPane` + `M0LayerRail` (01.T1.1 / 09.T9.1) | `bimba-graph-viewer` |
| `walk` | face 0 `cosmic-main` tab "Walk" | M0' chrome | live | `WalkPane` (M1' walk-as-melody) | — |
| `spandaNavigator` | face 0 `cosmic-main` tab "Spanda" | M0' chrome | live | `SpandaNavigatorPane` (22.T22.1) | — |
| `cosmic` | face 0 `cosmic-main` tab "Cosmic Engine" | M0' chrome | live | `CosmicEngine` (modulation-graph host) | — |
| `m2Correspondence` | face 0 `cosmic-main` tab "Correspondence" | M0' chrome | live | `M2CorrespondencePane` | — |
| `kleinTopology` | face 0 `cosmic-main` tab "Klein" | M0' chrome | live | `KleinTopologyPane` (02.T2.3) | `m1.paramasiva.kleinTopology` |
| `m1PlayedTorus` | face 0 `cosmic-main` tab "Played Torus" | M0' chrome | live | `PlayedTorusPane` | — |
| `m1SurfaceComposed` | face 0 `cosmic-main` tab "M1 Surface" | M0' chrome | live | `M1SurfaceDispatchPane` (22.T22.10 — `composed-cosmic-1-2-3` mode, DR-WC-M1-1) | — |
| `m1SurfaceDeep` | face 1 `personal-main` tab "M1 Deep" | M0' chrome | live | `M1SurfaceDispatchPane` (22.T22.10 — `standalone-ide-deep` mode, DR-WC-M1-1) | — |
| `m3PentadicInspector` | face 0 `cosmic-main` tab "Pentadic" | M0' chrome | live | `PentadicInspectorPane` | — |
| `m3Inspectors` | face 0 `cosmic-main` tab "M3 Inspectors" | M0' chrome | live | `M3InspectorsPane` (hosts `M3CosmicWheelRenderService`, 24.T24.1) | — |
| `m5Ebm` | face 0 `cosmic-main` tab "M5 EBM" | M0' chrome | live | `M5EbmObservatoryPane` (26.T26.1 — M5-domain content, READ role: "M5 does not talk. It scores.") | — |
| `fileTree` | face 1 left border "Vault" | M0' chrome | live | `FileTreePane` | — |
| `journalTimeline` | face 1 left border "Journal" | M0' chrome | live | `JournalTimelinePane` | — |
| `dayCalendar` | face 1 left border "Calendar" | M0' chrome | live | `DayCalendarPane` | — |
| `oracle` | face 1 left border "Oracle" | M0' chrome | live | `OraclePane` (real CLI cast via Tauri `oracle_cast`) | — |
| `personalHome` | face 1 `personal-main` tab "Now" | M0' chrome | live | `NowPane` (M4' day surface) | — |
| `m4DialogicalArena` | face 1 `personal-main` tab "Arena" | M0' chrome | live | `M4DialogicalArenaPane` (41.T41.7 — M4' dia-logical arena; view id `m4.nara.dialogicalArena`; protected-local handle-only; CPF (00/00) wizard gate; renders `pending-wire` while the `m4.arena.*` ws seam is unimplemented) | `m4.nara.dialogicalArena` |
| `canonUpdateLedger` | face 1 `personal-main` tab "CU Ledger" | M0' chrome | live | `CanonUpdateLedgerPane` (40.T40.5 — Track-40 CU-ledger review over `s5'.canon_update.list`, Track-48 query-view posture; renders `pending-wire` while the `s5'.canon_update.*` ws seam is unimplemented) | — |
| `editor` | face 1 dynamic tabs (`vault.open`) | M0' chrome | live | `MarkdownEditorPane` (canonical READ half; S1 Present journal write scope only — see §4) | `canon-studio` (read half) |
| `coordinateTree` | face 1 left border (designated) | M0' chrome | pending | 28.6 owns; navigation currently carried by `bimbaGraph` click-selection + `walk` traversal via the shared coordinate store | `coordinate-tree` |
| `backendStudio` | face 0/1 (designated, deep-mode) | M0' chrome | pending | 28.13 owns (first-build allowance, §9) | `backend-studio` |
| `smartConnections` | face 1 left border (designated, deep-mode) | M0' chrome | pending | 28.12 owns (first-build allowance, §9) | `smart-connections` |
| `cymatic` | legacy saved-layout redirect | M0' chrome | legacy | `App.tsx::factory` redirect message (surface is now a Cosmic Engine layer) | — |
| `codon` | legacy saved-layout redirect | M0' chrome | legacy | `App.tsx::factory` redirect message (surface is now a Cosmic Engine layer) | — |
| `omniChat` | `/` omni border, both faces, tab "Pi" | M5' chrome | live | `ChatPane` (27.1; Pi voice = agentic dispatch entry) | — |
| `omniSessions` | `/` omni border, both faces, tab "Sessions" | M5' chrome | live | `SessionsPane` (27.2) | — |
| `omniLogs` | `/` omni border, both faces, tab "Tools" | M5' chrome | live | `LogsPane` (27.4; tool-stream temporal fold) | — |
| `omniDispatchTrace` | `/` omni border, both faces, tab "Dispatch" | M5' chrome | pending-fold | 27.3 owns the body; AGENTIC PRIMARY abbreviated render (§5) | `agentic-control-room` (abbreviated) |
| `omniEvidence` | `/` omni border, both faces, tab "Evidence" | M5' chrome | pending-fold | 27.5 owns the body | `evidence-pane` |
| `omniReview` | `/` omni border, both faces, tab "Review" | M5' chrome | pending-fold | 27.6 owns the body; `m5ReviewGate.ts` decision logic is live (08.T8.3) | `review-pane` |
| `agenticControlRoom` | main tabset (designated, deep render) | M5' chrome | pending | 28.5 owns; GOVERNANCE PRIMARY deep render (§5) | `agentic-control-room` |
| `autoresearch` | main tabset (designated) | M5' chrome | pending | 28.10 / 28.15 own | `autoresearch-pane` |
| `atelier-commands` | command registry (`atelier.scentFollow` / `atelier.cognateSearch` / `atelier.psychoidTrace`) | M5' chrome | shell | `src/commands/atelier.ts` (16.T16.19; Möbius write-back stage pending, 28.7 — see §4) | `logos-atelier` |
| `omniGateway` | `/` omni border, both faces, tab "Gateway" | shared infrastructure | pending-fold | 27.7 owns the body | — |
| `omniDiagnostics` | `/` omni border, both faces, tab "Diagnostics" | shared infrastructure | pending-fold | 27.8 owns the body; `PrivacyDropFeed` destination (28.16) | — |
| `status-strip` | shell footer | shared infrastructure | shell | `StatusStrip` (15.10 — exactly six entries, all store-consumed, §7) | — |
| `command-palette` | shell overlay (⌘⇧P) | shared infrastructure | shell | `CommandPalette` + `commands/registry.ts` (T2.4) | — |
| `provenance-badge` | per-binding inline | shared infrastructure | shell | `ProvenanceBadge` (`ProvenanceState` taxonomy — no widget invents its own provenance rendering) | — |
| `profile-tick` | per-surface re-render seam | shared infrastructure | shell | `state/useProfileTick.ts` (27.T27.0 — the ONE 15.6 seam) | — |
| `readiness-gate` | per-binding inline wrapper (designated) | shared infrastructure | pending | 28.11 owns: nine-id taxonomy module + per-binding inline rendering (§6) | `bridge-gate` |

The `pending` rows are the doc-ahead half of this contract: when a designated surface lands it MUST take the surface id declared here and flip its row to `live`/`shell` — the validator fails a `pending` id found in the factory.

## 3. GatewayClient as Only Network

`bridge/gatewayClient.ts` (held by `bridge/gatewayHolder.ts`, opened once by `App.tsx`) is the only network primitive for this chrome — the carrier translation of `SharedBridgeAdapter`. Surfaces invoke gateway methods through the holder; they must not open their own WebSockets, fetch S2/S3/S5 endpoints directly, allocate alternate persistence channels, or import substrate packages that bypass the client. Local filesystem access rides the Tauri vault service (`invokeCommand`) under S1 scope law only.

| Surface | Gateway obligations (live methods as of 2026-07-12) |
| --- | --- |
| `bimbaGraph` | `s2.graph.query` read-only (nodes/links Cypher); canon mutation is Hen's (DR-M0-1). |
| `m2Correspondence` | `s2.parashaktiCorrespondences` (Asma overlay rides the same read). |
| `omniChat` | `chat.history` / `chat.send`. |
| `omniSessions` | `sessions.list` / `sessions.resolve` via `bridge/sessionClient.ts`. |
| `atelier-commands` | `s1'.entity.capture` (scent-follow stages a Hen-promotion CANDIDATE — Atelier proposes, Hen reviews), `s1'.semantic.suggest_links`, `s0'.anuttara.trace`. |
| `omniReview` (fold body, 27.6) | `s5'.review.*` reads; decisions gated by `m5ReviewGate.ts` BEFORE dispatching `s5'.review.submit`. |
| `agenticControlRoom` / `omniDispatchTrace` / `omniEvidence` (bodies pending) | bridge-delivered run/evidence envelopes only, after privacy gating; capability parity via `isMediationCapabilityAllowed` (matrix arrives with 12.10). |
| every surface | `profile.update` heartbeat + `m123.chime` arrive ONLY through the one `GatewayClient`; events enter the ring (`state/eventsStore.ts`), liveness pulses never do. |

Forbidden direct imports (carrier translation of the frozen `sharedBridgeAdapter.forbiddenDirectImports`): `neo4j-driver`, `redis`, `@clockworklabs/spacetimedb-sdk`, `portal-core`, `epii-review-core`, `epii-agent-core`, anything under `Body/S/S0` / `Body/S/S2` / `Body/S/S3` / `Body/S/S5`, raw `WebSocket` construction outside `bridge/gatewayClient.ts`, and direct persistence writers outside the Tauri vault service. Track 28 introduces NONE.

## 4. M0/M5 Governance Flow

M0' chrome reads: the graph explorer, walk, layer rail, and vault/editor surfaces expose coordinate-rooted navigation and canonical read state. Every M0 layer view pins `mutatesGraphCanon: false` (`src/panes/m0Layers.ts`, DR-M0-1).

M5' chrome governs writes: authoring affordances on M0' surfaces NEVER mutate canon locally. The **Möbius write-back grammar**, carrier form:

1. M0' selects — a coordinate lands in the shared coordinate store (graph click, walk step, layer route); the open note is the Atelier's operand.
2. M5' stages — `atelier.scentFollow` captures the note as a Hen-promotion CANDIDATE via `s1'.entity.capture`; review rides the `omniReview` fold gated by `m5ReviewGate` (human gate for recursive self-review lineages).
3. Crystallisation — the governed write routes through `aletheia_crystallise` (write-back stage pending, owned by 28.7) and returns M5-vetted content to the canonical read surface (`editor` — the Canon Studio read half).
4. Return — M0' re-renders from the next public profile generation (`useProfileTick`); nothing re-renders from its own write.

Boundary note: the `editor`'s debounced write-back into `Idea/Empty/Present/...` is **journal law** (S1 Present write scope, `src-tauri/vault.rs`) — a personal-vault write, not a graph-canon write. Canon promotion ALWAYS takes the staged route above (CCT-14 lifecycle; Atelier proposes, Hen reviews, canon-write follows).

## 5. Governance-Primary vs Agentic-Primary Split

**DR-WC-IS-1 — RESOLVED: GOVERNANCE PRIMARY.** Full governance, review, and evidence work belongs to the deep-render surfaces of this carrier: the designated `agenticControlRoom` main-tabset pane (28.5) and the deep folds it opens. The frozen ide-shell's governance-primary role transfers to these surfaces intact.

**DR-WC-IS-2 — RESOLVED: AGENTIC PRIMARY for the `/` membrane.** The omni border tabs (`omniDispatchTrace`, `omniEvidence`, `omniReview`) render abbreviated, time-ordered, Pi-context state and route intent by click-through; the deep render and the governing action surface belong to the governance-primary panes. Same `MediatedRunEvidencePacket` data, two foldings.

**DR-WC-IS-3 — cross-layout obligation.** Every intent target routes into the same surface id (§2) and preserves the envelope. The **CrossLayoutIntent envelope** field inventory is LAW (frozen `omnipanel-types.ts` lineage): `coordinate` / `artifactUri` / `reviewId` / `dayNow` / `sessionKey` / `profileGeneration` / `privacyClass` / `requestedExtensionId` / `requestedContributionId`. Carrier reading: `requestedExtensionId` addresses the face/border, `requestedContributionId` addresses the §2 surface id. Registration of intent targets is 28.14's lane; handlers route through `commands/registry.ts` (the single intent spine — `vault.open` is the live exemplar).

## 6. Readiness Primitive

Kernel-bridge readiness is the only readiness primitive. Surfaces must not invent parallel readiness enums, placeholder-ready states, or local demo fallbacks.

The nine-id readiness taxonomy (07-t0 lineage, verbatim LAW):

- `bridge_unavailable`
- `profile_missing_field`
- `s2_graph_blocked`
- `s3_subscription_blocked`
- `s5_review_blocked`
- `authority_payload_missing`
- `privacy_blocked`
- `degraded_but_readable`
- `ready_public_current`

Rendering law: each binding renders its own readiness state inline where the blocked or degraded datum would otherwise appear (border colour / pending badge / blocked overlay per 15.6); a wrapping pending shell is allowed ONLY for `bridge_unavailable`. No separate errors panel — provenance lives at the datum. Global summaries (status strip, `omniGateway`) may summarize, never replace.

Carrier state of truth: today the app renders readiness through the provenance store (`connection` / `supervisor` / `stale`) and the `ProvenanceState` badge taxonomy (`canonical / derived / inferred / pending / canonical_absent / review_pending / blocked`). The nine-id taxonomy module (`readiness-gate`, §2) lands under 28.11 as the single exported source; until then the badge taxonomy is the honest interim and every new binding must consume it rather than inventing readiness.

## 7. Privacy and Profile Tick

The privacy gate is non-bypassable: no private journal/identity bodies in stores or events — handles only (E6 law: the natal sky never crosses the gateway bus; the bus carries the kernel's `quintessence` handle summary per DR-M4-3). Payloads pass the privacy discipline before a surface commits them to state, render output, status fields, persisted editor content, or emitted evidence. Per-surface dropped-payload counts aggregate via `PrivacyDropFeed` into `omniDiagnostics` (28.16).

Profile-tick re-render contract: `state/useProfileTick.ts` is the ONE re-render seam (generation-gated zustand, no timers; one clock — no `setInterval`/rAF-as-clock anywhere). A changed profile generation invalidates coordinate reads, evidence rows, review summaries, autoresearch receipts, and control-room state derived from the previous generation.

Status-strip shared fields (15.10, exactly six): tick generation · day-now · session · gateway state · supervisor state · active coordinate — consumed FROM the four stores, never owned by widget state. They display only privacy-safe handles.

## 8. DR Cross-Reference

- DR-M0-1: coordinate-rooted navigation and governed-route write initiation (`m0Layers.ts` pins `mutatesGraphCanon: false`).
- DR-M5-1: governance write and agentic evidence ownership (M5' partition).
- DR-MP-1, DR-MP-2, DR-MP-3: shared bridge/profile/privacy constraints (§3, §7).
- DR-WC-IS-1: governance-primary deep render — RESOLVED in §5.
- DR-WC-IS-2: agentic-primary abbreviated `/` membrane + click-through — RESOLVED in §5.
- DR-WC-IS-3: cross-layout intent targets preserve surface id + envelope fields (§5).
- DR-IG-1: readiness-gate inline degraded rendering (§6).
- DR-TS-1: profile-tick re-render and status-field discipline (§7).
- DR-WC-OP-1: the omni collapse map (`/ chat` → `omniChat`, `logs` → `omniLogs`) — carrier addition; `OMNIPANEL_TABS` is its live form.

## 9. First-Build Allowances

Allowed first-build work under this contract (everything else is audit-extend):

- The designated `pending` surfaces of §2: `coordinateTree` (28.6), `agenticControlRoom` (28.5), `autoresearch` (28.10/28.15), `backendStudio` (28.13), `smartConnections` (28.12), `readiness-gate` (28.11).
- The pending omni fold bodies (27.3 / 27.5 / 27.6 / 27.7 / 27.8) inside their already-mounted tabs.
- `PrivacyDropFeed`, fed only by privacy-safe events and dropped-count metadata (28.16).
- `CHROME-CONTRACT.md` itself (this tranche, 28.T28.1).

Anti-greenfield rule: audit-extend, never rebuild. New chrome work must cite the relevant section here, take its declared §2 surface id, preserve `GatewayClient` as the only network primitive, preserve the readiness primitive of §6, and preserve the M0'/M5'/shared partition unless a later decision record explicitly changes it. The validator `src/chromeContract.test.ts` holds this file and the live registry in lockstep.
