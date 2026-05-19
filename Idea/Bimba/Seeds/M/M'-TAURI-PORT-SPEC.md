---
coordinate: "M'.desktop"
status: "active-spec"
updated: "2026-05-19"
depends_on:
  - "[[M'-PORTAL-SPEC]]"
  - "[[M'-SYSTEM-SPEC]]"
  - "[[S3-SPEC]]"
  - "[[S-AD-HOC-ROADMAP]]"
  - "[[S-SHARDING-TASK-LIST]]"
  - "[[S0-SPEC]]"
  - "[[2026-05-19-kernel-mprime-harmonic-clock-integration-plan]]"
  - "[[mprime-domain-specs]]"
  - "[[mprime-tauri-gap-table]]"
---

# [[M']] Tauri Port Spec

The Tauri v2 port of `Body/S/S3/epi-app` should preserve the useful renderer/domain work from the current Electron app while replacing Electron main-process authority with Rust-backed Tauri commands, gateway RPC, and [[SpaceTimeDB]] subscriptions.

The port is not a fresh desktop rewrite. It is the desktop mirror of the [[M'-PORTAL-SPEC]] grammar:

| Desktop surface | Existing basis | Target authority |
|---|---|---|
| `0` structural map | `M0_Anuttara`, `GraphWorkspace`, graph APIs | [[S2]] graph services + [[S3]] gateway projection |
| `/` OmniPanel | `renderer/components/OmniPanel.tsx` and `renderer/components/omni/*` | [[S3]] gateway RPC + S0' portal surface registry |
| `1` Nara/Epii return | `M4_Nara`, `M5_Epii` domains | [[S4]] / [[S5]] agent access and governed M4/M5 services |

The desktop app must surface the whole [[M']] set, even when the shell groups it as `0` / `/` / `1`:

- [[M0']] — Bimba graph/map explorer and coordinate source traceability.
- [[M1']] — relational/topological walks from selected coordinates.
- [[M2']] — semantic, MEF, and correspondential matrix inspection.
- [[M3']] — integrated clock platform: solar-system/kairos visualisation and Nara walkabout entry.
- [[M4']] — Nara lived modalities: journal/flow, daily note, dream journal, oracle, highlighting, personal continuity.
- [[M5']] — Epii integrative workbench: pedagogy, etymological archaeology, Bimba wisdom exploration, autoresearch, inbox/review, VAK execution.

The desktop port must also consume the harmonic/musical profile defined by [[M'-SYSTEM-SPEC]] and the S0/S2 kernel-pointer contracts. It should not create a renderer-local version of the matheme. `ClockCosmos`, Bimba map, correspondence matrix, Nara journal context, and Epii review evidence must all read the same profile shape: tick, helix, position, pitch class, ratio, square, element, lens anchor, resonance index, and 8+4 rendering role.

The renderer must also read the profile's diatonic CF/VAK projection: diatonic degree, mode, mode-anchor CF, VAK register, and agent/function label. This is how the desktop app keeps the musical instrument, pointer web, and VAK execution language in one contract instead of treating agent routing and harmonic rendering as separate taxonomies.

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
- It must become the clean Epii workspace for pedagogy, etymological archaeology, Bimba map exploration, autoresearch evidence, and review/inbox work.
- The older Epii archaeology plan requires conversational exploration and QL community crystallisation before backend Bimba resonance, MEF lensing, and knowledge sedimentation are surfaced.

## Replace From Electron

Electron main-process APIs should be replaced with Tauri commands/events that bind to the same S-layer contracts:

- file/vault access routes through S1/S1' compiler and vault contracts.
- graph access routes through S2 graph service clients, not renderer-local assumptions.
- gateway access routes through S3 gateway RPC and session contracts.
- live projection routes through SpaceTimeDB subscription, with HTTP SQL polling only as compatibility/fallback.
- temporal/Kairos context routes through S3' temporal projection and portal runtime state.
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

## `0` Structural Surface

The Tauri app should make `0` the structural Bimba map entry.

Required target:

- full-window graph/map explorer for canonical M/Bimba coordinates.
- source/wikilink traceability for selected nodes.
- route selected coordinates into M0'-M3' views.
- expose clock as an M3' structural visualisation, not as the whole `0` surface.
- use live temporal/Kairos projection where it informs orientation.

The existing `M0_Anuttara/GraphWorkspace` is the basis, but it must be backed by current S2/S3 contracts rather than Electron-local graph loading.

The integrated clock platform is the desktop enlargement of the TUI clock/portal specs. It should provide a real visual substrate for the `0` side: solar-system/kairos clock, temporal conditions, coordinate correspondences, and routeable Nara walkabouts. The clock is [[M3']], and it is reached through the structural world rather than replacing that world.

Musical instrument requirement:

- Operational tick state comes from S0/S3 projection, not animation frame count.
- Pitch-class, ratio, square, helix, and element labels come from the shared `MathemeHarmonicProfile`.
- Diatonic mode and context-frame labels come from the same profile; the renderer may select views over them but may not recompute or rename the CF mapping locally.
- Inner eight positions drive sounded/visual frequency content.
- Outer four positions drive nodal/boundary conditions for cymatic or standing-wave rendering.
- Future audio analysis follows `STFT -> CQT -> chromagram -> active lens -> coordinate profile`.
- The renderer may visualise or sonify the profile, but may not redefine the profile.

## `1` Personal / World Return

The Tauri app should preserve and deepen the current M4/M5 domains:

- [[Nara]] journal/editor/flow remains the M4' personal-dialogical surface.
- [[Epii]] system/developer view becomes the M5' autoresearch/review/system-building surface.
- Both consume the shared DAY/NOW/Kairos/session projection.
- Both use gateway-backed agent access rather than local Electron placeholders.
- Epii sees review inbox deposits from Anima/Aletheia as the work to which their output makes sense.

Nara modality requirements:

- Journal remains the primary flow surface.
- Daily Note becomes the DAY/NOW-oriented practical/log surface, tied to Chronos/Khora file-set handling.
- Dream Journal becomes a CT3/pattern-sensitive stream with dream-specific highlighting and Anima sendoff.
- Oracle becomes a divination/interpretive surface that can invoke governed Epi-Logos skills and record outputs with lineage.
- Highlight categories remain useful UI affordances, but sendoff must become typed invocation against the gateway/agent contract rather than stringly slash commands.

Epii workspace requirements:

- Pedagogy: conversational Epi-Logos teaching and guided interpretation.
- Etymological archaeology: staged word/root/cognate/community exploration with backend insight surfacing only after relevant crystallisation.
- Bimba map explorer: wisdom packets, coordinate relations, and source traceability.
- Autoresearch: system self-observation, research loops, improvement proposals, and implementation evidence.
- Inbox/review: Anima/Aletheia deposits, validation gates, user-facing decisions, and continuation requests.

## VAK / Anima / Epi Execution Surface

The app needs an explicit agentic execution page. It should be accessible from [[M5']] and controllable from [[OmniPanel]] as `/`.

Required shape:

- VAK evaluation panel: CPF, CT, CP, CF, CFP, CS.
- routing panel: Anima/Aletheia mode, agent/team/chain, bounded tools, bounded skills.
- payload panel: selected text, journal source, coordinate, session, DAY/NOW, attachments.
- execution panel: run tree, tool events, diagnostics, retry/abort/continue, completion evidence.
- inbox panel: deposits that require Epii/user validation, continuation, or rejection.

Implementation must preserve the VAK planning distinction: Aletheia is a mode/activity surface of Anima, not a separate peer app; Epii is the integrative/user-developer position that can review, learn from, and improve the system.

## Port Architecture

Recommended module split:

- `src-tauri/commands/gateway.rs` — gateway RPC, session operations, health/readiness.
- `src-tauri/commands/vault.rs` — vault/file/read paths through S1/S1' contracts.
- `src-tauri/commands/graph.rs` — graph queries through S2 services.
- `src-tauri/commands/temporal.rs` — DAY/NOW/Kairos/SpaceTimeDB projection.
- `src-tauri/commands/agents.rs` — S4/S5 bounded agent invocation.
- `src-tauri/commands/inbox.rs` — Epii/Nara review inbox over gateway/session/task records.
- `src-tauri/events.rs` — gateway events and SpaceTimeDB projection events to renderer.
- `renderer/services/*` — typed clients replacing `window.sPrime` preload assumptions.

Renderer code should move toward provider-backed service clients that can be shared by the current web renderer, tests, and Tauri runtime.

Renderer domain clients should be explicit enough to stop drift:

- `gatewayClient` for RPC/session/chat/config.
- `temporalClient` for DAY/NOW/Kairos/SpaceTimeDB projection.
- `naraClient` for journal/flow/highlight/modality records.
- `epiiClient` for pedagogy, archaeology, Bimba/wisdom exploration, autoresearch, and inbox operations.
- `agentExecutionClient` for VAK evaluation, Anima/Aletheia dispatch, tool stream, diagnostics, and review deposits.

## Harmonic Profile Architecture Amendment

The Tauri port must now treat `MathemeHarmonicProfile` as the desktop app's shared instrument contract. `PortalClockState` and legacy clock commands may remain as compatibility surfaces during migration, but the six M' domains should converge on one profile client that reads the S0/S3 projection and S2 pointer law.

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

No renderer domain may hardcode private clock, codon, hexagram, tarot, planetary, or chakral mapping tables. The renderer may contain display labels and iconography. The authority for mappings is the backend profile plus S2 graph law.

### Portal 0 Structural / Instrument Side

The `0` side is M0'-M3' as one structural instrument:

- [[M0']] renders the selected Bimba graph coordinate and pointer topology.
- [[M1']] renders relation movement, torus/path traversal, and graph-law routeability.
- [[M2']] renders the 72-fold MEF/element/planetary/chakral/mode field.
- [[M3']] renders the harmonic clock and Mahamaya DNA/I-Ching/Tarot transcription.

The `0` side consumes the same profile. It does not contain separate clocks for graph, torus, harmonic matrix, and codon wheel.

### S0' Command / Config / Readiness Membrane

The `/` surface must expose profile readiness as an operator concern:

- gateway/kernel profile availability;
- S2 pointer-harmonic law availability;
- S3 DAY/NOW/session/deposition availability;
- Graphiti protected-local memory availability;
- missing backend contract vs private projection block vs pending dataset LUT.

Readiness panels must distinguish raw service health from usable bounded capability. A connected graph or gateway is not enough if the current surface lacks the required profile fields or privacy permission.

### Portal 1 Nara / Epii Lived Return

The `1` side consumes profile context through Nara and Epii:

- [[M4']] receives profile handles for journal, dream, oracle, highlight, and playback context while keeping protected identity and content local.
- [[M5']] receives profile, pointer, deposition, source/spec/code/test, and Graphiti handles as review evidence.

Public S2 topology and protected Graphiti/Nara episodes may link by coordinate and handle; they do not collapse into one data plane.

### M2 / M3 Harmonic Clock Panels

M2 and M3 panels must be separate views over the same tick:

- [[M2']] is the 72-fold vibrational source: MEF, elements, planetary/chakral correspondences, modal/scale color, and semantic resonance.
- [[M3']] is the 64-fold symbolic transcription: DNA codon, I-Ching hexagram, 384 line-change operator, 2-bit nucleotide logic, DNA/RNA phase, Tarot compression, shadow/provisional states, and M2->M3 epogdoon compression.

The exact mathematical commitments are:

- Paramasiva tick is the harmonic clock.
- M2 is the 72-fold MEF/planetary/chakral field.
- M3 is the DNA/I-Ching/Tarot binary transcription surface.
- S2 is the pointer-law authority.
- S3 deposits DAY/NOW/session/Graphiti observations.

### Graphiti And S2 Graph Boundary

S2 is canonical coordinate topology. Graphiti is episodic protected-local memory. Tauri may show links between them, but:

- S2 graph nodes do not absorb private journal content or unreconciled Graphiti episode bodies.
- Graphiti episodes may point to coordinates, profile ticks, and source handles.
- Profile deposition uses safe handles: coordinate, tick, harmonic state, M2 resonance index, M3 symbolic address, pointer anchor, DAY/NOW/session, and episode id.
- Promotion into canonical graph facts is an Epii/S5' review operation.

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
| M5' Epii | `EpiiDashboard.tsx`, Library, Atelier, Epii Agent, `epiiClient`, and `agentExecutionClient` exist. | Review inbox needs real gateway/session/task deposits, profile evidence, pointer/deposition anchors, and promotion transitions. | Evidence matrix and VAK execution page need integration design against [[M5'-SPEC]]. | Partly: M2/M3 evidence waits on full profile; agent/review shell can proceed. |
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
- Epii inbox can read actual gateway/session/task deposits and apply review transitions.
- Epii archaeology workflow respects staged progression: exploration/community formation before backend Bimba resonance, MEF analysis, and sedimentation display.
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
