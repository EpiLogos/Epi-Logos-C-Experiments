# ACR To OmniPanel Migration Map

Task: `27.T27.10`. Active carrier: `Body/M/pratibimba-app`. The frozen
`Body/M/epi-theia/extensions/agentic-control-room` package is provenance only.

## Runtime Symbols

| Retired ACR symbol | Active owner | Disposition |
|---|---|---|
| `AgenticActor` | `omnipanelRuntime.ts::ActorIdentity` | Renamed; runtime actor plus role |
| `AgenticRoute` | `omnipanelRuntime.ts::DispatchRoute` | Renamed; method plus capability |
| `RunStatus` | `omnipanelRuntime.ts::RunStatus` | Migrated |
| `RunTreeNode` | `omnipanelRuntime.ts::RunTreeNode` | Migrated; consumed by `dispatchGenealogy.ts` |
| `ToolStreamEvent` | `omnipanelRuntime.ts::ToolStreamEvent` | Migrated; payload bodies omitted |
| `ReviewDecision` / `ReviewTransition` | `omnipanelRuntime.ts` | Migrated runtime vocabulary |
| `isMediationCapabilityAllowed` | `omnipanelRuntime.ts` | Migrated pure exact/wildcard predicate |
| `assertCapabilityParity` | `omnipanelCapabilities.ts::parseMediationCapabilitySnapshot` | Replaced by strict gateway projection validation; Pi startup retains local-matrix parity authority |
| `ACRRuntimeService` | carrier `GatewayClient` + `eventsStore` + Omni fold modules | Decomposed; no second socket/service store |
| `run-flow-widget.tsx` | `dispatchGenealogy.ts`, `DispatchGenealogyTree.tsx`, `DispatchGenealogyStream.tsx`, review block surfaces | Decomposed into tab fold primitives |
| `ACR_WIDGET_IDS` | `omnipanelRuntime.ts::OMNIPANEL_TABS` | Replaced by the eight-tab `/` manifest |

## Evidence And Review Symbols

| Retired ACR symbol | Active owner | Disposition |
|---|---|---|
| `RunEvidenceEnvelope` | `evidenceShapes.ts::MediatedRunEvidencePacket` | Superseded by the richer Track 26.10 canonical packet; no parallel envelope schema |
| `MediatedRunEvidencePacket` | `evidenceShapes.ts` | Migrated to its canonical schema home |
| evidence builders / required-field checks / protected-handle validation | `serializeEvidencePacket`, `parseEvidencePacket`, `validateEvidencePacket` | Re-expressed around the canonical packet and fail-closed parser |
| `enforceHumanGate` | `../m5ReviewGate.ts` | Migrated and widened for the real review lineage |

## Capability And Roster Correction

`s4'.mediation.capabilities.list` is live and is the only OmniPanel capability
source. `omnipanelCapabilities.ts` invokes and strict-parses it, retaining both
membership and entitlement class. Aletheia-mode-internal tools never degrade to
standard tools in the face.

The old migration source referred to `constitutional_agents` as dispatch
targets. DR-M5-1 has since invalidated that model. The executable roster is Pi,
Anima, and the six Aletheia techne guardians. Nous, Logos, Eros, Mythos, Psyche,
and Sophia remain authorial/Psyche aspect registers composed by Anima. They are
not direct peer-agent targets.

## Surface Fate

The standalone ACR package does not exist in the active carrier. Per
DR-WC-IS-1/2, governance-primary deep panes and agentic-primary OmniPanel folds
consume the same mediated packet in two renderings. The OmniPanel owns the
abbreviated conversational/dispatch folds; deep governance actions remain on
the designated carrier panes.
