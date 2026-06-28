# UI Foundation Principles Contract

This document is the canonical contract for the M' Theia UI foundation principles. It binds every M' surface that contributes Theia shell real estate, including the integrated daily surfaces, standalone Mn depth widgets, OmniPanel, activity-bar modes, status bar surfaces, and bottom-pane diagnostics.

These principles are normative requirements. Implementations MUST treat them as product law, not design preference. A surface that cannot satisfy one of these principles MUST publish explicit readiness or blocked provenance before it contributes UI.

Source plan: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/15-ui-design-foundations.md`.

## Surface Contract Cross-References

- `cosmic-side`: the cosmic side of `daily-0-1`, owned by the integrated `1-2-3` composition surface.
- `personal-side`: the personal side of `daily-0-1`, owned by the integrated `4-5-0` composition surface.
- `ide-deep`: the `4+2` depth layout, where standalone Mn extension widgets render one pole at a time.
- `omnipanel`: the persistent right-sidebar `/` operator membrane, identical across `cosmic-side`, `personal-side`, and `ide-deep`.
- `left-sidebar-system`: the activity-bar-switched bimba face shared by `daily-0-1` and `ide-deep`.

## Surface-Standard

The [[m5-prime-pratibimba-surface-standard]] materializes these principles as the app-wide block rendering contract for [[M'-SYSTEM-SPEC]] surfaces. It is the missing grammar between Track 15's foundation principles and Track 30's design-language layer: typed data becomes `Block[]`, the `BlockRegistry` accepts or rejects each block against the live catalog, and `BlockHostWidget` renders the accepted blocks through the owning `BlockSpec` while preserving Theia shell residency.

Binding surface facts:

- **Renderer:** `@pratibimba/block-kit` owns `BlockHostWidget` at `Body/M/epi-theia/extensions/block-kit/src/browser/block-host.tsx`; it renders blocks through registry-owned specs and carries `data-block-type`, `data-owner-extension`, `data-edit-surface`, and `data-privacy-class` attributes as visual-regression anchors.
- **Catalog:** `Body/M/epi-theia/extensions/block-kit/src/common/registry.ts` owns `CORE_BLOCK_OWNER_REGISTRATIONS`, `BLOCK_KIT_SURFACE_REGISTRATIONS`, and `BLOCK_KIT_GATEWAY_METHOD_CONTRACTS`; no core block type may render without an owner.
- **Live edge:** live blocks ride the day-now context runtime (`s3'.temporal.context` / `s3'.temporal.subscribe`) into the owning host. The standard does not create a new channel or store.
- **Persisted edge:** block-docs serialize `Block[]` into `Idea/Empty/Present/{day_id}/` as CTX-structured markdown or MDX instances. They are Pratibimba working artifacts, never canon writes.
- **Interaction loop:** verdict and annotation affordances route through `blocks.verdict` / `blocks.annotate` to `s4'.psyche.update` under the existing Human Gate; the standard renders governance, it does not redefine governance.
- **Design-language consumption:** block surfaces consume the binding token and primitive contracts (`ui-design-tokens`, `ui-colour-tokens`, `ui-typography`, `ui-motion-tokens`, `ui-accessibility`, `ui-composition-rules`, `ui-visual-regression-catalog`) and MUST NOT fork local visual grammar.
- **Visual-regression coverage:** the G8 baseline family `acceptance-harness/fixtures/visual-regression/block-host-widget/` pins `BlockHostWidget` in review, protected-evidence, and catalog/dispatch states with a 0.02 pixel-ratio threshold.

Compliance with the nine principles:

| Principle | Surface-Standard obligation |
| --- | --- |
| 1. Coordinate as Primary Navigation | Every block carries `ctx` and MAY carry `coordinate`; navigation/select affordances root in those addresses. |
| 2. Profile-Tick As Primary Clock | Live block updates arrive through the temporal context runtime and profile generation, not independent widget timers. |
| 3. Provenance Always Visible | `privacyClass`, `provenance`, owner extension, edit surface, readiness, and verdict state render inline with each block. |
| 4. Bimba/Pratibimba As UI Dial | The same typed truth renders as a Pratibimba block face without changing coordinate, session, day-now, or profile identity. |
| 5. OmniPanel As `/` Operator Membrane | Review, evidence, dispatch genealogy, and tool-stream blocks land inside the existing OmniPanel tabs, not modal clones. |
| 6. Composition Over Juxtaposition | One `BlockHostWidget` composes heterogeneous blocks into a coherent surface instead of adjacent standalone panes. |
| 7. Activity-Bar Discipline | The renderer is content inside existing Theia slots; it adds no competing left/right sidebar ownership. |
| 8. Theia Conventions | The standard uses `ReactWidget`, contribution points, shell layout restoration, commands, and package manifests already owned by Theia. |
| 9. Day-Now As Ambient Thread | Day-now is carried as ambient live/persisted context; no block or widget claims day-now as primary real estate. |

## Principle 1: Coordinate As Primary Navigation

Every UI surface MUST root navigation, selection, deep links, evidence anchors, and widget state in the active coordinate. The active coordinate is global UI state. A surface MUST NOT introduce an alternate primary navigation model that bypasses or obscures coordinate identity.

Surface bindings:

- `cosmic-side`: the integrated `1-2-3` composition MUST render from the active coordinate and expose coordinate-preserving transitions into M1, M2, and M3 details.
- `personal-side`: the integrated `4-5-0` composition MUST bind journal, field, and recognition state to the same active coordinate rather than a separate personal-only navigation tree.
- `ide-deep`: each standalone Mn widget MUST open from, preserve, and deep-link back to the active coordinate.

## Principle 2: Profile-Tick As Primary Clock

Every live widget MUST treat `MathemeHarmonicProfile` profile-tick advance as the primary UI clock. Rendering MAY respond to user input, but user input MUST NOT become the authoritative timebase for surfaces that are profile-driven.

Surface bindings:

- `cosmic-side`: the K2 torus, cymatic layer, codon annulus, and lens-ring composition MUST advance from the profile tick.
- `personal-side`: journal ambience, personal field rendering, recognition hints, and protected personal projections MUST advance from the same profile tick where they are live.
- `ide-deep`: standalone Mn widgets MUST subscribe to the kernel-bridge profile tick when displaying live profile-bound data.

## Principle 3: Provenance Always Visible

Every datum rendered in UI MUST expose readiness or provenance inline at the point of use. Valid readiness states include `ready`, `pending-*`, `blocked`, and explicitly typed degraded states. A surface MUST NOT hide provenance in a separate errors-only panel or substitute guessed defaults for missing authority.

Surface bindings:

- `cosmic-side`: profile, correspondence, cymatic, and codon data MUST carry inline provenance markers on the composed surface.
- `personal-side`: personal handles, protected projections, review state, and recognition evidence MUST expose privacy and readiness provenance without leaking raw protected payloads.
- `ide-deep`: inspection widgets MUST show source handles, readiness, blockers, and evidence anchors beside the data they explain.

## Principle 4: Bimba/Pratibimba As UI Dial

The Bimba/Pratibimba `0/1` control MUST function as a face switch over shared state, not as an app switch. Coordinate, lens, mode, profile generation, session key, and day-now MUST survive the inversion.

Surface bindings:

- `cosmic-side`: the bimba face MUST preserve state when the user flips into `personal-side`.
- `personal-side`: the pratibimba face MUST preserve state when the user flips back into `cosmic-side`.
- `ide-deep`: layout switches between `daily-0-1` and `ide-deep` MUST preserve the same state identity contract.

## Principle 5: OmniPanel As `/` Operator Membrane

OmniPanel MUST be the persistent right-sidebar membrane for Pi conversation, session continuity, dispatch genealogy, tool stream, evidence, review gates, gateway readiness, and diagnostics. These functions MUST NOT be implemented as scattered modal surfaces or duplicate right-sidebar panels.

Surface bindings:

- `cosmic-side`: OmniPanel MUST remain available with the same session and tab state while the cosmic composition is active.
- `personal-side`: OmniPanel MUST remain available with identical session continuity and review surfaces while protected personal context is active.
- `ide-deep`: OmniPanel MUST persist across deep widgets and provide the same dispatch, evidence, review, gateway, and diagnostic membrane.

## Principle 6: Composition Over Juxtaposition

Integrated surfaces MUST compose participating M-extensions into one coherent editor-area surface. They MUST NOT render the participating extensions as adjacent standalone panes when the product meaning is a single composition.

Surface bindings:

- `cosmic-side`: the integrated `1-2-3` surface MUST compose M1, M2, and M3 into one K2-driven cosmic engine.
- `personal-side`: the integrated `4-5-0` surface MUST compose M4, M5, and M0 into one personal recognition surface.
- `ide-deep`: standalone Mn widgets MAY render one pole at a time, but MUST NOT claim to be the integrated daily composition.

## Principle 7: Activity-Bar Discipline

Left-sidebar modes MUST be activity-bar-switched through Theia shell conventions. They MUST NOT be stacked into a crowded persistent sidebar, and they MUST NOT compete with OmniPanel for right-sidebar ownership.

Surface bindings:

- `cosmic-side`: left sidebar MUST expose Coordinate Tree, Bimba Graph Viewer, and Canon Studio as activity-bar modes.
- `personal-side`: left sidebar MUST expose Day Calendar, Journal Entries, and Personal Coordinate as activity-bar modes.
- `ide-deep`: left sidebar MUST expose Coordinate Tree, Bimba Graph Viewer, Canon Studio, Backend Studio, and Smart Connections as activity-bar modes.

## Principle 8: Theia Conventions

M' UI extensions MUST consume Theia conventions where they fit: status bar, breadcrumbs, command palette, keybindings, contribution points, layout restoration, activity-bar slots, and widget lifecycle. A surface MUST NOT reinvent a parallel shell primitive when Theia provides a stable one.

Surface bindings:

- `cosmic-side`: composition controls and navigation affordances MUST use Theia shell integration where shell-level behavior is required.
- `personal-side`: privacy-safe personal commands, calendar navigation, and journal entry affordances MUST use Theia contribution paths where applicable.
- `ide-deep`: deep widgets, source navigation, backend tooling, and workspace behavior MUST remain Theia-native.

## Principle 9: Day-Now As Ambient Thread

Day-now and session anchors MUST behave as ambient thread state. They MUST be available to status bar, widgets, dispatch, evidence, review, and persistence flows, but MUST NOT become a standalone owner of primary UI real estate.

Surface bindings:

- `cosmic-side`: the daily cosmic composition MUST consume day-now as context and surface it ambiently through status or provenance affordances.
- `personal-side`: journal and protected personal surfaces MUST bind to day-now without turning the day anchor into the central UI object.
- `ide-deep`: deep inspection, evidence, review, and backend surfaces MUST preserve day-now across layout switches and dispatch flows.

## Compliance

Every M' extension that contributes to `widget.application-shell-left`, `widget.application-shell-right`, or `widget.application-shell-bottom` MUST declare adherence to this contract with `contributes.uiFoundationPrincipleAdherence: true` in its package manifest or equivalent contribution manifest.

Any exception MUST be explicit, typed, and temporary: the extension MUST publish the blocked principle, affected surface contract, readiness state, owner, and follow-up tranche before activation.
