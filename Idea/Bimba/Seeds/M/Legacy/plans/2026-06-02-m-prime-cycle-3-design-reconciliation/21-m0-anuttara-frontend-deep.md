# Track 21 — M0' Anuttara Frontend Deep Design

Closes the per-extension widget UX of the `m0-anuttara` Theia surface. Track 01 (M0 substrate reconciliation) lands the six-layer contract + ARCHETYPE_LUT ordering fix + symbolic-coordinate-string EBNF + Verifier module at the substrate side. Track 11 (theia-shell-surface-hosting) ratifies the shell that hosts the extension. Track 15 (ui-design-foundations) names the binding foundation principles. Track 19 (contemplation-surface-integration) lands the contemplative substrate (`CONTEMPLATION_PROMPT_LUT[12]`, Verifier `virtue_witness_vector`, M0/M2 parity bridges). **What none of those tracks own is the per-Mn widget DEPTH: how the M0' Anuttara surface actually reads as a workbench.** Track 21 closes that gap.

The current `Body/M/epi-theia/extensions/m0-anuttara/` scaffold is one `ReactWidget` (`m0-anuttara-widget.tsx`) with five flat `<section>` blocks (banner / detail / language fields / S2 provenance / M5 actions / profile snapshot), one inspector (`m0-inspector.ts` with `M0InspectorModel` that *types* six-layer routing but does not render it), one layer-discriminator (`m0-layers.ts` with `M0_LAYER_VIEWS[6]` already-frozen), and one contribution contract (`index.ts` with `TRACK_08_CONTRIBUTION`, three declared view IDs, three commands, an intent target for legacy `'graph'`). The substrate is real but flat — the integrated bimba-map engagement system the Anuttara UX names is *typed but not surfaced*. Track 21 lifts the typed-and-not-surfaced into actual per-layer panels, contemplative footers, archetype routing readers, virtue witness rendering, symbolic-coordinate question consoles, and the Reading↔Authoring mode grammar — without rebuilding any landed scaffold and without violating the `mutatesGraphCanon: false` invariant ratified by DR-M0-1.

**Surface scope rationale.** Track 21 is per-Mn DEPTH for M0', exactly analogous to Track 11 §11.10-11.12 (M4 canvas port) and Track 15 §15.8-15.9 (M1-2 vortex visual). It does NOT re-open contract decisions (DR-M0-1 stands; the surface ratifies it as a UI mode-toggle). It does NOT re-implement M0/M5 chrome that already lives in `ide-shell-m0-m5` (bimba-graph-viewer, canon-studio, coordinate-tree, logos-atelier — those are consumed via `cross-layout-intent-dispatcher` deep-links, never duplicated inside m0-anuttara). It does NOT introduce direct S0/S2/S3/S5 imports — every cross-stack call routes through `SharedBridgeAdapter`. It does NOT re-author Track 19 substrate (ARCHETYPE_LUT ordering, CONTEMPLATION_PROMPT_LUT, M0/M2 parity bridges, Verifier module) — it consumes them via kernel-bridge profile payload fields by cross-link.

## Source Specs and Matrix

- Canonical UX: [`Idea/Pratibimba/System/Subsystems/Anuttara/anuttara-ux-full-m0-branch.md`](../../../../../Pratibimba/System/Subsystems/Anuttara/anuttara-ux-full-m0-branch.md)
- Canonical M' Seed: [`Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md`](../../M0'/M0'-SPEC.md), [`Idea/Bimba/Seeds/M/M0'/M0-ARCHITECTURE.md`](../../M0'/M0-ARCHITECTURE.md)
- Foundation contract: `Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.{md,json}` (KernelBridgeAPI capabilities, `sharedBridgeAdapter.forbiddenDirectImports`, readiness taxonomy)
- Track 11 (shell hosting): [`11-theia-shell-surface-hosting.md`](11-theia-shell-surface-hosting.md) — Tranches 11.2 (cross-layout intent), 11.3 (daily-layer widget ownership), 11.6 (acceptance-harness state-identity)
- Track 15 (UI foundations): [`15-ui-design-foundations.md`](15-ui-design-foundations.md) — foundation principles 1-9 (coordinate as primary nav, profile-tick clock, provenance always visible, Bimba/Pratibimba as UI dial, OmniPanel as `/`, composition over juxtaposition, activity-bar discipline, Theia conventions, day-now as ambient thread)
- Track 19 (contemplation surface): [`19-contemplation-surface-integration.md`](19-contemplation-surface-integration.md) — Tranches 19.1 (ARCHETYPE_LUT ordering fix), 19.3 (CONTEMPLATION_PROMPT_LUT[12]), 19.6 (Verifier 4'-5'-0' triplet), 19.10 (M0/M2 parity bridges)
- Track 01 (M0 substrate): [`01-m0-anuttara-reconciliation.md`](01-m0-anuttara-reconciliation.md) — Tranches 1.1 (six-layer surface contract), 1.2 (DR-M0-1 governed-route), 1.3 (DR-M0-2 source naming), 1.6 (image-assets-on-nodes), 1.9 (`c_1_relation_family` discriminator), 1.10 (Verifier module + `M0VerifierReport`), 1.11 (Anuttara symbolic-coordinate-string EBNF)
- Full row-level matrix: [`plan.runs/wave-c-m0-anuttara-frontend-matrix.md`](plan.runs/wave-c-m0-anuttara-frontend-matrix.md)
- Anchor canon: `Body/S/S0/epi-lib/include/m0.h` (`VIRTUE_LUT[9]` line 163, `ARCHETYPE_LUT[12]` line 208, `M0_CORE_RELATIONS[65]` line 526, `m0_bind_m5_logos` line 530), `Body/S/S0/epi-lib/docs/m0-dataset-audit.md` (108 nodes; lazy strategy)

## Cycle 2 Substrate Inheritance

Consume as-is —
- `Body/M/epi-theia/extensions/m0-anuttara/src/browser/m0-anuttara-widget.tsx` (the `ReactWidget`; the readiness banner; the bridge subscription pattern via `SharedBridgeAdapter.onProfile / onReadiness / onCoordinateContext`),
- `Body/M/epi-theia/extensions/m0-anuttara/src/browser/frontend-module.ts` (the `M0AnuttaraContribution` view contribution, `M0AnuttaraPublisher` observability publisher, intent target registration for `'graph'`),
- `Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-inspector.ts` (the `M0InspectorModel` shape, `normalizeM0CoordinateInput` parser, `buildM0InspectorModel` selector; the field/anchor/pointer/relationFamily/readiness selector helpers),
- `Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-layers.ts` (the `M0_LAYER_VIEWS[6]` frozen array, the `M0LayerLocalView`/`M0LayerBridgedView` discriminated union, the `bridgedLayerRoute` helper),
- `Body/M/epi-theia/extensions/m0-anuttara/src/common/index.ts` (`TRACK_08_CONTRIBUTION` with `compactViews`, `selectionHandlers`, `currentStateSelectors`, `evidenceSerializers`, `routeContracts`, `observabilityEvents`, `compositionBoundary.forbiddenImports`),
- `Body/M/epi-theia/extensions/m-extension-runtime/src/common/{profile,readiness,shared-bridge,bridge-api,contribution-contracts}.ts` (the `MathemeHarmonicProfileBoundary`, `MExtensionReadinessSnapshot`, `SharedBridgeAdapter`, `KernelBridgeAPI`, `CoordinateContext` shapes — all read-only at this domain),
- `Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/{bimba-graph-viewer-widget,canon-studio-widget,coordinate-tree-widget,logos-atelier-widget}.tsx` (consumed via deep-link only — Track 21 NEVER re-implements them),
- Cycle 2 Track 02 (M0-anuttara T0/T1/T2/T3/T4) substrate routings — the readable graph + source traceability + Anuttara language layer + GDS delta + routing all already landed.

Audit/verify — `forbiddenImports` enforcement (`Body/S/S0`, `Body/S/S2`, `Body/S/S3`, `Body/S/S5`, `neo4j-driver` are already declared; Track 21 must not introduce any).

Extend existing — `m0-anuttara-widget.tsx`, `m0-inspector.ts`, `m0-layers.ts`, `index.ts`, `frontend-module.ts`. Every Track-21 tranche either adds a new `src/browser/{components,panels,state}/*` file under `m0-anuttara`, extends an existing selector in `m0-inspector.ts`, or extends an existing contribution contract field.

## Surface Contracts

Before tranches: what the `m0-anuttara` surface IS at widget level after Track 21 lands. Treat these as binding contracts every tranche must honour.

**(SC-1) One widget, six panels, three modes, two faces.** The M0' surface is **one** Theia widget (`M0AnuttaraWidget`) hosting **six** layer panels (M0-0' through M0-5', four local + two bridged) selectable via a horizontal tab-strip, with **three** orthogonal mode controls (Reading↔Authoring, Implicate↔Explicate, Layer selector) and **two** persistent footer elements (Contemplation Prompt + Verifier Witness summary). The three previously-declared `ALL_VIEW_IDS` (`languageMap`, `owlShaclInspector`, `rVirtuePanel`) collapse into in-widget panels (per DR-WC-M0-1) — they are not separate Theia widgets. The Theia "no parallel widget shell" foundation principle (Track 15 §7 activity-bar discipline) is honoured by hosting one widget that mode-switches internally.

**(SC-2) `mutatesGraphCanon: false` is invariant.** Per DR-M0-1 (RESOLVED): canon mutation routes through M5-5 Logos Atelier governance. Every `M0GatewayAction` retains `mutatesGraphCanon: false as const`. The Authoring-mode UI affordance (Tranche 21.12) is a routed-write surface — it does NOT add a `requestCanonMutation()` method on `m-extension-runtime`. Deep-links to `canon-studio-widget` and `logos-atelier-widget` (already in ide-shell-m0-m5) carry the user to the governance perimeter.

**(SC-3) Every cross-stack call routes through `SharedBridgeAdapter`.** `forbiddenImports = ['Body/S/S0', 'Body/S/S2', 'Body/S/S3', 'Body/S/S5', 'neo4j-driver']` is enforced at contract validator + (per Track 11.5) at the validator script. Track 21 never adds a direct kernel-side, gateway-side, or graph-driver import. Substrate-resident LUTs (`ARCHETYPE_LUT`, `VIRTUE_LUT`, `CONTEMPLATION_PROMPT_LUT`, `M0_M2_ZODIACAL_BRIDGE`, etc.) are consumed via projected fields on `MathemeHarmonicProfileBoundary.payload` — never imported.

**(SC-4) Provenance lives on every datum.** Every selector returns a `state: M0ProvenanceState` value. The Layer Selector (Tranche 21.1) carries a per-layer pill. The new states `'bridged_local' | 'bridged_public'` are added (per Track 15.6 inline provenance principle). No separate "errors" panel — provenance is *where the datum is*.

**(SC-5) The active coordinate is global.** The widget reads `context.selectedCoordinate` from `SharedBridgeAdapter.onCoordinateContext`. Every per-layer panel, the archetype routing reader, the contemplation footer, the virtue witness panel, the symbolic-coordinate question console all key off the same coordinate (Track 15 foundation principle 1).

**(SC-6) The profile-tick is the UI clock.** The widget re-renders on every `bridge.onProfile` advance (already-wired in the scaffold). No tranche introduces a local timer (Track 15 foundation principle 2).

**(SC-7) Privacy class flows through every observability publish.** `PRIVACY_CLASS = 'public_current_with_graph_provenance'` is on `M0AnuttaraPublisher.publish` calls; M0-4' bridged route delegates `'protected_local'` rendering to `m4-nara` (never reads it locally); M0-5' bridged route delegates `'public_pedagogy'` rendering to `m5-epii`. Track 21 introduces no new privacy class.

**(SC-8) Cross-layout intent is consumer-side.** Track 11.2 lands the envelope; Track 21.19 wires m0-anuttara's consumer side. Intent payload with `requestedContributionId: M0LayerKey` opens the widget on that layer + sets implicate/explicate + mode. No reciprocal dispatch is required.

**(SC-9) The substrate is implicate ground; the surface is explicate articulation.** The Implicate↔Explicate toggle (Tranche 21.7) is a UI affordance over the same substrate. NO data fork. Implicate-mode selectors prefer `c_1_form` and ground-state fields; explicate-mode selectors prefer `c_1_complete_formulation` and articulated fields. Same payload, two presentations — the M0↔M5 Möbius hint at UI scale.

## Tranches

1. **21.1 — Layer Selector tab-strip (the six-mode navigation grammar)** *(no-orphan-fill; resolves DR-WC-M0-1)*

   Source row: WC-M0-01 + WC-M0-22 + WC-M0-25.

   New component at `Body/M/epi-theia/extensions/m0-anuttara/src/browser/components/layer-selector.tsx`. Renders the already-frozen `M0_LAYER_VIEWS[6]` from `m0-layers.ts` as a horizontal tab-strip mounted directly below `ReadinessBanner` in `m0-anuttara-widget.tsx`, above the existing detail sections. Type signature:

   ```ts
   export interface LayerSelectorProps {
       readonly layers: readonly M0LayerView[];
       readonly activeLayer: M0LayerKey;
       readonly onSelect: (key: M0LayerKey) => void;
       readonly layerReadiness: Record<M0LayerKey, M0ProvenanceState>;
   }
   export const LayerSelector: React.FC<LayerSelectorProps>;
   ```

   Each tab renders the layer's `label`, a provenance-state pill keyed off `layerReadiness[layer.key]`, and (for `layer.placement === 'bridged'`) an outbound-link glyph. Active-layer state held in `M0AnuttaraWidget.activeLayer: M0LayerKey` (default `'language'`). New `protected setActiveLayer(key: M0LayerKey): void` triggers `this.update()` + writes back through `SharedBridgeAdapter` for state preservation (cross-link 21.20). The three downgraded `ALL_VIEW_IDS` (`languageMap`, `owlShaclInspector`, `rVirtuePanel`) collapse into panels INSIDE this widget per DR-WC-M0-1; their IDs are retained as `ALL_VIEW_IDS` entries for back-compat with the contribution contract but no longer instantiate separate widgets.

   Verification:
   - `test -f Body/M/epi-theia/extensions/m0-anuttara/src/browser/components/layer-selector.tsx`
   - `grep -n "M0_LAYER_VIEWS\|LayerSelector\|activeLayer\|setActiveLayer" Body/M/epi-theia/extensions/m0-anuttara/src/browser/m0-anuttara-widget.tsx`
   - `pnpm -C Body/M/epi-theia/extensions/m0-anuttara build`
   - `pnpm --filter @pratibimba/m0-anuttara test`

2. **21.2 — Language-Layer Reader panel (M0-0')** *(extend existing; consumes Track 01.3 alias canon + Track 01.6 asset handles)*

   Source row: WC-M0-02.

   New panel at `Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/language-layer-panel.tsx`. Extends `buildM0InspectorModel` to project seven `c_1_*` fields (currently three): add `c_1_form`, `c_1_formulation_breakdown`, `c_1_primary_designation`, `c_1_name`. Extend `M0InspectorModel`:

   ```ts
   export interface M0AssetHandle {
       readonly uri: string;
       readonly kind: 'image' | 'sigil' | 'glyph' | 'seal' | 'tarot' | 'audio' | 'document';
       readonly state: M0ProvenanceState;
   }
   export interface M0InspectorModel {
       // ...existing fields...
       readonly languageFields: readonly M0ProvenancedField[];   // extended to 7 entries
       readonly assetHandles: readonly M0AssetHandle[];          // NEW selector, from c_1_asset_uri[] + c_1_asset_kind
   }
   ```

   Panel renders the seven fields as a `<dl>` with provenance-state attributes, then a horizontal scrollable asset preview row (CSS-only thumbnails, click-through opens a modal-less inline expanded view). Naming-canon enforcement per Track 01.3 (DR-M0-2): `c_1_*` are canonical; unprefixed aliases (`symbol`, `formulation_type`) accepted via fallback with provenance-state `derived`. Asset handles render `state === 'canonical_absent'` (gray placeholder) when `c_1_asset_uri[]` is empty.

   Verification:
   - `test -f Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/language-layer-panel.tsx`
   - `grep -nE "c_1_form\\b|c_1_formulation_breakdown|c_1_primary_designation|c_1_name|c_1_asset_uri|c_1_asset_kind|assetHandles" Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-inspector.ts`
   - inspector test asserts a synthetic payload with all seven `c_1_*` fields renders each with `state: 'canonical'`; payload missing five renders five `'canonical_absent'`
   - `pnpm --filter @pratibimba/m0-anuttara build`

3. **21.3 — QL-Structure Layer Reader panel (M0-1')** *(first-build against unowned M' product surface)*

   Source row: WC-M0-03.

   New panel at `Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/ql-structure-layer-panel.tsx`. New selector on `M0InspectorModel`:

   ```ts
   export interface QlStructureProjection {
       readonly position: 0 | 1 | 2 | 3 | 4 | 5 | null;
       readonly qlVariant: string | null;
       readonly familyContainsParent: string | null;
       readonly mirror: { readonly child: string | null; readonly inverse: string | null };
       readonly anchoredTo: readonly string[];
       readonly state: M0ProvenanceState;
   }
   export interface M0InspectorModel {
       readonly qlStructure: QlStructureProjection;
   }
   ```

   Selector reads from the same `s2.graph.node` payload via `properties?.c_1_ql_position`, `properties?.c_1_ql_variant`, traversal of `node.relations` for `FAMILY_CONTAINS` parent, `MIRROR_CHILDREN` row, `ANCHORED_TO` outbound coordinates (consume Track 01.9 `c_1_relation_family` discriminator to filter structural-only). Panel renders a `<dl>` plus an "Open in Coordinate Tree" deep-link button that dispatches via `cross-layout-intent-dispatcher` with payload `{ requestedExtensionId: 'ide-shell-m0-m5', requestedContributionId: 'coordinateTree', coordinate }` — NEVER duplicates the tree widget itself.

   Verification:
   - `test -f Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/ql-structure-layer-panel.tsx`
   - `grep -n "QlStructureProjection\|qlStructure\|FAMILY_CONTAINS\|MIRROR_CHILDREN\|ANCHORED_TO" Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-inspector.ts`
   - panel test asserts a payload with `c_1_ql_position: 4` + `c_1_ql_variant: "mod6"` + a `FAMILY_CONTAINS` parent edge renders all three fields with `state: 'canonical'`; missing payload falls back to `'canonical_absent'`
   - `pnpm --filter @pratibimba/m0-anuttara build`

4. **21.4 — Relations Layer Reader panel (M0-2')** *(extend existing; consumes Track 01.9 `c_1_relation_family` discriminator)*

   Source row: WC-M0-04.

   New panel at `Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/relations-layer-panel.tsx`. Replaces the comma-joined `relationFamilies` line in `m0-anuttara-widget.tsx` (within the existing S2 provenance `<section>`, when active layer is `'relations'`) with a two-column table. New selector:

   ```ts
   export const M0_STRUCTURAL_RELATIONS = [
       'CONTAINS', 'FAMILY_CONTAINS', 'ANCHORED_TO', 'BEDROCK',
       'MANIFESTS', 'INVERTS_TO', 'REFLECTS_AS', 'DERIVES_FROM',
       'HAS_LENS', 'HAS_KERNEL_RESONANCE'
   ] as const;
   export interface M0RelationRow {
       readonly targetCoordinate: string;
       readonly relationType: string;
       readonly relationFamily: 'structural' | 'correspondential' | 'kernel_core' | 'inferred' | 'sync' | 'compatibility';
       readonly state: M0ProvenanceState;
   }
   export interface M0RelationsProjection {
       readonly structural: readonly M0RelationRow[];
       readonly correspondential: readonly M0RelationRow[];
   }
   export interface M0InspectorModel {
       readonly relations: M0RelationsProjection;     // replaces the older relationFamilies[]
   }
   ```

   Selector partitions `node.relations` by `properties?.c_1_relation_family` value; falls back to `M0_STRUCTURAL_RELATIONS.includes(relation.type)` for legacy edges. Two columns render side-by-side; never collapsed (per Track 01.9). Provenance pill per row.

   Verification:
   - `test -f Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/relations-layer-panel.tsx`
   - `grep -n "M0_STRUCTURAL_RELATIONS\|M0RelationsProjection\|structural\|correspondential" Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-inspector.ts`
   - panel test asserts payload with one `CONTAINS` edge + one decan-rulership edge with `c_1_relation_family: 'correspondential'` renders them in distinct columns
   - `pnpm --filter @pratibimba/m0-anuttara test`

5. **21.5 — Community + Clock Overlay panel stub (M0-3')** *(spec-ahead-integration; cross-link Tranche 01.5)*

   Source row: WC-M0-05.

   New panel at `Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/community-clock-panel.tsx`. Downgrades the OWL/SHACL inspector view ID (`m0.anuttara.owlShaclInspector`) from a separate widget into a sub-tab inside this panel (per DR-WC-M0-1). New selectors:

   ```ts
   export interface M0CommunityIdEntry {
       readonly id: string;
       readonly size: number;
       readonly state: M0ProvenanceState;
   }
   export interface M0CommunityClockProjection {
       readonly communityIds: readonly M0CommunityIdEntry[];
       readonly activeNowClock: {
           readonly tick12: number | null;
           readonly degreeNode360: number | null;
           readonly state: M0ProvenanceState;
       };
       readonly graphitiEpisodeRefs: readonly string[];
       readonly state: M0ProvenanceState;
   }
   export interface M0InspectorModel {
       readonly communityClock: M0CommunityClockProjection;
   }
   ```

   Selector reads `profile.payload.gds_community` (S2 GDS projection) and `profile.payload.active_now_clock` (S3 Graphiti tick). NO local clock — `activeNowClock.tick12` mirrors the kernel-bridge profile-tick (Track 15.6). Renders `state === 'blocked'` with label `'pending: Track 02 T7/T8 coordinate-native graph API parity'` (from the existing `DECLARED_BLOCKERS` constant) until S2 GDS payload arrives. OWL/SHACL sub-tab renders the existing `readinessFacts` rows.

   Verification:
   - `test -f Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/community-clock-panel.tsx`
   - `grep -n "M0CommunityClockProjection\|gds_community\|active_now_clock\|graphiti_episode_refs" Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-inspector.ts`
   - panel test asserts no payload → `state === 'blocked'`; synthetic payload with `tick12: 7` → renders `'7'` in the tick cell with `state: 'derived'`
   - `pnpm --filter @pratibimba/m0-anuttara build`

6. **21.6 — Bridged-Layer Launcher (M0-4' / M0-5' deep-link buttons)** *(extend existing; consume `m0-layers.ts` as-is)*

   Source rows: WC-M0-06 + WC-M0-07.

   New component at `Body/M/epi-theia/extensions/m0-anuttara/src/browser/components/bridged-layer-launcher.tsx`. Mounted by `M0AnuttaraWidget` when the user picks a `placement === 'bridged'` tab in the Layer Selector. Type signature:

   ```ts
   export interface BridgedLayerLauncherProps {
       readonly layer: M0LayerBridgedView;
       readonly currentCoordinate: string | null;
       readonly onDispatch: (route: string) => void;
   }
   export const BridgedLayerLauncher: React.FC<BridgedLayerLauncherProps>;
   ```

   Renders one card per bridged layer: bridge target label (`"Personal route (M4 Nara)"` or `"Pedagogy route (M5 Epii)"`), summary, privacy-class disclosure (`'protected_local'` for M0-4'; `'public_pedagogy'` for M0-5'), and a "Open in m4-nara / m5-epii" button. On click, calls `bridgedLayerRoute(layer, currentCoordinate)` (already-exported helper from `m0-layers.ts`) and dispatches via Theia's `CommandRegistry.executeCommand('omnipanel.intent.dispatch', { requestedExtensionId: layer.bridgeExtensionId, requestedContributionId: 'artifact', coordinate: currentCoordinate, source: 'm0-anuttara' })`. NEVER renders the bridged payload locally — the bridge target is the owner.

   Verification:
   - `test -f Body/M/epi-theia/extensions/m0-anuttara/src/browser/components/bridged-layer-launcher.tsx`
   - `grep -n "bridgedLayerRoute\|BridgedLayerLauncher\|omnipanel.intent.dispatch" Body/M/epi-theia/extensions/m0-anuttara/src/browser/`
   - launcher test asserts click on M0-4' card dispatches with `requestedExtensionId: 'm4-nara'` and the current coordinate; never reads `'protected_local'` payload locally
   - `pnpm --filter @pratibimba/m0-anuttara test`

7. **21.7 — Implicate / Explicate toggle** *(no-orphan-fill; resolves O-WC-M0-1)*

   Source row: WC-M0-08.

   New component at `Body/M/epi-theia/extensions/m0-anuttara/src/browser/components/implicate-explicate-toggle.tsx`. Two-state toggle rendered to the right of the Layer Selector (21.1). Adds a new field to `M0InspectorModel`:

   ```ts
   export type M0Phase = 'implicate' | 'explicate';
   export interface M0InspectorModel {
       readonly phase: M0Phase;
       // ...existing fields...
   }
   ```

   When `phase === 'implicate'`: per-layer selectors prefer M0-side fields. Language layer (21.2) prioritises `c_1_form` (ground-state). Relations layer (21.4) emphasises structural family. Pedagogy bridged-route card shows "forward projection" framing. When `phase === 'explicate'`: selectors prefer the Pratibimba-return reading. Language layer prioritises `c_1_complete_formulation` (articulated). Pedagogy card shows "completed atelier route" framing. CSS-only lemniscate glyph (no animation library) renders during transition. State preserved via `currentStateSelectors` (cross-link 21.20). Implements the M0↔M5 Möbius hint at UI scale per SC-9 without forking the substrate.

   Verification:
   - `test -f Body/M/epi-theia/extensions/m0-anuttara/src/browser/components/implicate-explicate-toggle.tsx`
   - `grep -n "ImplicateExplicateToggle\|M0Phase\|implicate\|explicate" Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-inspector.ts`
   - inspector test asserts implicate phase priorities `c_1_form` field-order; explicate phase priorities `c_1_complete_formulation` field-order; both for the same payload
   - `pnpm --filter @pratibimba/m0-anuttara build`

8. **21.8 — Archetype Routing Reader panel** *(first-build; cross-link Tranche 19.1 ARCHETYPE_LUT ordering fix)*

   Source rows: WC-M0-09 + WC-M0-15.

   New panel at `Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/archetype-routing-panel.tsx`. Mounts inside the M0-0' Language Layer panel as a "Routing" sub-tab AND as a top-level sub-section when the selected coordinate's payload carries `c_1_archetype_index` ∈ {3, 5, 7, 9}. New selector:

   ```ts
   export type M0SubTableId = 'ZODIACAL' | 'MONOPOLY' | 'DIVINE_ACT' | 'VIRTUE' | 'NONE';
   export type M0SyntaxLayer = 'speech' | 'relationship' | 'action' | 'completion' | null;
   export interface M0SubTableRow {
       readonly id: number;
       readonly label: string;
       readonly symbol: string | null;
       readonly provenance: string;
   }
   export interface M0ArchetypeRoutingProjection {
       readonly archetypeIndex: number | null;          // ARCHETYPE_LUT[index]
       readonly archetypeLabel: string | null;          // e.g. "Acts of Śiva"
       readonly routedSubTable: M0SubTableId;
       readonly subTableRows: readonly M0SubTableRow[];
       readonly syntaxLayer: M0SyntaxLayer;
       readonly state: M0ProvenanceState;
   }
   export interface M0InspectorModel {
       readonly archetypeRouting: M0ArchetypeRoutingProjection;
   }
   ```

   Sub-table content comes from `profile.payload.m0_routing_lut_snapshot: { archetype_lut: M0SubTableRow[][]; }` (kernel-bridge projection of the `.rodata` LUTs landed by Track 19.1). NEVER imports from `Body/S/S0/epi-lib/include/m0.h`. Renderer shows: archetype name + index (e.g. "Archetype 7 — Acts of Śiva / DIVINE_ACT_LUT[7]"), syntax-layer pill (per Track 19.9 mapping: 3→`'speech'`, 5→`'relationship'`, 7→`'action'`, 9→`'completion'`), routed sub-table rows as a scrollable list. Cross-links Tranche 21.13 (Syntax-Layer Reader sub-panels) and Tranche 21.16 (Parity Bridge Reader) for the Arch 3/5/7/9 specialisations.

   Verification:
   - `test -f Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/archetype-routing-panel.tsx`
   - `grep -n "M0ArchetypeRoutingProjection\|routedSubTable\|syntaxLayer\|m0_routing_lut_snapshot" Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-inspector.ts`
   - panel test asserts Arch 7 input renders DIVINE_ACT rows + syntax-layer `'action'`; Arch 9 input renders VIRTUE rows + syntax-layer `'completion'`
   - `pnpm --filter @pratibimba/m0-anuttara test`

9. **21.9 — Contemplation Prompt footer** *(spec-ahead-integration; cross-link Tranche 19.3; resolves DR-WC-M0-3)*

   Source row: WC-M0-10.

   New permanent footer component at `Body/M/epi-theia/extensions/m0-anuttara/src/browser/components/contemplation-prompt-footer.tsx`. Persistent across all six layers (per DR-WC-M0-3). Selector:

   ```ts
   export interface M0ContemplationProjection {
       readonly archetypeIndex: number | null;
       readonly prompt: string | null;
       readonly responseDraft: string;
       readonly state: M0ProvenanceState;
   }
   export interface M0InspectorModel {
       readonly contemplation: M0ContemplationProjection;
   }
   ```

   Reads `profile.payload.contemplation_prompt_lut[archetypeIndex]` (kernel-bridge projection of the LUT landed by Track 19.3). UI: a single-line prompt area at the bottom of `m0-anuttara-widget.tsx`; below it a `<textarea>` for the user response (local UI state via React `useState` on draft text — not in `M0InspectorModel.contemplation.responseDraft` which is a placeholder, the panel maintains its own draft and writes to `responseDraft` on every change for state persistence). On submit (Enter key or "Submit" button), the publisher fires:

   ```ts
   this.publisher.publish({
       type: 'm0.review.requested',                   // existing OBSERVABILITY_EVENT_TYPES[1]
       extensionId: 'm0-anuttara',
       emittedAt: Date.now(),
       payload: {
           archetypeIndex,
           prompt,
           responseText: draft,
           coordinate: this.context.selectedCoordinate,
           profileGeneration: this.profile?.generation,
           privacyClass: PRIVACY_CLASS
       }
   });
   ```

   No local persistence. Gateway routes to `contemplate_session_close` (Track 19.6). Renders `state === 'blocked'` with label `'pending: Track 19.3 — CONTEMPLATION_PROMPT_LUT[12]'` until LUT is in the profile payload. Footer is NOT a modal (Track 15 principle 5 + DR-WC-M0-3).

   Verification:
   - `test -f Body/M/epi-theia/extensions/m0-anuttara/src/browser/components/contemplation-prompt-footer.tsx`
   - `grep -n "M0ContemplationProjection\|contemplation_prompt_lut\|m0.review.requested" Body/M/epi-theia/extensions/m0-anuttara/src/`
   - footer test asserts submission with synthetic prompt + draft text emits `m0.review.requested` event with all required payload fields; payload includes `coordinate` from context
   - `pnpm --filter @pratibimba/m0-anuttara build`

10. **21.10 — Virtue Witness panel (the 9-bit witness vector)** *(spec-ahead-integration; cross-link Tranches 01.10 + 19.6)*

    Source rows: WC-M0-11 + WC-M0-18.

    New panel at `Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/virtue-witness-panel.tsx`. Replaces the third declared view ID `m0.anuttara.rVirtuePanel` (downgrade to in-widget panel per DR-WC-M0-1). Selector:

    ```ts
    export type M0VirtueLabels = readonly [
        'Love/Peace', 'Truth', 'Openness/Creativity', 'Joy/Play',
        'Goodness', 'Beauty', 'Life/Nature', 'Wisdom', 'Reality'
    ];
    export interface M0VirtueWitnessProjection {
        readonly witnessBits: readonly [
            boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean
        ];
        readonly virtueLabels: M0VirtueLabels;
        readonly coherenceScore: number | null;
        readonly unsatisfiedConstraints: readonly string[]; // symbolic-coordinate-strings
        readonly state: M0ProvenanceState;
    }
    export interface M0InspectorModel {
        readonly virtueWitness: M0VirtueWitnessProjection;
    }
    ```

    Reads `profile.payload.m0_verifier_report: { virtue_witness_vector: number; coherence_score: number; unsatisfied_constraints: string[]; }` (kernel-bridge projection of the `M0VerifierReport` struct landed by Track 1.10). The 9-bit vector unpacks LSB-first into `witnessBits`. UI: a 3×3 grid of indicator dots (one per virtue), each filled (witnessed) or empty (unwitnessed), labelled with the virtue name. Coherence score rendered as a numeric badge with colour band: `>= 0.85` green, `>= 0.6` amber, `< 0.6` red. `unsatisfiedConstraints` rendered as a scrollable string list; clicking a constraint string opens it in the Symbolic-Coordinate Question Console (21.11).

    Verification:
    - `test -f Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/virtue-witness-panel.tsx`
    - `grep -n "M0VirtueWitnessProjection\|witnessBits\|virtueLabels\|coherenceScore\|m0_verifier_report" Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-inspector.ts`
    - panel test asserts a `virtue_witness_vector: 0b110110111` unpacks to `[T,T,T,F,T,T,F,T,T]` (LSB-first) → renders 7 filled / 2 empty in correct grid positions; coherence score `0.72` renders amber
    - `pnpm --filter @pratibimba/m0-anuttara test`

11. **21.11 — Symbolic-Coordinate Question Console** *(spec-ahead-integration; cross-link Tranches 01.10, 01.11, 05.21)*

    Source row: WC-M0-12.

    New panel at `Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/symbolic-coordinate-question-console.tsx`. Lists Verifier-emitted symbolic-coordinate-strings from `profile.payload.m0_verifier_questions: readonly string[]`. Selectors:

    ```ts
    export type M0SymbolicNamespace = 'R' | 'L' | 'M' | 'C';
    export type M0SymbolicStateMarker = 'pending' | 'unwitnessed' | 'drift' | 'incoherent' | 'violated';
    export interface M0SymbolicCoordinateParse {
        readonly namespace: M0SymbolicNamespace;
        readonly coordinate: readonly string[];
        readonly archetypeIndex: number | null;       // T7 → 7, T9 → 9
        readonly stateMarker: M0SymbolicStateMarker | null;
    }
    export type M0SymbolicResponseStatus = 'awaiting' | 'parsed' | 'responded' | 'reverified';
    export interface M0SymbolicQuestionRow {
        readonly raw: string;                          // raw EBNF coordinate-string
        readonly parsed: M0SymbolicCoordinateParse | null;
        readonly responseStatus: M0SymbolicResponseStatus;
        readonly responseText: string | null;
        readonly state: M0ProvenanceState;
    }
    export interface M0InspectorModel {
        readonly symbolicQuestions: readonly M0SymbolicQuestionRow[];
    }
    ```

    UI: vertically-scrollable list of question rows. Each row shows raw EBNF string, parse summary (namespace + coordinate + archetype + state marker), a free-text response box, and a status pill (`awaiting → parsed → responded → reverified`). Submit dispatches:

    ```ts
    await this.bridge.invokeCapability({
        method: 'invokeGatewayRpc',
        sessionKey: 'm0-anuttara-symbolic',
        params: {
            gatewayMethod: "s0'.verifier.respond_question",
            coordinateString: row.raw,
            responseText: draft,
            sourceExtensionId: 'm0-anuttara'
        },
        profileGeneration: this.profile?.generation ?? null,
        provenanceHandles: [],
        vak: null
    });
    ```

    Track 5.21's anuttara-symbolic-parse skill handles round-trip parsing. NEVER parses the EBNF locally — parse result comes back through the bridge response payload. Status flips on each transition; row state stored in widget-local React state.

    Verification:
    - `test -f Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/symbolic-coordinate-question-console.tsx`
    - `grep -nE "M0SymbolicQuestionRow|m0_verifier_questions|s0'.verifier.respond_question" Body/M/epi-theia/extensions/m0-anuttara/src/`
    - console test asserts a synthetic `#R0-0/1/A-T7-pending?` row renders with `archetypeIndex: 7`, `stateMarker: 'pending'`; submit dispatches the gateway RPC with correct method and params
    - `pnpm --filter @pratibimba/m0-anuttara build`

12. **21.12 — Reading / Authoring mode toggle** *(extend existing; ratifies DR-M0-1 at UI level; resolves DR-WC-M0-2)*

    Source rows: WC-M0-13 + WC-M0-14.

    New component at `Body/M/epi-theia/extensions/m0-anuttara/src/browser/components/mode-toggle.tsx`. Replaces the static "M5 action hooks" `<section>` in `m0-anuttara-widget.tsx` with a mode-keyed actions panel. New field:

    ```ts
    export type M0SurfaceMode = 'reading' | 'authoring';
    export interface M0InspectorModel {
        readonly mode: M0SurfaceMode;
    }
    ```

    In `'reading'` mode the actions panel renders ONLY the `deposit-graph-readiness-evidence` action and a "Switch to Authoring" affordance. In `'authoring'` mode the panel renders all three M5-routed actions from `m0-inspector.ts.actions` (`open-language-development-route`, `deposit-graph-readiness-evidence`, `request-anuttara-review`) PLUS two deep-link buttons:

    - "Open in Canon Studio" → `commands.executeCommand('omnipanel.intent.dispatch', { requestedExtensionId: 'ide-shell-m0-m5', requestedContributionId: 'canonStudio', coordinate, source: 'm0-anuttara' })`
    - "Open in Logos Atelier" → `{ requestedExtensionId: 'ide-shell-m0-m5', requestedContributionId: 'logosAtelier', coordinate, source: 'm0-anuttara' }`

    Authoring-mode banner: `"Per DR-M0-1: M0' never mutates canon. Routed-write via M5 atelier governance."` rendered with `data-provenance-state="derived"`. **Invariant SC-2:** every `M0GatewayAction.mutatesGraphCanon` MUST remain `false as const`. Track 21 introduces NO `requestCanonMutation()` path. The mode toggle is a UI affordance over already-existing routed-write actions.

    Verification:
    - `test -f Body/M/epi-theia/extensions/m0-anuttara/src/browser/components/mode-toggle.tsx`
    - `grep -n "M0SurfaceMode\|mode-toggle\|canonStudio\|logosAtelier\|Per DR-M0-1" Body/M/epi-theia/extensions/m0-anuttara/src/`
    - `grep -cE "mutatesGraphCanon: false as const|mutatesGraphCanon: false," Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-inspector.ts` returns ≥ 4 hits
    - mode-toggle test asserts authoring-mode renders both deep-link buttons AND the DR-M0-1 banner; reading-mode hides routed-write affordances; no `requestCanonMutation` symbol exists anywhere in the m0-anuttara source tree
    - `pnpm --filter @pratibimba/m0-anuttara test`

13. **21.13 — Syntax-Layer Reader sub-panels (Arch 3 speech / 5 relationship / 7 action / 9 completion)** *(no-orphan-fill; cross-link Tranche 19.9)*

    Source row: WC-M0-15.

    Four sub-panels at `Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/syntax-layers/`:

    - `arch3-speech-panel.tsx` — Vāk syntax-of-speech; 12 ZODIACAL_LUT rows
    - `arch5-relationship-panel.tsx` — Mono-Poly syntax-of-relationship; 7 MONOPOLY_LUT rows
    - `arch7-action-panel.tsx` — Acts of Śiva syntax-of-action; 7 DIVINE_ACT_LUT rows
    - `arch9-completion-panel.tsx` — Parameśvara syntax-of-completion; 9 VIRTUE_LUT rows

    Type signature shared:

    ```ts
    export interface SyntaxLayerPanelProps {
        readonly subTableRows: readonly M0SubTableRow[];      // from 21.8 archetypeRouting
        readonly contemplationPrompt: string | null;          // from 21.9 contemplation
        readonly virtueWitness: M0VirtueWitnessProjection | null;  // arch9 only
        readonly onSeekContemplation: () => void;
    }
    ```

    Each panel renders the routed sub-table rows + a "Why this question right now?" tooltip linking the Contemplation Prompt footer (21.9). The Arch 9 panel additionally cross-renders the 9-bit witness from 21.10 inline (one row per virtue with witnessed/unwitnessed glyph + label). Mounts lazily — only when active archetype matches AND user opens the Archetype Routing Reader (21.8) sub-tab.

    Verification:
    - `test -d Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/syntax-layers`
    - `test -f Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/syntax-layers/arch3-speech-panel.tsx`
    - `test -f Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/syntax-layers/arch5-relationship-panel.tsx`
    - `test -f Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/syntax-layers/arch7-action-panel.tsx`
    - `test -f Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/syntax-layers/arch9-completion-panel.tsx`
    - panel test asserts Arch 9 panel renders 9 VIRTUE rows in canonical order (Love/Peace at index 0 through Reality at index 8) and cross-links 21.10 witness
    - `pnpm --filter @pratibimba/m0-anuttara build`

14. **21.14 — Lazy 96-Node Browser panel** *(first-build; resolves O-WC-M0-3)*

    Source row: WC-M0-16.

    New panel at `Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/lazy-node-browser-panel.tsx`. Sub-tab of the M0-0' Language Layer (per DR-WC-M0-1 stacked tab). Paginated browsing of the 96-node residual set (108 total − 12 LUT-lifted) per `Body/S/S0/epi-lib/docs/m0-dataset-audit.md` lazy strategy. Selectors:

    ```ts
    export type M0SubBranch = '#0-0' | '#0-1' | '#0-2' | '#0-3' | '#0-4' | '#0-5';
    export interface M0LazyNodeEntry {
        readonly coordinate: string;
        readonly name: string;
        readonly symbol: string | null;
        readonly form: string | null;
        readonly state: M0ProvenanceState;
    }
    export interface M0LazyNodeBrowserState {
        readonly subBranch: M0SubBranch;
        readonly offset: number;
        readonly limit: 20;
        readonly entries: readonly M0LazyNodeEntry[];
        readonly total: number | null;
        readonly state: M0ProvenanceState;
    }
    ```

    UI: sub-branch selector (six pills: `#0-0` 4-Fold Zero / `#0-1` Emergence / `#0-2` 8-Fold Virtues / `#0-3` Archetypal Number Language / `#0-4` Holographic Matrix / `#0-5` Śiva-Śakti), node list (20 at a time), node-detail card on click. Pagination dispatches:

    ```ts
    await this.bridge.invokeCapability({
        method: 'invokeGatewayRpc',
        sessionKey: 'm0-anuttara-lazy-browser',
        params: {
            gatewayMethod: 's2.graph.list',
            coordinatePrefix: subBranch,
            limit: 20,
            offset
        },
        profileGeneration: this.profile?.generation ?? null,
        provenanceHandles: [],
        vak: null
    });
    ```

    Node-card click updates the widget's selected coordinate via `SharedBridgeAdapter` `coordinateContext` update — re-routes the active layer panel to the new node.

    Verification:
    - `test -f Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/lazy-node-browser-panel.tsx`
    - `grep -n "LazyNodeBrowser\|s2.graph.list\|coordinatePrefix\|M0LazyNodeBrowserState" Body/M/epi-theia/extensions/m0-anuttara/src/browser/`
    - browser test asserts pagination request for `#0-3` sends `offset: 0, limit: 20`; second page sends `offset: 20`; node-card click updates `selectedCoordinate` context
    - `pnpm --filter @pratibimba/m0-anuttara test`

15. **21.15 — 16-Fold Void-Structure ring renderer** *(first-build; resolves O-WC-M0-2)*

    Source row: WC-M0-17.

    New component at `Body/M/epi-theia/extensions/m0-anuttara/src/browser/components/void-structure-ring.tsx`. Mounts inside the Language Layer panel (21.2) when the active sub-branch (from 21.14) is `#0-4` Holographic Matrix. Renders 16 sacred-circle divisions as an SVG ring (CSS-driven; no canvas library) at fixed 240×240 px. Selector:

    ```ts
    export interface M0VoidLens {
        readonly lensIndex: number;                  // 0..15
        readonly coordinate: string;                 // e.g. "#0-4-{n}"
        readonly label: string;
        readonly state: M0ProvenanceState;
    }
    export interface M0VoidStructureProjection {
        readonly lenses: readonly M0VoidLens[];      // length 16
        readonly state: M0ProvenanceState;
    }
    export interface M0InspectorModel {
        readonly voidStructure: M0VoidStructureProjection;
    }
    export interface VoidStructureRingProps {
        readonly projection: M0VoidStructureProjection;
        readonly onLensClick: (lens: M0VoidLens) => void;
    }
    ```

    Each arc renders as 22.5° (16 arcs × 22.5° = 360°) SVG `<path>` element with `aria-label` carrying the lens coordinate. Click updates `selectedCoordinate` in the widget's `CoordinateContext`. Provenance pill per arc: filled = `'canonical'`, dotted = `'canonical_absent'`, red = `'blocked'`. Paired faces (lens 0/8, 1/9, 2/10, 3/11, 4/12, 5/13, 6/14, 7/15) lightly shaded as belonging to the same bimba↔pratibimba conjugation axis. Reads `profile.payload.m0_void_structure_ring: readonly M0VoidLens[]` (kernel-bridge projection).

    Verification:
    - `test -f Body/M/epi-theia/extensions/m0-anuttara/src/browser/components/void-structure-ring.tsx`
    - `grep -n "VoidStructureRing\|M0VoidLens\|m0_void_structure_ring\|lensIndex" Body/M/epi-theia/extensions/m0-anuttara/src/`
    - ring test asserts 16 arcs render with `aria-label` containing the lens coordinate; click on arc 7 sets selected coordinate to that lens's coordinate
    - `pnpm --filter @pratibimba/m0-anuttara build`

16. **21.16 — M0/M2 Parity Bridge Reader** *(spec-ahead-integration; cross-link Tranche 19.10)*

    Source row: WC-M0-19.

    New sub-panel at `Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/parity-bridge-reader.tsx`, mounted inside the Archetype Routing Reader (21.8). Activates conditionally on the active archetype:

    - Arch 3 active → renders `M0_M2_ZODIACAL_BRIDGE[12]` rows
    - Arch 5 active → renders `PSYCHOID_PLANETARY_CORRESPONDENCE[7]` rows
    - Arch 7 active → renders `ALCHEMICAL_TO_TATTVIC[6]` rows

    Selectors:

    ```ts
    export interface M0M2ZodiacalRow {
        readonly vakSymbol: string;
        readonly m0ResonanceIdx: number;
        readonly m0Successor: number;
        readonly element: string;
        readonly mode: string;
        readonly m2SignIdx: number;
        readonly decanPlanets: readonly [string, string, string];
        readonly firstDecanIdx72: number;
    }
    export interface M0PsychoidRow {
        readonly lensCoordinate: string;
        readonly lensName: string;
        readonly planetName: string;
        readonly planetId: number;
    }
    export interface M0AlchemicalRow {
        readonly alchemicalName: string;        // includes Salt (NOT Mineral), per 05.16
        readonly tattvicName: string;
        readonly mElemId: number;
        readonly cyclePoint: 'prima_materia' | 'ultima_materia' | 'intermediate';
    }
    export interface M0ParityBridgeProjection {
        readonly zodiacalBridge: readonly M0M2ZodiacalRow[] | null;
        readonly psychoidPlanetary: readonly M0PsychoidRow[] | null;
        readonly alchemicalToTattvic: readonly M0AlchemicalRow[] | null;
        readonly state: M0ProvenanceState;
    }
    export interface M0InspectorModel {
        readonly parityBridges: M0ParityBridgeProjection;
    }
    ```

    Reads `profile.payload.m0_m2_parity_bridges` (kernel-bridge projection of the LUTs landed by Track 19.10). Renders `state === 'blocked'` with label `'pending: Track 19.10 — M0/M2 parity bridges'` until landing. Tabular display; each row clickable to open the corresponding M2 decan / planet / element in the M2 Parashakti surface via `commands.executeCommand('omnipanel.intent.dispatch', { requestedExtensionId: 'm2-parashakti', requestedContributionId: 'correspondenceTree', coordinate: m2_coordinate })`.

    Verification:
    - `test -f Body/M/epi-theia/extensions/m0-anuttara/src/browser/panels/parity-bridge-reader.tsx`
    - `grep -n "M0_M2_ZODIACAL_BRIDGE\|PSYCHOID_PLANETARY_CORRESPONDENCE\|ALCHEMICAL_TO_TATTVIC\|m0_m2_parity_bridges" Body/M/epi-theia/extensions/m0-anuttara/src/`
    - panel test asserts Arch 5 input renders 7 rows with Saturn at index 6 (parent-as-7th); Arch 7 input renders 6 rows with `mElemId: 5` named `'Salt'` (NOT `'Mineral'`)
    - `pnpm --filter @pratibimba/m0-anuttara test`

17. **21.17 — Layout-aware widget placement (compact card in `daily-0-1`, main editor in `ide-deep`)** *(extend existing; cross-link Tranche 15.3)*

    Source row: WC-M0-21.

    Extends `frontend-module.ts` to register layout-conditional placement. Default `defaultWidgetOptions: { area: 'main' }` retained for `ide-deep` (per Track 15 §"`ide-deep`"). For `daily-0-1` cosmic-face, registers the existing `M0CoordinateSummaryCard` (referenced by `TRACK_08_CONTRIBUTION.compactViews[0]` but the file currently does not exist) against the cosmic-side activity-bar compact slot via `pratibimba-layouts` layout binding. New file:

    ```ts
    // Body/M/epi-theia/extensions/m0-anuttara/src/browser/components/m0-coordinate-summary-card.tsx
    export interface M0CoordinateSummaryCardProps {
        readonly currentProfile: MathemeHarmonicProfileBoundary | null;
        readonly readiness: MExtensionReadinessSnapshot;
        readonly coordinateContext: CoordinateContext;
        readonly onOpenFullView: () => void;
    }
    export const M0CoordinateSummaryCard: React.FC<M0CoordinateSummaryCardProps>;
    ```

    Card renders: coordinate, label, active layer label (from `M0SurfaceState` per 21.20), provenance-state pill, "Open full view" button → dispatches `commands.executeCommand('omnipanel.intent.dispatch', { requestedLayout: 'ide-deep', requestedExtensionId: 'm0-anuttara', coordinate, source: 'm0-anuttara-compact' })`. The three `requiredSelectors` from `TRACK_08_CONTRIBUTION.compactViews[0]` (`currentProfile`, `readiness`, `coordinateContext`) are honoured.

    Verification:
    - `test -f Body/M/epi-theia/extensions/m0-anuttara/src/browser/components/m0-coordinate-summary-card.tsx`
    - `grep -n "M0CoordinateSummaryCard\|compact-card\|requestedLayout: 'ide-deep'" Body/M/epi-theia/extensions/m0-anuttara/src/`
    - card test asserts all required selectors render and the "Open full view" button dispatches the intent correctly
    - `pnpm --filter @pratibimba/m0-anuttara build`
    - `pnpm --filter @pratibimba/pratibimba-layouts test` confirms `daily-0-1` layout descriptor accepts the compact card binding

18. **21.18 — Per-layer provenance pills + new `bridged_*` provenance states** *(extend existing; cross-link Track 15 principle 3)*

    Source row: WC-M0-22.

    Extends `M0ProvenanceState` union with two new states:

    ```ts
    export type M0ProvenanceState =
        | 'canonical'
        | 'canonical_absent'
        | 'derived'
        | 'inferred'
        | 'review_pending'
        | 'blocked'
        | 'bridged_local'      // NEW — M0-4' delegated to m4-nara protected-local
        | 'bridged_public';    // NEW — M0-5' delegated to m5-epii public-pedagogy
    ```

    Extends `M0InspectorModel` with:

    ```ts
    export interface M0InspectorModel {
        readonly layerReadiness: Record<M0LayerKey, M0ProvenanceState>;
    }
    ```

    `buildM0InspectorModel` populates `layerReadiness` per-key:
    - `'language'` → `canonical` if `properties?.c_1_symbol` present, else `canonical_absent`
    - `'ql-structure'` → `canonical` if `properties?.c_1_ql_variant` present, else `canonical_absent`
    - `'relations'` → `canonical` if `node?.relations?.length > 0`, else `canonical_absent`
    - `'time-community'` → `derived` if `payload.gds_community` present, else `blocked`
    - `'personal'` → always `bridged_local`
    - `'pedagogy'` → always `bridged_public`

    Layer Selector (21.1) consumes `layerReadiness` for each tab's pill. CSS rules in `Body/M/epi-theia/extensions/m0-anuttara/style/provenance-pills.css` map the eight states to colour: `canonical` green, `canonical_absent` gray, `derived` amber, `inferred` amber-dim, `review_pending` amber-pulse, `blocked` red, `bridged_local` purple, `bridged_public` blue.

    Verification:
    - `grep -n "bridged_local\|bridged_public\|layerReadiness" Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-inspector.ts`
    - `test -f Body/M/epi-theia/extensions/m0-anuttara/style/provenance-pills.css`
    - inspector test asserts `layerReadiness.personal === 'bridged_local'` and `layerReadiness.pedagogy === 'bridged_public'` regardless of payload; `layerReadiness.language === 'canonical'` only when `c_1_symbol` present
    - `pnpm --filter @pratibimba/m0-anuttara test`

19. **21.19 — Layer-aware cross-layout intent target** *(spec-ahead-integration; cross-link Tranche 11.2)*

    Source row: WC-M0-24.

    Extends `frontend-module.ts` `registerIntentTarget` to accept a `requestedContributionId` carrying an `M0LayerKey`. New payload contract in `Body/M/epi-theia/extensions/m0-anuttara/src/common/cross-layout-intent.ts`:

    ```ts
    export interface M0CrossLayoutIntentPayload {
        readonly requestedExtensionId: 'm0-anuttara';
        readonly requestedContributionId: M0LayerKey | 'graph';   // 'graph' = legacy fallback
        readonly coordinate?: string;
        readonly implicateExplicate?: M0Phase;
        readonly mode?: M0SurfaceMode;
        readonly source?: string;
    }
    ```

    `M0AnuttaraContribution.handleRoute` (extended from existing handler) reads the payload:
    - If `requestedContributionId` is an `M0LayerKey`, sets `widget.activeLayer = requestedContributionId`
    - If `implicateExplicate` present, sets `widget.phase = implicateExplicate`
    - If `mode` present, sets `widget.mode = mode`
    - If `coordinate` present, sets `widget.context.selectedCoordinate = coordinate` (via bridge)
    - Legacy `'graph'` continues to open the primary view without layer activation

    Cross-link Track 11.2 cross-layout intent T5 promotion — this is the m0-anuttara consumer side.

    Verification:
    - `test -f Body/M/epi-theia/extensions/m0-anuttara/src/common/cross-layout-intent.ts`
    - `grep -n "M0CrossLayoutIntentPayload\|requestedContributionId\|M0LayerKey" Body/M/epi-theia/extensions/m0-anuttara/src/browser/frontend-module.ts`
    - intent test asserts dispatch with `requestedContributionId: 'relations'` opens the widget and sets `activeLayer === 'relations'`
    - `pnpm --filter @pratibimba/m0-anuttara test`
    - `pnpm --filter @pratibimba/omnipanel-shell test` (cross-link confirms envelope shape)

20. **21.20 — Active-layer state persistence across `daily-0-1` ↔ `ide-deep` toggle** *(spec-ahead-integration; cross-link Tranches 11.6, 15.7)*

    Source row: WC-M0-25.

    Extends `TRACK_08_CONTRIBUTION.currentStateSelectors` in `Body/M/epi-theia/extensions/m0-anuttara/src/common/index.ts`:

    ```ts
    {
        id: 'm0-anuttara.activeLayer',
        source: 'shared-bridge',
        reads: ['activeLayer', 'implicateExplicate', 'mode']
    }
    ```

    New file `Body/M/epi-theia/extensions/m0-anuttara/src/browser/state/m0-surface-state.ts`:

    ```ts
    export interface M0SurfaceState {
        readonly activeLayer: M0LayerKey;
        readonly implicateExplicate: M0Phase;
        readonly mode: M0SurfaceMode;
    }
    export const DEFAULT_M0_SURFACE_STATE: M0SurfaceState;
    export function deserializeM0SurfaceState(payload: unknown): M0SurfaceState;
    export function serializeM0SurfaceState(state: M0SurfaceState): Readonly<Record<string, unknown>>;
    ```

    `M0AnuttaraWidget` reads on `postConstruct` via the SharedBridgeAdapter `currentStateSelectors` payload, writes on every state change. On layout toggle (Track 15.7), the bridge DI singleton preserves these fields alongside `coordinate`, `lens`, `mode`, `profileGeneration`, `sessionKey`, `dayNow`.

    Verification:
    - `test -f Body/M/epi-theia/extensions/m0-anuttara/src/browser/state/m0-surface-state.ts`
    - `grep -n "M0SurfaceState\|m0-anuttara.activeLayer\|implicateExplicate\|deserializeM0SurfaceState" Body/M/epi-theia/extensions/m0-anuttara/src/`
    - state test asserts toggle from `daily-0-1` to `ide-deep` preserves `activeLayer: 'relations'` and `mode: 'authoring'` and `implicateExplicate: 'explicate'`
    - `pnpm --filter @pratibimba/m0-anuttara build`
    - extend Track 11.6 acceptance-harness assertion to cover the three new fields: `(coordinate, lens, mode, profileGeneration, sessionKey, dayNow, m0_active_layer, m0_implicate_explicate, m0_mode)` survives both toggles
    - `pnpm --filter @pratibimba/acceptance-harness test`

## Cycle 2 Substrate Inheritance

Consume as-is — `m0-anuttara-widget.tsx` (the `ReactWidget` shell, the `ReadinessBanner` mount, the `SharedBridgeAdapter` subscription pattern); `frontend-module.ts` (the `M0AnuttaraContribution` view contribution, the `M0AnuttaraPublisher`, the three commands `OPEN_COMMAND_ID`/`READ_ONLY_COMMAND_ID`/`DEPOSIT_ONLY_COMMAND_ID`); `m0-inspector.ts` (the `M0InspectorModel` shape, the `buildM0InspectorModel` selector, the field/anchor/pointer/relationFamily/readiness helpers); `m0-layers.ts` (the `M0_LAYER_VIEWS[6]` frozen array, the `bridgedLayerRoute` helper); `index.ts` (the `TRACK_08_CONTRIBUTION` contract); `m-extension-runtime` (the `SharedBridgeAdapter`, `MathemeHarmonicProfileBoundary`, `MExtensionReadinessSnapshot`, `CoordinateContext` types); `ide-shell-m0-m5` chrome (consumed via cross-layout deep-link only). Track 21 extends every named file or adds a new sibling under `src/browser/{components,panels,state}/`; never re-implements a landed file.

Audit/verify — `compositionBoundary.forbiddenImports` list in `index.ts` must remain enforced. Track 21 introduces zero direct `Body/S/S0`/`Body/S/S2`/`Body/S/S3`/`Body/S/S5`/`neo4j-driver` imports. The Track 11.5 validator script (forbidden-import lint) catches any drift.

Cross-link without duplication — Track 19 substrate (ARCHETYPE_LUT ordering fix per 19.1; CONTEMPLATION_PROMPT_LUT[12] per 19.3; Verifier `M0VerifierReport` per 1.10; symbolic-coordinate-string EBNF per 1.11; M0/M2 parity bridges per 19.10) lands in `Body/S/S0/epi-lib/{include,src}/m0.{h,c}` and is projected through `MathemeHarmonicProfileBoundary.payload` fields (`m0_routing_lut_snapshot`, `contemplation_prompt_lut`, `m0_verifier_report`, `m0_verifier_questions`, `m0_m2_parity_bridges`, `m0_void_structure_ring`) — Track 21 consumes the projections, never re-authors the substrate.

## Anti-Greenfield Posture

All work in Track 21 either:

- **Consumes** Theia conventions (activity-bar, status-bar, commands, `ReactWidget`, `SharedBridgeAdapter`, `CommandRegistry.executeCommand`)
- **Consumes** the landed `m0-anuttara` scaffold (one widget + one inspector + one layer-discriminator + one contribution contract; every tranche extends an existing file or adds a sibling component/panel/state file, never rewrites)
- **Consumes** Track 11 cross-layout intent envelope (T5 promotion lands in Track 11; Track 21.19 wires the m0-anuttara consumer side)
- **Consumes** Track 15 foundation principles (coordinate as primary nav, profile-tick clock, inline provenance, no modal review surfaces, activity-bar discipline)
- **Consumes** Track 19 contemplative substrate via kernel-bridge projections (ARCHETYPE_LUT, CONTEMPLATION_PROMPT_LUT, VIRTUE_LUT, M0VerifierReport, symbolic-coordinate questions, M0/M2 parity bridges)
- **Consumes** ide-shell-m0-m5 chrome via cross-layout deep-link only (bimba-graph-viewer, canon-studio, coordinate-tree, logos-atelier are never re-implemented inside m0-anuttara)
- **Extends** landed `m0-anuttara` scaffold files (`m0-anuttara-widget.tsx`, `m0-inspector.ts`, `m0-layers.ts`, `index.ts`, `frontend-module.ts`) with new selectors, fields, and panel mounts
- **First-builds against unowned M' product surface** — per-layer reader panels (M0-0' Language, M0-1' QL-Structure, M0-2' Relations, M0-3' Community-Clock), Archetype Routing Reader, Contemplation Prompt footer, Virtue Witness panel, Symbolic-Coordinate Question Console, Parity Bridge Reader, Lazy 96-Node Browser, 16-Fold Void-Structure ring, Bridged-Layer Launcher, Reading/Authoring mode toggle, Implicate/Explicate toggle, Layer Selector tab-strip, compact summary card. Each first-build either resolves a no-orphan-fill candidate (O-WC-M0-1, O-WC-M0-2, O-WC-M0-3) or lands an unowned UX surface named in `anuttara-ux-full-m0-branch.md` §3, §7, §9, §12 mantra.

No greenfield widget shell. No competing inspector. No direct kernel/gateway/graph driver imports. No `requestCanonMutation()` path. No modal review surfaces. The m0-anuttara surface becomes the integrated bimba-map engagement workbench the UX names — through Theia conventions, the SharedBridgeAdapter boundary, and the routed-write governance perimeter held by M5 atelier. The substrate of m0-anuttara stays consumed; the per-Mn depth lands on top of it.
