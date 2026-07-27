# Pratibimba-App Chrome Contract — M0'/M5'/shared Partition

**Coordinate:** M' (carrier chrome partition law — rerun 28.T28.1)
**Residency:** `Body/M/pratibimba-app/CHROME-CONTRACT.md`
**Position:** #4 — Context/Type (the chrome partition IS the type law of the carrier's surfaces)
**Actualises:** SC-I-1 + SC-I-2 + SC-I-4 of `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/28-ide-shell-chrome-deep.md`, remapped from the frozen Theia contract `Body/M/epi-theia/extensions/ide-shell-m0-m5/CHROME-CONTRACT.md` (structure + capability inventory are LAW; Theia plumbing is dead) onto the carrier's real chrome.
**Public surface:** the §2 surface table (machine-parsed by `src/chromeContract.test.ts`), the §6 nine-id readiness taxonomy, the §5 CrossLayoutIntent envelope field list, the §10 action-surface policy, and the §11 command-catalog completeness gate (whose authoritative list lives in `src/commands/catalog.ts`, machine-parsed by `src/commands/catalog.test.ts` — not in this file's prose).
**Does NOT own:** pane bodies (their tranches), gateway protocol (`Body/S/S3/gateway-contract`), vault law (S1/Hen), kernel computation (`Body/S/S0/portal-core`), the OmniPanel tab manifest values (`src/panes/omni/omnipanelRuntime.ts` owns `OMNIPANEL_TABS`; this contract must stay in parity with it, not the reverse), and the command list itself (`src/commands/catalog.ts` owns `COMMAND_CATALOG`; §11 references it, it does not restate it).
**Contract:** this file. Validators: `src/chromeContract.test.ts` (vitest; parses this file against the live registry in `src/App.tsx` + `OMNIPANEL_TABS`) and `src/commands/catalog.test.ts` (vitest; diffs `COMMAND_CATALOG` against an AST walk of the real register sites, §11).

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
| `bimbaGraph` | face 0 `cosmic-main` tab "Bimba" | M0' chrome | live | `GraphExplorerPane` + `M0LayerRail` (01.T1.1 / 09.T9.1) + `bimbaGraph/GraphCanvas` — solar-anchor in `daily-0-1`, full-lattice in `ide-deep` (28.T28.3 a/b) | `bimba-graph-viewer` |
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
| `mocBases` | face 0 `cosmic-main` tab "Bases" | M0' chrome | live | `MocBaseReflectionPane` (evaluated MOC membership + canvas-linked external Obsidian Base views, 48.T48.4) | — |
| `m5Ebm` | face 0 `cosmic-main` tab "M5 EBM" | M0' chrome | live | `M5EbmObservatoryPane` (26.T26.1 — M5-domain content, READ role: "M5 does not talk. It scores.") | — |
| `piAxiomTranslation` | face 0 `cosmic-main` tab "Axiom" | M0' chrome | live | `PiAxiomTranslationInspector` (26.T26.14 — DR-B-2 four-column English→Formal→OWL→SHACL chain; strict read of `s5'.epii.axiom_translation_history`; producer is epi-cli `gate::epii_axiom` over the PI harness) | `m5.epii.axiomTranslation` |
| `fileTree` | face 1 left border "Vault" | M0' chrome | live | `FileTreePane` | — |
| `journalTimeline` | face 1 left border "Journal" | M0' chrome | live | `JournalTimelinePane` | — |
| `dayCalendar` | face 1 left border "Calendar" | M0' chrome | live | `DayCalendarPane` | — |
| `oracle` | face 1 left border "Oracle" | M0' chrome | live | `OraclePane` (real CLI cast via Tauri `oracle_cast`) | — |
| `personalHome` | face 1 `personal-main` tab "Now" | M0' chrome | live | `NowPane` (M4' day surface) | — |
| `medicineView` | face 1 `personal-main` tab "Medicine" | M0' chrome | live | `MedicineViewPane` (25.T25.10 — profile-tick `nara.medicine.snapshot`, eight canonical chakra rows, active Sun decan, botanical evidence, explicit S1-governed NOW pin; never prescription) | `m4.nara.medicine` |
| `transformContainers` | face 1 `personal-main` tab "Transform" | M0' chrome | live | `TransformContainersPane` (25.T25.11; governed `nara.transform.start/advance` lifecycle over protected-local NOW state) | `m4.nara.transform` |
| `pratibimbaCoordinate` | face 1 `personal-main` (cross-layout `m4-nara/personalCoordinate`) | M0' chrome | live | `PratibimbaCoordinatePane` (25.T25.14 — handle-only protected-personal-field render (DR-M4-3); atlas-sync `ConsentRecord` editor via `nara.pasu.consents.append` (DR-WC-M4-4); read-only identity-augment proposals with M5'-review-gate accept/reject via `nara.identity.proposals.list/decide`; never mutates Q_identity) | `m4.nara.personalCoordinate` |
| `logosCycle` | face 1 `personal-main` tab "Logos" | M0' chrome | live | `M4LogosCyclePane` (25.T25.13; governed `nara.logos.status/advance/regress` six-stage A-Logos→An-a-Logos cycle over protected-local artifacts; a regress marks the backward move with `c_4_regression`) | `m4.nara.logosCycle` |
| `m4DialogicalArena` | face 1 `personal-main` tab "Arena" | M0' chrome | live | `M4DialogicalArenaPane` (41.T41.7 — M4' dia-logical arena; view id `m4.nara.dialogicalArena`; protected-local handle-only; CPF (00/00) wizard gate; renders `pending-wire` while the `m4.arena.*` ws seam is unimplemented) | `m4.nara.dialogicalArena` |
| `canonUpdateLedger` | face 1 `personal-main` tab "CU Ledger" | M0' chrome | live | `CanonUpdateLedgerPane` (40.T40.5 — Track-40 CU-ledger review over `s5'.canon_update.list`, Track-48 query-view posture; renders `pending-wire` while the `s5'.canon_update.*` ws seam is unimplemented) | — |
| `kairosEnablement` | face 1 `personal-main` tab "Kairos setup" | M0' chrome | live | `KairosEnablementPane` (32.T32.10 — FR-3 default-off, probe-before-persist onboarding; local dependency failure remains disabled and renders install guidance) | `m4.nara.kairosEnablement` |
| `editor` | face 1 dynamic tabs (`vault.open`) | M0' chrome | live | `MarkdownEditorPane` (canonical READ half; S1 Present journal write scope only — see §4) | `canon-studio` (read half) |
| `coordinateTree` | face 1 left border (designated) | M0' chrome | pending | 28.6 owns; navigation currently carried by `bimbaGraph` click-selection + `walk` traversal via the shared coordinate store | `coordinate-tree` |
| `backendStudio` | face 0/1 (designated, deep-mode) | M0' chrome | pending | 28.13 owns (first-build allowance, §9) | `backend-studio` |
| `semanticConnections` | face 1 left border "Connections" | M0' chrome | live | `SemanticConnectionsPane` (28.T28.12; real `s1'.semantic.suggest_links`, shared vault selection, no local index) | `smart-connections` |
| `cymatic` | legacy saved-layout redirect | M0' chrome | legacy | `App.tsx::factory` redirect message (surface is now a Cosmic Engine layer) | — |
| `codon` | legacy saved-layout redirect | M0' chrome | legacy | `App.tsx::factory` redirect message (surface is now a Cosmic Engine layer) | — |
| `omniChat` | `/` omni border, both faces, tab "Pi" | M5' chrome | live | `ChatPane` (27.1; Pi voice = agentic dispatch entry) | — |
| `omniSessions` | `/` omni border, both faces, tab "Sessions" | M5' chrome | live | `SessionsPane` (27.2) | — |
| `omniLogs` | `/` omni border, both faces, tab "Tools" | M5' chrome | live | `ToolStreamPanel` (27.4 — temporal fold of the Pi→subagent genealogy via `DispatchGenealogyStream`, live/paused + actor/kind/time/tool filters; the raw gateway-event ring rides beneath as a subordinate `<details>` `LogsPane`, no regression) | — |
| `omniDispatchTrace` | `/` omni border, both faces, tab "Dispatch" | M5' chrome | live | `CompositionDispatchTracePane` (29.T29.11; bounded existing observability ring, no fifth store) + `ContextPackSection` (51.T51.1; the S4' spine injection this session was given, per carrier, read from `s4'.context.assemble`) | `agentic-control-room` (abbreviated) |
| `omniEvidence` | `/` omni border, both faces, tab "Evidence" | M5' chrome | live | `EvidencePanel` (27.5 — MediatedRunEvidencePacket deposition fold via `EvidencePacketList`/`EvidencePacketView`; mediator + privacy-class filters, cross-fold deep-links to Dispatch/Tools, embedded `DispatchTraceMiniGraph`; honest-empty until a real deposit feed lands — `s5.epii.deposit` feed-gated) | `evidence-pane` |
| `omniReview` | `/` omni border, both faces, tab "Review" | M5' chrome | live | `ReviewBlocksPane` (44.T44.3 — first real data through the Track-44 block standard: genealogy fixture → review-item/evidence/dispatch-genealogy blocks via `BlockHost`; 27.6 extends with live `s5'.review.*` reads + verdict submit under `m5ReviewGate.ts`, which is already live per 08.T8.3) | `review-pane` |
| `omniTuning` | `/` omni border, both faces, tab "Tuning" | M5' chrome | live | `TuningPane` (38.T06.8 — live registry read, Tier-1 developer write, local lock, and append-only audit view through `s5'.tune.*`; Tier-2 proposal remains unavailable until 38.T06.9) | — |
| `agenticControlRoom` | main tabset (designated, deep render) | M5' chrome | pending | 28.5 owns; GOVERNANCE PRIMARY deep render (§5) | `agentic-control-room` |
| `autoresearch` | personal main tabset | M5' chrome | live | `AutoresearchPane` (28.T28.10: real `s5'.improve.status/history` plus day-scoped `s5'.improve.q_review.latest` reads, profile-tick refresh, persisted VAK/pair-composition queue disclosure, honest non-projected pass ordinal, six-capacity filter, dry-run/human-gate disclosure; 28.15 extends) | `autoresearch-pane` |
| `atelier-commands` | command registry (`atelier.scentFollow` / `atelier.cognateSearch` / `atelier.psychoidTrace`) | M5' chrome | shell | `src/commands/atelier.ts` (16.T16.19; Möbius write-back stage pending, 28.7 — see §4) | `logos-atelier` |
| `omniGateway` | `/` omni border, both faces, tab "Gateway" | shared infrastructure | live | `GatewayPanel` (27.7 — capability list folded from the live `s4'.mediation.capabilities.list` snapshot via `loadMediationCapabilitySnapshot`, per-row parity (`isSnapshotCapabilityAllowed`) + inline try-it over `gateway().invoke`, `KernelBridgeReadinessChip`; six un-ported facets (nodes/models/skills/cron/config/settings) + disconnect render honest ReadinessBanners) | — |
| `omniDiagnostics` | `/` omni border, both faces, tab "Diagnostics" | shared infrastructure | live | `DiagnosticsPanel` (27.8 — kernel-bridge readiness ledger, matheme profile-generation + tick history, gateway WS state, active-layout, and the last-32 `CrossLayoutIntent` log fed from the `dispatchCrossLayoutIntent` seam; subscriber-count + `s2.graph_services.ping` absent → honest ReadinessBanners) — renders always (provenance-always-visible), never blanks on disconnect; `PrivacyDropFeed` destination (28.16) | — |
| `status-strip` | shell footer | shared infrastructure | shell | `StatusStrip` (15.10 — exactly six entries, all store-consumed, §7) | — |
| `command-palette` | shell overlay (⌘⇧P) | shared infrastructure | shell | `CommandPalette` + `commands/registry.ts` (T2.4) | — |
| `face-toggle` | shell title-bar, both faces | shared infrastructure | shell | `FaceToggleChrome` routes the coin control through `face.toggle`; DR-UI-4 lemniscate motion, no second state | — |
| `provenance-badge` | per-binding inline | shared infrastructure | shell | `ProvenanceBadge` (`ProvenanceState` taxonomy — no widget invents its own provenance rendering) | — |
| `profile-tick` | per-surface re-render seam | shared infrastructure | shell | `state/useProfileTick.ts` (27.T27.0 — the ONE 15.6 seam) | — |
| `readiness-gate` | per-binding inline wrapper (designated) | shared infrastructure | pending | 28.11 owns: nine-id taxonomy module + per-binding inline rendering (§6) | `bridge-gate` |

The `pending` rows are the doc-ahead half of this contract: when a designated surface lands it MUST take the surface id declared here and flip its row to `live`/`shell` — the validator fails a `pending` id found in the factory. `code-pending` is stricter: the layout claim remains machine-visible, but its receiver component MUST remain absent until the named gate and delivery owner land it.

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
| `omniTuning` (fold body, 38.T06.8) | `s5'.tune.registry.list/get/set`, `s5'.tune.audit.read`, and `s5'.tune.lock.toggle`; no local schema, validation, audit, or proposal lifecycle. |
| `kairosEnablement` | `nara.kairos.probe_kerykeion` before preference persistence; `nara.kairos.sync` only after a successful local dependency probe. |
| `journalTimeline` first-day affordance | `vault.day.ensure` -> `khora.session_start`; optional `nara.kairos.sync`; then `nara.session_open`. The carrier records `first-session.start` only after all required calls succeed. |
| `medicineView` | `nara.medicine.snapshot` on shared profile generation; `nara.medicine.pin` only for the explicit NOW pin gesture. This surface never invokes the legacy balance/prescribe methods. |
| `logosCycle` | `nara.logos.status` on mount; `nara.logos.advance` / `nara.logos.regress` on the explicit forward/back gestures. A regress requires user confirmation and writes a `c_4_regression` artifact; this surface owns no cycle law. |
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

**DR-WC-IS-3 — cross-layout obligation.** Every intent target routes into the same surface id (§2) and preserves the envelope. The **CrossLayoutIntent envelope** field inventory is LAW (frozen `omnipanel-types.ts` lineage): `coordinate` / `artifactUri` / `reviewId` / `dayNow` / `sessionKey` / `profileGeneration` / `privacyClass` / `requestedExtensionId` / `requestedContributionId`. Carrier reading: `requestedExtensionId` addresses the M-family receiver and `requestedContributionId` addresses its registered contribution. `src/commands/crossLayoutIntent.ts` is the live 31.T31.10 / 11.T11.2 union ledger and `pratibimba.intent.dispatch` handler; it routes all 45 declared targets through mounted carrier hosts, preserves the nine fields, and carries both requested ids into the selected host rather than silently substituting another pane. The resolved target, not a tenth envelope field, declares `daily-0-1`, `ide-deep`, or current-layout preservation; the shell persists that result under `epi-logos.layout.active`. `OMNIPANEL_TABS.availableInLayouts` is filtered against that preference when the carrier materialises its `/` border; all nine current folds explicitly inhabit both layouts.

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

- The designated `pending` surfaces of §2: `coordinateTree` (28.6), `agenticControlRoom` (28.5), `backendStudio` (28.13), `readiness-gate` (28.11).
- The pending omni fold bodies (27.3 / 27.5 / 27.6 / 27.7 / 27.8) inside their already-mounted tabs.
- `PrivacyDropFeed`, fed only by privacy-safe events and dropped-count metadata (28.16).
- `CHROME-CONTRACT.md` itself (this tranche, 28.T28.1).

Anti-greenfield rule: audit-extend, never rebuild. New chrome work must cite the relevant section here, take its declared §2 surface id, preserve `GatewayClient` as the only network primitive, preserve the readiness primitive of §6, and preserve the M0'/M5'/shared partition unless a later decision record explicitly changes it. The validator `src/chromeContract.test.ts` holds this file and the live registry in lockstep.

## 10. Action Surface Contribution Policy

The command registry distinguishes global commands from actions contributed to a concrete rendered surface. A bound contribution declares exactly one `surface` and its matching subject. `src/commands/actionSurface.ts` validates the pairing at registry registration, so a contribution that would misstate its scope fails before it can reach a user.

| Surface | Required subject | Contribution law |
| --- | --- | --- |
| `toolbar` | `active-widget` | Persistent action for the currently active pane/widget only. It must not pretend to act on an arbitrary selection or artifact. |
| `context-menu` | `selection` | Selection-bound, target-specific action. It belongs in the menu produced for that selected target. |
| `inline` | `artifact` | Artifact-level action rendered beside the artifact it changes or opens. |

The command palette remains the global command membrane. Surface-bound actions are deliberately excluded from it: the palette has neither a selected target nor an artifact receiver, so surfacing them there would bypass the policy. A command that needs both a global invocation and a rendered action must register those as distinct contributions with their own honest scopes. This policy owns no pane selection state, artifact identity, or button rendering. The exhaustive inventory of registered commands (palette-visible and surface-bound alike) is §11.

## 11. Command Catalog Completeness

`src/commands/catalog.ts` (`COMMAND_CATALOG`) is the **single source of truth for every command registered on the one command registry** (`src/commands/registry.ts`) — one frozen row per command carrying `id`, `title`, owner-surface, and declaring-tranche. It is the carrier translation of the frozen Theia per-extension command manifest: the Theia six-extension surface (~60 command ids) collapsed into this carrier's faces/panes, so the catalog holds **exactly** what the carrier registers — **no more, no less** (no padding to a legacy count).

`src/commands/catalog.test.ts` is the **no-orphan / no-drift completeness gate**. It derives the LIVE command set from the REAL substrate — a TypeScript AST walk of every non-test `src/**` file for AppCommand-shaped object literals (`{ id, title, run }` — the `AppCommand` shape at `registry.ts`), with `id`/`title` resolved through string literals and module-level string consts, plus the one data-driven family (M0LayerRail over the frozen `M0_LAYER_ROUTES` table in `src/panes/m0Layers.ts`) reconstructed from that same real data. It then holds `COMMAND_CATALOG` in lockstep with that live set **both directions**:

- **no orphan** — every registered command id appears in the catalog;
- **no drift / no fabrication** — every catalogued id is really produced by a register site;
- **no duplicate ids**, and **title agreement** between catalog and live registry.

The gate **never greps this document** (or any prose): it diffs the catalog against the AST of the real registrations. Any new dynamic register idiom, or a wired-up previously-dead factory (`registerLeftSidebarModeCommands` in `src/ui/leftSidebarModes.ts` is proven dead, so its `leftSidebar.mode.*` commands are honestly excluded), fails the gate until the catalog is reconciled. The real-boot half of the gate lives in `tests/e2e/chrome-command-routing.spec.ts`: it opens the live command palette and asserts every palette item the running shell exposes is catalogued (no orphan in the live UI).

Register sites reflected by the catalog: `src/App.tsx` shell chrome (registered on App mount), `src/commands/atelier.ts` (`registerAtelierCommands`), `src/engine/modulation/engine.ts` (`registerEngineCommands`), `src/commands/crossLayoutIntent.ts` (`registerCrossLayoutIntentCommand`), and `src/panes/M0LayerRail.tsx` (the `M0_LAYER_ROUTES` local-layer family). The catalog owns no command bodies and no registration order — it reflects the register sites, it never changes them.
