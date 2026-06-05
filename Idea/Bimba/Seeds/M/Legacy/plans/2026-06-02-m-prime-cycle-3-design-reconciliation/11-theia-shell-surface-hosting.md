# Track 11 — Theia Shell / Surface Hosting

Closure of the shell that hosts the six M' surfaces + two integrated plugins. The substrate is largely **ALIGNED at presence level**: all six M-extensions (`m0-anuttara`..`m5-epii`), both integrated plugins (`plugin-integrated-1-2-3`, `plugin-integrated-4-5-0`), both contract preflights (`07-t0` individual + `08-t0` composition), `kernel-bridge` + `kernel-bridge-readiness`, `omnipanel-shell`, `pratibimba-layouts`, `ide-shell-m0-m5` (with all 8 named widgets + `bridge-gate`), `agentic-control-room`, `body-lite-surface`, `acceptance-harness`, `m-extension-runtime`, and `integrated-composition` are landed packages. `CrossLayoutIntent` envelope is typed; `OMNIPANEL_TABS.availableInLayouts` is typed. `epi-tauri`-as-deprecated standing invariant is honored at substrate level.

## Source Specs and Matrix

- Canonical: `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md` (shell separation invariant §`Shell layer` L91-148), `Idea/Bimba/Seeds/M/M'-PORTAL-SPEC.md`
- Substrate: `Body/M/epi-theia/extensions/{pratibimba-layouts,omnipanel-shell,ide-shell-m0-m5,kernel-bridge,kernel-bridge-readiness,acceptance-harness,m-extension-runtime,integrated-composition,contracts}`
- Full row-level evidence: `plan.runs/wave-b-theia-shell-matrix.md`

## Cycle 2 Substrate Inheritance

Consume as-is — all six M-extensions + two integrated plugins + both contract preflights + `kernel-bridge` mirror + `omnipanel-shell` widget + `pratibimba-layouts` with `daily-0-1` and `ide-deep` descriptors + `ide-shell-m0-m5` chrome + `acceptance-harness` + `m-extension-runtime` + `integrated-composition`. `Body/M/epi-tauri` is deprecated migration-source only per `MIGRATION-SOURCES.md`. Cycle 2 Track 01 owned the Electron/Theia shell + OmniPanel; cycle 3 closes the shell separation invariant decision and acceptance-harness contracts.

## Tranches

1. **11.1 — Shell-0/Shell-1/4+2/`/` separation reading (clarification, not contradiction)** *(doc-ahead-landing; DR-TS-1 VALIDATED)*

   Spec is already counting it out cleanly: layout is `0/1` (one shell with a 0-cosmic side and a 1-personal side) + `4+2` (six depth layers) + `/` (OmniPanel operator membrane). Code's two layouts (`daily-0-1` for the 0/1 shell, `ide-deep` for the 4+2 depth) ARE the two surfaces. The 0/1 toggle is the side-switch within `daily-0-1` — `(0/1)` IS `#` applied to user context, same state seen from opposite faces. No third layout, no separate toggle-widget extension (unless wanted as UI polish). Cross-links DR-M4-2 clause 5 (0 cosmic / 1 personal — same polarity all the way down).

   Verification: `pnpm --filter @pratibimba/pratibimba-layouts test` passes against current substrate; `daily-0-1` widget contributions partition cleanly into 0-side / 1-side renderings; spec patched to note the structural reading so the next reader doesn't re-litigate.

2. **11.2 — Cross-layout intent routing T5 promotion** *(spec-ahead-integration)*

   Wire each of the six M-extensions to consume `CrossLayoutIntent.requestedExtensionId` + `requestedContributionId`. Wire `OMNIPANEL_TABS.availableInLayouts` filter against `epi-logos.layout.active` preference. Extend, no rebuild.

   Verification: `pnpm --filter @pratibimba/omnipanel-shell test`; `pnpm --filter @pratibimba/pratibimba-layouts test`; integration test in `acceptance-harness` "OmniPanel intent → daily-0-1 → ide-deep with M3 codon preserved".

3. **11.3 — Daily-layer widget ownership trace + ORPHAN closure** *(no-orphan-fill)*

   Trace `pratibimba.daily.{journal, agent-checkin, cymatic-placeholder, status-display}` (declared in `layout-types.ts:L52-58`) to either `body-lite-surface` contributions (rename/align) or a named owning extension. If no owner, either downgrade layout claim (remove from `expectedWidgets`) or land a `pratibimba-daily-widgets` extension (first-build allowed: no current owner of the named M' product surfaces).

   Verification: Extension presence at `Body/M/epi-theia/extensions/<owner>/`; `validate-extension-contract-preflight.test.mjs` extended with `expectedWidgets` ↔ contributor mapping; `pnpm --filter @pratibimba/body-lite-surface test`.

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
