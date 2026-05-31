---
coordinate: "M'.desktop"
status: "active-spec"
updated: "2026-05-31"
depends_on:
  - "[[M'-PORTAL-SPEC]]"
  - "[[M'-SYSTEM-SPEC]]"
  - "[[M0'-SPEC]]"
  - "[[M1'-SPEC]]"
  - "[[M2'-SPEC]]"
  - "[[M3'-SPEC]]"
  - "[[M4'-SPEC]]"
  - "[[M5'-SPEC]]"
  - "[[S0-HARMONIC-POINTER-WEB36-SPEC]]"
  - "[[S3-SPEC]]"
  - "[[S-AD-HOC-ROADMAP]]"
  - "[[S-SHARDING-TASK-LIST]]"
  - "[[S0-SPEC]]"
  - "[[2026-05-19-kernel-mprime-harmonic-clock-integration-plan]]"
  - "[[2026-04-04-graphiti-unified-temporal-context-service]]"
  - "[[2026-05-31-theia-ide-shell-and-m-plugin-architecture]]"
  - "[[mprime-domain-specs]]"
  - "[[mprime-tauri-gap-table]]"
  - "[[alpha_quaternionic_integration_across_M_stack]]"
  - "[[m4-prime-psychoid-cymatic-field-engine]]"
  - "[[m4-prime-nara-day-episodes-and-oracle-artifacts]]"
  - "[[m5-prime-system-shape-and-tauri-ide-canon]]"
---

# [[M']] Tauri Port Spec

The [[Tauri]] v2 port of `Body/S/S3/epi-app` should preserve the useful renderer/domain work from the current Electron app while replacing Electron main-process authority with Rust-backed Tauri commands, gateway RPC, and [[SpaceTimeDB]] subscriptions.

The port is not a fresh desktop rewrite. It is the desktop mirror of the [[M'-PORTAL-SPEC]] grammar and the [[Theia]]/M-extension shape canonised by [[2026-05-31-theia-ide-shell-and-m-plugin-architecture]] and [[m5-prime-system-shape-and-tauri-ide-canon]].

### Two-Layer Page Architecture

The app has two distinct page layers plus a cross-cutting command membrane. This separation is load-bearing — shell surfaces must stay lean and immediately usable; subsystem pages must have maximum scope for depth:

| Layer | Pages | Purpose | Design principle |
|---|---|---|---|
| **Parent Shell 0/1** | Home (split view), CosmicPage, PersonalPage | Daily-driver operational UX | Minimal M' parent surface — open the app, see the integrated instrument state, start writing |
| **Subsystem M0-M5** | Six full-page deep workspaces | Full 4+2 M' instrument per domain | Maximum scope, inner 0-5 strata, unique depth modules |
| **[[OmniPanel]] `/`** | ESC-toggled overlay | Agent, settings, config, readiness, navigation | [[S0']] command membrane — cross-cuts all layers |

**Shell 0 (Cosmic):** Clock/[[Hopf fibration]], temporal field, structural orientation. Previews the integrated [[M1']]-[[M2']]-[[M3']] structural clock/instrument (relation movement, harmonic/correspondential matrix, clock/cosmos transcription) as a single cymatic harmonic clock surface without becoming those subsystems. Existing basis: `HopfClock`, `ClockHUD`, `StrataOverlay`.

**Shell 1 (Personal):** Flow editor, identity sidebar, immediate journaling, [[Epii]] pedagogy/review access, and relevant [[Bimba]] data structures. Previews the integrated 4/5/0 return: [[Nara]] journal/continuity, Epii learning/review, and [[M0']] ground-data as needed for orientation, without entering the full Nara, Epii, or Bimba map subsystems. Existing basis: `FlowEditor`, `IdentityLayerCard`, `IdentitySidebar`.

**Home** defaults to the 0/1 split view. A toggle (`0/1` ↔ `#0-#5`) switches to the subsystems grid entry. Both views coexist.

The Tauri-v2 app must mirror the canonical 0/1/4+2 discipline from [[M'-SYSTEM-SPEC]]: 0 side = [[Mahāmāyā]] graph view + clock-wheel, 1 side = [[psychoid cymatic field]] + flow surface, and 4+2 depth = the full subsystem composition with canonical [[Bimba]] map as architectural-knowledge backdrop. The existing `Body/M/epi-tauri/src/domains/M0_Anuttara/BimbaMap2D.tsx` and `BimbaMap3D.tsx` stubs are the 0-side graph affordance to extend with filtered subgraph rendering, [[world_clock]] pulse animation, GDS tangent overlay, and [[Anuttara]] `symbol` / `formulation_type` inspection.

**Subsystem pages (M0-M5)** are the deep workspaces:

- [[M0']] — full Bimba graph/map explorer and coordinate source traceability.
- [[M1']] — relational/topological walks, torus/path traversal from selected coordinates.
- [[M2']] — semantic, MEF, and correspondential matrix inspection at full depth.
- [[M3']] — full clock cosmos: solar-system/kairos visualisation, DNA/I-Ching transcription, cymatic rendering.
- [[M4']] — full Nara dashboard: Journal, Daily Note, Dream Journal, Oracle, highlight management, personal continuity.
- [[M5']] — full Epii IDE: Library/Bimba pedagogy, philosophy/canon studio, backend/frontend/code studios, agentic control room, review inbox, and Logos Atelier.

Each subsystem page has room for inner 0-5 strata that would overwhelm the lean shell. The parent shell is the minimal 0/1 surface; the subsystem pages are the 4+2 body of the app. Shell surfaces preview; subsystem pages deliver depth. Do not merge them.

The desktop port must also consume the harmonic/musical profile defined by [[M'-SYSTEM-SPEC]] and the [[S0]]/[[S2]] kernel-pointer contracts. It should not create a renderer-local version of the matheme. `ClockCosmos`, Bimba map, correspondence matrix, Nara journal context, and Epii review evidence must all read the same profile shape: tick, helix, position, pitch class, ratio, square, element, lens anchor, resonance index, and 8+4 rendering role.

The renderer must also read the profile's diatonic CF/[[VAK]] projection: diatonic degree, mode, mode-anchor CF, VAK register, and agent/function label. This is how the desktop app keeps the musical instrument, pointer web, and VAK execution language in one contract instead of treating agent routing and harmonic rendering as separate taxonomies.

## Preserve From Electron

The current app already has valuable M' shape:

- M0'-M5' domain routing through `MPRIME_DOMAINS`.
- inner 0'-5' stratum overlays per M domain.
- M0' graph/map workspace.
- M4' Nara dashboard, editor, journal/search surfaces.
- M5' Epii system, agent, and file surfaces.
- [[OmniPanel]] as an overlay with chat, sessions, skills, models, cron, config, logs, debug, nodes/devices, channels, and gateway settings.

All of this should be treated as portable renderer logic unless the code directly embeds Electron-only authority or stale gateway assumptions.

Specific Nara seed to preserve:

- `M4_Nara/ui/NaraDashboard.tsx` already establishes Journal, Daily Note, Dream Journal, and Oracle tabs.
- `M4_Nara/ui/NaraEditor.tsx` and `editor/components/FloatingMenu.tsx` already establish selected-text highlighting and sendoff.
- `renderer/stores/flowStore.ts` and `renderer/stores/highlightsStore.ts` already provide the flow/highlight persistence shape.
- `NaraDashboard` right-rail highlights and pending actions are the seed of the future review/inbox affordance, but current hardcoded local tasks must be replaced by gateway/Epii inbox data.

Specific Epii seed to revise:

- `M5_Epii` should not remain only a generic system/file/agent panel.
- It must become the clean Epii IDE workspace for pedagogy, etymological archaeology, Bimba/Gnosis graph exploration, philosophy/canon editing, code-aware autoresearch, and review/inbox work.
- The older [[Epii]] archaeology plan requires conversational exploration and [[QL]] community crystallisation before backend [[Bimba]] resonance, [[MEF]] lensing, and knowledge sedimentation are surfaced.
- The current `Library` / `Atelier` / `Epii Agent` triad is a useful first shell, but the full M5' subsystem must expose the six IDE strata defined in [[M5'-SPEC]].

## Replace From Electron

Electron main-process APIs should be replaced with Tauri commands/events that bind to the same S-layer contracts:

- file/vault access routes through S1/S1' compiler and vault contracts.
- graph access routes through S2 graph service clients, not renderer-local assumptions.
- gateway access routes through S3 gateway RPC and session contracts.
- live projection routes through [[SpaceTimeDB]] subscription, with HTTP SQL polling only as compatibility/fallback.
- temporal/[[Kairos]] context routes through [[S3']] temporal projection and portal runtime state.
- agent invocation routes through S4/S5 bounded tool/capability membranes.

No desktop-local session state model should be invented. The desktop app reads and mutates gateway sessions through the same canonical lifecycle as the TUI and CLI.

## OmniPanel As `/`

[[OmniPanel]] is the desktop `/` surface.

It must keep its wider operator scope:

- Overview: connection, role, scopes, session count, channel count, logs cursor.
- Chat: active session, history, send, queue, abort, attachments, external delivery, live run/tool stream, compaction status.
- Sessions: list filters, select/use, label edit, thinking/verbose/reasoning levels, delete.
- Required expansion: resolve, preview, reset, compact, fork, resume, import, DAY/NOW-derived labels, canonical keys, parent/source lineage, runtime diagnostics.
- Skills: status, enable/disable, install, API key management.
- Models/config: model/provider settings, schema-backed config editing, apply/update against a selected session where applicable.
- Cron/automation: schedule, isolated/main session targeting, wake mode, external delivery.
- Channels/nodes/devices: account/channel state, pairing, token management.
- Debug/logs: manual RPC, health snapshots, log tail, readiness.

Known parity issue to resolve during implementation: current renderer session patch/delete calls use `{ key }`, while the gateway identifier contract accepts `session` or `sessionKey`. The Tauri port should not copy that drift. It should standardise request params through a shared session client.

## Shell `0` — Cosmic Surface (Lean Preview)

Shell `0` is the structural operational preview of the integrated 1-2-3 systems. It surfaces [[M1']] relational movement, [[M2']] harmonic/correspondential matrix, and [[M3']] clock/cosmos transcription as one cymatic harmonic clock surface. Open the app, see the harmonic state, temporal field, current relation/correspondence/transcription, and selected coordinate — without navigating into a subsystem.

Current implementation: `CosmicPage` renders `HopfClock` (Hopf fibration / temporal field), `ClockHUD` (degree, tick, codon, aspects), and `StrataOverlay` (temporal strata panel). In the 0/1 split view, the cosmic side occupies the left half with the clock and its overlays.

Shell `0` should show:

- Live Hopf/clock visualisation from the shared `MathemeHarmonicProfile`.
- Current tick state, harmonic phase, and Kairos conditions.
- Selected coordinate orientation and the Bimba node identity needed to contextualise the current tick.
- Entry points into full subsystem pages (M0-M3) for depth work.

Shell `0` should NOT attempt to be the full Bimba map explorer (that is M0' subsystem page), the full topological traversal workspace (M1'), the full correspondence matrix (M2'), or the full DNA/I-Ching transcription surface (M3'). It previews the M1'-M3' instrument outputs and may show selected M0' coordinate data only as orientation.

### 0-Side Graph Affordance

The 0 side nevertheless includes a real [[Mahāmāyā]] graph affordance, not only text orientation. The current [[Tauri]] stubs `Body/M/epi-tauri/src/domains/M0_Anuttara/BimbaMap2D.tsx` and `Body/M/epi-tauri/src/domains/M0_Anuttara/BimbaMap3D.tsx` are the graph-view seed. They should be extended toward filtered subgraph rendering, [[world_clock]] pulse animation, GDS tangent overlays, [[Anuttara]] `symbol` / `formulation_type` inspection, and safe source/spec/code/test anchors. Whether this is co-resident with the clock, toggled, or graph-overlaying-clock remains a UX design decision; the data authority remains [[S2]]/[[S3]] either way.

### Full Structural Subsystem Pages (M0-M3)

The deep structural workspaces are reached as separate full-page routes:

- **[[M0]] ([[Anuttara]]):** Full [[Bimba]] graph/map explorer, source/wikilink traceability, coordinate inspector with harmonic profile and pointer-web layout. Backed by [[S2]]/[[S3]] contracts.
- **[[M1]] ([[Paramaśiva]]):** Relational movement, torus/path traversal, graph-law route visualisation. The topological workspace.
- **[[M2]] ([[Parāśakti]]):** Full [[MEF]]/element/planetary/chakral/mode correspondence matrix. 72-fold vibrational field at depth.
- **[[M3]] ([[Mahāmāyā]]):** Full clock cosmos — [[Hopf fibration]] at scale, DNA/I-Ching/Tarot transcription, 384 line-change surface, cymatic rendering. The [[M3']] subsystem page enlarges what Shell `0` previews.

Musical instrument requirement (applies to all structural subsystem pages):

- Operational tick state comes from [[S0]]/[[S3]] projection, not animation frame count.
- Pitch-class, ratio, square, helix, and element labels come from the shared [[MathemeHarmonicProfile]].
- Diatonic mode and context-frame labels come from the same profile; the renderer may select views over them but may not recompute or rename the CF mapping locally.
- Inner eight positions drive sounded/visual frequency content.
- Outer four positions drive nodal/boundary conditions for cymatic or standing-wave rendering.
- Future audio analysis follows `STFT -> CQT -> chromagram -> active lens -> coordinate profile`.
- The renderer may visualise or sonify the profile, but may not redefine the profile.
- [[M0']] graph and [[M3']] clock are two 0-side [[Mahāmāyā]] affordances over the same canonical substrate; the UX pass may choose co-resident, toggle, or overlay composition, but implementation must not fork their data authority.

## Shell `1` — Personal Surface (Lean Daily Driver)

Shell `1` is the personal daily-driver surface. It surfaces the 4/5/0 lived-return face: [[M4']] journal/continuity, [[M5']] [[Epii]] pedagogy/review, and the [[M0']] [[Bimba]] data structures relevant to the user's current return-to-ground. It lets the user write, reflect, see identity, invoke help, receive Bimba/Epii resonance, and return to ground without requiring the full subsystem deep-dive. Click-anywhere-to-write remains the fastest path from thought to record.

Current implementation: In the 0/1 split view, the personal side occupies the right half with `FlowEditor` (TipTap journal), `IdentitySidebar` (quintessence, wound status, elemental balance, identity layer cards). `PersonalPage` is the dedicated full-route for the personal shell surface.

Shell `1` should show:

- Flow editor for immediate journaling and note capture.
- Identity configuration sidebar (quintessence, layers, elemental balance).
- Current DAY/NOW context from the shared temporal projection.
- Minimal agent/[[Bimba]]/[[Epii]] affordance for immediate reflection, pedagogy, review alerts, or guided continuation.
- Relevant [[Bimba]] coordinate/source data when it helps the journal or Epii return to ground.
- Entry points into full subsystem pages (M4, M5) for depth work.

Shell `1` should NOT attempt to be the full Nara dashboard with all modality tabs (that is M4' subsystem page), the full Epii workbench (M5'), or the full Bimba map explorer (M0'). It is the daily writing/learning/reviewing surface of the 4/5/0 return.

### Full Personal Subsystem Pages (M4-M5)

The deep personal/world-return workspaces are reached as separate full-page routes:

- **[[M4]] ([[Nara]]):** Full dashboard with Journal, Daily Note, Dream Journal, Oracle, and highlight management tabs. Modality-specific tools, search, timeline, and review. The [[M4']] subsystem page expands what Shell `1` previews into a full personal instrument.
- **[[M5]] ([[Epii]]):** Full agent-led developer/pedagogical IDE — Library/Bimba pedagogy, philosophy/canon studio, backend/frontend/code studios, agentic control room, autoresearch, inbox/review, [[VAK]] execution, and Logos Atelier. The system-building and evidence-review workspace.

Both subsystem pages:

- Consume the shared DAY/NOW/[[Kairos]]/session projection.
- Use gateway-backed agent access rather than local Electron placeholders.
- [[Epii]] sees review inbox deposits from [[Anima]]/[[Aletheia]] as the work to which their output makes sense.

Nara modality requirements:

- Journal remains the primary flow surface.
- Daily Note becomes the DAY/NOW-oriented practical/log surface, tied to [[Chronos]]/[[Khora]] file-set handling.
- Dream Journal becomes a CT3/pattern-sensitive stream with dream-specific highlighting and [[Anima]] sendoff.
- Oracle becomes a divination/interpretive surface that can invoke governed Epi-Logos skills and record outputs with lineage.
- Highlight categories remain useful UI affordances, but sendoff must become typed invocation against the gateway/agent contract rather than stringly slash commands.

Epii workspace requirements:

- Library / Bimba pedagogy: wisdom packets, coordinate relations, source traceability, Gnosis library graph, and pedagogical explanations.
- Philosophy / Canon Studio: Epi-Logos philosophy files, foundational instructions, edited specs, and reviewable canon changes.
- Backend Studio: C/Rust/Python services, S-layer contracts, graph/storage/gateway evidence, and real test results.
- Frontend Studio: [[Tauri]] UI files, graph canvases, editors, shell/deep workspace UX, and interaction specs.
- Agentic Control Room: [[Pi]] agent, [[Anima]]/[[Aletheia]], [[VAK]] routing, forks/worktrees/tasks, run tree, diagnostics, and promotion gates.
- Logos Atelier: staged word/root/cognate/community exploration with backend insight surfacing only after relevant crystallisation.
- Inbox/review: Anima/Aletheia deposits, validation gates, user-facing decisions, continuation requests, and implementation evidence.

Epii graph viewer requirements:

- The graph viewer must support namespace selection across `bimba`, `gnosis`, and `etymology`, with protected reviewed `pratibimba` handles only where governance permits.
- `bimba` is canonical coordinate topology in [[S2]].
- `gnosis` is library/document knowledge and wisdom-packet context.
- `etymology` is the Logos Atelier graph: roots, cognates, semantic drift, word communities, and crystallisations.
- Namespace links may share coordinates, source handles, episode handles, and review ids; they must not merge raw private [[Graphiti]] bodies into canonical [[S2]] topology.

## [[VAK]] / [[Anima]] / [[Epii]] Execution Surface

The app needs an explicit agentic execution page. It should be accessible from [[M5']] and controllable from [[OmniPanel]] as `/`.

`/` and M5-4' overlap but are not identical. [[OmniPanel]] is the universal command/config/readiness membrane. [[M5-4']] is the deep agentic IDE surface where Epii can bind tasks to files, graph nodes, source evidence, tests, agent runs, review decisions, and promotion targets.

Required shape:

- VAK evaluation panel: CPF, CT, CP, CF, CFP, CS.
- routing panel: Anima/Aletheia mode, agent/team/chain, bounded tools, bounded skills.
- payload panel: selected text, journal source, coordinate, session, DAY/NOW, attachments.
- execution panel: run tree, tool events, diagnostics, retry/abort/continue, completion evidence.
- inbox panel: deposits that require Epii/user validation, continuation, or rejection.
- development panel: fork/worktree basis when present, touched files, graph/source anchors, test commands, and promotion target.

Implementation must preserve the [[VAK]] planning distinction: [[Aletheia]] is a mode/activity surface of [[Anima]], not a separate peer app; [[Epii]] is the integrative/user-developer position that can review, learn from, and improve the system.

## Port Architecture

Recommended module split:

- `src-tauri/commands/gateway.rs` — gateway RPC, session operations, health/readiness.
- `src-tauri/commands/vault.rs` — vault/file/read paths through S1/S1' contracts.
- `src-tauri/commands/graph.rs` — graph queries through S2 services.
- `src-tauri/commands/temporal.rs` — DAY/NOW/[[Kairos]]/[[SpaceTimeDB]] projection.
- `src-tauri/commands/agents.rs` — [[S4]]/[[S5]] bounded agent invocation.
- `src-tauri/commands/inbox.rs` — [[Epii]]/[[Nara]] review inbox over gateway/session/task records.
- `src-tauri/events.rs` — gateway events and [[SpaceTimeDB]] projection events to renderer.
- `renderer/services/*` — typed clients replacing `window.sPrime` preload assumptions.

Renderer code should move toward provider-backed service clients that can be shared by the current web renderer, tests, and Tauri runtime.

Renderer domain clients should be explicit enough to stop drift:

- `gatewayClient` for RPC/session/chat/config.
- `temporalClient` for DAY/NOW/[[Kairos]]/[[SpaceTimeDB]] projection.
- `naraClient` for journal/flow/highlight/modality records.
- `epiiClient` for library/canon/code/graph/atelier/autoresearch/inbox operations.
- `agentExecutionClient` for [[VAK]] evaluation, [[Anima]]/[[Aletheia]] dispatch, tool stream, diagnostics, and review deposits.

## Harmonic Profile Architecture Amendment

The [[Tauri]] port must now treat [[MathemeHarmonicProfile]] as the desktop app's shared instrument contract. `PortalClockState` and legacy clock commands may remain as compatibility surfaces during migration, but the six M' domains should converge on one profile client that reads the [[S0]]/[[S3]] projection and [[S2]] pointer law.

Recommended renderer contract:

- `profileClient`: fetches/subscribes to the current safe `MathemeHarmonicProfile`, selected-coordinate profile, readiness state, and provenance.
- `kernelProjection` remains the narrow projection helper for safe public-current profile consumption.
- `clockClient` remains compatibility for existing Tauri clock state until the profile contract contains the M2/M3 fields and S3 deposition anchor.
- `graphClient` remains S2 graph access, but harmonic pointer descriptors must flow through S2 law rather than being inferred from renderer node labels.

The app-level provider should expose:

- public-current tick and harmonic state;
- selected coordinate and pointer anchor;
- profile readiness and blocked reasons;
- DAY/NOW/session/deposition anchor;
- privacy class and protected-projection block state.

No renderer domain may hardcode private clock, codon, hexagram, tarot, planetary, or chakral mapping tables. The renderer may contain display labels and iconography. The authority for mappings is the backend profile plus [[S2]] graph law.

### Portal 0 Structural / Instrument Side

Shell `0` previews the structural instrument; subsystem pages [[M0]]-[[M3]] deliver it at depth. Both layers consume the same shared profile — the difference is scope, not authority.

Shell `0` shows: live clock, tick state, harmonic phase, and coordinate orientation. It is lean and immediately legible.

Subsystem pages expand:

- [[M0']] renders the full [[Bimba]] graph coordinate field and pointer topology.
- [[M1']] renders relation movement, torus/path traversal, and graph-law routeability.
- [[M2']] renders the 72-fold [[MEF]]/element/planetary/chakral/mode field.
- [[M3']] renders the full harmonic clock and [[Mahāmāyā]] DNA/I-Ching/Tarot transcription.

Neither shell nor subsystem pages contain separate clocks for graph, torus, harmonic matrix, and codon wheel. One profile, multiple views at different depths.

### [[S0']] Command / Config / Readiness Membrane

The `/` surface must expose profile readiness as an operator concern:

- gateway/kernel profile availability;
- [[S2]] pointer-harmonic law availability;
- [[S3]] DAY/NOW/session/deposition availability;
- [[Graphiti]] protected-local memory availability;
- missing backend contract vs private projection block vs pending dataset LUT.

Readiness panels must distinguish raw service health from usable bounded capability. A connected graph or gateway is not enough if the current surface lacks the required profile fields or privacy permission.

### Portal 1 [[Nara]] / [[Epii]] Lived Return

Shell `1` previews the personal instrument; subsystem pages [[M4]]-[[M5]] deliver it at depth.

Shell `1` shows: flow editor, identity sidebar, current DAY/NOW context. It is the daily-driver writing surface — click-anywhere-to-write.

Subsystem pages expand:

- [[M4']] receives profile handles for journal, dream, oracle, highlight, and playback context while keeping protected identity and content local. The full [[Nara]] dashboard with modality tabs, timeline, search, and review.
- [[M5']] receives profile, pointer, deposition, source/spec/code/test, graph namespace, and [[Graphiti]] handles as review evidence. The full [[Epii]] IDE spans Library/Bimba pedagogy, philosophy/canon, backend/frontend code, agentic control, Logos Atelier, autoresearch, and inbox.

Public [[S2]] topology and protected [[Graphiti]]/[[Nara]] episodes may link by coordinate and handle; they do not collapse into one data plane.

### M2 / M3 Harmonic Clock Panels

[[M2]] and [[M3]] panels must be separate views over the same tick:

- [[M2']] is the 72-fold vibrational source: [[MEF]], elements, planetary/chakral correspondences, modal/scale color, and semantic resonance.
- [[M3']] is the 64-fold symbolic transcription: DNA codon, I-Ching hexagram, 384 line-change operator, 2-bit nucleotide logic, DNA/RNA phase, Tarot compression, shadow/provisional states, and M2->M3 epogdoon compression.

The exact mathematical commitments are:

- [[Paramaśiva]] tick is the harmonic clock.
- [[M2]] is the 72-fold [[MEF]]/planetary/chakral field.
- [[M3]] is the DNA/I-Ching/Tarot binary transcription surface.
- [[S2]] is the pointer-law authority.
- [[S3]] deposits DAY/NOW/session/[[Graphiti]] observations.

### [[Graphiti]] And [[S2]] Graph Boundary

[[S2]] is canonical coordinate topology. [[Graphiti]] is episodic protected-local memory. [[Tauri]] may show links between them, but:

- [[S2]] graph nodes do not absorb private journal content or unreconciled [[Graphiti]] episode bodies.
- [[Graphiti]] episodes may point to coordinates, profile ticks, and source handles.
- Profile deposition uses safe handles: coordinate, tick, harmonic state, M2 resonance index, M3 symbolic address, pointer anchor, DAY/NOW/session, and episode id.
- Promotion into canonical graph facts is an [[Epii]]/[[S5']] review operation.

[[Epii]] adds namespace-aware graph viewing over the same graph infrastructure:

- `bimba` for canonical coordinate topology and pointer law.
- `gnosis` for library/document knowledge and wisdom packets.
- `etymology` for Logos Atelier roots, cognates, semantic drift, and crystallised constellations.
- protected reviewed `pratibimba` handles for personal resonances when the review boundary permits.

## Current-State Gap Table

Assessment from `Body/M/epi-tauri` as of 2026-05-19:

| Area | Already present | Needs backend contract | Needs design/spec only | Blocked by kernel profile tranche |
|------|-----------------|------------------------|------------------------|-----------------------------------|
| Shared profile types/client | `services/types.ts` defines `MathemeHarmonicProfile` with tick12, degree720, degree360, su2Layer, helix, ratioRole, chromatic, optional diatonic, resonance72, elements, planetaryChakral, and enriched binary/M3 projection. `services/kernelProjection.ts` projects safe public-current readiness and has a Vitest coverage foothold. | Add `pointerAnchor`, `depositionAnchor`, and eventual explicit `mahamaya` alias if the contract separates M3 from the current `binary` projection. | Add a domain-shared `profileClient`/provider contract so M0'-M5' stop reading profile fragments differently. | Partly: S0 profile tranche landed; S2/S3 anchors remain blocked by Tranche 3/4. |
| M0' graph map | `M0_Anuttara/BimbaMap2D.tsx`, graph store, and `graphClient` can load/select graph data. | S2 must return harmonic pointer descriptors and selected-coordinate profile anchors. | Node inspector needs profile/readiness/source/spec/code/test layout. | Partly: pointerAnchor waits on S2 tranche. |
| M1' movement | `M1_Paramasiva/SchemaWorkspace.tsx` shows graph schema counts. Graph client has `walk`, geometry, and coordinate methods. | S2 relation walk must return typed relation descriptors plus harmonic law. | Torus/path traversal surface is not specified in runtime UI yet beyond this spec. | Partly: movement can begin after S2 pointer descriptors; tick binding depends on profile tranche. |
| M2' harmonic matrix | `M2_Parashakti/CollabWorkspace.tsx` reads temporal DAY/NOW presence. `epiiClient.mef` can list active MEF lenses. Profile now exposes first `resonance72`, `elements`, and `planetaryChakral` fields. | S2 must still govern configurable correspondence provenance and selected-coordinate harmonic pointer descriptors. | Matrix, element, planetary/chakral, and modal panels need implementation design from [[M2'-SPEC]]. | Partly: backend fields exist; graph-law mapping remains blocked by Tranche 3. |
| M3' clock/cosmos | `ClockCosmos.tsx`, `HopfClock.tsx`, `StrataPanel.tsx`, `clockStore`, and `clockClient` provide visual shell, Hopf view, current degree, tick12, active codon, aspects, and temporal footer. Profile now exposes M3 address-law fields through `binary`. | Tarot/amino LUT-backed details, pointerAnchor, and depositionAnchor still need backend contracts. | UI needs migration plan from compatibility clock state to shared profile provider. | Partly: M3 codec foothold exists; LUTs and S2/S3 anchors remain blocked. |
| M4' Nara | `NaraDashboard.tsx`, editor, flow timeline, highlights, vault-backed daily/flow clients, and typed highlight sendoff envelope exist. | S3 deposition must include profile observation anchors and Graphiti privacy class; agent invocation must return governed review/deposit handles. | Daily Note, Dream Journal, Oracle, playback, and privacy-state UX need completion against [[M4'-SPEC]]. | Partly: profile handles wait on Tranche 4; modality surfaces can proceed from existing contracts. |
| M5' Epii | `EpiiDashboard.tsx`, Library, Atelier, Epii Agent, `epiiClient`, and `agentExecutionClient` exist. | Review inbox needs real gateway/session/task deposits, profile evidence, pointer/deposition anchors, namespace-aware graph access, and promotion transitions. | Evidence matrix, VAK execution page, IDE strata, and graph namespace UX need integration design against [[M5'-SPEC]]. | Partly: M2/M3 evidence waits on full profile; agent/review shell can proceed. |
| S0' `/` membrane | `OmniPanel.tsx`, gateway/temporal/agent clients, and command surfaces exist. | Readiness API must report profile availability, S2 law availability, S3 deposition, Graphiti privacy, pending LUT, and private-block states. | Display taxonomy for readiness states needs alignment with this amendment. | Partly: field-level readiness depends on backend tranches. |
| Privacy boundary | `kernelProjection.ts` blocks exposed `bioquaternion` / `resonanceSquareEmphasis` from safe public-current consumer readiness. | Backend profile must formalize public-current vs protected-local fields and Graphiti/Nara privacy classes. | Per-domain UI copy/states need consistent protected projection language. | Yes for formal privacy classes; current foothold is renderer-side only. |

## Testing Contract

The port is not complete until tests prove:

- OmniPanel method parity against the gateway contract.
- session patch/delete use the canonical identifier contract.
- DAY/NOW-derived session labels do not replace stable canonical keys.
- Tauri commands call real local gateway/S2/S3 services, not mocks.
- SpaceTimeDB projection can update the renderer session/temporal surface.
- Nara/Epii surfaces distinguish raw service connectivity from actual agent access.
- Nara highlight/sendoff produces typed invocation payloads preserving selected text, source, category, DAY/NOW, and session lineage.
- Daily Note, Dream Journal, and Oracle surfaces persist and retrieve real modality data rather than showing placeholders.
- M0' graph affordance renders filtered subgraphs from real S2 data, `world_clock` pulse, GDS overlay readiness, and Anuttara inspector facts without leaking private content.
- The 1-side psychoid cymatic field remains protected-local; any shared SpaceTimeDB or public profile payload carries only opaque handles / safe projection facts.
- Epii inbox can read actual gateway/session/task deposits and apply review transitions.
- Epii archaeology workflow respects staged progression: exploration/community formation before backend Bimba resonance, MEF analysis, and sedimentation display.
- Epii graph viewer preserves `bimba`, `gnosis`, `etymology`, and protected reviewed handle boundaries.
- Epii agentic IDE runs preserve file/source/graph/task provenance and require review before promotion.
- VAK execution page exercises a real bounded agent invocation path with diagnostics and completion evidence.
- current app typecheck remains clean before and after port steps.

Use the current Electron app as behavior reference, but make the Tauri port conform to the corrected S3/Khora session-runtime contract.

## Canonical Source Traceability

Implementation agents must consult these sources before changing the app shape:

- Current app: `Body/S/S3/epi-app/renderer/domains/M4_Nara/ui/NaraDashboard.tsx`
- Current app: `Body/S/S3/epi-app/renderer/domains/M4_Nara/ui/NaraEditor.tsx`
- Current app: `Body/S/S3/epi-app/renderer/domains/M4_Nara/editor/components/FloatingMenu.tsx`
- Current app: `Body/S/S3/epi-app/renderer/components/OmniPanel.tsx`
- Current app: `Body/S/S3/epi-app/renderer/domains/M0_Anuttara/ui/GraphWorkspace.tsx`
- Old canonical plan: `/Users/admin/Documents/Epi-Logos/docs/prompts/02-agent-bootstrap-vak-integration-review.md`
- Old canonical plan: `/Users/admin/Documents/Epi-Logos/docs/prompts/03-t-coordinate-thoughts-integration.md`
- Old canonical plan: `/Users/admin/Documents/Epi-Logos/docs/plans/2026-02-22-nara-fix-critical-issues.md`
- Old canonical plan: `/Users/admin/Documents/Epi-Logos/docs/plans/2026-02-22-ta-onta-first-working-e2e-readiness.prd.json`
- Old canonical Epii source: `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/Self/Action/Work/Bimba Map/#5-4.5.md`
