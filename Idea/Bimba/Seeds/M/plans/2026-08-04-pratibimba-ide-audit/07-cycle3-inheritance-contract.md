# Cycle 3 Inheritance Contract

## Purpose

The Pratibimba redesign is not Cycle 3 again. It is the carrier integration and workbench composition of capabilities that Cycle 3 designed, implemented, repaired, and verified across [[S]], [[S']], and [[M']].

This contract prevents two equal failures:

1. trusting a historical `done` label and assuming the capability is product-live;
2. failing to see a capability in the current UI and rebuilding substrate that already exists.

Every new IDE tranche must identify what it inherits before it is allowed to create, replace, move, or delete anything.

## Authority Stack

Use these sources in order:

1. [[World-Ontology]], [[ARCHITECTURE-DIAGRAM-PACK]], [[M'-SYSTEM-SPEC]], [[M-SYSTEM-INDEX]], [[S-SYSTEM-INDEX]], and their exact layer specs establish current ownership and product law.
2. The June Cycle 3 briefs under `2026-06-02-m-prime-cycle-3-design-reconciliation/` and [[13-decision-register]] establish detailed design decisions.
3. The July [[2026-07-03-m-prime-cycle-3-full-rerun/CHARTER]] and `carrier-contract.json` establish Tauri retargeting and execution law.
4. Current code, contracts, and data schemas establish what exists.
5. Independent verification records, live-wire captures, gateway ratchets, and current real-product observation establish what is presently true.

A later source may correct the product-live status of an earlier claim. It does not silently erase the earlier design obligation.

## Snapshot

### June Design Corpus

- 52 track entries, 50 logical track ids, and 551 tasks.
- Historical state: 246 `done`, 236 `audit_required`, 60 `quarantine`, 8 `pending`, and 1 `review`.
- These statuses describe the pre-rerun carrier and are not current completion evidence.

### July Full Rerun

- 57 track entries, 55 logical track ids including decision-law Track 13, and 656 indexed tasks.
- All 656 indexed tasks are marked `done` in `plan.state.json`.
- Sixteen additional state rows are stale blocked ids explicitly noted as no longer present in the plan index.
- The latest per-task verification records for the indexed set are 635 `PASS` and 21 `REFUSED`. Two additional PASS files, `T1.4.md` and `T1.5.md`, are legacy unindexed records and are excluded from those counts.
- There are 561 live-wire capture artifacts.
- The gateway ratchet requires 89 named methods to remain present; the latest audit found none of those 89 missing.
- One expected-red kernel-truth item remains: `psychoid_field_projection_carries_cymatic_signature_64_as_8x8_spectrum`.

The generated, task-level evidence join is [[data/cycle3-task-inventory.csv]]. The logical-track register is [[data/cycle3-track-register.json]]. Together they preserve every indexed task id, title, dependency, write scope, state, proof class, and latest verification result without copying 656 tranche bodies into this brief.

## Five Dispositions

Every inherited capability receives exactly one current disposition.

| Disposition | Meaning | New-plan rule |
|---|---|---|
| `PRESERVE` | Real substrate, contract, schema, gateway method, or useful carrier body exists | Consume it through its public surface; do not rebuild or relocate it |
| `RECOMPOSE` | Useful carrier body exists, but its layout/navigation role is wrong | Move it into the workbench geometry without reimplementing its domain law |
| `REVERIFY` | Code exists, but proof is stale, refused, harness-only, or too weak for its current claim | Run the correct current K/W/UF/G/native proof before depending on it |
| `REPAIR` | A concrete integration or truth defect is observed | Fix the narrow defect and retain the surrounding capability |
| `RETIRE-CARRIER` | Theia plumbing or obsolete tab/chrome composition is superseded | Preserve contract law and provenance; remove only the obsolete carrier mechanism |

`REBUILD` is not a default disposition. It is permitted only when the relevant code and contract are absent or an existing implementation is proven unsalvageable.

## Track-Family Crosswalk

| Cycle 3 tracks | Inherited capital | Destination in the redesigned product |
|---|---|---|
| 00, 14, 43 | Anti-fraud harness, release gates, coordinate headers, boundary law | Plan-wide verification and architecture gates; never a user-facing workspace |
| 01-10 | [[M0']]-[[M5']] substrate laws, integrated loops, graph/profile contracts | Shared organism and typed context feeding every workspace |
| 11, 15, 20, 27-32, 44, 51, 52 | Shell, visual language, deep surfaces, membrane, composition, settings, empty states, block law | Recompose into the stable workbench; exact old tab geometry is not inherited |
| 21-26 | Deep [[M0']]-[[M5']] carrier bodies | Editor types, instruments, inspectors, and workspace presets |
| 12, 39, 41, 42, 46, 47, 50 | Mediation, one-substrate agent system, Vama/Aeon/harness/code-mode loops | Agent pane, task/session lineage, approvals, scheduling, and run inspection |
| 16-19, 33-38, 40, 45, 48, 49, 53, 54 | Typed edges, contemplation, clock/energy/tuning, canon ledger, DOX/OKF, Bases, bell, residency, graph recovery | Preserve substrate; expose through editor/panel/status/health roles as appropriate |

`cycle3-track-register.json` carries the exact carrier law and disposition for all 55 logical tracks. This table is only the human orientation layer.

## Workbench Placement

| Inherited Cycle 3 capability | New workbench role |
|---|---|
| Shared profile, tick, harmonic/codon projections, live-wire contracts | Status bar plus shared work-context service |
| Bimba graph, coordinate normalization, provenance, Bases, canon read surfaces | [[M0']] explorer, graph editor, and source inspector |
| Spanda, played topology, audio bus, vortex and Klein surfaces | [[M1']] instrument editors and contextual inspectors |
| Correspondence, six axes, cymatics, epogdoon, MonoPoly | [[M2']] instrument editor and meaning inspector |
| Cosmic clock, [[35-fibonacci-ground-level-0-temporal-substrate|Fibonacci Ground]], 16 derived apertures, Tarot, hexagram, transcription | [[M3']] clock/cosmos editors and evidence inspector |
| NOW, day, journal, PASU, oracle, Kairos, session close, personal resonance | Protected [[M4']] continuity workspace |
| Chat, sessions, mediation, EBM, tools, changes, evidence, review, canon ledger | [[M5']] agent workbench and governed review loop |
| OmniPanel capabilities | Agent pane, bottom panel, health, settings, command palette, and status; not ten vertical peer tabs |
| Readiness and no-orphan registries | Organism Health with concise local summaries and recovery actions |

## Existing Carrier Bodies

These are representative landed bodies to preserve and recompose. The task inventory and each verification receipt carry the exhaustive paths.

| Area | Existing implementation anchors |
|---|---|
| Organism and shared state | `src/bridge/gatewayClient.ts`, `src/state/stores.ts`, `src-tauri/src/supervisor.rs` |
| [[M0']] | `src/panes/m0Layers.ts`, `src/panes/M0LayerRail.tsx`, `src/panes/m0AssetHandles.ts` |
| [[M1']] | `src/panes/KleinTopologyPane.tsx`, `src/panes/m1KleinTopology.ts`, `src/panes/m1SessionCloseReader.tsx` |
| [[M2']] | `src/panes/M2CorrespondencePane.tsx`, `src/components/CymaticField.tsx`, `src/components/EpogdoonProofOverlay.tsx` |
| [[M3']] | `src/panes/M3InspectorsPane.tsx`, `src/components/CosmicClockRenderService.tsx`, `src/components/M3CosmicWheelRenderService.tsx` |
| [[M4']] | `src/panes/NaraCanvasEditor.tsx`, `src/panes/JournalTimelinePane.tsx`, `src/panes/OraclePane.tsx`, `src/panes/m4DayContainer.ts` |
| [[M5']] | `src/panes/ChatPane.tsx`, `src/panes/M5RecognitionLayer.tsx`, `src/panes/M5EbmObservatoryPane.tsx`, `src/panes/omni/ReviewBlocksPane.tsx` |
| Governed editing | `src/panes/canonStudio.ts`, `src/panes/NaraCanvasEditor.tsx`, vault and filesystem ports |
| Evidence harness | `scripts/live-wire.mjs`, `scripts/gateway-method-audit.mjs`, `scripts/tauri-boot-smoke.mjs`, `tests/e2e/` |

Their presence does not validate the current layout. Their behavior and contracts are inherited even when their navigation container is replaced.

## Decisions The Redesign Must Not Reopen

- [[M0']] is readable graph plus inspectors; canon writes route through governed [[M5']] Atelier/Hen paths.
- [[M1']] topology remains genuinely spatial and profile-driven; local pitch/time law is forbidden.
- [[M2']] retains six 72-fold axes, separate sonic overlays, and the structural 9:8 fold.
- [[M3']] is 16 derived apertures grounded by [[35-fibonacci-ground-level-0-temporal-substrate|Fibonacci Ground]] as lens id 16. The superseded homogeneous 18-row branch must not return.
- The shared profile and gateway remain authoritative. Renderer-local LUT, clock, codon, astrology, or private-body reconstruction is forbidden.
- [[M4']] remains protected-local and dialogical; privacy borders and consent are domain law, not styling.
- Track 26's statement that the EBM observatory scores rather than talks applies to that observatory body, not to the whole [[M5']] workspace. Conversation belongs to the Pi/operator membrane and must be integrated beside active work.
- Theia contract shapes may be inherited; Theia plumbing is frozen and must not be revived.
- Cross-layout coordinate/session/profile/evidence identity must survive the new geometry.
- Human review and promotion remain explicit; agent completion is never automatic canon promotion.

## Evidence Caveats

### Twenty-One Current Refusals

The following indexed tasks are ledger-`done` but have a latest verification record of `REFUSED`:

```text
11.T11.6  11.T11.7  15.T15.7  19.T19.2  20.T20.3
21.T21.16
22.T22.3  22.T22.4  22.T22.13
23.T23.12 23.T23.14 23.T23.15
24.T24.5  24.T24.7  24.T24.13
25.T25.2  25.T25.12 25.T25.14 25.T25.18 25.T25.19 25.T25.22
```

Most were refused by later batch gates because another app test or UI flow was red. Their implementation evidence may still be valuable, but a new plan cannot call them currently verified without a fresh pass.

### Verification-Class Holes

- Tracks 01, 03, 04, and 05 still carry class `K` even though they expose carrier surfaces. `verification-classes.json` records this as a known sibling hole. Any redesigned user flow consuming them requires UF proof in addition to substrate tests.
- Track 54 has no verification-class entry. It must be classified before follow-on work closes.
- `app-smoke` currently proves a mounted native shell and a separately healthy gateway, not that the native supervisor started its own organism. It cannot close startup inheritance until repaired.

### Harness Is Evidence, Not Product

The gateway method audit, live-wire script, filesystem sidecar, Playwright global setup, and fixtures are verification infrastructure. Their existence does not mean the normal native product starts the same dependencies or exposes the tested workflow coherently.

## New-Plan Admission Gate

Every new implementation task that touches an inherited area must declare:

```text
cycle3Inherits: [task ids or track ids]
disposition: PRESERVE | RECOMPOSE | REVERIFY | REPAIR | RETIRE-CARRIER
existingBodies: [real paths]
existingProof: [verification records, tests, ratchets, or explicit missing proof]
ideDestination: [workspace + workbench region]
contractChange: none | proposed-and-canon-flagged
deletionReplacement: none | old body -> new destination
```

The task is inadmissible when it says only "implement M2", "build the agent panel", or "create deep mode" without this inheritance declaration.

## Phase Close Gate

A new IDE phase cannot close unless it proves:

1. all touched Cycle 3 task/track ids are represented in the phase inheritance declarations;
2. no expected-present gateway method disappeared;
3. live-wire projections still strict-parse and required projection manifest rows remain present;
4. kernel-truth has no unmanifested red or unexpectedly green standing red;
5. moved carrier bodies retain real behavior, privacy, evidence, and cross-layout identity;
6. removed tabs/panes have an explicit workbench destination or an approved retirement reason;
7. native startup proof comes from the launched carrier's own supervisor and first profile;
8. the completed user workflow is driven in the real app, not inferred from component mounts.

This is how the redesign consumes Cycle 3 instead of performing it for a third time.
