# Track 11 — Theia Shell / Surface Hosting

<!-- carrier-retarget-banner v1 -->
> ⚑ **RETARGET — cycle-3 full rerun.** This file is the design-recon **SOURCE** (the tranche brief the rerun stubs send you to). Every `Body/M/epi-theia/…` path below is **FROZEN reference only**. **Build / verify target = `Body/M/pratibimba-app`** (the carrier) **+ substrate crates** (`epi-lib` / `portal-core` / `epi-cli` / `graph-*` / gateway — these carry unchanged). Any Verify line that names `epi-theia` (e.g. `cd Body/M/epi-theia && pnpm --filter …build`) is **retargeted**: run the **pratibimba-app carrier equivalent** (or the substrate crate's own runner), **never** the epi-theia build. Law: [`CHARTER.md`](../2026-07-03-m-prime-cycle-3-full-rerun/CHARTER.md) §13–18 · single-source map [`carrier-contract.json`](../2026-07-03-m-prime-cycle-3-full-rerun/carrier-contract.json) · per-track CARRIER: [recapture register](../../../plans/2026-07-03-cycle-3-recapture-register.md) §2.


Closure of the shell that hosts the six M' surfaces + two integrated plugins. The substrate is largely **ALIGNED at presence level**: all six M-extensions (`m0-anuttara`..`m5-epii`), both integrated plugins (`plugin-integrated-1-2-3`, `plugin-integrated-4-5-0`), both contract preflights (`07-t0` individual + `08-t0` composition), `kernel-bridge` + `kernel-bridge-readiness`, `omnipanel-shell`, `pratibimba-layouts`, `ide-shell-m0-m5` (with all 8 named widgets + `bridge-gate`), `agentic-control-room`, `body-lite-surface`, `acceptance-harness`, `m-extension-runtime`, and `integrated-composition` are landed packages. `CrossLayoutIntent` envelope is typed; `OMNIPANEL_TABS.availableInLayouts` is typed. `epi-tauri`-as-deprecated standing invariant is honored at substrate level.

## Target Authority Invariant

Cycle 3 work is **Electron-first, browser-derived, gateway-mediated**. `Body/M/epi-theia/electron-app` is the full-fidelity development, smoke-build, and acceptance target; it carries the whole `daily-0-1` + `ide-deep` product surface. `Body/M/epi-theia/theia-app` is the derived browser-mode target for gateway-served, hosted, phone, secondary-machine, CI, Docker, and headless use. Browser mode may step down capability through gateway mediation, permission gates, and readiness labels, but it must not become the only target that carries a Pratibimba surface package or the target where full-surface behavior is first validated.

## Source Specs and Matrix

- Canonical: `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md` (shell separation invariant §`Shell layer` L91-148), `Idea/Bimba/Seeds/M/M'-PORTAL-SPEC.md`
- Substrate: `Body/M/epi-theia/{electron-app,theia-app,extensions/{pratibimba-layouts,omnipanel-shell,ide-shell-m0-m5,kernel-bridge,kernel-bridge-readiness,acceptance-harness,m-extension-runtime,integrated-composition,contracts}}`
- Full row-level evidence: `plan.runs/wave-b-theia-shell-matrix.md`

## Cycle 2 Substrate Inheritance

Consume as-is — all six M-extensions + two integrated plugins + both contract preflights + `kernel-bridge` mirror + `omnipanel-shell` widget + `pratibimba-layouts` with `daily-0-1` and `ide-deep` descriptors + `ide-shell-m0-m5` chrome + `acceptance-harness` + `m-extension-runtime` + `integrated-composition`. `Body/M/epi-tauri` is deprecated migration-source only per `MIGRATION-SOURCES.md`. Cycle 2 Track 01 owned the Electron/Theia shell + OmniPanel; cycle 3 closes the shell separation invariant decision and acceptance-harness contracts.

## Tranches

0. **11.0 — Electron target package parity gate** *(code-ahead-landing; target-authority closure)*

   `electron-app` must carry every Pratibimba surface package that `theia-app` carries unless the package is named in an explicit browser-only exception ledger. This closes the browser-first drift where `ide-shell-m0-m5`, `agentic-control-room`, `body-lite-surface`, and `acceptance-harness` landed in browser mode while Electron lacked the full-surface set. Root scripts should treat Electron as the default target (`pnpm start`, smoke build, and full-surface acceptance), with browser commands labelled as browser/gateway/remote mode.

   Verification: `node --test Body/M/epi-theia/extensions/test/electron-target-parity.test.mjs`; `Body/M/epi-theia/scripts/smoke-build.sh` builds `@pratibimba/electron-app` and checks Electron frontend chunks for the full surface packages.

   **RETIRED (2026-07-11) — Fable-adjudicated: dead Theia plumbing, superseded by the carrier.** The electron-app ↔ theia-app target split this gate polices exists only in frozen `Body/M/epi-theia` (never build/verify there per the rerun carrier contract; Theia packaging targets are DEAD plumbing). The carrier `@pratibimba/app` is a **single Tauri app** — one target, no browser/Electron package drift is possible, so the parity *gate* has no object. The surviving real concern — *the shipped app actually boots with its full surface set against a live gateway* — is owned by the carrier's `scripts/boot-smoke.mjs` (spawns a real `epi gate start`, real WebSocket handshake, fails unless a live profile tick arrives and advances) plus `pnpm test:e2e` (playwright). Do not re-litigate this as an Electron work item; if a second packaging target ever appears for the Tauri app, a parity gate should be re-derived against that reality, not this one.

1. **11.1 — Shell-0/Shell-1/4+2/`/` separation reading (clarification, not contradiction)** *(doc-ahead-landing; DR-TS-1 VALIDATED)*

   Spec is already counting it out cleanly: layout is `0/1` (one shell with a 0-cosmic side and a 1-personal side) + `4+2` (six depth layers) + `/` (OmniPanel operator membrane). Code's two layouts (`daily-0-1` for the 0/1 shell, `ide-deep` for the 4+2 depth) ARE the two surfaces. The 0/1 toggle is the side-switch within `daily-0-1` — `(0/1)` IS `#` applied to user context, same state seen from opposite faces. No third layout, no separate toggle-widget extension (unless wanted as UI polish). Cross-links DR-M4-2 clause 5 (0 cosmic / 1 personal — same polarity all the way down).

   Verification: `pnpm --filter @pratibimba/pratibimba-layouts test` passes against current substrate; `daily-0-1` widget contributions partition cleanly into 0-side / 1-side renderings; spec patched to note the structural reading so the next reader doesn't re-litigate.

   **LANDED (2026-06-10) — structural reading, no third layout.** The (0/1) side partition is now build-enforced in `pratibimba-layouts/src/common/layout-types.ts`. `DAILY_0_1_WIDGET_IDS` is the single source of truth for both `DAILY_0_1_DESCRIPTOR.expectedWidgets` and `DAILY_0_1_FACE_OF`, a `Readonly<Record<Daily01WidgetId, DailyShellFace>>` assigning every `daily-0-1` widget to exactly one face — so `tsc -b` (the package `test`) fails if the partition ever drifts:

   - **0-side (cosmic)** = `pratibimba.daily.cymatic-placeholder` — lean preview of the M1'-M3' structural / cymatic-clock outputs.
   - **1-side (personal)** = `pratibimba.daily.journal`, `pratibimba.daily.agent-checkin` — lean preview of the M4'/M5'/M0' lived-return.
   - **`/` membrane** = `pratibimba.omnipanel.shell`, `pratibimba.daily.status-display` — S0' operator surface (OmniPanel + bridge-readiness) cross-cutting BOTH faces; it is `#` itself, not a pole.

   `partitionDailyWidgets()` returns `{ cosmic, personal, membrane }` (exhaustive, disjoint); `dailyWidgetsForSide('0-cosmic' | '1-personal')` returns each face's rendering with the membrane folded onto both sides. There is **no third layout and no separate toggle-widget extension** — `ide-deep` is the distinct 4+2 depth surface, `daily-0-1` is the 0/1 shell, and the toggle is `#` applied to user context, the same layout from opposite faces. This is the clarification DR-TS-1 ratifies (cross-links DR-M4-2 clause 5: 0 cosmic / 1 personal — same polarity all the way down). The matter is settled; do not re-litigate it as a contradiction.

2. **11.2 — Cross-layout intent routing T5 promotion** *(spec-ahead-integration)*

   Wire each of the six M-extensions to consume `CrossLayoutIntent.requestedExtensionId` + `requestedContributionId`. Wire `OMNIPANEL_TABS.availableInLayouts` filter against `epi-logos.layout.active` preference. Extend, no rebuild.

   Verification: `pnpm --filter @pratibimba/omnipanel-shell test`; `pnpm --filter @pratibimba/pratibimba-layouts test`; integration test in `acceptance-harness` "OmniPanel intent → daily-0-1 → ide-deep with M3 codon preserved".

3. **11.3 — Daily-layer widget ownership trace + ORPHAN closure** *(no-orphan-fill; AMENDED 2026-06-15 per DR-LIB-ATELIER-1 + CCT-19 — Library + Atelier projections registered as projection-lenses, not standalone extensions)*

   Trace `pratibimba.daily.{journal, agent-checkin, cymatic-placeholder, status-display}` (declared in `layout-types.ts:L52-58`) to either `body-lite-surface` contributions (rename/align) or a named owning extension. If no owner, either downgrade layout claim (remove from `expectedWidgets`) or land a `pratibimba-daily-widgets` extension (first-build allowed: no current owner of the named M' product surfaces).

   **Library + Atelier projection registration** (per DR-LIB-ATELIER-1 + CCT-19): the M5-0' Library and M5-5' Logos Atelier are NOT standalone Theia extensions to land. They are **projections / lensings of existing Theia IDE surfaces**, registered in the daily-layer widget map as projection-lenses:

   - **`pratibimba.daily.library-projection`** — coordinate-overlay lens on the Theia file-tree (per Tranche 6.2b). Maps to `body-lite-surface` (small additive contribution) OR new minimal `library-projection-lens` package (≤200 LOC, lens-explicit naming, NOT a "library-surface" extension).
   - **`pratibimba.daily.atelier-cluster-lens`** — etymological-cluster overlay on the existing m0-anuttara graph viewer (per Tranche 6.2). Maps to `m0-anuttara` extension's existing widget (small additive view-mode contribution, ≤80 LOC), NOT a separate `logos-atelier` extension.

   **Anti-rebuild commitment.** `test ! -d Body/M/epi-theia/extensions/library-surface && test ! -d Body/M/epi-theia/extensions/logos-atelier && test ! -d Body/M/epi-theia/extensions/scent-following-workspace` — these directories MUST NOT exist as standalone extensions. The projection-lens approach uses existing extension contribution points (`body-lite-surface` for the file-tree overlay, `m0-anuttara` for the graph-viewer lens, `omnipanel-shell` for command bindings + Library tab).

   Verification: Extension presence at `Body/M/epi-theia/extensions/<owner>/`; `validate-extension-contract-preflight.test.mjs` extended with `expectedWidgets` ↔ contributor mapping; `pnpm --filter @pratibimba/body-lite-surface test`; `test ! -d Body/M/epi-theia/extensions/library-surface` AND `test ! -d Body/M/epi-theia/extensions/logos-atelier` (no standalone extensions); `grep -nE "pratibimba.daily.library-projection|pratibimba.daily.atelier-cluster-lens" Body/M/epi-theia/extensions/pratibimba-layouts/src/common/layout-types.ts` returns the registered widget IDs as projection-lenses.

   **Cross-track hooks:** DR-LIB-ATELIER-1 (canonical reframe); CCT-19 (Library + Atelier projection canon); Tranches 6.1 EXPANDED, 6.2 (Atelier projection), 6.2b (Library projection) — the M5-side reframe tranches.

4. **11.4 — `smart-connections-sidebar` layout-claim code-pending marker** *(code-pending-closure)*

   Mark `pratibimba.smart-connections-sidebar` entry in `ide-deep.expectedWidgets` as code-pending with gating reference (Track 03 T6.5 per `MIGRATION-SOURCES.md`). Ensure layout-switcher does not throw on missing widget. Cross-link `MIGRATION-SOURCES.md`.

   Verification: `pnpm --filter @pratibimba/pratibimba-layouts test` (layout-switcher tolerates pending widget).

5. **11.5 — Forbidden-direct-import lint enforcement against six M-extension source trees** *(spec-ahead-integration)*

   Extend `Body/M/epi-theia/extensions/scripts/validate-extension-contract-preflight.mjs` to grep each Mn-extension `src/**/*.ts` for `forbiddenDirectImports` + fail on hit. Consume `07-t0` authority as-is.

   Verification: `node Body/M/epi-theia/extensions/scripts/validate-extension-contract-preflight.mjs`; `node --test Body/M/epi-theia/extensions/test/validate-extension-contract-preflight.test.mjs`.

6. **11.6 — Acceptance-harness cross-layout state-identity preservation assertion** *(spec-ahead-integration)*

   Extend `acceptance-harness/tests/topology.test.mjs` with end-to-end assertion: toggling `daily-0-1` ↔ `ide-deep` with selected M3 codon + active session + profile generation preserves `(coordinate, lens, mode, profileGeneration, sessionKey, dayNow)` per `layout-types.ts:L7-12` kernel-bridge DI singleton contract.

   Verification: `pnpm --filter @pratibimba/acceptance-harness test`.

7. **11.7 — Spec-side stale `Tauri implementation` wording audit** *(doc-ahead-landing)*

   Audit `M'-SYSTEM-SPEC §Shell layer` L143 + `M'-TAURI-PORT-SPEC.md` for residual Tauri wording. Downgrade where substance still applies to Theia; retire where it does not. Parallel to M1 Tranche 02.1.

   Verification: `grep -rn "Tauri implementation\|tauri-side\|epi-tauri target" Idea/Bimba/Seeds/M/*.md` returns nothing not explicitly deprecated.

8. **11.8 — Integrated-plugin readiness gate against Wave-A profile-field pending markers** *(spec-ahead-integration; cross-link to Tranches 07.1, 08.1)*

   `plugin-integrated-1-2-3` + `plugin-integrated-4-5-0` each declare typed `IntegratedReadiness` blocked states consuming Wave-A pending-* markers (`klein_flip_state`, `resonance72`, `planetaryChakral`, `audio_octet`/`nodal_quartet`, cymatic field) via shared `integrated-composition` contract. Extension of existing package; no rebuild.

   Verification: `pnpm --filter @pratibimba/integrated-composition test`; `pnpm --filter @pratibimba/plugin-integrated-1-2-3 test`; `pnpm --filter @pratibimba/plugin-integrated-4-5-0 test`; fixture parity with kernel-bridge readiness ledger (Tranche 10.1).

9. **11.9 — Surface → extension → contract closure ledger** *(no-orphan-fill)*

   Single ledger JSON at `Body/M/epi-theia/extensions/contracts/surface-extension-contract-ledger.json` mapping every widget id in `pratibimba-layouts/src/common/layout-types.ts` to `(extension package, contract entry, status)`. Closes the shell-scope no-orphan audit (feeds Tranche 14).

   Verification: `node --test Body/M/epi-theia/extensions/test/surface-extension-contract-ledger.test.mjs` (new sibling validator) asserts every `expectedWidgets` id has owner or code-pending marker.

10. **11.10 — Theia canvas-as-input port for M4-Nara: Tiptap mount + Inversify HighlightService + HighlightMark port** *(spec-ahead-integration; first-build for canvas surface; cross-link Tracks 05.15, 05.19; full spec at `Idea/Bimba/Seeds/M/M4'/2026-06-04-prospective-retrospective-canvas-spec.md` §2.1, §2.2)*

    The canonical Nara app surface is `Body/M/epi-theia/extensions/m4-nara/` (the `Body/S/S3/epi-app/renderer/domains/M4_Nara/` Electron surface is retired genealogy). The current m4-nara extension is readiness-banner + DayContainer dl only — no canvas editor exists. **Port the canvas-as-input system** from the retired surface into Theia idiom: new `Body/M/epi-theia/extensions/m4-nara/src/browser/canvas-editor.tsx` mounting Tiptap inside a `ReactWidget`, bound to the day's NOW.md content via `readNaraDayContainer` and `SharedBridgeAdapter.onCoordinateContext`. Port the HighlightMark Tiptap extension to `src/browser/editor/extensions/highlight-mark.ts` preserving the `setHighlight | unsetHighlight | toggleHighlight | extractHighlights` interface. Port the FloatingMenu to `src/browser/editor/components/floating-menu.tsx`, triggered on text-selection; agent-action buttons dispatch via SharedBridgeAdapter rather than in-renderer. **Replace the Zustand HighlightsStore** with an Inversify-injected `HighlightService` at `src/browser/services/highlight-service.ts` (`@injectable()`, standard Theia `Emitter`/`Event` subscription pattern, `inscribeAgentMark(position, category, content, sourceFacet)` for agent inscriptions). Privacy-class flow-through on every artifact write — `PRIVACY_CLASS: 'protected_local'` from extension contract. The `NaraArtifactKind` `'agent-chat'` carries agent inscriptions (existing kind, no schema addition needed at this tranche).

    Verification: `pnpm -C Body/M/epi-theia/extensions/m4-nara build` clean; `test -f Body/M/epi-theia/extensions/m4-nara/src/browser/canvas-editor.tsx`; `test -f Body/M/epi-theia/extensions/m4-nara/src/browser/editor/extensions/highlight-mark.ts`; `test -f Body/M/epi-theia/extensions/m4-nara/src/browser/services/highlight-service.ts`; widget test asserts canvas mounts and user can toggle a `daily-note` highlight via the floating menu; privacy-class assertion test confirms no `extractHighlights` output enters `buildPublicProfilePayload` or `buildS2CanonicalProjection`.

11. **11.11 — Agent inscription highlight categories + visual register** *(spec-ahead-integration; depends on 11.10; cross-link Tracks 05.18, 12.18; full spec at `Idea/Bimba/Seeds/M/M4'/2026-06-04-prospective-retrospective-canvas-spec.md` §2.3)*

    Extend `Body/M/epi-theia/extensions/m4-nara/src/browser/editor/extensions/highlight-mark.ts` `HighlightCategory` enum with six **agent-side categories** in addition to the four ported user-side categories (`daily-note | oracle | dream | expand`): `recognition` (gold `#d4a574`, warm — card-position activated; kairos window landed), `prospective-surfacing` (rose `#e8a3a3`, warm forward — what is forming; agent's prospective inscription), `retrospective-surfacing` (slate `#8090a3`, cool back — what has gathered; re-entry block; daily briefing), `kairos-touch` (silver `#b8c0cc`, mercurial — transit aspect activation; planet station), `somatic-mark` (earth `#8a7355`, grounded — body-zone / chakra / element shift from M4-1), `live-spread` (purple-deep `#5b3a7e`, oracle-anchored — active spread-position reference). Add CSS rules in new sibling stylesheet `Body/M/epi-theia/extensions/m4-nara/style/highlights.css` (left-border + tint per category matching old surface visual convention). Agent categories enter via `HighlightService.inscribeAgentMark`; FloatingMenu exposes user-side only. Structural law: **agent inscriptions never replace or remove user content** — they are wrapped marks at specific positions with their own visual register, demarcating agent-vs-user authorship on the same continuous page. Extend portal-core `NaraActivityKind::Highlight` payload at `Body/S/S0/portal-core/src/events.rs:138` with `category: String`; add new variants `NaraActivityKind::FileReentry` and `NaraActivityKind::TrancheComplete` for the temporal cycle (Track 19.11). Extend `Body/S/S0/portal-core/tests/nara_journal_parser.rs::dream_oracle_and_highlight_inputs_remain_distinguished` test with the new agent categories.

    Verification: `pnpm -C Body/M/epi-theia/extensions/m4-nara build` clean; `cargo check -p portal-core`; `cargo test -p portal-core --test nara_journal_parser dream_oracle_and_highlight_inputs_remain_distinguished` passes with 10 categories; CSS contract test asserts each of the 10 categories has a defined visual rule; agent inscription end-to-end test inscribes a `prospective-surfacing` mark via `HighlightService.inscribeAgentMark` and confirms it renders with the correct visual register and does not collide with user-side content.

12. **11.12 — Ambient state strip + Tuning bar widgets on m4-nara surface** *(spec-ahead-integration; depends on 11.10, 11.11, 05.16, 05.19, 12.18; full spec at `Idea/Bimba/Seeds/M/M4'/2026-06-04-prospective-retrospective-canvas-spec.md` §2.4, §2.5)*

    Two new widgets mounted above the canvas in `M4NaraWidget`:

    (a) `Body/M/epi-theia/extensions/m4-nara/src/browser/widgets/ambient-state-strip.tsx` — ~32px informational strip, three sections left-to-right: **Klein weighting indicator** (horizontal bar split by `c_3_klein_weighting` from Janus, hover surfaces driving aspects), **somatic signature** (four element-glyphs Earth/Water/Air/Fire from the operative quartet under L2' canonical IDs from 5.16, sized by intensity from `medicine.rs balance()`; active chakra glyph from `ELEMENT_CHAKRA[dominant]` and decan ruling planet via `PLANET_CHAKRA`; hover surfaces decan, ruling planet, body zones), **live spreads chip** (count + state breakdown from `OracleSpreadPosition` table from 5.17; click expands side panel listing spreads with target aspects).

    (b) `Body/M/epi-theia/extensions/m4-nara/src/browser/widgets/tuning-bar.tsx` — ~24px persistent control bar with three controls bound to NOW frontmatter keys from 5.19: **tranche mode** segmented control, **response orbit** dropdown, **sense override** slider pair (defaults from Janus weighting; user override persists for session). Each change writes via SharedBridgeAdapter call to Khora `khora_write`. Keyboard shortcuts registered in `frontend-module.ts`.

    The strips do not occupy the writing surface. They surface the structural state at a glance and tune the temporal contemplative function as first-class controls. Compose with `M4NaraWidget` above the existing `ReadinessBanner`.

    Verification: `pnpm -C Body/M/epi-theia/extensions/m4-nara build` clean; widget tests render ambient strip with synthetic `c_3_klein_weighting` and ElementalBalance fixture (asserts L2' canonical element ordering); tuning bar test writes through to NOW frontmatter via SharedBridgeAdapter mock; keyboard shortcut registration test passes; visual-regression fixture (cross-link Tranche 15.12) captures the ambient strip + tuning bar over the canvas as a single composite shot.
