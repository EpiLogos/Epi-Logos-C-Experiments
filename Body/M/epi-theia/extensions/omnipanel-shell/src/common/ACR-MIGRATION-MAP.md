# ACR Substrate to OmniPanel Content Model Migration Map

Task: 27.T27.10

This map is the execution contract for moving the Agentic Control Room (ACR)
content substrate into the OmniPanel runtime model and the canonical evidence
schema home. It is intentionally per-symbol: follow the rows before deleting or
emptying `agentic-control-room`.

## Scope

- Migration sources:
  - `agentic-control-room/src/common/run-model.ts`
  - `agentic-control-room/src/common/parity.ts`
  - `agentic-control-room/src/browser/acr-runtime-service.ts`
  - `Body/S/S4/plugins/pleroma/capability-matrix.json`
- Runtime target:
  - `omnipanel-shell/src/common/omnipanel-runtime.ts`
  - `omnipanel-shell/src/browser/services/`
- Evidence target:
  - `integrated-composition/src/common/evidence-shapes.ts`

## Required Symbol Map

| Symbol | From | To | Rename? | Migration plan |
|---|---|---|---|---|
| `AgenticActor` | `agentic-control-room/src/common/run-model.ts:27` | `omnipanel-shell/src/common/omnipanel-runtime.ts` | -> `ActorIdentity` | Replace the ACR actor union with an OmniPanel-owned actor identity type. Keep constitutional names and string extension support, but route UI-facing mediation through the OmniPanel dispatch model. |
| `constitutional_agents` array | `Body/S/S4/plugins/pleroma/capability-matrix.json:7` via `agentic-control-room` parity/read paths | `omnipanel-shell/src/common/omnipanel-runtime.ts` | -> `anima.dispatchTargets[]` | Treat the matrix array as Anima's dispatch target registry. OmniPanel should expose it as content model data, not as ACR package state. |
| `RunEvidenceEnvelope` | `agentic-control-room/src/browser/acr-runtime-service.ts` service state, imported from `agentic-control-room/src/common/run-model.ts:96` | `integrated-composition/src/common/evidence-shapes.ts` | keep name | Move the envelope type and builder to the shared evidence schema home. `omnipanel-runtime.ts` imports it from integrated-composition rather than redefining it. |
| `MediatedRunEvidencePacket` | `agentic-control-room/src/browser/acr-runtime-service.ts` deposition flow, built by `agentic-control-room/src/common/run-model.ts:200` | `integrated-composition/src/common/evidence-shapes.ts` | keep name | Merge the fuller ACR packet fields into the canonical packet already present in `evidence-shapes.ts`; preserve the current ledger API while adding the substrate fields needed by OmniPanel Evidence and Review tabs. |
| `capacity_workflows` refs | `agentic-control-room` capability/workflow references and Pi runtime monitor views | `omnipanel-shell/src/common/omnipanel-runtime.ts` and `omnipanel-shell/src/browser/services/` | -> `capacityBindings` | Normalize capacity workflow references into explicit runtime bindings keyed by dispatch target, route, capability name, and tab/facet destination. The current scan did not find a literal `capacity_workflows` key, so this row covers the semantic reference family named by the migration spec. |

## Full Per-Symbol Plan

| Symbol | From | To | Rename? | Notes |
|---|---|---|---|---|
| `AgenticActor` | `agentic-control-room/src/common/run-model.ts:27` | `omnipanel-shell/src/common/omnipanel-runtime.ts` | -> `ActorIdentity` | Replace ACR naming at the content-model boundary. Keep support for `anima`, `eros`, `logos`, `mythos`, `nous`, `psyche`, `sophia`, `aletheia`, `pi`, and extension strings. |
| `AgenticRoute` | `agentic-control-room/src/common/run-model.ts:39` | `omnipanel-shell/src/common/omnipanel-runtime.ts` | -> `DispatchRoute` | Preserve the string-or-union pattern; register routes through OmniPanel runtime services. |
| `RunStatus` | `agentic-control-room/src/common/run-model.ts:48` | `omnipanel-shell/src/common/omnipanel-runtime.ts` | no | Move verbatim unless later tab work adds display-only states. |
| `RunTreeNode` | `agentic-control-room/src/common/run-model.ts:59` | `omnipanel-shell/src/common/omnipanel-runtime.ts` | no | Extend for Dispatch Trace tab needs: actor, capability, session key, profile tick, and evidence packet references. |
| `ToolStreamEvent` | `agentic-control-room/src/common/run-model.ts:70` | `omnipanel-shell/src/common/omnipanel-runtime.ts` | no | Extend for Tool Stream tab needs: actor, dispatch node id, latency, input/output digest, session key, profile tick, and evidence packet reference. |
| `ReviewDecision` | `agentic-control-room/src/common/run-model.ts:79` | `omnipanel-shell/src/common/omnipanel-runtime.ts` | no | Move verbatim for Review tab and Pi runtime monitor consumers. |
| `ReviewTransition` | `agentic-control-room/src/common/run-model.ts:81` | `omnipanel-shell/src/common/omnipanel-runtime.ts` | no | Change actor field to `ActorIdentity` during the same migration. |
| `RunEvidenceEnvelope` | `agentic-control-room/src/common/run-model.ts:96` and `acr-runtime-service.ts` evidence state | `integrated-composition/src/common/evidence-shapes.ts` | no | Canonical schema home is integrated-composition; OmniPanel imports. |
| `MediatedRunEvidencePacket` | `agentic-control-room/src/common/run-model.ts:200` and `acr-runtime-service.ts` deposition flow | `integrated-composition/src/common/evidence-shapes.ts` | no | Canonical schema home is integrated-composition; merge with the existing ledger packet shape instead of duplicating. |
| `MediationCapabilityName` | `agentic-control-room/src/common/run-model.ts:113` | `omnipanel-shell/src/common/omnipanel-runtime.ts` | no | Runtime capability vocabulary, used by `capacityBindings` and service guards. |
| `enforceHumanGate()` | `agentic-control-room/src/common/run-model.ts:216` | `omnipanel-shell/src/browser/services/review-landing-service.ts` | no | Wrap in a Review service so UI and gateway parity failures surface in the Review tab. |
| `buildEvidenceEnvelope()` | `agentic-control-room/src/common/run-model.ts:243` | `integrated-composition/src/common/evidence-shapes.ts` | no | Move with `RunEvidenceEnvelope`; preserve defaults and privacy class behavior. |
| `isMediationCapabilityAllowed()` | `agentic-control-room/src/common/run-model.ts:301` | `omnipanel-shell/src/common/omnipanel-runtime.ts` | no | Keep pure and importable by services, tests, Review tab, Gateway tab, and Pi runtime monitor. |
| `buildMediatedRunEvidencePacket()` | `agentic-control-room/src/common/run-model.ts:342` | `integrated-composition/src/common/evidence-shapes.ts` | no | Move with validators; update imports to use integrated-composition. |
| `REQUIRED_EVIDENCE_FIELDS` | `agentic-control-room/src/common/run-model.ts:397` | `integrated-composition/src/common/evidence-shapes.ts` | no | Evidence completeness invariant. |
| `REQUIRED_MEDIATED_EVIDENCE_FIELDS` | `agentic-control-room/src/common/run-model.ts:410` | `integrated-composition/src/common/evidence-shapes.ts` | no | Mediated packet completeness invariant. |
| `missingEvidenceFields()` | `agentic-control-room/src/common/run-model.ts:424` | `integrated-composition/src/common/evidence-shapes.ts` | no | Evidence tab and review gate should consume this shared function. |
| `validateCurrentProfileRef()` | `agentic-control-room/src/common/run-model.ts:435` | `integrated-composition/src/common/evidence-shapes.ts` | private | Keep private to packet construction. |
| `validateGraphContextRef()` | `agentic-control-room/src/common/run-model.ts:445` | `integrated-composition/src/common/evidence-shapes.ts` | private | Keep private to packet construction. |
| `validateSessionRuntimeRef()` | `agentic-control-room/src/common/run-model.ts:455` | `integrated-composition/src/common/evidence-shapes.ts` | private | Keep private to packet construction. |
| `validateSemanticCandidateRef()` | `agentic-control-room/src/common/run-model.ts:462` | `integrated-composition/src/common/evidence-shapes.ts` | private | Keep private to packet construction. |
| `validateS5Refs()` | `agentic-control-room/src/common/run-model.ts:478` | `integrated-composition/src/common/evidence-shapes.ts` | private | Keep private to packet construction. |
| `sanitizeProtectedHandle()` | `agentic-control-room/src/common/run-model.ts:489` | `integrated-composition/src/common/evidence-shapes.ts` | private | Preserve protected-body rejection exactly. |
| `validateVaultRef()` | `agentic-control-room/src/common/run-model.ts:507` | `integrated-composition/src/common/evidence-shapes.ts` | private | Preserve mediated vault capability checks. |
| `assertCapabilityParity()` | `agentic-control-room/src/common/parity.ts:19` | `omnipanel-shell/src/common/omnipanel-runtime.ts` | no | Consumed by Review gate checks and Gateway capability rows. |
| `AgenticControlRoomRuntimeService` | `agentic-control-room/src/browser/acr-runtime-service.ts:74` | `omnipanel-shell/src/browser/services/omnipanel-runtime-service.ts` plus focused services | -> `OmniPanelRuntimeService` runtime concerns | Fold run state, route invocation, tool stream absorption, evidence setting, and review submission into OmniPanel services. Keep tab state and profile tick behavior already present in `OmniPanelRuntimeService`. |
| `RunState` | `agentic-control-room/src/browser/acr-runtime-service.ts:44` | `omnipanel-shell/src/common/omnipanel-runtime.ts` | -> `OmniPanelRunState` | Move out of ACR service so Dispatch Trace, Tool Stream, Evidence, Review, and Pi Chat share one state contract. |
| `SelectedCandidate` | `agentic-control-room/src/browser/acr-runtime-service.ts:28` | `omnipanel-shell/src/common/omnipanel-runtime.ts` | -> `SelectedRuntimeSubject` | Generalize candidate language for OmniPanel sessions, dispatches, evidence packets, and review subjects. |
| `selectRouteActor()` | `agentic-control-room/src/browser/acr-runtime-service.ts:105` | `omnipanel-shell/src/browser/services/omnipanel-runtime-service.ts` | -> `selectDispatchTarget()` | Store a `DispatchRoute` and `ActorIdentity`, then derive Anima genealogy for Pi Chat badges and Dispatch Trace. |
| `startRun()` | `agentic-control-room/src/browser/acr-runtime-service.ts:114` | `omnipanel-shell/src/browser/services/omnipanel-runtime-service.ts` | -> `invokeRoute()` | Continue to call `s4'.mediation.route` through the bridge; no direct fetch or websocket. |
| `setEvidence()` | `agentic-control-room/src/browser/acr-runtime-service.ts:219` | `omnipanel-shell/src/browser/services/evidence-landing-service.ts` | no | Validate privacy, add to shared ledger, expose latest packet to Evidence and Review tabs. |
| `submitReviewDecision()` | `agentic-control-room/src/browser/acr-runtime-service.ts:238` | `omnipanel-shell/src/browser/services/review-landing-service.ts` | no | Preserve human-gate-before-gateway behavior and gateway parity rejection. |
| `absorbBridgeEvent()` | `agentic-control-room/src/browser/acr-runtime-service.ts:303` | `omnipanel-shell/src/browser/services/tool-stream-service.ts` | no | Keep privacy filtering and normalize tool events into the OmniPanel stream model. |
| `composeEvidence()` | `agentic-control-room/src/browser/acr-runtime-service.ts:343` | `omnipanel-shell/src/browser/services/evidence-landing-service.ts` | no | Calls `buildEvidenceEnvelope()` from integrated-composition and stores the result in OmniPanel state. |

## Capacity And Dispatch Bindings

`capacity_workflows` refs should not survive as an ACR-specific concept. The
OmniPanel model should expose:

| New field | Source | Purpose |
|---|---|---|
| `anima.dispatchTargets[]` | `constitutional_agents` and Aletheia crystallisation routes | Defines who Anima can dispatch to from Pi Chat and Dispatch Trace. |
| `capacityBindings[]` | capability matrix tools, route handlers, gateway facets, and Pi runtime monitor views | Binds a route or capability to a visible OmniPanel tab/facet and to the service that invokes or observes it. |
| `capacityBindings[].capability` | `MediationCapabilityName` | Keeps capability allow-list checks pure and testable. |
| `capacityBindings[].route` | `DispatchRoute` | Links slash commands, Pi conversation dispatches, and service invocations. |
| `capacityBindings[].targetTab` | `OmniPanelTabId` | Routes output to `dispatch-trace`, `tool-stream`, `evidence`, `review`, `gateway`, or `diagnostics`. |

## Execution Order

1. Expand `integrated-composition/src/common/evidence-shapes.ts` with
   `RunEvidenceEnvelope`, the full `MediatedRunEvidencePacket`, builders,
   required-field constants, and private validators.
2. Replace `AgenticActor`/`AgenticRoute` definitions in OmniPanel with
   `ActorIdentity`/`DispatchRoute`, then move the pure runtime types and
   guards into `omnipanel-runtime.ts`.
3. Add `anima.dispatchTargets[]` and `capacityBindings[]` to the OmniPanel
   runtime contract, deriving their initial data from the capability matrix.
4. Fold `AgenticControlRoomRuntimeService` behavior into
   `omnipanel-runtime-service.ts` and focused services under
   `omnipanel-shell/src/browser/services/`.
5. Update consumers to import from `@pratibimba/omnipanel-shell` or
   `@pratibimba/integrated-composition`; remove imports from
   `@pratibimba/agentic-control-room`.
6. Decompose `run-flow-widget.tsx` into OmniPanel Dispatch Trace, Tool Stream,
   Evidence, and Review surfaces; keep the deeper Pi runtime monitor as a
   consumer, not as the schema owner.
7. Delete or archive the empty `agentic-control-room` package only after the
   build and migration tests pass.

## Verification Plan

- `test -f Body/M/epi-theia/extensions/omnipanel-shell/src/common/ACR-MIGRATION-MAP.md`
- `grep -n "AgenticActor\|constitutional_agents\|RunEvidenceEnvelope\|MediatedRunEvidencePacket\|capacity_workflows" Body/M/epi-theia/extensions/omnipanel-shell/src/common/ACR-MIGRATION-MAP.md`
- Post-execution migration check: `grep -rnE "from '@pratibimba/agentic-control-room'" Body/M/epi-theia/extensions/` returns zero matches.
- Post-execution import test: all migrated symbols are importable from their new homes.
- Post-execution builds: `pnpm --filter @pratibimba/omnipanel-shell build`, `pnpm --filter @pratibimba/ide-shell-m0-m5 build`, and `pnpm --filter @pratibimba/integrated-composition build`.

## Decision Notes

- `agentic-control-room` should become a migration source only after the
  symbols move. The preferred end state is to delete the empty package rather
  than keep a forwarding shell.
- OmniPanel Pi Chat and Pi Runtime Monitor remain distinct consumers of the
  same OmniPanel runtime substrate. Pi Chat is the conversational membrane;
  Pi Runtime Monitor is the full-fidelity observability surface.
- Evidence shape ownership belongs to integrated-composition. OmniPanel owns
  runtime state, dispatch content model, tab routing, and service orchestration.
