# Track 28 — `ide-shell-m0-m5` Chrome Deep UX

Closes per-widget UX for the **eight landed widgets + `bridge-gate`** inside `Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/`, plus the **left-sidebar activity-bar system** (per 15.3), plus the **Smart-Connections code-pending stub** (per 11.4), plus the **Backend Studio LSP slot** (per 15-foundation `ide-deep` row), plus the **ide-shell vs OmniPanel ownership split** for the Evidence / Review / Dispatch-trace surfaces (per 15.2 + DR-WC-IS-1/2). The eight widgets are **the M0/M5 chrome system**: coordinate-rooted navigation backbone (Coordinate Tree, Bimba Graph Viewer), canonical-write under governance (Canon Studio, Logos Atelier — both route writes through M5 atelier per DR-M0-1 + 21-m0 SC-2), agentic-dispatch evidence + review surfaces (Evidence pane, Review pane, ACR, Autoresearch pane), readiness primitive (`bridge-gate`). Track 28 names what each widget IS at depth, what split lives where, and the disciplines (SharedBridgeAdapter as only network, kernel-bridge readiness as the only readiness primitive, privacy gate non-bypassable, anti-greenfield audit-extend over rebuild).

Cross-links: Track 11 (TS-07 the eight ide-shell widgets are M0/M5 chrome; 11.2 cross-layout intent; 11.4 smart-connections code-pending; 11.6 acceptance-harness state-identity; 11.9 surface-extension-contract ledger). Track 15 (15-foundation principles 1, 2, 3, 5, 6, 7; 15.2 OmniPanel reframe; 15.3 left-sidebar activity-bar; 15.6 inline readiness; 15.10 status-bar discipline; 15.11 dispatch-genealogy primitive). Track 21 (M0' frontend deep — Tranches 21.3/21.5/21.12 deep-link INTO ide-shell widgets; SC-2 canon writes via M5 atelier). Track 26 (M5' frontend deep — Role 2 five widgets in ide-shell; 26.3 / 26.4 / 26.5 / 26.6 / 26.7 / 26.9 / 26.10 / 26.14 deep specifications). Track 27 (OmniPanel deep — consumes the ownership split from DR-WC-IS-1/2). Track 13 (decision register — DR-WC-IS-1/2/3 land here).

## Source Specs and Matrix

- Canonical UI foundation: [`15-ui-design-foundations.md`](15-ui-design-foundations.md) — nine binding principles; §"`ide-deep`" surface contract; §"Left-sidebar-system"; tranches 15.2 / 15.3 / 15.6 / 15.7 / 15.10 / 15.11
- Theia shell hosting closure: [`11-theia-shell-surface-hosting.md`](11-theia-shell-surface-hosting.md) — TS-07/08/09; tranches 11.2 / 11.4 / 11.5 / 11.6 / 11.9 / 11.10 / 11.11
- Wave-B shell evidence: [`plan.runs/wave-b-theia-shell-matrix.md`](plan.runs/wave-b-theia-shell-matrix.md)
- Stage-1 cross-links: [`21-m0-anuttara-frontend-deep.md`](21-m0-anuttara-frontend-deep.md) (M0 governance flow into ide-shell), [`26-m5-epii-frontend-deep.md`](26-m5-epii-frontend-deep.md) (Role 2 five widgets + Aletheia subagent surfacing + axiom-translation)
- Foundation contract: `Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.{md,json}` (KernelBridgeAPI capabilities; nine readiness ids; `sharedBridgeAdapter.forbiddenDirectImports`)
- Migration-source authority: `Body/M/epi-theia/extensions/MIGRATION-SOURCES.md` (smart-connections-sidebar gated on Track 03 T6.5)
- Existing widgets + bridge-gate: `Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/{bimba-graph-viewer-widget, canon-studio-widget, agentic-control-room-widget, coordinate-tree-widget, logos-atelier-widget, evidence-pane-widget, review-pane-widget, autoresearch-pane-widget, bridge-gate, frontend-module}`; common: `src/common/{contract, capability-matrix-types, decorations, graph-types, vault-bridge-gate, index}.ts`
- Full row-level matrix: [`plan.runs/wave-c-ide-shell-chrome-matrix.md`](plan.runs/wave-c-ide-shell-chrome-matrix.md)

## Cycle 2 Substrate Inheritance

Consume as-is —
- All eight widgets + `bridge-gate.tsx` + `frontend-module.ts` are landed. Audit + extend; NEVER rebuild.
- `IdeShellBridgeGate` React component, `isPrivacySafe()` gate, eight widget IDs in `IDE_SHELL_WIDGET_IDS`, four intent target ids in `IDE_SHELL_INTENT_TARGETS`, eight `AbstractViewContribution` classes, `IdeShellM0M5Config` rebindable via DI, vault-bridge command `vault-bridge.s1prime.vault.write_file`.
- `Body/M/epi-theia/extensions/m-extension-runtime/src/common/{shared-bridge, bridge-api, profile, readiness, contribution-contracts}.ts` (SharedBridgeAdapter, KernelBridgeAPI, MathemeHarmonicProfileBoundary, MExtensionReadinessSnapshot, CoordinateContext) — all read-only at this domain.
- `Body/M/epi-theia/extensions/pratibimba-layouts/src/common/layout-types.ts` (`DAILY_0_1_DESCRIPTOR` and `IDE_DEEP_DESCRIPTOR` — extend `expectedWidgets` for `autoresearch-pane` per 28.15; activity-bar mode contributions per 28.2).
- Cycle 2 Track 05 T4 (M0/M5 chrome scaffolding) substrate routings — already landed at presence; depth lands at Wave-C.

Audit/verify —
- `sharedBridgeAdapter.forbiddenDirectImports` ([`Body/S/S0`, `Body/S/S2`, `Body/S/S3`, `Body/S/S5`, `portal-core`, `neo4j-driver`, `@clockworklabs/spacetimedb-sdk`, `redis`, `epii-review-core`, `epii-agent-core`]) — Track 28 introduces NONE.
- Privacy gate (`FORBIDDEN_PRIVACY_CLASSES` / `ALLOWED_PRIVACY_CLASSES`) — Track 28 introduces NONE; per-widget `isPrivacySafe()` retained.

Extend existing —
- All eight widgets receive an audit-and-extend tranche (28.3 → 28.10).
- `bridge-gate.tsx` gains nine-id readiness taxonomy + per-binding inline rendering (28.11).
- `frontend-module.ts` registers four additional `registerIntentTarget` calls (28.14).
- New `src/browser/{activity-bar, acr, backend-studio, smart-connections, services}/*` sub-folders host the closing first-builds (activity-bar contribution 28.2, ACR T8 contents 28.5, Backend Studio 28.13, Smart-Connections stub 28.12, PrivacyDropFeed service 28.16).
- `Body/M/epi-theia/extensions/ide-shell-m0-m5/CHROME-CONTRACT.md` lands at 28.1 as the single source-of-truth for the chrome partition.

## Surface Contracts

Before tranches: what the ide-shell chrome IS after Track 28 lands. Binding contracts every tranche must honour.

**(SC-I-1) One unified chrome system, three partitions.** Eight widgets + `bridge-gate` form **one chrome system** (one extension, one inversify container, one privacy gate, one readiness primitive). The chrome partitions into **three categories**: (a) **M0' chrome** — `bimba-graph-viewer / canon-studio / coordinate-tree` (coordinate-rooted navigation + canonical read + governed-route write); (b) **M5' chrome** — `logos-atelier / evidence-pane / review-pane / autoresearch-pane / agentic-control-room` (governance + agentic dispatch + axiom-translation + scent-following atelier); (c) **shared infrastructure** — `bridge-gate` (readiness primitive consumed by all). The CHROME-CONTRACT (28.1) declares the partition; the contract validator enforces it.

**(SC-I-2) M0/M5 governance flow.** Canonical reads happen on the **left** (Coordinate Tree, Bimba Graph Viewer) and via Canon Studio Reading mode; canonical writes route through **M5 Logos Atelier governance** (DR-M0-1 + 21-m0 SC-2; `mutatesGraphCanon: false` invariant on every action). Authoring affordances on Canon Studio and Coordinate Tree NEVER mutate canon locally — they emit `CrossLayoutIntent` to Logos Atelier Möbius write-back stage (28.7). Logos Atelier crystallises via `aletheia_crystallise` → routes governed write back to Canon Studio with M5-vetted content.

**(SC-I-3) Activity-bar discipline (15-foundation principle 7).** Left-sidebar is activity-bar-switched, NOT stacked. `daily-0-1` modes: Coordinate Tree · Bimba Graph Viewer · Canon Studio. `ide-deep` modes: same three + Backend Studio + Smart Connections. The activity-bar contribution (28.2) is one and the same across both layouts; per-layout filtering against `epi-logos.layout.active` preference. Active activity-bar mode persists via SharedBridgeAdapter `currentStateSelectors` through layout toggle per 15.7. No competing widget shell.

**(SC-I-4) ide-shell vs OmniPanel ownership split (DR-WC-IS-1 + DR-WC-IS-2 RESOLVED).** Both surfaces render Evidence + Review + Dispatch-Trace data; the split is **role primary**, not data primary. (a) **ide-shell ACR = GOVERNANCE PRIMARY** — `ide-deep` only; IOD-17 capability-matrix source-of-truth; RunTree for governance audit; full `MediatedRunEvidencePacket` deep render; three-cell IOD-17 parity matrix. (b) **OmniPanel Dispatch-Trace + Evidence + Review = AGENTIC PRIMARY** — cross-layout always-on; Pi voice context; time-ordered + actor-grouped; abbreviated record list + click-through to ide-shell for full render. Same `MediatedRunEvidencePacket` data, two foldings. Click-through between surfaces via `CrossLayoutIntent` envelope (28.14).

**(SC-I-5) Bridge-gate is the readiness primitive.** Nine readiness ids from 07-t0 (`bridge_unavailable / profile_missing_field / s2_graph_blocked / s3_subscription_blocked / s5_review_blocked / authority_payload_missing / privacy_blocked / degraded_but_readable / ready_public_current`) render **inline** per-binding per 15.6 — border-colour / pending badge / blocked overlay. Wrapping pending shell stays ONLY for `bridge_unavailable`. The readiness primitive is exported from `@pratibimba/m-extension-runtime` so `IntegratedBridgeGate` (in `integrated-composition`) consumes the same source (28.11). No separate "errors" panel — provenance lives at the datum.

**(SC-I-6) SharedBridgeAdapter is the only network surface.** Every gateway call routes through `KERNEL_BRIDGE_API.invokeCapability` with `method: 'invokeGatewayRpc'` + inner `gatewayMethod` (`s2.graph.node`, `s2'.coordinate.resolve`, `s5'.review.inbox`, `s5'.improve.history`, `aletheia_gnosis_query`, `aletheia_crystallise`, `vault-bridge.s1prime.vault.write_file`, etc.). NO direct S0/S2/S3/S5 imports anywhere in `Body/M/epi-theia/extensions/ide-shell-m0-m5/src/`. The forbidden-direct-import lint (11.5) enforces.

**(SC-I-7) Privacy class flows through every render.** `isPrivacySafe()` gate is non-bypassable. Per-widget `privacyDropped` count rendered; aggregated via `PrivacyDropFeed` (28.16) for OmniPanel Diagnostics. No new privacy class introduced.

**(SC-I-8) Coordinate-rooted, profile-tick-clocked (15-foundation principles 1 + 2).** Every widget subscribes to `SharedBridgeAdapter.onCoordinateContext` (active coordinate is global state); every widget body re-renders on `bridge.onProfile` advance via `useProfileTick()` hook (28.17). Status-bar shared fields (profile-tick state / day-now / session id / gateway readiness / profile generation / active coordinate) MUST be consumed FROM SharedBridgeAdapter projection, NEVER owned by widget state (28.18; 15.10 owns the status-bar build).

**(SC-I-9) Cross-layout intent envelope universal.** All eight widgets have a registered intent target (28.14); each handler consumes `CrossLayoutIntent` payload (`coordinate / artifactUri / reviewId / dayNow / sessionKey / profileGeneration / privacyClass / requestedExtensionId / requestedContributionId`) per `omnipanel-types.ts`. Click-through between widgets (e.g. RunTree node → Backend Studio openSource; Evidence record → ide-shell ACR vs OmniPanel-Dispatch-Trace; Coordinate Tree node → Bimba Graph Viewer focus + Canon Studio open) uses this single envelope.

**(SC-I-10) Anti-greenfield posture.** No widget gets re-built. The eight widget files + `bridge-gate.tsx` + `frontend-module.ts` are the substrate. First-build is allowed ONLY for: (a) activity-bar contribution (28.2 — no current owner of the named M' product surface); (b) Backend Studio LSP slot (28.13 — no current owner; 15-foundation row names it); (c) Smart-Connections stub (28.12 — gated forward extension per MIGRATION-SOURCES.md); (d) PrivacyDropFeed DI service (28.16 — polish only); (e) CHROME-CONTRACT.md (28.1 — doc-ahead-landing).

## Tranches

1. **28.1 — Chrome contract doc-ahead-landing + M0/M5 ownership partition** *(doc-ahead-landing; resolves SC-I-1 + SC-I-2 + SC-I-4)*

   New file `Body/M/epi-theia/extensions/ide-shell-m0-m5/CHROME-CONTRACT.md` declaring the eight widgets + `bridge-gate` as one unified chrome system. Section structure:
   - **§1 Three Partitions** — (a) M0' chrome (`bimba-graph-viewer / canon-studio / coordinate-tree`); (b) M5' chrome (`logos-atelier / evidence-pane / review-pane / autoresearch-pane / agentic-control-room`); (c) shared infrastructure (`bridge-gate`).
   - **§2 Per-Widget Slot Assignment** — Coordinate Tree → activity-bar left (slot: `coordinate-tree`); Bimba Graph Viewer → activity-bar left (`bimba-graph-viewer`); Canon Studio → activity-bar left + main editor (`canon-studio`); Logos Atelier → main editor (`logos-atelier`); ACR → main editor (`agentic-control-room`); Evidence pane → right sidebar (`evidence-pane`); Review pane → right sidebar (`review-pane`); Autoresearch pane → right sidebar (`autoresearch-pane`); Backend Studio → activity-bar left, `ide-deep` only; Smart Connections → activity-bar left, `ide-deep` only.
   - **§3 SharedBridgeAdapter as Only Network** — per-widget gateway method table; nine forbidden direct imports.
   - **§4 M0/M5 Governance Flow** — read on left; write through M5 atelier; `mutatesGraphCanon: false` invariant; Möbius write-back grammar.
   - **§5 ide-shell vs OmniPanel Split** — DR-WC-IS-1 RESOLVED (governance vs agentic primary); DR-WC-IS-2 RESOLVED (full deep render vs abbreviated + click-through).
   - **§6 Bridge-gate Readiness Primitive** — nine-id taxonomy from 07-t0; per-binding inline rendering per 15.6.
   - **§7 Privacy & Profile-Tick** — `isPrivacySafe()` gate; `useProfileTick()` hook; status-bar shared fields rule.
   - **§8 DR Cross-Reference** — DR-M0-1, DR-M5-1, DR-MP-1/2/3, DR-WC-IS-1/2/3, DR-IG-1, DR-TS-1.
   - **§9 First-Build Allowances** — activity-bar contribution, Backend Studio, Smart-Connections stub, PrivacyDropFeed, CHROME-CONTRACT.md.

   Extend `Body/M/epi-theia/extensions/scripts/validate-extension-contract-preflight.mjs` to assert every ide-shell widget id has a CHROME-CONTRACT category (M0' / M5' / shared). 21-m0 + 26-m5 tranches that touch ide-shell widgets reference this contract by section number.

   Verification: `test -f Body/M/epi-theia/extensions/ide-shell-m0-m5/CHROME-CONTRACT.md`; `grep -n "M0' chrome\|M5' chrome\|shared infrastructure\|activity-bar slot\|Möbius write-back\|GOVERNANCE PRIMARY\|AGENTIC PRIMARY" .../CHROME-CONTRACT.md`; `node Body/M/epi-theia/extensions/scripts/validate-extension-contract-preflight.mjs` extended-assertion; `node --test Body/M/epi-theia/extensions/test/validate-extension-contract-preflight.test.mjs` asserts every ide-shell widget id has a CHROME-CONTRACT category.

2. **28.2 — Left-sidebar activity-bar system contribution** *(spec-ahead-integration; consumes 15.3 + 15.7; cross-link 11.4 / 28.12 / 28.13)*

   New file `Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/activity-bar/left-sidebar-activity-bar-contribution.ts` registering Theia activity-bar modes via `MenuContribution` + `CommandContribution` + `ViewContainer` slot. Type signature:

   ```ts
   export interface LeftSidebarMode {
       readonly id: 'coordinate-tree'|'bimba-graph-viewer'|'canon-studio'|'backend-studio'|'smart-connections';
       readonly label: string;
       readonly iconClass: string;                              // codicon class
       readonly widgetId: string;                                // ide-shell widget id
       readonly availableInLayouts: readonly ('daily-0-1'|'ide-deep')[];
       readonly codePendingMarker?: 'track-03-t6.5'|'first-build';
   }

   export const LEFT_SIDEBAR_MODES: readonly LeftSidebarMode[] = [
       { id: 'coordinate-tree',    label: 'Coordinate Tree',    iconClass: 'codicon-list-tree',    widgetId: IDE_SHELL_WIDGET_IDS.COORDINATE_TREE,     availableInLayouts: ['daily-0-1','ide-deep'] },
       { id: 'bimba-graph-viewer', label: 'Bimba Graph Viewer', iconClass: 'codicon-graph',        widgetId: IDE_SHELL_WIDGET_IDS.BIMBA_GRAPH_VIEWER,  availableInLayouts: ['daily-0-1','ide-deep'] },
       { id: 'canon-studio',       label: 'Canon Studio',       iconClass: 'codicon-book',         widgetId: IDE_SHELL_WIDGET_IDS.CANON_STUDIO,        availableInLayouts: ['daily-0-1','ide-deep'] },
       { id: 'backend-studio',     label: 'Backend Studio',     iconClass: 'codicon-terminal',     widgetId: 'pratibimba.ide-shell.backend-studio',   availableInLayouts: ['ide-deep'], codePendingMarker: 'first-build' },
       { id: 'smart-connections',  label: 'Smart Connections',  iconClass: 'codicon-link',         widgetId: 'pratibimba.smart-connections-sidebar',  availableInLayouts: ['ide-deep'], codePendingMarker: 'track-03-t6.5' }
   ];
   ```

   The contribution filters `LEFT_SIDEBAR_MODES` against `epi-logos.layout.active` preference at activation; mode-switching writes back via SharedBridgeAdapter `currentStateSelectors.activeActivityBarMode` so the mode survives `daily-0-1 ↔ ide-deep` toggle per 15.7 BimbaPratibimbaUiState. Mode-switching command id pattern `pratibimba.ide-shell.activity-bar.set-mode.{mode-id}`. Move `defaultWidgetOptions.area` of `bimba-graph-viewer-widget` + `canon-studio-widget` to `'left'` when active layout = `daily-0-1`; retain `'main'` when active layout = `ide-deep` (so Canon Studio + Bimba Graph Viewer can be opened in the main editor for `ide-deep` deep work). Cross-link 28.12 (smart-connections stub) + 28.13 (Backend Studio).

   Verification: `test -f Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/activity-bar/left-sidebar-activity-bar-contribution.ts`; `pnpm --filter @pratibimba/ide-shell-m0-m5 test`; mode-registration test asserts exactly three modes for `daily-0-1` + five modes for `ide-deep`; per-layout filter test (Backend Studio + Smart Connections hidden in `daily-0-1`); cross-layout state-identity preserves active mode (cross-link 11.6 + 28.19); `grep -n "LEFT_SIDEBAR_MODES\|epi-logos.layout.active\|activeActivityBarMode" Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/`.

3. **28.3 — Bimba Graph Viewer: two-rendering audit + neighbor graph + relation-family filter** *(audit-extend; consumes 15-foundation §"Left-sidebar-system" + DR-IG-1)*

   Audit `Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/bimba-graph-viewer-widget.tsx`. Five deliverables; widget shell + privacy gate + `openCoordinate(coordinate)` subgraph fetch retained as-is.

   (a) `RenderingMode = 'solar-anchor' | 'full-lattice'` switched by `epi-logos.layout.active` preference. **Solar-anchor** (`daily-0-1`) = compact card showing active coordinate label + immediate Bimba-side neighbors only (≤6 neighbors); rendered as a small SVG "sun + planets" diagram (active coord at center; neighbors radiating). **Full-lattice** (`ide-deep`) = full SVG / ForceGraph rendering of `BimbaSubgraphPayload.neighbors[]` with node-click handler.

   (b) New sub-component at `Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/bimba-graph-viewer/graph-canvas.tsx`:

   ```tsx
   export interface GraphCanvasProps {
       readonly subgraph: BimbaSubgraphPayload;
       readonly renderingMode: 'solar-anchor'|'full-lattice';
       readonly activeCoordinate: string|null;
       readonly relationFamilyFilter: 'all'|'structural'|'correspondential';
       readonly onNodeClick: (coordinate: string) => void;
       readonly onEdgeHover: (edge: BimbaEdge) => void;
   }
   export const GraphCanvas: React.FC<GraphCanvasProps>;
   ```

   Rendering: SVG-based (no external `react-force-graph` dep at this tranche; if Theia ships `vis-network` use it, else SVG circles + lines). Force-layout via simple eigenvalue placement; nodes coloured by C-family letter (P/S/T/M/L/C six canonical colours + Empty/Pratibimba two namespace colours per 28.6 colour map); edges coloured by `c_1_relation_family` (`structural` = solid line; `correspondential` = dashed line per DR-IG-1 / TS-16 / 21-m0 21.4).

   (c) Edge filter dropdown `<RelationFamilyFilter>` with three options (`all` / `structural` / `correspondential`) per DR-IG-1 + 21-m0 21.4. Bound to `relationFamilyFilter` state.

   (d) Node click handler `onNodeClick(coordinate)` calls `this.bridge.publishCoordinateContext({ selectedCoordinate: coordinate, source: 'bimba-graph-viewer' })` via SharedBridgeAdapter — consumed by Coordinate Tree (highlight, 28.6), Canon Studio (open canonical source for the coordinate via `vault-bridge.s1prime.vault.read_file`, 28.4), per-Mn widgets per 21-m0 SC-5.

   (e) `bridge-gate` per-binding readiness per 28.11 — the `s2.graph.node` binding renders inline border-colour (green/amber/red); pending badge "s2_graph_blocked"; blocked overlay if `bridge_unavailable`.

   Privacy gate + `privacyDropped` counter retained; per-widget count published to `PrivacyDropFeed` (28.16).

   Verification: `test -f Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/bimba-graph-viewer/graph-canvas.tsx`; `grep -n "RenderingMode\|solar-anchor\|full-lattice\|GraphCanvas\|RelationFamilyFilter\|c_1_relation_family\|publishCoordinateContext" Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/`; rendering-mode test asserts solar-anchor in `daily-0-1`, full-lattice in `ide-deep`; edge-filter test partitions neighbors by family (DR-IG-1 fixture); node-click test publishes coordinate context via SharedBridgeAdapter mock + Coordinate Tree subscriber receives + highlights; `pnpm --filter @pratibimba/ide-shell-m0-m5 build && test`.

4. **28.4 — Canon Studio: Monaco upgrade + QL/bimba decoration + Smart Connections autocomplete + PASU.md edit flow** *(audit-extend + spec-ahead-integration; consumes 11.4 + 15-foundation §"Left-sidebar-system" + 25-m4 PASU.md + DR-WC-IS-3 RESOLVED)*

   Audit `Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/canon-studio-widget.tsx`. Per DR-WC-IS-3 RESOLVED (Monaco): replace `<textarea>` with Theia's `MonacoEditor` mounted in `ReactWidget`. Five deliverables.

   (a) Monaco mount — `Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/canon-studio/monaco-mount.tsx` instantiates `MonacoEditor` via Theia's `MonacoEditorProvider` + `MonacoEditorModel`; model URI = `this.uri`; model content = `this.content`; `onDidChangeContent` triggers `this.setContent(model.getValue())`. The `<textarea>` and separate decoration list are removed.

   (b) Inline QL/bimba decoration — reuse `decorateCoordinates(this.content)` (existing scanner). Convert each `Decoration { kind, match, range }` to `editor.IModelDeltaDecoration` with `options.inlineClassName: 'ql-coordinate' | 'bimba-wikilink' | 'frontmatter-key'`; CSS styles per decoration kind shipped via new stylesheet `Body/M/epi-theia/extensions/ide-shell-m0-m5/style/canon-studio-decorations.css` (coordinate = soft amber background `#d4a574`; wikilink = blue underline; frontmatter key = subtle bold).

   (c) Smart Connections autocomplete — register Monaco `CompletionItemProvider` for `markdown` language:

   ```ts
   monaco.languages.registerCompletionItemProvider('markdown', {
       triggerCharacters: ['[', '#', 'M', 'S', 'T', 'L', 'C', 'P'],
       provideCompletionItems: async (model, position) => {
           const linePrefix = model.getLineContent(position.lineNumber).substr(0, position.column - 1);
           const wikilinkMatch = /\[\[([^\]]*)$/.exec(linePrefix);
           const coordMatch = /([#SMTLCP][0-9-]*)$/.exec(linePrefix);
           if (!wikilinkMatch && !coordMatch) return { suggestions: [] };
           const query = wikilinkMatch?.[1] ?? coordMatch?.[1] ?? '';
           const receipt = await this.bridge.invokeCapability({
               method: 'invokeGatewayRpc',
               sessionKey: 'canon-studio-autocomplete',
               params: { gatewayMethod: "s1'.semantic.suggest", query, limit: 20 },
               profileGeneration: this.bridge.cachedProfile?.generation ?? null,
               provenanceHandles: [], vak: null
           });
           if (!isPrivacySafe(receipt.privacyClass)) return { suggestions: [] };
           const candidates = (receipt.artifact as { suggestions?: SemanticSuggestion[] })?.suggestions ?? [];
           return { suggestions: candidates.map(c => ({
               label: c.label, kind: monaco.languages.CompletionItemKind.Reference,
               documentation: c.summary, insertText: c.coordinate ?? c.label,
               range: /* compute from match */
           })) };
       }
   });
   ```

   Falls back to "Smart Connections gated on Track 03 T6.5" placeholder when smart-connections-sidebar stub (28.12) still active — the `s1'.semantic.suggest` gateway method returns 503 with reason `pending-extension` until vault-bridge + smart-connections-sidebar both land.

   (d) Frontmatter linter + PASU.md edit flow — the C-family typology authority (per DR-S1-5) ships in `@pratibimba/m-extension-runtime` as `C_FAMILY_SCHEMA` (lands per S1' work; consume read-only here). Lint frontmatter keys against the schema; surface diagnostics via Monaco `MarkerService`. When `this.uri` matches `Idea/Pratibimba/Self/PASU.md`, render special PASU keys (`c_0_birth_date`, `c_0_birth_location`, `c_0_natal_chart_path`, `c_2_jungian`, `c_3_gene_keys`, `c_4_human_design`, `c_5_quintessence_hash`, `c_5_quintessence_clock`, `c_4_last_wound` per 25-m4 PASU.md) with typed inline editors above the markdown body (date picker, location picker, etc.). Cross-link 25-m4 PASU.md frontmatter contract; PASU edit flow surfaces "Open in Logos Atelier for governed write" per 21-m0 SC-2.

   (e) Vault-bridge save retained as-is (rejection until T4.5 lands with canonical message `"no vault-bridge registered"`). Authoring-mode UI surfaces "Open in Logos Atelier" deep-link button next to Save — emits `CrossLayoutIntent { requestedExtensionId: 'ide-shell-m0-m5', requestedContributionId: 'logos-atelier', artifactUri: this.uri }` per DR-M0-1 governance flow. `mutatesGraphCanon: false` invariant retained.

   Verification: `test -f Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/canon-studio/monaco-mount.tsx`; `test -f Body/M/epi-theia/extensions/ide-shell-m0-m5/style/canon-studio-decorations.css`; `grep -n "MonacoEditor\|CompletionItemProvider\|IModelDeltaDecoration\|s1'.semantic.suggest\|PASU\|c_0_birth_date\|Open in Logos Atelier" Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/canon-studio-widget.tsx`; Monaco-mount test renders model + responds to `onDidChangeContent`; QL-coordinate inline decoration test asserts `ql-coordinate` class spans applied; `s1'.semantic.suggest` autocomplete test with mocked SharedBridgeAdapter + privacy-class reject; PASU.md edit flow opens typed editors for the seven PASU keys; vault-bridge gate rejects with canonical message until T4.5; Authoring "Open in Logos Atelier" emits `CrossLayoutIntent`; `pnpm --filter @pratibimba/ide-shell-m0-m5 build && test`.

5. **28.5 — Agentic Control Room: T8 contents + DR-M5-1 roster collapse + Pi-monitor reframe + Aletheia subagent trace** *(audit-extend; consumes 26.7 + 26.9 + DR-WC-IS-1 RESOLVED + 26.8 psyche-facet decision)*

   Audit `Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/agentic-control-room-widget.tsx`. Mirror 26.7 from M5 frontend deep. Five deliverables.

   (a) **T8 contents** — replace empty `t8-host` section with sub-components in new sub-folder `Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/acr/`:
   - `run-tree.tsx` — `<RunTree dispatchTrace={DispatchTraceNode} onNodeClick={(node) => ...}>` Pi→Anima→subagent tree per 26.10 `DispatchTraceNode` schema; node click → backend-studio openSource(coord, sourceAnchor) (28.13) + Evidence pane cross-link via `mediatedRunEvidencePacketId`.
   - `tool-stream.tsx` — `<ToolStream tools={ToolInvocationRef[]}>` time-ordered tool-call list per 15.11 dispatch-genealogy primitive; per-tool inputDigest / outputDigest / errorMessage.
   - `abort-retry-continue-controls.tsx` — `<AbortRetryContinueControls run={Run} disabled={humanRequired}>` gated on `humanRequired===false`; abort/retry/continue commands wrapped via `s5'.epii.runtime_control`.
   - `evidence-deposit-form.tsx` — `<EvidenceDepositForm>` wraps `s5'.epii.deposit`; emits `MediatedRunEvidencePacket` per 26.10.
   - `review-decision-controls.tsx` — `<ReviewDecisionControls reviewId={string} iod17Parity={ReviewItemDeep['iod17Parity']}>` wraps `s5'.review.transition`; disabled when `humanRequired===true` with IOD-17 parity check (per 26.5).

   (b) **DR-M5-1 roster collapse** per 26.7 (b) — `parseCapabilityMatrix` consumer renders Pi (single harness) + Anima (main dispatcher) + six Aletheia subagents (Anansi/Janus/Moirai/Mercurius/Agora/Zeithoven) as crystallisation-mode sub-items NOT peer agents; legacy `constitutional_agents=[anima, eros, logos, mythos, nous, psyche, sophia]` renders as psyche-facet badges per 26.8 (Sophia surfaces only as facet, never actor row). Feature flag `dr_m5_1_roster_collapse: true` until 26.8 ratification.

   (c) **Pi-monitor reframe** — `<PiRuntimeMonitorBanner />` at top: "Pi runtime monitoring — dispatch traces, tool streams, capacity-workflow runs. Single agent harness; Anima dispatches; Aletheia subagents surface in crystallisation-mode." Widget label reframes "Agentic Control Room" → "Pi Runtime Monitor (ACR)" per 26.7 (c); widget id `pratibimba.ide-shell.agentic-control-room` preserved.

   (d) **DR-WC-IS-1 RESOLVED**: ACR is GOVERNANCE PRIMARY — IOD-17 capability-matrix source-of-truth (already wired); RunTree for governance audit; full `MediatedRunEvidencePacket` deep render via `<EvidenceDepositForm>`; three-cell IOD-17 parity matrix (per 28.9 Review-pane pattern). OmniPanel Dispatch Trace (27-omnipanel-shell) is AGENTIC PRIMARY — abbreviated time-ordered render. RunTree node click-through to Backend Studio (28.13) `backend-studio.openSource(source-anchor)`; click-through to Evidence pane (28.8) on `mediatedRunEvidencePacketId`.

   (e) **Aletheia subagent trace** per 26.9 — new file `Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/acr/aletheia-subagent-trace.tsx`:

   ```tsx
   export interface AletheiaSubagentTraceProps {
       readonly subagent: 'anansi'|'janus'|'moirai'|'mercurius'|'agora'|'zeithoven';
       readonly subtrace: DispatchTraceNode;
       readonly vetoRecord?: { reason: string; raisedAt: number };
   }
   export const AletheiaSubagentTrace: React.FC<AletheiaSubagentTraceProps>;
   ```

   Per-subagent rendering: Anansi (citation trail graph); Janus (prospective-retrospective binary per 12.18); Moirai (tarot cast-anchor); Mercurius (kairos Kerykeion ephemeris); Agora (deliberation log); Zeithoven (temporal-rhythm tick alignment). Veto banner red + non-blocking on human gate per 12.19.

   Verification: `test -d Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/acr`; `grep -n "RunTree\|ToolStream\|AbortRetryContinueControls\|EvidenceDepositForm\|ReviewDecisionControls\|PiRuntimeMonitorBanner\|AletheiaSubagentTrace\|dr_m5_1_roster_collapse" Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/`; T8 contents render in former t8-host; roster-collapse test (Pi + Anima + 6 Aletheia subagents; Sophia facet-only); human-required disables abort/retry + review decision; IOD-17 parity violation surfaces red; click-through to Backend Studio + Evidence pane works; Aletheia veto banner red + non-blocking.

6. **28.6 — Coordinate Tree: family colouring + active-coordinate highlight + CRUD-vs-governed-route toggle + per-family expand/collapse** *(audit-extend; consumes 15-foundation principle 1 + TS-18 + DR-M0-1 + 21-m0 21.3 / SC-5)*

   Audit `Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/coordinate-tree-widget.tsx`. Five deliverables; widget shell + `loadTree(rootCoordinate)` retained.

   (a) **Per-family colouring** — extend `renderTree(node, depth)` to extract C-family-letter from `node.coordinate` first character (`P / S / T / M / L / C`); apply CSS class `coordinate-family-{letter}` to the `<li>`. Two namespace prefix classes for `Empty/` / `Pratibimba/` paths (`coordinate-namespace-empty` / `coordinate-namespace-pratibimba`) per repo-ontology. Six C-family colours + two namespace colours shipped via new stylesheet `Body/M/epi-theia/extensions/ide-shell-m0-m5/style/coordinate-tree.css`. Colour palette per repo-ontology / CHROME-CONTRACT §2.

   (b) **Active-coordinate highlight** — widget subscribes to `SharedBridgeAdapter.onCoordinateContext` on mount via new `protected activeCoordinate: string|null = null;` field + `disposers[]` cleanup; the matching `<li>` gets `class="active-coordinate"`. On user click of a node, widget publishes via `SharedBridgeAdapter.publishCoordinateContext({ selectedCoordinate: coordinate, source: 'coordinate-tree' })` per 15-foundation principle 1 + 21-m0 SC-5; all other widgets refocus.

   (c) **CRUD-vs-governed-route mode toggle** — new state `protected surfaceMode: 'reading'|'authoring' = 'reading';`. Reading mode = current read-only tree. Authoring mode = surfaces "Propose canonical edit" button on hover per `<li>`; clicking the button emits `CrossLayoutIntent { requestedExtensionId: 'ide-shell-m0-m5', requestedContributionId: 'canon-studio', coordinate: node.coordinate, artifactUri: <derived-from-pointer-anchor> }` per DR-M0-1 + 21-m0 SC-2; NEVER mutates locally; `mutatesGraphCanon: false` retained. Toggle widget in widget header (read vs authoring toggle button).

   (d) **Per-family expand/collapse** — `<li>` gains expand-arrow `data-expanded={true|false}`; expand-state stored in `expanded: Set<string>` keyed by coordinate; clicking arrow toggles; expand-state survives layout toggle (cross-link 28.19 acceptance harness). Per-family bulk-expand commands (`pratibimba.coordinate-tree.expand-family.{P|S|T|M|L|C}`) registered in `frontend-module.ts`.

   (e) **Privacy-class colouring per node** — `BimbaSubgraphPayload`-style privacy fetch via `s2'.coordinate.resolve` returns privacy class per node; apply `coordinate-privacy-{class}` CSS class; forbidden-privacy nodes render as gray-out with privacy-blocked overlay (per 28.11 nine-id readiness `privacy_blocked`).

   Verification: `grep -n "coordinate-family-\|coordinate-namespace-\|active-coordinate\|surfaceMode\|reading\|authoring\|publishCoordinateContext\|CrossLayoutIntent\|expanded" Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/coordinate-tree-widget.tsx`; family-colouring test (six C-family + two namespace + privacy classes); active-coordinate highlight test (subscribes + publishes via SharedBridgeAdapter mock); CRUD-vs-governed-route mode test asserts Authoring routes to Canon Studio via `CrossLayoutIntent`, NEVER mutates; expand/collapse test asserts state preserved across layout toggle; privacy-class colouring test; `pnpm --filter @pratibimba/ide-shell-m0-m5 build && test`.

7. **28.7 — Logos Atelier: scent-following retrofit + Aletheia tools + Möbius write-back to Canon Studio** *(audit-extend; consumes 26.3 + 21-m0 SC-2 + 12.19 + 26.9 + 26.14)*

   Audit `Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/logos-atelier-widget.tsx`. Mirror 26.3 from M5 frontend deep. Five deliverables; widget shell + privacy gate + `currentTerm` + `provenanceHandles[]` machinery retained.

   (a) Replace `ATELIER_STAGES` (six generic L0-L5) with `SCENT_FOLLOWING_STAGES` per 26.3:

   ```ts
   const SCENT_FOLLOWING_STAGES = [
       { id: 'root',              label: 'Root',                  purpose: 'Etymology root of term' },
       { id: 'cognate',           label: 'Cognate',               purpose: 'Cross-language cognates' },
       { id: 'drift',             label: 'Semantic Drift',        purpose: 'Historical sense drift' },
       { id: 'psychoid',          label: 'Psychoid Charge',       purpose: 'Archetypal-affective charge per Atelier' },
       { id: 'pros-hen',          label: 'Pros-hen Synthesis',    purpose: 'Toward-the-One; Klein-V4 square pull' },
       { id: 'mobius-write-back', label: 'Möbius Write-Back',     purpose: 'Candidate articulation flowing to M0/M5-1' }
   ] as const;
   ```

   `stages: Record<string, AtelierStageState>` re-keyed; existing `setStageNotes` / `attachProvenance` API preserved.

   (b) Wire Aletheia crystallisation tools via `KERNEL_BRIDGE_API.invokeCapability`:
   - `aletheia_gnosis_query` (root + cognate stages) — `gatewayMethod: 'aletheia_gnosis_query'`; result populates stage's `provenanceHandles` with `etymology://` URIs.
   - `aletheia_thought_route` (drift + psychoid stages) — `gatewayMethod: 'aletheia_thought_route'`.
   - `aletheia_crystallise` (Möbius write-back stage) — `gatewayMethod: 'aletheia_crystallise'`; result is a candidate canonical articulation.

   Until `s5'.gnostic.*` lands at 6.1: `<ReadinessBanner snapshot={{ state: 'pending-gateway', blockers: ["s5'.gnostic.query unregistered"] }} />` with invoke buttons disabled.

   (c) Etymology namespace integrity — all provenance handles use `etymology://` URI scheme per UX §5.3. Reject handles with other URI schemes via privacy gate extension.

   (d) **Möbius write-back governance flow** per 21-m0 SC-2 + DR-M0-1 — Möbius write-back stage renders "Crystallise + Send to Canon Studio" button that:
   1. Calls `aletheia_crystallise` with current term + accumulated stage notes + provenance handles
   2. Receives candidate canonical articulation
   3. Emits `CrossLayoutIntent { requestedExtensionId: 'ide-shell-m0-m5', requestedContributionId: 'canon-studio', artifactUri: <generated>, content: <crystallised-articulation> }` per 21-m0 SC-2 governance
   4. Canon Studio (28.4) opens with the crystallised content; user reviews; routes through vault-bridge.

   `mutatesGraphCanon: false` invariant — Logos Atelier never mutates canon; it crystallises a candidate and routes via Canon Studio + vault-bridge.

   (e) **Aletheia subagent surfacing + veto** per 26.9 + 12.19 — Möbius write-back stage renders subagent-veto banners + lineage badges in provenance-handle list (Anansi citation trail, Janus prospective-retrospective, Moirai cast, Mercurius kairos, Agora deliberation, Zeithoven temporal-rhythm). Any Aletheia subagent veto: red banner "Aletheia subagent {name} veto — {reason}"; non-blocking on human gate per 12.19. Cross-link 26.14 PiAxiomTranslationInspector — Möbius write-back stage cross-links to it (axiom-translation lives in ACR 28.5).

   Verification: `grep -n "SCENT_FOLLOWING_STAGES\|aletheia_gnosis_query\|aletheia_thought_route\|aletheia_crystallise\|mobius-write-back\|etymology://\|CrossLayoutIntent\|veto" Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/logos-atelier-widget.tsx`; stage-progression test asserts six new stages, no legacy L0-L5 ids; Möbius-write-back invokes `aletheia_crystallise` then emits `CrossLayoutIntent` to Canon Studio (mock SharedBridgeAdapter); `etymology://` URI scheme enforcement; subagent veto banner red + non-blocking on human gate; privacy gate preserved; `pnpm --filter @pratibimba/ide-shell-m0-m5 build && test`.

8. **28.8 — Evidence pane: `MediatedRunEvidencePacket` + dispatch-trace mini-graph + DR-WC-IS-2 deep-vs-abbreviated split** *(audit-extend; consumes 26.4 + 26.10 + 15.2 + 15.11)*

   Audit `Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/evidence-pane-widget.tsx`. Mirror 26.4 from M5 frontend deep. Six deliverables; widget shell + privacy gate retained.

   (a) Replace `EvidenceRecord` (generic shape) with `MediatedRunEvidencePacket` import from `@pratibimba/integrated-composition` (lands at 26.10). Update `addRecord` / `setRecords` / `records: MediatedRunEvidencePacket[]` accordingly.

   (b) **Mediator badge** (top-right per record): renders `record.mediatedBy.kind` — `Pi` (purple) / `Anima` (gold) / `Aletheia · {subagent}` (per-subagent colour per 26.9).

   (c) **Inline dispatch-trace mini-graph** (collapsible) per 15.11 dispatch-genealogy primitive — renders `record.dispatchTrace: DispatchTraceNode` as nested tree; collapsed by default; expand on click. Each tree node carries actor + methodOrSkill + tickAtInvoke + psycheFacet badge per 26.8.

   (d) **Tool-stream link** — `<a data-cross-link="omnipanel.tool-stream" data-evidence-id={record.id}>View tool stream in OmniPanel →</a>` emits `CrossLayoutIntent { requestedExtensionId: 'omnipanel-shell', requestedContributionId: 'tool-stream', requestedReviewId: record.id }`.

   (e) **Axiom-translation link** — when `record.axiomTranslationSteps.length > 0`, renders "View axiom translation →" button that emits `CrossLayoutIntent { requestedExtensionId: 'ide-shell-m0-m5', requestedContributionId: 'agentic-control-room', requestedContributionId: 'axiom-translation-inspector', sessionKey: record.sessionKey }` → opens `PiAxiomTranslationInspector` inside ACR per 26.14. Cross-link 28.5.

   (f) **Contemplation-object link** — when `record.contemplationObjectRef` present (per 19.7), renders "Contemplation: open viewer →" button → emits `CrossLayoutIntent { requestedExtensionId: 'm5-epii', requestedContributionId: 'contemplation-object-viewer', requestedContributionId: record.contemplationObjectRef }` → opens `ContemplationObjectViewer` per 26.12.

   **DR-WC-IS-2 RESOLVED**: ide-shell evidence-pane = FULL `MediatedRunEvidencePacket` deep render (`ide-deep` only; governance audit context). OmniPanel-Evidence-tab (27-omnipanel-shell) = abbreviated record list + click-through to ide-shell-evidence-pane for the full render. Cross-layout intent envelope (28.14) carries `evidenceRecordId` so click-through highlights the record in either surface (bidirectional). Per 15.2 NO modal surfaces — both panes are landing surfaces.

   Verification: `grep -n "MediatedRunEvidencePacket\|dispatchTrace\|toolStream\|axiomTranslationSteps\|contemplationObjectRef\|mediatedBy" Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/evidence-pane-widget.tsx`; mediator-badge + mini-graph + tool-stream cross-link + axiom-translation link + contemplation-object link render-tests; cross-layout dispatch test (OmniPanel click → ide-shell highlights same record + vice-versa); privacy-class gate preserved; `pnpm --filter @pratibimba/ide-shell-m0-m5 build && test`.

9. **28.9 — Review pane: IOD-17 three-way parity matrix + dispatch-genealogy click-through + DR-WC-IS-2 deep-vs-abbreviated split** *(audit-extend; consumes 26.5 + 15.2 + 15.11)*

   Audit `Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/review-pane-widget.tsx`. Mirror 26.5 from M5 frontend deep. Five deliverables; widget shell + `refreshInbox()` + human-required banner retained.

   (a) Extend `ReviewItem` to `ReviewItemDeep` per 26.5:

   ```ts
   interface ReviewItemDeep extends ReviewItem {
       readonly iod17Parity: {
           readonly capabilityMatrixState: 'human-required'|'agent-allowed'|'unset';
           readonly agentContractState:    'human-required'|'agent-allowed'|'unset';
           readonly widgetState:           'human-required'|'agent-allowed'|'unset';
           readonly inParity: boolean;
       };
       readonly dispatchGenealogyRef: string;
       readonly mediatedRunEvidencePacketId?: string;
   }
   ```

   (b) **IOD-17 three-way parity readout** — three-cell matrix (capability-matrix / agent-contract / widget); green checkmark per cell when `state === 'human-required'` matches expectation, red X otherwise; aggregate parity indicator `inParity` as bottom-line green/red. Red banner "IOD-17 parity violated — gateway will reject any transition" when `inParity === false`.

   (c) **Dispatch-genealogy click-through** — per item, renders "View dispatch tree →" button → emits `CrossLayoutIntent { requestedExtensionId: 'ide-shell-m0-m5', requestedContributionId: 'agentic-control-room', requestedSessionKey: item.dispatchGenealogyRef }` → opens ACR with `RunTree` highlighted on the matching dispatch.

   (d) **Evidence-packet click-through** — when `item.mediatedRunEvidencePacketId` present, renders "View evidence →" button → emits `CrossLayoutIntent { requestedExtensionId: 'ide-shell-m0-m5', requestedContributionId: 'evidence-panel', requestedEvidenceRecordId: item.mediatedRunEvidencePacketId }` → opens Evidence pane (28.8) highlighted on the matching record.

   (e) Existing human-required banner extended with parity status line. Per 15.2: pane stays as landing surface; no modal pop-ups.

   **DR-WC-IS-2 RESOLVED**: ide-shell review-pane = FULL parity readout + governance audit (`ide-deep` only). OmniPanel-Review-tab (27-omnipanel-shell) = inbox + click-through to ide-shell review-pane for the full parity readout. Same data, two foldings.

   Verification: `grep -n "ReviewItemDeep\|iod17Parity\|capabilityMatrixState\|agentContractState\|widgetState\|inParity\|dispatchGenealogyRef\|mediatedRunEvidencePacketId" Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/review-pane-widget.tsx`; parity-violation red banner test; parity-OK green-check test; click-through opens ACR + Evidence with pre-populated refs; human-required banner blocks agent transitions; no modal surface; `pnpm --filter @pratibimba/ide-shell-m0-m5 build && test`.

10. **28.10 — Autoresearch pane: autoresearch-as-concept frame + Möbius-pass ribbon + per-capacity filter + dry-run + requires_human disclosure** *(audit-extend; consumes 26.6 + 26.2)*

    Audit `Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/autoresearch-pane-widget.tsx`. Mirror 26.6 from M5 frontend deep. Five deliverables; widget shell + privacy gate + `refreshHistory()` retained.

    (a) **Autoresearch-as-concept header** — renders a permanent header banner explaining the autoresearch contract: "Autoresearch is dry-run only; `requires_human` non-bypassable; `forbidden_authority` enforces no direct canon mutation. Candidates surface as proposals that route through M5 atelier governance for human ratification per DR-M0-1." Cross-link to CHROME-CONTRACT.md §4 governance flow + 21-m0 SC-2.

    (b) **Möbius-pass ribbon** — `<MobiusPassRibbon />` reading `s5'.improve.status` → `recompose.rs` pass-state via `KERNEL_BRIDGE_API.invokeCapability`. Horizontal ribbon `Surface → Route → Orchestrate → Integrate` with active stage highlighted; recompose-pass count badge; dry-run badge if `dry_run === true`. Subscribes to profile-tick per 28.17.

    (c) **Per-capacity filter** — dropdown with seven options (`all` + the six M5 operational capacities from 26.2: `anuttara-construction / paramasiva-cpt-rag / parashakti-graph-relational-ml / mahamaya-process-reward-rl / nara-anima-dialogic / epii-self-referential`). Local widget state per 15-foundation principle 7; filters `candidates` array client-side.

    (d) Extend `AutoresearchCandidate` with optional `capacity?: M5OperationalCapacity` field matching 26.2 ids. Per-candidate badge shows capacity.

    (e) **`requires_human` non-bypassable disclosure** — per-candidate, if `candidate.requires_human === true`, renders human-gate badge (gold border) with banner "Human ratification required — agent transitions blocked at gateway"; per-candidate "Open in Review pane →" click-through emits `CrossLayoutIntent { requestedExtensionId: 'ide-shell-m0-m5', requestedContributionId: 'review-pane', requestedReviewId: candidate.id }`.

    Verification: `grep -n "MobiusPassRibbon\|autoresearch-as-concept\|requires_human\|dry-run\|recompose-pass\|forbidden_authority\|capacity" Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/autoresearch-pane-widget.tsx`; header-frame render test; Möbius-pass ribbon active-stage test (with `s5'.improve.status` mock); per-capacity filter narrows candidate list; `requires_human` gold-badge + Review-pane click-through test; `cargo check -p epii-autoresearch-core` (consume `capacity_workflows` + `recompose` substrate); `pnpm --filter @pratibimba/ide-shell-m0-m5 build && test`.

11. **28.11 — Bridge-gate: nine-id readiness taxonomy + per-binding inline rendering + shared readiness primitive in `m-extension-runtime`** *(audit-extend + spec-ahead-integration; consumes 15.6 + 07-t0 readiness ids + TS-09)*

    Audit `Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/bridge-gate.tsx`. Five deliverables; existing `IdeShellBridgeGate` React component subsection retained.

    (a) Subscribe to `bridge.subscribe('observability')` (consume the `observability` subscription per 07-t0) for readiness ledger updates. Consume the nine readiness ids per 07-t0: `bridge_unavailable / profile_missing_field / s2_graph_blocked / s3_subscription_blocked / s5_review_blocked / authority_payload_missing / privacy_blocked / degraded_but_readable / ready_public_current`. Wrapping pending shell stays ONLY for `bridge_unavailable`; finer-grained states render inline at the binding site per 15.6.

    (b) Move the readiness primitive to `@pratibimba/m-extension-runtime` so `IntegratedBridgeGate` (in `integrated-composition`) consumes the same source. New file `Body/M/epi-theia/extensions/m-extension-runtime/src/common/bridge-readiness.ts`:

    ```ts
    export type BridgeReadinessId =
        | 'bridge_unavailable' | 'profile_missing_field' | 's2_graph_blocked'
        | 's3_subscription_blocked' | 's5_review_blocked' | 'authority_payload_missing'
        | 'privacy_blocked' | 'degraded_but_readable' | 'ready_public_current';

    export interface BridgeReadinessBinding {
        readonly bindingKey: string;             // 's2.graph.node' | 's5'.review.inbox' | etc.
        readonly readinessId: BridgeReadinessId;
        readonly blockers: readonly string[];    // human-readable reasons
        readonly lastTickObserved: number;
    }

    export function classifyReadiness(snapshot: MExtensionReadinessSnapshot, bindingKey: string): BridgeReadinessBinding;

    /** React hook for per-binding readiness inline rendering. */
    export function useBridgeReadiness(bridge: KernelBridgeAPI, bindingKey: string): BridgeReadinessBinding;
    ```

    (c) Component `<BridgeReadinessBadge bindingKey={...} />` exported from `m-extension-runtime` renders per-binding: border-colour (green for `ready_public_current` / `degraded_but_readable`, amber for `profile_missing_field` / `authority_payload_missing` / `s2_graph_blocked` / `s3_subscription_blocked` / `s5_review_blocked`, red for `bridge_unavailable` / `privacy_blocked`); pending badge with readinessId text; blocked overlay for red states. 15.6 inline-provenance principle honoured.

    (d) The eight ide-shell widgets adopt the per-binding pattern: `bimba-graph-viewer` binds `s2.graph.node`; `coordinate-tree` binds `s2'.coordinate.resolve`; `evidence-pane` binds `s5'.review.history`; `review-pane` binds `s5'.review.inbox`; `autoresearch-pane` binds `s5'.improve.history`; `logos-atelier` binds `aletheia_gnosis_query` + `aletheia_crystallise`; `canon-studio` binds `vault-bridge.s1prime.vault.write_file` + `s1'.semantic.suggest`; `agentic-control-room` binds capability-matrix + per-route. Per-widget render adds `<BridgeReadinessBadge bindingKey={...} />` next to each data binding.

    (e) `IntegratedBridgeGate` (`Body/M/epi-theia/extensions/integrated-composition/src/browser/integrated-bridge-gate.tsx`) consumes the same `useBridgeReadiness` + `BridgeReadinessBadge` primitive (NOT a parallel implementation). Folds WC-IS-15.

    Verification: `test -f Body/M/epi-theia/extensions/m-extension-runtime/src/common/bridge-readiness.ts`; `grep -n "useBridgeReadiness\|BridgeReadinessBadge\|bridge_unavailable\|profile_missing_field\|s2_graph_blocked\|degraded_but_readable\|ready_public_current\|classifyReadiness" Body/M/epi-theia/extensions/`; nine-id readiness rendering test (one per id); per-binding inline badge test for each widget; shared primitive consumed by both `IdeShellBridgeGate` and `IntegratedBridgeGate`; wrapping pending shell only for `bridge_unavailable`; `pnpm --filter @pratibimba/m-extension-runtime build && test`; `pnpm --filter @pratibimba/ide-shell-m0-m5 build && test`; `pnpm --filter @pratibimba/integrated-composition build && test`.

12. **28.12 — Smart-Connections sidebar code-pending stub** *(code-pending-closure; consumes 11.4 + MIGRATION-SOURCES.md)*

    New file `Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/smart-connections/smart-connections-sidebar-stub.tsx` + registration in `frontend-module.ts`. Stub widget registers the widget id `pratibimba.smart-connections-sidebar` (the layout-claim from `IDE_DEEP_DESCRIPTOR.expectedWidgets`); body renders placeholder:

    ```tsx
    export class SmartConnectionsSidebarStub extends ReactWidget {
        static readonly ID = 'pratibimba.smart-connections-sidebar';
        static readonly LABEL = 'Smart Connections';

        @postConstruct()
        protected init(): void {
            this.id = SmartConnectionsSidebarStub.ID;
            this.title.label = SmartConnectionsSidebarStub.LABEL;
            this.title.closable = true;
            this.addClass('ide-shell-widget');
            this.addClass('ide-shell-smart-connections-stub');
        }

        protected override render(): React.ReactNode {
            return (
                <div data-test="smart-connections-stub">
                    <h3>{SmartConnectionsSidebarStub.LABEL}</h3>
                    <p className="ide-shell-pending-extension">
                        Gated on Track 03 T6.5 — smart-connections-sidebar extension scaffolds at T4.5
                        per <code>MIGRATION-SOURCES.md</code>. This stub satisfies the layout-claim
                        <code>pratibimba.smart-connections-sidebar</code> in <code>IDE_DEEP_DESCRIPTOR.expectedWidgets</code>.
                    </p>
                </div>
            );
        }
    }
    ```

    Activity-bar contribution from 28.2 references the stub widget id with `codePendingMarker: 'track-03-t6.5'`. Layout-switcher tolerates the stub. When the real `smart-connections-sidebar` extension scaffolds at T4.5, this stub file is deleted and the real extension takes over the widget id — extension `package.json` claims the id; pratibimba-layouts switcher resolves to the real factory.

    Verification: `test -f Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/smart-connections/smart-connections-sidebar-stub.tsx`; `pnpm --filter @pratibimba/pratibimba-layouts test` (layout-switcher tolerates pending widget); `grep -n "pratibimba.smart-connections-sidebar\|Track 03 T6.5\|pending-extension\|SmartConnectionsSidebarStub" Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/smart-connections/`; MIGRATION-SOURCES.md row referenced in stub body.

13. **28.13 — Backend Studio: LSP slot + coordinate-aware navigation** *(spec-ahead-integration; first-build against unowned M' product surface; 15-foundation `ide-deep` row)*

    New sub-folder `Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/backend-studio/`. Three deliverables.

    (a) **`backend-studio-contribution.ts`** — activity-bar mode "Backend Studio" visible only when `epi-logos.layout.active = 'ide-deep'`. Widget id `pratibimba.ide-shell.backend-studio`. ViewContainer slot in activity-bar left. Re-uses the activity-bar contribution from 28.2 (`codePendingMarker: 'first-build'` cleared once landed).

    (b) **`backend-studio-service.ts`** — Theia LSP slot:

    ```ts
    @injectable()
    export class BackendStudioService {
        @inject(MonacoLanguages) protected readonly monacoLanguages!: MonacoLanguages;
        @inject(EditorManager) protected readonly editorManager!: EditorManager;
        @inject(KERNEL_BRIDGE_API) protected readonly bridge!: KernelBridgeAPI;

        registerLanguageServers(): void {
            // rust-analyzer for Body/S/S0/{epi-lib (rust crates), portal-core} + Body/S/S1/hen-compiler-core + Body/S/S2/{graph-schema, graph-services}
            // clangd for Body/S/S0/epi-lib (C parts) + Body/S/S0/epi-cli
            // pylsp for Body/S/S0/epi-gnostic + Body/S/S3 python integrations
        }

        async openSource(coordinate: string, sourceAnchor: string): Promise<void> {
            const receipt = await this.bridge.invokeCapability({
                method: 'invokeGatewayRpc',
                sessionKey: 'backend-studio-open-source',
                params: { gatewayMethod: 's2.graph.node', coordinate },
                profileGeneration: this.bridge.cachedProfile?.generation ?? null,
                provenanceHandles: [], vak: null
            });
            if (!isPrivacySafe(receipt.privacyClass)) return;
            const sourceUri = this.resolveSourceAnchor(receipt.artifact, sourceAnchor);
            await this.editorManager.open(new URI(sourceUri));
        }
        protected resolveSourceAnchor(artifact: unknown, anchor: string): string { /* ... */ }
    }
    ```

    LSP slot ships rust-analyzer / clangd / pylsp registration via Theia's `MonacoLanguages.register`; supports navigating `Body/S/S0/epi-lib/`, `Body/S/S0/portal-core/`, `Body/S/S1/hen-compiler-core/`, `Body/S/S2/{graph-schema, graph-services}/`, `Body/S/S3/`, `Body/S/S4/`, `Body/S/S5/` sources.

    (c) `backend-studio.openSource(coordinate, sourceAnchor)` Theia command registered. Consumed by: RunTree (28.5) node click → opens source-anchor in editor; PiAxiomTranslationInspector (26.14) cross-link to source skill file (`Body/S/S4/pi-agent/skills/anuttara-symbolic-parse/SKILL.md`); Coordinate Tree (28.6) "View source" affordance per node.

    Privacy gate retained — source paths are public by default; forbidden privacy classes block file open.

    Verification: `test -d Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/backend-studio`; `test -f Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/backend-studio/backend-studio-contribution.ts`; `test -f Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/backend-studio/backend-studio-service.ts`; activity-bar mode "Backend Studio" registered in `ide-deep` only; `backend-studio.openSource` command resolves source-anchor + opens file via Theia editor; RunTree + PiAxiomTranslationInspector + Coordinate Tree click-throughs work (mock SharedBridgeAdapter + EditorManager); privacy gate blocks forbidden classes; `pnpm --filter @pratibimba/ide-shell-m0-m5 build && test`.

14. **28.14 — Cross-layout intent target registration for the four un-registered widgets** *(spec-ahead-integration; consumes 11.2 + `omnipanel-types.ts`)*

    Audit `Body/M/epi-theia/extensions/ide-shell-m0-m5/src/common/contract.ts` + `src/browser/frontend-module.ts`. Extend `IDE_SHELL_INTENT_TARGETS`:

    ```ts
    export const IDE_SHELL_INTENT_TARGETS = {
        CANON_STUDIO:          'canon-studio',
        BIMBA_GRAPH:           'bimba-graph',
        AGENTIC_CONTROL_ROOM:  'agentic-control-room',
        EVIDENCE_PANEL:        'evidence-panel',
        // NEW per 28.14:
        COORDINATE_TREE:       'coordinate-tree',
        LOGOS_ATELIER:         'logos-atelier',
        REVIEW_PANE:           'review-pane',
        AUTORESEARCH_PANE:     'autoresearch-pane'
    } as const;
    ```

    Add four `registerIntentTarget` calls in `frontend-module.ts` (sibling `*Contribution` classes already exist). Each handler consumes `CrossLayoutIntent` payload (`coordinate / artifactUri / reviewId / dayNow / sessionKey / profileGeneration / privacyClass / requestedExtensionId / requestedContributionId`) per `omnipanel-types.ts`:

    - **Coordinate Tree handler** — `widget.loadTree(intent.coordinate)`; if `requestedContributionId === 'highlight-coordinate'`, also sets `activeCoordinate = intent.coordinate` per 28.6 (b).
    - **Logos Atelier handler** — when `intent.requestedContributionId` matches pattern `term:{value}`, calls `widget.setTerm(value)`; pre-populates Möbius write-back stage if `intent.artifactUri` present.
    - **Review Pane handler** — calls `widget.refreshInbox()`; if `intent.reviewId` present, scrolls to + highlights that item per 28.9 click-through.
    - **Autoresearch Pane handler** — calls `widget.refreshHistory()`; if `intent.requestedContributionId` matches pattern `capacity:{id}`, sets per-capacity filter per 28.10 (c).

    Eight intent targets total registered. Cross-link 11.2 cross-layout intent T5 promotion.

    Verification: `grep -n "COORDINATE_TREE\|LOGOS_ATELIER\|REVIEW_PANE\|AUTORESEARCH_PANE\|registerIntentTarget" Body/M/epi-theia/extensions/ide-shell-m0-m5/src/`; eight intent targets total registered in `frontend-module.ts`; per-target handler test exercises the consumer-side wiring with synthetic `CrossLayoutIntent` (mock SharedBridgeAdapter); cross-layout state-identity preserves the intent target activation (cross-link 11.6 + 28.19); `pnpm --filter @pratibimba/ide-shell-m0-m5 build && test`.

15. **28.15 — Autoresearch pane orphan-against-layout fill** *(no-orphan-fill; consumes 11.5 lint extension + 11.9 ledger)*

    Audit `Body/M/epi-theia/extensions/pratibimba-layouts/src/common/layout-types.ts`. Add `pratibimba.ide-shell.autoresearch-pane` to `IDE_DEEP_DESCRIPTOR.expectedWidgets` (currently absent; `autoresearch-pane-widget` exists but is orphan against the layout descriptor). Extend `Body/M/epi-theia/extensions/test/validate-extension-contract-preflight.test.mjs` per 11.5 to assert every `IDE_DEEP_DESCRIPTOR.expectedWidgets` id has either:
    (a) a registered widget factory in some Mn-extension or ide-shell-m0-m5 `frontend-module.ts`, OR
    (b) a `code-pending` marker (e.g. smart-connections-sidebar stub per 28.12).

    Verification: `grep -n "pratibimba.ide-shell.autoresearch-pane" Body/M/epi-theia/extensions/pratibimba-layouts/src/common/layout-types.ts`; orphan-fill test asserts no `expectedWidgets` id is unowned; `node --test Body/M/epi-theia/extensions/test/validate-extension-contract-preflight.test.mjs`; cross-link 28.20 ledger row added.

16. **28.16 — Federated `PrivacyDropFeed` (OmniPanel Diagnostics tab feed)** *(aligned-only-polish; consumes 15.2 Diagnostics tab)*

    New file `Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/services/privacy-drop-feed.ts` — DI singleton:

    ```ts
    @injectable()
    export class PrivacyDropFeed {
        protected readonly events: PrivacyDropEvent[] = [];
        protected readonly emitter = new Emitter<PrivacyDropEvent>();
        readonly onDrop: Event<PrivacyDropEvent> = this.emitter.event;

        record(widgetId: string, privacyClass: string, droppedAt: number = Date.now()): void {
            const event = { widgetId, privacyClass, droppedAt };
            this.events.push(event);
            this.emitter.fire(event);
        }

        get aggregate(): { byWidget: Record<string, number>; byClass: Record<string, number>; total: number };
    }
    ```

    Per-widget privacy-drop hooks: replace per-widget `this.privacyDropped += 1` with `feed.record(this.id, privacyClass)`. Per-widget count rendering preserved (read from `feed.aggregate.byWidget[this.id]`). OmniPanel Diagnostics tab (27-omnipanel-shell) subscribes via `feed.onDrop` + renders aggregate (`byWidget` table + `byClass` histogram + `total` count). Cross-link 27-omnipanel-shell tranche on Diagnostics.

    Verification: `test -f Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/services/privacy-drop-feed.ts`; eight widgets publish via feed; aggregate test asserts `byWidget` + `byClass` + `total` populated; subscription test fires `onDrop`; `pnpm --filter @pratibimba/ide-shell-m0-m5 build && test`.

17. **28.17 — Profile-tick re-render contract per widget** *(spec-ahead-integration; consumes 15.6 + 15-foundation principle 2)*

    Extend `Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/bridge-gate.tsx` to expose `useProfileTick()` React hook via context:

    ```tsx
    const ProfileTickContext = React.createContext<{ tickGeneration: number }>({ tickGeneration: 0 });

    export function useProfileTick(): number {
        return React.useContext(ProfileTickContext).tickGeneration;
    }

    export class IdeShellBridgeGate extends React.Component<...> {
        // existing onConnectionChange + onProfile subscriptions
        // expose this.state.tickGeneration via Provider
        override render(): React.ReactNode {
            // ...
            return (
                <ProfileTickContext.Provider value={{ tickGeneration: this.state.tickGeneration }}>
                    {this.props.children}
                </ProfileTickContext.Provider>
            );
        }
    }
    ```

    Each ide-shell widget body subscribes via `useProfileTick()` in render path; on tick advance, `this.update()` triggered. Existing `await`-driven re-renders stay; tick-driven re-renders are additional. Cross-link 11.6 acceptance-harness state-identity test asserts widgets re-render on profile-tick advance.

    Verification: `grep -n "useProfileTick\|ProfileTickContext\|tickGeneration\|onProfile" Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/`; profile-tick replay test asserts each widget re-renders on each tick with stable input; no parallel local timer competes; `pnpm --filter @pratibimba/ide-shell-m0-m5 build && test`.

18. **28.18 — Status-bar consumption audit (no own-state for shared fields)** *(doc-ahead-landing; consumes 15.10)*

    Audit each ide-shell widget. For the six shared status-bar fields named in 15.10 (profile-tick state / day-now anchor / session id / gateway readiness / profile generation / active coordinate) MUST consume from `SharedBridgeAdapter` projection, NOT from own widget state:

    - `agentic-control-room-widget.tsx` renders `coordinate / sessionKey / dayNow / profileGeneration` in VAK fields — consume `bridge.cachedProfile?.generation`, `bridge.cachedCoordinateContext?.coordinate`, etc.
    - `evidence-pane-widget.tsx` renders `sessionKey / dayNowContext / profileGeneration` per record — derive from `record.{sessionKey, dayNowContext, profileGeneration}` set at record creation; widget does NOT compute.
    - other widgets similarly.

    Widget tests assert the rendered values mirror the SharedBridgeAdapter source. 15.10 tranche owns the status-bar build; 28.18 adds the per-widget consumption-only contract via code comments + tests.

    Verification: `grep -n "SharedBridgeAdapter.cachedProfile\|cachedProfile.generation\|cachedCoordinateContext\|profileGeneration\|sessionKey\|dayNow" Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/`; per-widget audit code-comments added where field is rendered; status-bar consumption test (cross-link 15.10).

19. **28.19 — Acceptance-harness state-identity assertion per ide-shell widget** *(spec-ahead-integration; consumes 11.6)*

    Extend `Body/M/epi-theia/extensions/acceptance-harness/tests/topology.test.mjs` per 11.6 with per-widget state-identity assertions. Test flow:
    1. Open `daily-0-1` layout
    2. Select coordinate `M3-1-0-13` (sample codon)
    3. Activate session `acceptance-test-session-001` + profile generation `42`
    4. Activate activity-bar mode `coordinate-tree` (per 28.2)
    5. Open Bimba Graph Viewer + select coordinate
    6. Open Canon Studio + open file
    7. Activate Logos Atelier + set term
    8. Activate Evidence pane + select record
    9. Activate Review pane + select item
    10. Activate ACR + populate VAK fields
    11. Activate Autoresearch pane + set per-capacity filter
    12. Toggle to `ide-deep`
    13. Toggle back to `daily-0-1`
    14. Assert ALL of:
        (a) Coordinate Tree active-coordinate highlight `M3-1-0-13` preserved
        (b) Bimba Graph Viewer selected coordinate `M3-1-0-13` preserved
        (c) Canon Studio open uri preserved
        (d) Logos Atelier current term preserved
        (e) Evidence pane record selection preserved
        (f) Review pane item selection preserved
        (g) ACR VAK fields preserved
        (h) Autoresearch pane filter preserved
        (i) Active activity-bar mode preserved (per 28.2)
        (j) `bridge-gate` readiness state per binding preserved (per 28.11)
        (k) Session `acceptance-test-session-001` + profile generation `42` preserved (per 15.7)

    Verification: `pnpm --filter @pratibimba/acceptance-harness test`; per-widget state-identity assertion passes; `grep -n "ide-shell.*state-identity\|toggling daily-0-1\|active-coordinate.*preserved" Body/M/epi-theia/extensions/acceptance-harness/tests/topology.test.mjs`.

20. **28.20 — Surface→extension→contract ledger contribution (ide-shell rows)** *(no-orphan-fill; consumes 11.9 + 14-no-orphan-audit)*

    Contribute the ide-shell rows to `Body/M/epi-theia/extensions/contracts/surface-extension-contract-ledger.json` per 11.9. Row shape:

    ```json
    {
        "widgetId": "pratibimba.ide-shell.bimba-graph-viewer",
        "extensionPackage": "@pratibimba/ide-shell-m0-m5",
        "contractEntry": "07-t0.ide-shell.bimba-graph-viewer",
        "category": "M0' chrome",
        "status": "audit-extend-pending",
        "tranche": "28.3",
        "layoutBindings": ["daily-0-1", "ide-deep"],
        "activityBarMode": "bimba-graph-viewer"
    }
    ```

    Rows for: eight widgets (status: `audit-extend-pending` for 28.3..28.10 widgets until those land); `bridge-gate` (`landed`); activity-bar contribution (`code-pending` → `landed` after 28.2); `pratibimba.smart-connections-sidebar` (`code-pending` per 28.12); `pratibimba.ide-shell.backend-studio` (`code-pending` → `landed` after 28.13); ledger row for the chrome-contract (`28.1`).

    Sibling validator test `Body/M/epi-theia/extensions/test/surface-extension-contract-ledger.test.mjs` (lands at 11.9) extended to assert ide-shell rows present + status correct. Cross-link 14-no-orphan-audit.

    Verification: `node --test Body/M/epi-theia/extensions/test/surface-extension-contract-ledger.test.mjs`; ide-shell rows present + status field tracks Wave-C tranche landing; `grep -n "pratibimba.ide-shell\|audit-extend-pending\|landed\|code-pending" Body/M/epi-theia/extensions/contracts/surface-extension-contract-ledger.json`; cross-link 14-no-orphan-audit.

## Anti-Greenfield Posture

All Track 28 work either:
- **Audits + extends** the eight landed ide-shell widgets (28.3 / 28.4 / 28.5 / 28.6 / 28.7 / 28.8 / 28.9 / 28.10) — every widget retains its shell, privacy gate, bridge subscription, intent-target wiring; only the render tree + sub-component breakdown + service injection deepens.
- **Audits + extends** `bridge-gate.tsx` to nine-id readiness + per-binding inline rendering, moving the shared primitive to `m-extension-runtime` (28.11) so `IntegratedBridgeGate` consumes the same source.
- **Extends `frontend-module.ts`** to register four additional intent targets (28.14), four additional `defaultWidgetOptions.area` switches (28.2), and the new contributions (activity-bar, Backend Studio, Smart-Connections stub).
- **Adds sub-folders** under `Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/`: `activity-bar/` (28.2), `acr/` (28.5), `backend-studio/` (28.13), `smart-connections/` (28.12), `services/` (28.16), `bimba-graph-viewer/` (28.3), `canon-studio/` (28.4). All first-builds are against unowned M' product surfaces named by 15-foundation / 11.4 / 26.7.
- **Adds shared primitive** to `m-extension-runtime` (`bridge-readiness.ts` 28.11) consumed by both ide-shell and integrated-composition.
- **Adds doc-ahead-landing** `CHROME-CONTRACT.md` (28.1).
- **Lands DRs** in Track 13 (DR-WC-IS-1 / DR-WC-IS-2 / DR-WC-IS-3 ratified by 28.1 / 28.5 / 28.8 / 28.9 / 28.4).
- **Extends contract validator** to enforce CHROME-CONTRACT category for every ide-shell widget id (28.1) + orphan-against-layout fill (28.15).
- **Extends acceptance-harness** per 11.6 with per-widget state-identity assertions (28.19).
- **Contributes ledger rows** to 11.9 surface-extension-contract ledger (28.20).

No greenfield widget shell; no competing chrome system; no rebuild of the eight landed widgets. The chrome IS the substrate; Track 28 lifts each widget into its 21-m0 / 26-m5 / 15-foundation depth without breaking the inversify graph, the privacy gate, the SharedBridgeAdapter contract, or the kernel-bridge readiness primitive.

## Closing

The ide-shell-m0-m5 chrome is the load-bearing M0/M5 surface — coordinate-rooted navigation, canonical-write under governance, agentic-dispatch evidence + review surfaces. The eight widgets + bridge-gate are one chrome system, partitioned into M0' chrome (Coordinate Tree, Bimba Graph Viewer, Canon Studio) + M5' chrome (Logos Atelier, Evidence pane, Review pane, Autoresearch pane, ACR) + shared infrastructure (bridge-gate). The ide-shell carries the governance audit perimeter (full `MediatedRunEvidencePacket` deep render, IOD-17 three-way parity matrix, capability-matrix source-of-truth); the OmniPanel (27-omnipanel-shell) carries the agentic-membrane abbreviated render. Same data, two foldings, one envelope (`CrossLayoutIntent`) carrying click-through between the surfaces. The chrome reads on the left (Coordinate Tree, Bimba Graph Viewer in solar-anchor or full-lattice rendering); writes route through M5 atelier governance (`mutatesGraphCanon: false` invariant; Möbius write-back stage in Logos Atelier → Canon Studio → vault-bridge). The bridge-gate readiness primitive (nine ids from 07-t0, inline per-binding rendering per 15.6) is the truthful provenance surface; privacy gate is non-bypassable; profile-tick clock is universal (`useProfileTick()` hook). The activity-bar discipline (15.3) folds the left-sidebar into three modes for `daily-0-1` and five for `ide-deep` — Coordinate Tree · Bimba Graph Viewer · Canon Studio always; Backend Studio + Smart Connections only in `ide-deep`. The chrome surfaces are not eight independent widgets — they are one chrome speaking eight aspects of the M0/M5 governance flow.

**End of Track 28.**
