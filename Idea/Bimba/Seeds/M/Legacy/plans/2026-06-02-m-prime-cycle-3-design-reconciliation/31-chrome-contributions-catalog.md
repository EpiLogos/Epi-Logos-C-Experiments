# Track 31 — Theia Chrome Contributions Catalog

<!-- carrier-retarget-banner v1 -->
> ⚑ **RETARGET — cycle-3 full rerun.** This file is the design-recon **SOURCE** (the tranche brief the rerun stubs send you to). Every `Body/M/epi-theia/…` path below is **FROZEN reference only**. **Build / verify target = `Body/M/pratibimba-app`** (the carrier) **+ substrate crates** (`epi-lib` / `portal-core` / `epi-cli` / `graph-*` / gateway — these carry unchanged). Any Verify line that names `epi-theia` (e.g. `cd Body/M/epi-theia && pnpm --filter …build`) is **retargeted**: run the **pratibimba-app carrier equivalent** (or the substrate crate's own runner), **never** the epi-theia build. Law: [`CHARTER.md`](../2026-07-03-m-prime-cycle-3-full-rerun/CHARTER.md) §13–18 · single-source map [`carrier-contract.json`](../2026-07-03-m-prime-cycle-3-full-rerun/carrier-contract.json) · per-track CARRIER: [recapture register](../../../plans/2026-07-03-cycle-3-recapture-register.md) §2.


Closes the cross-cutting Theia chrome contribution catalog. Stage 1 per-Mn frontend tranches (21–26) scattered specific chrome contributions across the substrate: M0 mode toggles, M1 face-mode preference + developer-mode gating, M2 dev-mode proof toggle, M3 cosmic-clock cast command, M4 `cmd-shift-D` day-calendar + `cmd-shift-T` time-axis chord + Journal Entries / Personal Coordinate activity-bar modes, M5 review queue + recognition-layer slot intent target. Tracks 11 and 15 ratified the chrome conventions — `cmd-period` 0/1 toggle (15.5), status-bar discipline of exactly six state-thread entries (15.10), left-sidebar activity-bar discipline (15.3, 15-foundation principle 7), no-modal review surface (15.2), composition over juxtaposition (15.4), Theia conventions where they fit (15-foundation principle 8). What none of those tracks owns is the **chrome catalog** — the consolidated audit + lint that ensures every contribution has an owner, no chord collides with another, status-bar count never drifts above six, and modal calls never leak into review/evidence/gate-landing code paths. Track 31 closes that gap.

The substrate already lands two `StatusBarContribution` instances (`pratibimba.layout.indicator` in `pratibimba-layouts/src/browser/layout-status-bar.ts`; `pratibimba.kernel-bridge.status` in `kernel-bridge/src/browser/kernel-bridge-status-bar.ts`), six `AbstractViewContribution` + `CommandContribution` instances (one per Mn extension; each registers `${EXTENSION_ID}: open primary view` + `.readOnly` + `.depositOnly` + `${EXTENSION_ID}.handleRoute` commands + at least one `registerIntentTarget` call), one `MenuContribution` (the `Pratibimba` top-level menu with `1_layouts` and `2_intents` submenus in `pratibimba-layouts/src/browser/layout-commands.ts`), and one `CommandContribution` per the body-lite-surface deep-link family. NO `KeybindingContribution` instances are currently registered anywhere in the substrate; the `cmd-period` chord named in 15.5, the `cmd-shift-D` / `cmd-shift-T` chords named in 25.1 / 25.16, and the per-Mn `cmd-shift-{0..5}` chords this track introduces are all SPEC-AHEAD until stage 2. NO `PreferenceContribution` instances are currently registered; the `epi-logos.layout.active`, `epi-logos.ui.developerMode`, `epi-logos.kairos.enabled`, `epiLogos.m2Parashakti.devMode`, `epi-logos.m1.vortex.faceMode` keys named in stage-1 tranches are referenced without a declaring contribution. NO BreadcrumbsContribution is registered (Theia's pattern `@theia/core/lib/browser/breadcrumbs/breadcrumbs-contribution` is available but unconsumed).

Track 31 lifts the typed-and-not-catalogued into ONE chrome contributions ledger artifact, four sibling validators that lint the ledger, ten in-package chrome contributions that land the missing platform conventions (six state-thread status-bar entries, cmd-period + per-Mn keybindings, Epi-Logos top-level menu, coordinate breadcrumbs, per-extension preference namespaces, intent-target registration catalogue), and four doc-ahead policy contracts (shell-slot-policy, chrome-action-surface-policy, no-modal discipline, status-bar discipline). Every contribution either consumes a Theia platform convention (`CommandContribution`, `KeybindingContribution`, `MenuContribution`, `StatusBarContribution`, `PreferenceContribution`, `BreadcrumbsContribution`, `ApplicationShell` slots, `TabBarToolbarContribution`) or extends a landed per-extension `frontend-module.ts`. No greenfield chrome shell, no parallel widget shell, no competing menu bar — only the catalog the substrate has been silently honouring (or quietly drifting from).

## Source Specs and Matrix

- Foundation contracts: [`15-ui-design-foundations.md`](15-ui-design-foundations.md) — §15.3 (activity-bar system), §15.5 (cmd-period chord), §15.10 (status bar discipline); foundation principles 1, 2, 5, 6, 7, 8.
- Shell hosting: [`11-theia-shell-surface-hosting.md`](11-theia-shell-surface-hosting.md) — §11.2 (cross-layout intent), §11.5 (forbidden-direct-import lint validator pattern), §11.9 (ledger artifact pattern), §11.10–11.12 (M4 canvas chrome).
- Per-Mn frontend deep: [`21-m0-anuttara-frontend-deep.md`](21-m0-anuttara-frontend-deep.md), [`22-m1-paramasiva-frontend-deep.md`](22-m1-paramasiva-frontend-deep.md), [`23-m2-parashakti-frontend-deep.md`](23-m2-parashakti-frontend-deep.md), [`24-m3-mahamaya-frontend-deep.md`](24-m3-mahamaya-frontend-deep.md), [`25-m4-nara-frontend-deep.md`](25-m4-nara-frontend-deep.md), [`26-m5-epii-frontend-deep.md`](26-m5-epii-frontend-deep.md).
- Contemplation surface: [`19-contemplation-surface-integration.md`](19-contemplation-surface-integration.md).
- Substrate command convention: `Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.{md,json}` (six-extension `mN.openX` commands + `.readOnly` + `.depositOnly` reservations; route scheme `epi-logos://ide/<extension>/<surface>?...`).
- Substrate frontend-modules: `Body/M/epi-theia/extensions/{m0-anuttara,m1-paramasiva,m2-parashakti,m3-mahamaya,m4-nara,m5-epii}/src/browser/frontend-module.ts`.
- Substrate status-bar entries: `Body/M/epi-theia/extensions/kernel-bridge/src/browser/kernel-bridge-status-bar.ts`; `Body/M/epi-theia/extensions/pratibimba-layouts/src/browser/layout-status-bar.ts`.
- Substrate menu contributions: `Body/M/epi-theia/extensions/pratibimba-layouts/src/browser/layout-commands.ts`.
- Substrate body-lite deep-link commands: `Body/M/epi-theia/extensions/body-lite-surface/src/browser/deep-link-commands.ts`.
- Substrate validators: `Body/M/epi-theia/extensions/scripts/validate-extension-contract-preflight.mjs`; `Body/M/epi-theia/extensions/test/validate-extension-contract-preflight.test.mjs`.
- Full row-level matrix: [`plan.runs/wave-c-chrome-contributions-matrix.md`](plan.runs/wave-c-chrome-contributions-matrix.md).

## Cycle 2 Substrate Inheritance

Consume as-is —

- Theia platform conventions: `AbstractViewContribution` (six per-Mn view contributions), `CommandContribution` + `CommandRegistry` (every Mn extension), `KeybindingContribution` + `KeybindingRegistry` (Theia core, currently unused by epi-theia substrate), `MenuContribution` + `MenuModelRegistry` + `MAIN_MENU_BAR` (consumed by `pratibimba-layouts/src/browser/layout-commands.ts`), `StatusBar` + `StatusBarAlignment` + `FrontendApplicationContribution` (consumed by `kernel-bridge-status-bar.ts` + `layout-status-bar.ts`), `PreferenceContribution` + `PreferenceService` (Theia core, referenced but unconsumed by stage-1 tranches), `BreadcrumbsContribution` (Theia core, unconsumed), `TabBarToolbarContribution` (Theia core, unconsumed), `ApplicationShell` widget areas (`widget.application-shell-{main,left,right,bottom-area,top-area,status-bar}`).
- `Body/M/epi-theia/extensions/{m0-anuttara..m5-epii}/src/browser/frontend-module.ts` — six per-Mn `AbstractViewContribution` + `CommandContribution` implementations each declaring `OPEN_COMMAND_ID`, `READ_ONLY_COMMAND_ID`, `DEPOSIT_ONLY_COMMAND_ID`, `${EXTENSION_ID}.handleRoute` commands + one or more `registerIntentTarget` calls (`m5-epii` registers `review` + `evidence-deposit`; analogous patterns extend per stage 1 tranches).
- `Body/M/epi-theia/extensions/pratibimba-layouts/src/browser/layout-commands.ts` — `PratibimbaLayoutCommandContribution` declaring `SWITCH_TO_DAILY` / `SWITCH_TO_IDE_DEEP` / `TOGGLE_LAYOUT` commands; `PRATIBIMBA_MENU = [...MAIN_MENU_BAR, '5_pratibimba']` with `1_layouts` + `2_intents` submenu groups.
- `Body/M/epi-theia/extensions/pratibimba-layouts/src/browser/layout-status-bar.ts` — `pratibimba.layout.indicator` status-bar entry, priority 220, `StatusBarAlignment.LEFT`, command `TOGGLE_LAYOUT`.
- `Body/M/epi-theia/extensions/kernel-bridge/src/browser/kernel-bridge-status-bar.ts` — `pratibimba.kernel-bridge.status` status-bar entry, priority 200, `StatusBarAlignment.LEFT`, no command (display only).
- `Body/M/epi-theia/extensions/body-lite-surface/src/browser/deep-link-commands.ts` — `BodyDeepLinkCommandContribution` registering `OPEN_CONTROL_ROOM`, `OPEN_REVIEW_ITEM`, `OPEN_GRAPH_NODE`, `START_PROTECTED_ENTRY` commands.
- `Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.{md,json}` — six-extension widget id manifest, the canonical `mN.openX` command convention, the route scheme `epi-logos://ide/<extension>/<surface>?...`.
- `Body/M/epi-theia/extensions/contracts/surface-extension-contract-ledger.json` (Tranche 11.9 ledger pattern) — the ledger format Track 31's chrome ledger follows.
- `Body/M/epi-theia/extensions/scripts/validate-extension-contract-preflight.mjs` — the validator script pattern Track 31's four chrome validators follow.

Audit/verify —

- Forbidden-direct-import lint (11.5) — the existing `forbiddenDirectImports` enforcement against `Body/S/S0`/`Body/S/S2`/`Body/S/S3`/`Body/S/S5`/`neo4j-driver` is extended by 31.8 with a chrome-specific forbidden-import rule (no `MessageBox.show` / `OpenDialog` / modal `Dialog.show` from review / evidence / gate-landing code paths).
- Status-bar count discipline (15.10) — current substrate has TWO status-bar contributions (layout-indicator + kernel-bridge.status); the six state-thread entries named in 15.10 are unimplemented. 31.1 lands the six; the kernel-bridge.status entry collapses into the gateway-readiness state-thread entry (one-to-one identity, no orphan); the layout-indicator is moved to `StatusBarAlignment.RIGHT` (navigation chip, not state-thread entry) per DR-WC-CC-1.
- Chord conflict freshness (15.5) — `cmd-period` is the 0/1 toggle (binding); it overrides the Theia default "Quick Fix" binding within the Epi-Logos profile. 31.3 declares the override; `epi-logos.keymap.preserveTheiaDefaults` preference (default `false`) downgrades cmd-period to `cmd-shift-zero` for users who need Quick Fix on the default chord.

Extend existing — every per-Mn `frontend-module.ts` extended with the new keybindings + intent targets + per-extension preference namespace + activity-bar mode contributions. `pratibimba-layouts/src/browser/layout-commands.ts` extended with the cmd-period chord registration. `kernel-bridge/src/browser/kernel-bridge-status-bar.ts` renamed and folded into the `gateway-readiness` state-thread entry. New shared file `m-extension-runtime/src/browser/preferences/epi-logos-preferences.ts` declares cross-cutting preferences.

First-builds against unowned chrome surfaces — six state-thread status-bar entries (CC-01); Epi-Logos top-level menu (CC-05); coordinate breadcrumbs (CC-06); shell-slot-policy contract (CC-07); chrome-action-surface-policy contract (CC-11); chrome-contributions-catalog ledger (CC-12); four sibling validators (CC-13). Each first-build either resolves a no-orphan-fill candidate (CC-01, CC-02, CC-04, CC-10, CC-12) or lands an unowned chrome surface named in 15-foundation principles 1, 5, 7, 8.

## Catalog Contracts

Before tranches: what the chrome catalog IS at substrate level after Track 31 lands. Treat these as binding contracts every tranche must honour.

**(CCT-1) Six state-thread status-bar entries, no more, no fewer.** Exactly six `StatusBarContribution` instances in `StatusBarAlignment.LEFT` with priority bands `190` (active-coordinate, leftmost) → `180` (profile-tick) → `170` (profile-generation) → `160` (day-now) → `150` (session-id) → `140` (gateway-readiness). The layout-indicator and any future navigation chips are `StatusBarAlignment.RIGHT`. NO widget reads day-now / session id / profile-tick except via the status-bar state thread (15.10 binding). Lint asserts exactly six LEFT-aligned state-thread entries by id-prefix `pratibimba.state-thread.*`.

**(CCT-2) Cmd-period is the 0/1 toggle.** `cmd-period` (15.5) is the chord for `pratibimba.layout.toggle`. It overrides Theia's default Quick Fix chord within the Epi-Logos profile. `epi-logos.keymap.preserveTheiaDefaults` preference (default `false`) allows users to opt-out; when `true`, cmd-period reverts to Quick Fix and `cmd-shift-zero` becomes the 0/1 toggle. The chord conflict validator (31.13) enforces uniqueness across the catalog.

**(CCT-3) Per-Mn deep-widget chord grammar.** `cmd-shift-0` opens M0-anuttara reader; `cmd-shift-1` opens M1-paramasiva instrument; `cmd-shift-2` opens M2-parashakti cymatic engine; `cmd-shift-3` opens M3-mahamaya wheel; `cmd-shift-4` opens M4-nara journal; `cmd-shift-5` opens M5-epii atelier. Each chord triggers the corresponding extension's `OPEN_COMMAND_ID`. Cross-Mn chord overlap is prohibited; chord-conflict lint asserts.

**(CCT-4) OmniPanel tab chord grammar.** `cmd-1` through `cmd-8` activate OmniPanel tabs (Pi Chat / Sessions / Dispatch Trace / Tool Stream / Evidence / Review / Gateway / Diagnostics) in declared order. When the active layout is `daily-0-1`, tabs not in `availableInLayouts` are unbound; the chord no-ops. Cross-layout-intent shortcut: `cmd-shift-L` dispatches the active `CrossLayoutIntent` envelope.

**(CCT-5) Canvas highlight chord grammar.** `cmd-h` prefix + category-letter activates one of the ten highlight categories (per 11.11): `cmd-h-d` daily-note, `cmd-h-o` oracle, `cmd-h-r` recognition, `cmd-h-p` prospective-surfacing, `cmd-h-s` retrospective-surfacing (s for slate), `cmd-h-k` kairos-touch, `cmd-h-b` somatic-mark (b for body), `cmd-h-l` live-spread (l for live), `cmd-h-e` expand (e for expand), `cmd-h-m` dream (m for moon). User-side chords (`d`, `o`, `e`, `m`) are bound via FloatingMenu (11.10); agent-side chords (`r`, `p`, `s`, `k`, `b`, `l`) are read-only chord references — they do NOT fire from user input, only display the chord in the FloatingMenu tooltip when an agent inscribes the category.

**(CCT-6) Activity-bar modes ledger.** Daily-0-1 cosmic-side: Coordinate Tree (`ide-shell-m0-m5`), Bimba Graph Viewer (`ide-shell-m0-m5`), Canon Studio (`ide-shell-m0-m5`). Daily-0-1 personal-side: Day Calendar (`m4-nara`, per 25.1), Journal Entries (`m4-nara`, per 25.3), Personal Coordinate (`m4-nara`, per 25.7). Ide-deep additional: Backend Studio (`ide-shell-m0-m5`, gated per 11.4 + 22.21), Smart Connections (`smart-connections-sidebar` extension, code-pending per 11.4). NO mode appears in both layouts AND owns a different widget across them; per-mode `(modeId, ownerExtension, layoutScope, widgetId, iconRef)` ledger entry asserts.

**(CCT-7) Application-shell slot policy.** Left sidebar = activity-bar-switched (NOT stacked); only ide-shell-m0-m5 + m4-nara + smart-connections-sidebar contribute. Right sidebar = OmniPanel only (`omnipanel-shell` exclusive owner). Bottom pane = per-layout: `daily-0-1` carries cosmic-status + readiness-ledger + day-now-anchor (`pratibimba-layouts` + `kernel-bridge-readiness` + `body-lite-surface`); `ide-deep` carries evidence + review + autoresearch + kernel-bridge-readiness (`ide-shell-m0-m5` + `kernel-bridge-readiness`). Editor area = composition slots (15.4): cosmic 1-2-3 composes M1 K² + M2 cymatic + M3 codon-rotation; personal 4-5-0 composes M4 journal + personal cymatic + M3 recognition layer. Extensions contributing to forbidden slots fail preflight via 31.7 validator.

**(CCT-8) No-modal discipline.** `MessageBox.show`, `OpenDialog`, modal `Dialog.show`, `ConfirmDialog.show` are PROHIBITED in code paths tagged review / evidence / gate-landing (file path under `*/review/*`, `*/evidence/*`, `*/gate-landing/*`, or carrying comment marker `// @epi-logos:context=review`). 31.8 lint asserts. Per 15.2: Review tab IS the landing surface.

**(CCT-9) Preference namespace convention.** Per-extension preferences live in `epi-logos.{extension}.*` (e.g. `epi-logos.m1.vortex.faceMode`, `epi-logos.m2.devMode`). Cross-cutting preferences live in `epi-logos.{layout,profile,privacy,kairos,motion,ui,keymap}.*`. Stage 1 references the unprefixed `epiLogos.m2Parashakti.devMode` in 23.4; Track 31 normalises to `epi-logos.m2.devMode` and updates 23.4 cross-link by note.

**(CCT-10) Epi-Logos top-level menu.** New top-level menu at `MAIN_MENU_BAR + '3_epi_logos'` with four submenus: `1_cosmic` (M0–M3 quick-access), `2_personal` (M4–M5 + day calendar), `3_compose` (1-2-3 / 4-5-0 plugins), `4_diagnostics` (gateway + readiness + profile + status-bar quick-jumps). Coexists with the existing `Pratibimba` top-level menu at `5_pratibimba`. DR-WC-CC-3 ratifies the two-top-level-menu split.

**(CCT-11) Coordinate breadcrumbs.** Active coordinate visible as breadcrumb at the top of the editor area. Format: family → archetype → position (e.g. `M4 / Nara / DayContainer`). Click any segment dispatches `omnipanel.intent.dispatch` with the reduced coordinate. Per-Mn 72-fold (23.7) and decan-chain (24.7) breadcrumbs are WIDGET-INTERNAL (not in the top breadcrumb bar) and remain owned by their respective extensions.

**(CCT-12) Chrome contributions ledger.** ONE ledger artifact at `Body/M/epi-theia/extensions/contracts/chrome-contributions-catalog.json` maps every contribution to `(id, owningExtension, type, scope, declaringTranche)`. Sections: `statusBarEntries`, `commands`, `keybindings`, `menuItems`, `activityBarModes`, `preferences`, `breadcrumbProviders`, `intentTargets`, `slotPolicy`. 31.13 validators assert no orphans, no duplicates, no chord conflicts, exactly six state-thread status-bar entries.

## Tranches

1. **31.1 — Status bar entries catalog (exactly six state-thread entries)** *(spec-ahead-integration; closes CC-01, DR-WC-CC-1)*

   Source rows: CC-01 + 15.10.

   Land six `StatusBarContribution` instances in `Body/M/epi-theia/extensions/m-extension-runtime/src/browser/status-bar/`:
   - `active-coordinate-status-entry.ts` — id `pratibimba.state-thread.active-coordinate`, priority 190, LEFT-aligned, consumes `SharedBridgeAdapter.onCoordinateContext`, command `pratibimba.state-thread.jump-to-coordinate` (opens coordinate-tree at active coordinate). Tooltip: full coordinate path + family + archetype + position.
   - `profile-tick-status-entry.ts` — id `pratibimba.state-thread.profile-tick`, priority 180, LEFT-aligned, consumes `SharedBridgeAdapter.onProfile`, displays `tick12 / position6 / Ananda_Matrix_Op` triplet, click toggles `epi-logos.profile.tick.visible` preference. Tooltip: profile generation + last-tick timestamp + slerp phase.
   - `profile-generation-status-entry.ts` — id `pratibimba.state-thread.profile-generation`, priority 170, LEFT-aligned, consumes `SharedBridgeAdapter.onProfile`, displays `gen: {n}` monospaced numeric. Click opens Diagnostics OmniPanel tab.
   - `day-now-status-entry.ts` — id `pratibimba.state-thread.day-now`, priority 160, LEFT-aligned, consumes `SharedBridgeAdapter.onCoordinateContext.dayNow`, displays `DD-MM` short date. Tooltip: full day-id, vault path `Idea/Empty/Present/{YYYY}/{MM}/W{WW}/{DD}/`, click dispatches `m4.openArtifact` for active day's NOW.md (or no-op if no active session). Per DR-WC-CC-1: this is THE day-now anchor; no widget owns it.
   - `session-id-status-entry.ts` — id `pratibimba.state-thread.session-id`, priority 150, LEFT-aligned, consumes `SharedBridgeAdapter.onCoordinateContext.sessionKey`, displays session id short prefix (8 chars). Click opens Sessions OmniPanel tab. Per DR-WC-CC-1: this is THE session id; no widget owns it.
   - `gateway-readiness-status-entry.ts` — id `pratibimba.state-thread.gateway-readiness`, priority 140, LEFT-aligned, consumes `KernelBridgeAPI.onConnectionChange`, displays connection-state icon + `gateway`. Replaces the existing `pratibimba.kernel-bridge.status` entry (one-to-one collapse; the existing `kernel-bridge-status-bar.ts` is renamed to `gateway-readiness-status-entry.ts` and moved to `m-extension-runtime/src/browser/status-bar/` — substrate-residency vs conceptual-coordinate distinction honoured).

   The existing `pratibimba.layout.indicator` (layout-status-bar.ts) is RETAINED but moved to `StatusBarAlignment.RIGHT` with priority 100 (navigation chip, not state-thread entry); 31.13 validator distinguishes LEFT state-thread entries from RIGHT navigation chips by id-prefix `pratibimba.state-thread.*` (state-thread, exactly six) vs `pratibimba.nav.*` (navigation, any count).

   Each entry has a stable `data-pratibimba-state-thread` DOM attribute for headless test inspection (mirroring the existing layout-indicator pattern).

   Verification:
   - `test -d Body/M/epi-theia/extensions/m-extension-runtime/src/browser/status-bar`
   - `test -f Body/M/epi-theia/extensions/m-extension-runtime/src/browser/status-bar/active-coordinate-status-entry.ts`
   - `test -f Body/M/epi-theia/extensions/m-extension-runtime/src/browser/status-bar/profile-tick-status-entry.ts`
   - `test -f Body/M/epi-theia/extensions/m-extension-runtime/src/browser/status-bar/profile-generation-status-entry.ts`
   - `test -f Body/M/epi-theia/extensions/m-extension-runtime/src/browser/status-bar/day-now-status-entry.ts`
   - `test -f Body/M/epi-theia/extensions/m-extension-runtime/src/browser/status-bar/session-id-status-entry.ts`
   - `test -f Body/M/epi-theia/extensions/m-extension-runtime/src/browser/status-bar/gateway-readiness-status-entry.ts`
   - `grep -nE "pratibimba\.state-thread\.(active-coordinate|profile-tick|profile-generation|day-now|session-id|gateway-readiness)" Body/M/epi-theia/extensions/m-extension-runtime/src/browser/status-bar/` returns exactly six unique ids
   - `grep -cE "StatusBarContribution|FrontendApplicationContribution" Body/M/epi-theia/extensions/m-extension-runtime/src/browser/status-bar/*.ts` returns ≥ 6
   - layout-indicator alignment test asserts `pratibimba.layout.indicator` uses `StatusBarAlignment.RIGHT` after the move
   - `pnpm --filter @pratibimba/m-extension-runtime test`
   - `node --test Body/M/epi-theia/extensions/test/validate-status-bar-discipline.test.mjs` (lands in 31.13)

2. **31.2 — Command palette catalog per extension** *(no-orphan-fill; closes CC-02)*

   Source rows: CC-02 + 07-t0 command convention.

   Sweep every CommandContribution declaration across stage-1 wave-C tranches; catalog into ledger format `(command_id, label, category, owning_extension, when_clause, declaring_tranche)`. Per-extension extensions to `frontend-module.ts` (already-landed pattern) for every stage-1 command. Canonical commands by extension:

   - **m0-anuttara** (`EXTENSION_ID = 'm0-anuttara'`): `OPEN_COMMAND_ID` + `READ_ONLY_COMMAND_ID` + `DEPOSIT_ONLY_COMMAND_ID` + `${EXTENSION_ID}.handleRoute` (landed); plus 21.1 `m0-anuttara.layer-selector.activate`, 21.7 `m0-anuttara.implicate-explicate.toggle`, 21.9 `m0-anuttara.contemplation.submit`, 21.10 `m0-anuttara.virtue-witness.refresh`, 21.11 `m0-anuttara.symbolic-question.submit`, 21.12 `m0-anuttara.mode.toggle`, 21.19 `m0-anuttara.cross-layout-intent.dispatch`.
   - **m1-paramasiva** (`EXTENSION_ID = 'm1-paramasiva'`): landed quartet + 22.6 `m1-paramasiva.mersenne-proof.reveal`, 22.7 `m1-paramasiva.vortex.face-mode.toggle`, 22.8 `m1-paramasiva.K2-instrument.focus`, 22.9 `m1-paramasiva.coordinate-tree.contribute`.
   - **m2-parashakti** (`EXTENSION_ID = 'm2-parashakti'`): landed quartet + 23.2 `m2-parashakti.cymatic.view-switch`, 23.4 `m2-parashakti.proof-identity.toggle`, 23.7 `m2-parashakti.breadcrumb.address72`, 23.8 `m2-parashakti.outer-planet.toggle`.
   - **m3-mahamaya** (`EXTENSION_ID = 'm3-mahamaya'`): landed quartet + 24.1 `m3-mahamaya.cosmic-clock.open`, 24.2 `m3-mahamaya.tarot.draw`, 24.3 `m3-mahamaya.iching.cast`, 24.7 `m3-mahamaya.decan-chain.lookup`, 24.8 `m3-mahamaya.hexagram-body.open`, 24.9 `m3-mahamaya.quintessence.display`.
   - **m4-nara** (`EXTENSION_ID = 'm4-nara'`): landed quartet (`m4.openArtifact`) + 25.1 `m4-nara.day-calendar.focus` (chord `cmd-shift-D`), 25.4 `m4-nara.pasu-identity.open`, 25.5 `m4-nara.quintessence.display`, 25.6 `m4-nara.personal-cymatic.focus`, 25.8 `m4-nara.oracle.cast` (composite I-Ching + Tarot), 25.9 `m4-nara.oracle.history.open`, 25.10 `m4-nara.medicine.focus`, 25.11 `m4-nara.transform.open` (containers Bohm / Talking Circle / Diamond), 25.12 `m4-nara.lens.apply`, 25.13 `m4-nara.logos.stage-advance`, 25.14 `m4-nara.pratibimba.consent-gate`, 25.15 `m4-nara.kairos.refresh`, 25.16 `m4-nara.time-axis.cycle` (chord `cmd-shift-T`).
   - **m5-epii** (`EXTENSION_ID = 'm5-epii'`): landed quartet (`m5.openReview`) + 26.2 `m5-epii.capacity-tree.focus`, 26.5 `m5-epii.mobius-pass-ribbon.open`, 26.7 `m5-epii.contemplation-object.open`, 26.11 `m5-epii.recognition-layer.focus`, 26.13 `m5-epii.iod-17-parity.refresh`, 26.14 `m5-epii.pi-axiom-translation.open`.

   Cross-cutting commands (registered in `m-extension-runtime` or `pratibimba-layouts`): `pratibimba.layout.toggle` (landed), `pratibimba.layout.switch-to-daily` (landed), `pratibimba.layout.switch-to-ide-deep` (landed), `pratibimba.state-thread.jump-to-coordinate` (new — 31.1), `pratibimba.cross-layout-intent.dispatch` (T5 promotion — 11.2), `omnipanel.intent.dispatch` (existing, OmniPanel-side dispatcher).

   Per-extension `frontend-module.ts` extended with new commands following the landed pattern (one `commands.registerCommand(...)` block per command). NO direct kernel-side / gateway-side / graph-driver imports — every command dispatches via `SharedBridgeAdapter`.

   Verification:
   - `grep -rnE "registerCommand\\(.*m[0-5]-(anuttara|paramasiva|parashakti|mahamaya|nara|epii)" Body/M/epi-theia/extensions/{m0-anuttara,m1-paramasiva,m2-parashakti,m3-mahamaya,m4-nara,m5-epii}/src/browser/frontend-module.ts` returns ≥ 60 hits
   - command-id uniqueness test asserts no command id appears in two extensions' `registerCommand` calls
   - chrome-contributions-catalog.json (31.12) `commands` section enumerates all ~60+ command ids with `(owningExtension, declaringTranche)` per entry
   - `node --test Body/M/epi-theia/extensions/test/validate-chrome-contributions-catalog.test.mjs` (lands in 31.13) asserts command catalog completeness vs frontend-module.ts scan

3. **31.3 — Keybinding chord grammar** *(spec-ahead-integration; closes CC-03, CCT-2, CCT-3, CCT-4, CCT-5, DR-WC-CC-2; resolves 15.5)*

   Source rows: CC-03 + 15.5 + 25.1 + 25.16 + 11.10/11.11 + DR-WC-CC-2.

   Land `KeybindingContribution` instances per extension. NO `KeybindingContribution` is currently registered in the substrate; 31.3 introduces six (one per Mn extension) + one (`pratibimba-layouts`) + one (`omnipanel-shell`).

   Per-extension `frontend-module.ts` extended with `implements KeybindingContribution` and `registerKeybindings(keybindings: KeybindingRegistry): void` method:

   - **pratibimba-layouts** — `cmd+.` (Linux/Win: `ctrl+.`) → `pratibimba.layout.toggle` (15.5 cmd-period 0/1 toggle); `cmd+shift+L` → `pratibimba.cross-layout-intent.dispatch`. Override: `keybindings.unregisterKeybinding('cmd+.')` removes the Theia default Quick Fix binding, gated on `epi-logos.keymap.preserveTheiaDefaults === false`. When the preference is `true`, the override is skipped and `cmd+shift+0` becomes the 0/1 toggle instead.
   - **m0-anuttara** — `cmd+shift+0` → `m0-anuttara.openCoordinate` (cmd-shift-{0..5} per CCT-3); `cmd+shift+I` → `m0-anuttara.implicate-explicate.toggle`; `cmd+shift+M` → `m0-anuttara.mode.toggle` (reading/authoring).
   - **m1-paramasiva** — `cmd+shift+1` → `m1-paramasiva.openCoordinate`; `cmd+alt+F` → `m1-paramasiva.vortex.face-mode.toggle`; `cmd+alt+P` → `m1-paramasiva.mersenne-proof.reveal` (gated `epi-logos.ui.developerMode`).
   - **m2-parashakti** — `cmd+shift+2` → `m2-parashakti.openCoordinate`; `cmd+alt+V` → `m2-parashakti.cymatic.view-switch`; `cmd+alt+T` → `m2-parashakti.proof-identity.toggle` (gated `epi-logos.m2.devMode`).
   - **m3-mahamaya** — `cmd+shift+3` → `m3-mahamaya.openCoordinate`; `cmd+alt+C` → `m3-mahamaya.iching.cast`; `cmd+alt+R` → `m3-mahamaya.tarot.draw`.
   - **m4-nara** — `cmd+shift+4` → `m4-nara.openCoordinate`; `cmd+shift+D` → `m4-nara.day-calendar.focus` (25.1); `cmd+shift+T` → `m4-nara.time-axis.cycle` (25.16); `cmd+alt+O` → `m4-nara.oracle.cast`; canvas highlight chord prefix `cmd+H`: `cmd+H D` → daily-note, `cmd+H O` → oracle, `cmd+H E` → expand, `cmd+H M` → dream (per CCT-5; user-side categories only — agent-side categories not bound).
   - **m5-epii** — `cmd+shift+5` → `m5-epii.openReview`; `cmd+alt+M` → `m5-epii.mobius-pass-ribbon.open`; `cmd+alt+R` → `m5-epii.recognition-layer.focus` (when in `daily-0-1` personal-side composition).
   - **omnipanel-shell** — `cmd+1` through `cmd+8` → `omnipanel.tab.activate.{0..7}` (CCT-4); each `when`-clause checks `omnipanelTabAvailable === true` for the active layout.

   Each `KeybindingContribution` declares chord + commandId + `when` clause. The `when`-clause for `daily-0-1`-only chords references context key `epiLogosLayoutActive === 'daily-0-1'`; the kernel-bridge subscribes to layout preference and updates the context key on change.

   Verification:
   - `grep -rnE "implements KeybindingContribution|registerKeybindings" Body/M/epi-theia/extensions/{m0-anuttara,m1-paramasiva,m2-parashakti,m3-mahamaya,m4-nara,m5-epii,pratibimba-layouts,omnipanel-shell}/src/browser/` returns ≥ 8
   - cmd-period registration test asserts `pratibimba-layouts/src/browser/layout-commands.ts` (or sibling) registers `cmd+.` → `pratibimba.layout.toggle`
   - per-Mn cmd-shift-{0..5} test asserts each Mn extension binds the corresponding chord
   - OmniPanel cmd-{1..8} test asserts all 8 tabs are bound with `when`-clauses honouring `availableInLayouts`
   - canvas highlight prefix test asserts `cmd+H D/O/E/M` are bound in m4-nara
   - `node --test Body/M/epi-theia/extensions/test/validate-keybinding-chord-uniqueness.test.mjs` (lands in 31.13) asserts no chord appears in two `KeybindingContribution` instances with overlapping `when`-clauses
   - Theia default override test asserts the `cmd+.` Quick Fix default is unregistered when `epi-logos.keymap.preserveTheiaDefaults === false`

4. **31.4 — Activity-bar mode contributions** *(no-orphan-fill; closes CC-04, CCT-6)*

   Source rows: CC-04 + 15.3 + 25.1/25.3/25.7 + 11.4.

   Activity-bar mode ledger entry per mode. `pratibimba-layouts/src/common/layout-types.ts` extended with typed `expectedActivityBarModes: Record<PratibimbaLayoutId, ActivityBarMode[]>` (per-layout array of `(modeId, ownerExtension, widgetId, iconRef)`). New file `Body/M/epi-theia/extensions/pratibimba-layouts/src/common/activity-bar-modes.ts`:

   ```ts
   export interface ActivityBarMode {
       readonly modeId: string;
       readonly ownerExtension: string;
       readonly widgetId: string;
       readonly iconRef: string;        // Theia codicon name or M0 ARCHETYPE_LUT glyph ref
       readonly orderPriority: number;
   }
   export const DAILY_0_1_ACTIVITY_BAR_MODES: readonly ActivityBarMode[] = [
       // Cosmic-side (3 modes)
       { modeId: 'pratibimba.activity-bar.coordinate-tree', ownerExtension: 'ide-shell-m0-m5', widgetId: 'pratibimba.coordinate-tree', iconRef: '$(list-tree)', orderPriority: 10 },
       { modeId: 'pratibimba.activity-bar.bimba-graph-viewer', ownerExtension: 'ide-shell-m0-m5', widgetId: 'pratibimba.bimba-graph-viewer', iconRef: '$(graph)', orderPriority: 20 },
       { modeId: 'pratibimba.activity-bar.canon-studio', ownerExtension: 'ide-shell-m0-m5', widgetId: 'pratibimba.canon-studio', iconRef: '$(book)', orderPriority: 30 },
       // Personal-side (3 modes — per 25.1, 25.3, 25.7)
       { modeId: 'pratibimba.activity-bar.day-calendar', ownerExtension: 'm4-nara', widgetId: 'm4.nara.dayCalendar', iconRef: '$(calendar)', orderPriority: 40 },
       { modeId: 'pratibimba.activity-bar.journal-entries', ownerExtension: 'm4-nara', widgetId: 'm4.nara.journalEntries', iconRef: '$(notebook)', orderPriority: 50 },
       { modeId: 'pratibimba.activity-bar.personal-coordinate', ownerExtension: 'm4-nara', widgetId: 'm4.nara.personalCoordinate', iconRef: '$(person)', orderPriority: 60 }
   ];
   export const IDE_DEEP_ACTIVITY_BAR_MODES: readonly ActivityBarMode[] = [
       ...DAILY_0_1_ACTIVITY_BAR_MODES,
       // ide-deep additional (2 modes — per 15.3)
       { modeId: 'pratibimba.activity-bar.backend-studio', ownerExtension: 'ide-shell-m0-m5', widgetId: 'pratibimba.backend-studio', iconRef: '$(server)', orderPriority: 70 },
       { modeId: 'pratibimba.activity-bar.smart-connections', ownerExtension: 'smart-connections-sidebar', widgetId: 'pratibimba.smart-connections-sidebar', iconRef: '$(circuit-board)', orderPriority: 80 }   // code-pending per 11.4
   ];
   ```

   Per-extension `frontend-module.ts` extended with activity-bar mode registration via Theia's standard `ViewContainer` + `ViewContribution` patterns; each mode binds to its owning widget id. `m4-nara/src/browser/frontend-module.ts` extended with three activity-bar contributions for Day Calendar / Journal Entries / Personal Coordinate (per 25.1/25.3/25.7); each gated `when: epiLogosLayoutActive === 'daily-0-1' || epiLogosLayoutActive === 'ide-deep'`.

   Smart Connections mode marked code-pending per 11.4 (gating reference Track 03 T6.5); layout-switcher tolerates missing widget per 11.4.

   Verification:
   - `test -f Body/M/epi-theia/extensions/pratibimba-layouts/src/common/activity-bar-modes.ts`
   - `grep -nE "DAILY_0_1_ACTIVITY_BAR_MODES|IDE_DEEP_ACTIVITY_BAR_MODES|ActivityBarMode" Body/M/epi-theia/extensions/pratibimba-layouts/src/common/`
   - daily-0-1 mode-count test asserts exactly 6 entries (3 cosmic + 3 personal)
   - ide-deep mode-count test asserts exactly 8 entries (6 daily-0-1 + 2 additional)
   - mode-owner uniqueness test asserts no mode id appears with two different `ownerExtension` values
   - chrome-contributions-catalog.json (31.12) `activityBarModes` section enumerates all 8 modes
   - `pnpm --filter @pratibimba/pratibimba-layouts test` includes activity-bar mode count assertion

5. **31.5 — Menu contributions: Epi-Logos top-level menu** *(spec-ahead-integration; closes CC-05, CCT-10, DR-WC-CC-3)*

   Source rows: CC-05 + DR-WC-CC-3 + 25 + 26 + 21–24 (the per-Mn + per-plugin commands the menu groups).

   New file `Body/M/epi-theia/extensions/pratibimba-layouts/src/browser/epi-logos-menu.ts` (extending the landed pattern from `layout-commands.ts`). Defines:

   ```ts
   export const EPI_LOGOS_MENU = [...MAIN_MENU_BAR, '3_epi_logos'];
   export const EPI_LOGOS_COSMIC_GROUP = [...EPI_LOGOS_MENU, '1_cosmic'];
   export const EPI_LOGOS_PERSONAL_GROUP = [...EPI_LOGOS_MENU, '2_personal'];
   export const EPI_LOGOS_COMPOSE_GROUP = [...EPI_LOGOS_MENU, '3_compose'];
   export const EPI_LOGOS_DIAGNOSTICS_GROUP = [...EPI_LOGOS_MENU, '4_diagnostics'];

   @injectable()
   export class EpiLogosMenuContribution implements MenuContribution {
       registerMenus(menus: MenuModelRegistry): void {
           menus.registerSubmenu(EPI_LOGOS_MENU, 'Epi-Logos');

           // 1_cosmic — M0–M3 quick-access (cmd-shift-{0..3})
           menus.registerMenuAction(EPI_LOGOS_COSMIC_GROUP, { commandId: 'm0-anuttara.openCoordinate', label: 'M0 Anuttara — Open Reader', order: '1' });
           menus.registerMenuAction(EPI_LOGOS_COSMIC_GROUP, { commandId: 'm1-paramasiva.openCoordinate', label: 'M1 Paramasiva — Open Instrument', order: '2' });
           menus.registerMenuAction(EPI_LOGOS_COSMIC_GROUP, { commandId: 'm2-parashakti.openCoordinate', label: 'M2 Paraśakti — Open Cymatic Engine', order: '3' });
           menus.registerMenuAction(EPI_LOGOS_COSMIC_GROUP, { commandId: 'm3-mahamaya.openCoordinate', label: 'M3 Mahāmāyā — Open Wheel', order: '4' });

           // 2_personal — M4–M5 + day calendar
           menus.registerMenuAction(EPI_LOGOS_PERSONAL_GROUP, { commandId: 'm4-nara.openArtifact', label: 'M4 Nara — Open Journal', order: '1' });
           menus.registerMenuAction(EPI_LOGOS_PERSONAL_GROUP, { commandId: 'm5-epii.openReview', label: 'M5 Epii — Open Atelier', order: '2' });
           menus.registerMenuAction(EPI_LOGOS_PERSONAL_GROUP, { commandId: 'm4-nara.day-calendar.focus', label: 'Day Calendar', order: '3' });
           menus.registerMenuAction(EPI_LOGOS_PERSONAL_GROUP, { commandId: 'm4-nara.pasu-identity.open', label: 'PASU Identity Wizard', order: '4' });

           // 3_compose — 1-2-3 / 4-5-0 plugin entries
           menus.registerMenuAction(EPI_LOGOS_COMPOSE_GROUP, { commandId: 'plugin-integrated-1-2-3.open', label: 'Cosmic Engine (1-2-3)', order: '1' });
           menus.registerMenuAction(EPI_LOGOS_COMPOSE_GROUP, { commandId: 'plugin-integrated-4-5-0.open', label: 'Personal Recognition (4-5-0)', order: '2' });

           // 4_diagnostics — gateway + readiness + profile + status-bar quick-jumps
           menus.registerMenuAction(EPI_LOGOS_DIAGNOSTICS_GROUP, { commandId: 'omnipanel.tab.activate.6', label: 'Open Gateway Diagnostics', order: '1' });
           menus.registerMenuAction(EPI_LOGOS_DIAGNOSTICS_GROUP, { commandId: 'omnipanel.tab.activate.7', label: 'Open Bridge Diagnostics', order: '2' });
           menus.registerMenuAction(EPI_LOGOS_DIAGNOSTICS_GROUP, { commandId: 'pratibimba.state-thread.jump-to-coordinate', label: 'Jump to Active Coordinate', order: '3' });
       }
   }
   ```

   Coexists with `PratibimbaLayoutCommandContribution` (at `5_pratibimba`). Per DR-WC-CC-3, Epi-Logos at `3_epi_logos` (left of Pratibimba) honours dependency direction (Epi-Logos is canonical foundation; Pratibimba is workspace presentation).

   Bound in `pratibimba-layouts/src/browser/frontend-module.ts`:

   ```ts
   bind(EpiLogosMenuContribution).toSelf().inSingletonScope();
   bind(MenuContribution).toService(EpiLogosMenuContribution);
   ```

   Verification:
   - `test -f Body/M/epi-theia/extensions/pratibimba-layouts/src/browser/epi-logos-menu.ts`
   - `grep -nE "EPI_LOGOS_MENU|EPI_LOGOS_COSMIC_GROUP|EPI_LOGOS_PERSONAL_GROUP|EPI_LOGOS_COMPOSE_GROUP|EPI_LOGOS_DIAGNOSTICS_GROUP" Body/M/epi-theia/extensions/pratibimba-layouts/src/browser/epi-logos-menu.ts`
   - menu-registration test asserts both `EpiLogosMenuContribution` and `PratibimbaLayoutCommandContribution` bind to `MenuContribution` (two top-level menus coexist per DR-WC-CC-3)
   - menu-order test asserts `EPI_LOGOS_MENU` at position `3_epi_logos` (left of `5_pratibimba`)
   - `pnpm --filter @pratibimba/pratibimba-layouts test`

6. **31.6 — Breadcrumbs: coordinate path visible** *(spec-ahead-integration; closes CC-06, CCT-11)*

   Source rows: CC-06 + 15-foundation principle 1.

   New file `Body/M/epi-theia/extensions/m-extension-runtime/src/browser/breadcrumbs/coordinate-breadcrumbs-contribution.ts` implementing Theia's `BreadcrumbsContribution`:

   ```ts
   @injectable()
   export class EpiLogosCoordinateBreadcrumbsContribution implements BreadcrumbsContribution {
       readonly type: string = 'epi-logos.coordinate';
       readonly priority: number = 100;

       @inject(SHARED_BRIDGE_ADAPTER) protected readonly bridge!: SharedBridgeAdapter;

       async computeBreadcrumbs(uri: URI): Promise<Breadcrumb[]> {
           const context = await this.bridge.getCurrentCoordinateContext();
           if (!context?.selectedCoordinate) return [];
           const parsed = parseCoordinate(context.selectedCoordinate);
           // M4 / Nara / DayContainer
           return [
               { id: `epi.coord.${parsed.family}`, label: parsed.family, iconClass: 'codicon-symbol-namespace' },
               { id: `epi.coord.${parsed.archetype}`, label: parsed.archetypeName, iconClass: 'codicon-symbol-class' },
               { id: `epi.coord.${parsed.position}`, label: parsed.positionName, iconClass: 'codicon-symbol-property' }
           ];
       }

       async resolveBreadcrumb(breadcrumb: Breadcrumb): Promise<BreadcrumbPopup | undefined> {
           // Click any segment dispatches omnipanel.intent.dispatch with the reduced coordinate
           return undefined;  // handled by command registry instead
       }
   }
   ```

   Per-segment click dispatches `omnipanel.intent.dispatch` with the reduced coordinate (e.g. clicking `M4` segment navigates to M4 family root; clicking `Nara` navigates to the M4 archetype Nara). Cross-link 28-ide-shell-chrome-deep for the active-coordinate navigation contract.

   Per-Mn 72-fold (23.7) and decan-chain (24.7) breadcrumbs are WIDGET-INTERNAL (not in the top breadcrumb bar) and remain owned by their respective extensions. The top breadcrumb bar shows ONLY the family → archetype → position triad per CCT-11.

   Bound in `m-extension-runtime/src/browser/frontend-module.ts` (or sibling `breadcrumbs-frontend-module.ts`):

   ```ts
   bind(EpiLogosCoordinateBreadcrumbsContribution).toSelf().inSingletonScope();
   bind(BreadcrumbsContribution).toService(EpiLogosCoordinateBreadcrumbsContribution);
   ```

   Verification:
   - `test -f Body/M/epi-theia/extensions/m-extension-runtime/src/browser/breadcrumbs/coordinate-breadcrumbs-contribution.ts`
   - `grep -nE "EpiLogosCoordinateBreadcrumbsContribution|BreadcrumbsContribution" Body/M/epi-theia/extensions/m-extension-runtime/src/browser/`
   - breadcrumb render test against synthetic `selectedCoordinate: 'M4-3'` renders three segments `M4 / Nara / DayContainer`
   - click-through test asserts clicking the `M4` segment dispatches `omnipanel.intent.dispatch` with `coordinate: 'M4'`
   - `pnpm --filter @pratibimba/m-extension-runtime test`

7. **31.7 — Application-shell slot policy contract** *(doc-ahead-landing; closes CC-07, CCT-7)*

   Source rows: CC-07 + 15-foundation principles 5, 6, 7.

   New file `Body/M/epi-theia/extensions/contracts/shell-slot-policy.json` enumerating per-slot ownership constraints:

   ```json
   {
       "version": "2026-06-05.31-T7",
       "slots": {
           "widget.application-shell-left": {
               "policy": "activity-bar-switched",
               "stacking": "forbidden",
               "permittedContributors": ["ide-shell-m0-m5", "m4-nara", "smart-connections-sidebar"],
               "rationale": "15-foundation principle 7: activity-bar discipline. Modes switch within the slot; widgets are NOT stacked."
           },
           "widget.application-shell-right": {
               "policy": "exclusive",
               "exclusiveOwner": "omnipanel-shell",
               "rationale": "15-foundation principle 5: OmniPanel as / operator membrane. Right sidebar IS the OmniPanel."
           },
           "widget.application-shell-bottom-area": {
               "policy": "per-layout",
               "daily-0-1": ["pratibimba-layouts.cosmic-status", "kernel-bridge-readiness.summary", "body-lite-surface.day-now-anchor"],
               "ide-deep": ["ide-shell-m0-m5.evidence", "ide-shell-m0-m5.review", "ide-shell-m0-m5.autoresearch", "kernel-bridge-readiness.full"],
               "rationale": "15 Surface Contracts: bottom pane composition differs per layout."
           },
           "widget.application-shell-main": {
               "policy": "composition",
               "compositionContracts": ["08-t0-composition-contract-preflight"],
               "permittedContributors": ["m0-anuttara", "m1-paramasiva", "m2-parashakti", "m3-mahamaya", "m4-nara", "m5-epii", "plugin-integrated-1-2-3", "plugin-integrated-4-5-0"],
               "rationale": "15.4 composition-over-juxtaposition: integrated plugins compose into ONE editor surface, not side-by-side panes."
           },
           "widget.application-shell-top-area": {
               "policy": "exclusive",
               "exclusiveOwner": "m-extension-runtime.coordinate-breadcrumbs",
               "rationale": "CCT-11 coordinate breadcrumbs at the top of the editor area."
           },
           "widget.application-shell-status-bar": {
               "policy": "discipline",
               "stateThreadEntries": {
                   "alignment": "LEFT",
                   "idPrefix": "pratibimba.state-thread.",
                   "exactCount": 6,
                   "permittedIds": [
                       "pratibimba.state-thread.active-coordinate",
                       "pratibimba.state-thread.profile-tick",
                       "pratibimba.state-thread.profile-generation",
                       "pratibimba.state-thread.day-now",
                       "pratibimba.state-thread.session-id",
                       "pratibimba.state-thread.gateway-readiness"
                   ]
               },
               "navigationChips": {
                   "alignment": "RIGHT",
                   "idPrefix": "pratibimba.nav.",
                   "permittedContributors": ["pratibimba-layouts"]
               },
               "rationale": "15.10 status bar discipline: exactly six state-thread entries; navigation chips permitted only on RIGHT."
           }
       }
   }
   ```

   Sibling validator extends `validate-extension-contract-preflight.mjs` to lint every extension's `frontend-module.ts` against the slot policy. Extensions contributing to forbidden slots fail preflight.

   Verification:
   - `test -f Body/M/epi-theia/extensions/contracts/shell-slot-policy.json`
   - `node Body/M/epi-theia/extensions/scripts/validate-extension-contract-preflight.mjs` includes slot-policy validation pass
   - slot-policy schema test asserts every slot has `policy`, `rationale`, and at least one ownership field
   - forbidden-slot test asserts an artificial extension contributing to `widget.application-shell-right` (other than `omnipanel-shell`) fails preflight

8. **31.8 — No-modal discipline lint** *(spec-ahead-integration; closes CC-08, CCT-8)*

   Source rows: CC-08 + 15.2 + 15-foundation principle 5.

   New validator at `Body/M/epi-theia/extensions/scripts/validate-no-modal-discipline.mjs`:

   ```js
   #!/usr/bin/env node
   import { readFileSync, readdirSync, statSync } from 'node:fs';
   import { join } from 'node:path';

   const FORBIDDEN_CALLS = [
       'MessageBox.show',
       'OpenDialog.show',
       'ConfirmDialog.show',
       'Dialog.show',         // bare modal Dialog (Theia core)
       'window.alert',
       'window.confirm',
       'window.prompt'
   ];

   const TAGGED_CONTEXT_PATTERNS = [
       /\/review\//,
       /\/evidence\//,
       /\/gate-landing\//,
       /\/\/ @epi-logos:context=review/,
       /\/\/ @epi-logos:context=evidence/,
       /\/\/ @epi-logos:context=gate-landing/
   ];

   function scanFile(path) {
       const content = readFileSync(path, 'utf-8');
       const violations = [];
       const isTaggedContext = TAGGED_CONTEXT_PATTERNS.some(pattern => pattern.test(path) || pattern.test(content));
       if (!isTaggedContext) return violations;
       for (const call of FORBIDDEN_CALLS) {
           if (content.includes(call)) {
               violations.push({ path, call, contextMarker: 'tagged' });
           }
       }
       return violations;
   }

   // ... walks Body/M/epi-theia/extensions/{m0..m5,ide-shell-m0-m5,m5-epii,plugin-integrated-*}/src/**/*.ts
   ```

   Sibling test at `Body/M/epi-theia/extensions/test/validate-no-modal-discipline.test.mjs`. Per CCT-8: Review tab IS the landing surface (15.2).

   Verification:
   - `test -f Body/M/epi-theia/extensions/scripts/validate-no-modal-discipline.mjs`
   - `test -f Body/M/epi-theia/extensions/test/validate-no-modal-discipline.test.mjs`
   - `node Body/M/epi-theia/extensions/scripts/validate-no-modal-discipline.mjs` exits 0 against current substrate (no violations in landed code)
   - injected-fixture test asserts a synthetic source file with `MessageBox.show` in `*/review/*` path produces a violation
   - `node --test Body/M/epi-theia/extensions/test/validate-no-modal-discipline.test.mjs`

9. **31.9 — Preference contributions per extension** *(spec-ahead-integration; closes CC-09, CCT-9)*

   Source rows: CC-09 + 22.6 + 23.4 + 25.3 + 19.12 + 30.5.

   New shared file `Body/M/epi-theia/extensions/m-extension-runtime/src/browser/preferences/epi-logos-preferences.ts` declaring cross-cutting preferences via `PreferenceContribution`:

   ```ts
   import { PreferenceContribution, PreferenceSchema } from '@theia/core/lib/browser/preferences';

   export const EPI_LOGOS_PREFERENCES: PreferenceSchema = {
       type: 'object',
       properties: {
           'epi-logos.layout.active': {
               type: 'string',
               enum: ['daily-0-1', 'ide-deep'],
               default: 'daily-0-1',
               description: 'Active workspace layout (consumed by 11.2 cross-layout intent + 25.3 daily-0-1 gating)'
           },
           'epi-logos.profile.tick.visible': {
               type: 'boolean',
               default: true,
               description: 'Whether profile-tick state appears in the status bar'
           },
           'epi-logos.privacy.default-class': {
               type: 'string',
               enum: ['protected_local', 'protected_local_handle_only', 'public_pedagogy', 'public_current_with_graph_provenance'],
               default: 'protected_local',
               description: 'Default privacy class for new artifacts (PASU residency at protected_local per MEMORY)'
           },
           'epi-logos.kairos.enabled': {
               type: 'boolean',
               default: false,
               description: 'Whether the kerykeion kairos populator is active (FR-3 stub gate per 19.12)'
           },
           'epi-logos.motion.reduced': {
               type: 'boolean',
               default: false,
               description: 'Reduce motion in lemniscate transitions + tick choreography (30.5 a11y)'
           },
           'epi-logos.ui.developerMode': {
               type: 'boolean',
               default: false,
               description: 'Developer-mode gating for matheme proof overlays (22.6) + dev panels'
           },
           'epi-logos.keymap.preserveTheiaDefaults': {
               type: 'boolean',
               default: false,
               description: 'Preserve Theia default chord bindings (overrides cmd-period to cmd-shift-zero for 0/1 toggle per DR-WC-CC-2)'
           },
           'epi-logos.m1.vortex.faceMode': {
               type: 'string',
               enum: ['digit-root', 'raw'],
               default: 'digit-root',
               description: 'Vortex face-mode toggle (22 face-mode shared preference)'
           },
           'epi-logos.m2.devMode': {
               type: 'boolean',
               default: false,
               description: 'M2 paraśakti proof-identity panel toggle (23.4)'
           }
       }
   };

   @injectable()
   export class EpiLogosPreferenceContribution implements PreferenceContribution {
       readonly schema = EPI_LOGOS_PREFERENCES;
   }
   ```

   Per-extension preference namespace `epi-logos.{extension}.*` enforced. Each Mn extension MAY declare its own per-extension preferences (e.g. `epi-logos.m0.anuttara.activeLayer`, `epi-logos.m4.nara.timeAxisMode`); chrome-contributions-catalog.json (31.12) `preferences` section enumerates all known preference keys with `(owningExtension, declaringTranche)`.

   Bound in `m-extension-runtime/src/browser/frontend-module.ts`:

   ```ts
   bind(EpiLogosPreferenceContribution).toSelf().inSingletonScope();
   bind(PreferenceContribution).toService(EpiLogosPreferenceContribution);
   ```

   The stage-1 reference `epiLogos.m2Parashakti.devMode` (23.4) is NORMALISED to `epi-logos.m2.devMode` per CCT-9; the 23.4 cross-link is annotated with this normalisation.

   Verification:
   - `test -f Body/M/epi-theia/extensions/m-extension-runtime/src/browser/preferences/epi-logos-preferences.ts`
   - `grep -nE "epi-logos\\.(layout|profile|privacy|kairos|motion|ui|keymap|m[0-5])\\." Body/M/epi-theia/extensions/m-extension-runtime/src/browser/preferences/`
   - preference-namespace test asserts every preference key matches `^epi-logos\\.[a-z][a-z0-9]*\\.([a-zA-Z][a-zA-Z0-9.-]*)$`
   - chrome-contributions-catalog.json (31.12) `preferences` section enumerates ≥ 9 cross-cutting + per-Mn preference keys
   - `pnpm --filter @pratibimba/m-extension-runtime test`

10. **31.10 — Cross-layout intent dispatcher contributions** *(no-orphan-fill; closes CC-10)*

    Source rows: CC-10 + 11.2 + 21.19 + 25 + 26.

    Per-extension intent-target ledger. Each extension's `frontend-module.ts` registers intent targets for every `requestedContributionId` it supports via the landed `registerIntentTarget` helper (from `@pratibimba/m-extension-runtime`).

    Stage-1 declared intent targets:

    - **m0-anuttara** — `'graph'` (legacy, landed); plus per 21.19: each `M0LayerKey` (`'language'`, `'ql-structure'`, `'relations'`, `'time-community'`, `'personal'`, `'pedagogy'`) registered as an intent target.
    - **m1-paramasiva** — `'instrument'` (primary, landed); plus 22 widget-id targets.
    - **m2-parashakti** — `'cymatic'`, `'correspondenceTree'` (landed); 23 view-switcher modes.
    - **m3-mahamaya** — `'wheel'`, `'cosmicClock'`, `'decanChain'` (per 24).
    - **m4-nara** — `'artifact'` (landed); plus 25 widget-id targets (`'dayCalendar'`, `'journalEntries'`, `'personalCoordinate'`, `'oracle'`, `'medicine'`, `'transform'`, `'lens'`, `'logos'`, `'kairos'`).
    - **m5-epii** — `'review'`, `'evidence-deposit'` (landed); plus 26 widget-id targets (`'recognitionLayer'`, `'mobiusPassRibbon'`, `'contemplationObject'`, `'jointComposition'`).

    Chrome-contributions-catalog.json (31.12) `intentTargets` section enumerates every `(extensionId, requestedContributionId, label, handler)` triple. Intent-target ledger consistency lint asserts every `requestedContributionId` declared in stage-1 tranches has a matching `registerIntentTarget` call in the extension's `frontend-module.ts`.

    The OmniPanel-side `omnipanel.intent.dispatch` command (existing in `omnipanel-shell`) consumes the intent-target ledger; per-extension targets fire when their `requestedExtensionId` + `requestedContributionId` matches.

    Verification:
    - `grep -rnE "registerIntentTarget\\(.*'(graph|instrument|cymatic|correspondenceTree|wheel|cosmicClock|decanChain|artifact|dayCalendar|journalEntries|personalCoordinate|oracle|medicine|transform|lens|logos|kairos|review|evidence-deposit|recognitionLayer|mobiusPassRibbon|contemplationObject|jointComposition|language|ql-structure|relations|time-community|personal|pedagogy)'" Body/M/epi-theia/extensions/{m0-anuttara,m1-paramasiva,m2-parashakti,m3-mahamaya,m4-nara,m5-epii}/src/browser/frontend-module.ts` returns ≥ 30 hits
    - intent-target ledger test asserts every declared `requestedContributionId` in chrome-contributions-catalog.json has a matching `registerIntentTarget` call
    - cross-layout intent dispatch test (extending 11.6 acceptance-harness test) asserts dispatch with `(requestedExtensionId, requestedContributionId)` opens the correct widget at the correct mode
    - `pnpm --filter @pratibimba/omnipanel-shell test`

11. **31.11 — Toolbar / context-menu / inline-action contribution policy** *(doc-ahead-landing; closes CC-11)*

    Source rows: CC-11 + 15-foundation principles 5, 6 + 11.10.

    New file `Body/M/epi-theia/extensions/contracts/chrome-action-surface-policy.md` documenting the three-rule grammar:

    > **Rule 1 — Toolbar = persistent global action on the active widget.**
    > Theia's `TabBarToolbarContribution` is the consumption path. Examples: `m4-nara` Day Calendar widget hosts a "Today" toolbar button at the right of its TabBar (jump to current day); `m5-epii` Review widget hosts a "Filter by capacity" toolbar dropdown. Each toolbar action MUST: bind to a registered command; honour `when`-clause for the active widget; render via Theia's `TabBarToolbarRegistry.registerItem(...)`. Toolbar actions are GLOBAL to the widget — not selection-dependent.
    >
    > **Rule 2 — Context-menu = selection-bound action that varies by target.**
    > Theia's `MenuModelRegistry` context-menu paths are the consumption path. Examples: `m4-nara` canvas right-click context menu (per 11.10) offers "Toggle Highlight" / "Inscribe Recognition Mark" / "Open in Day Calendar" based on selected text/node; `ide-shell-m0-m5` Coordinate Tree right-click offers "Reveal in Bimba Graph" / "Open in Canon Studio" / "Deposit Review Evidence" based on selected node. Context-menu items MUST: be registered against context-menu paths (e.g. `'navigator-context-menu'`, `'canvas-context-menu'`); honour `when`-clause for selection state; appear ONLY in the selection's natural menu surface.
    >
    > **Rule 3 — Inline-button = artifact-level action embedded in content.**
    > Embedded buttons in widget body for actions that operate on a specific artifact instance. Examples: `m4-nara` DayContainer artifact rows host a "Open Canvas" inline button per artifact (per 25.2); `m5-epii` Review queue rows host "Mark Reviewed" inline button. Inline buttons MUST: render within the React widget body (not in toolbar / context-menu); dispatch via `commands.executeCommand(...)`; remain disabled when the artifact is in a non-actionable state (e.g. already-reviewed).

    Per-Mn surface examples cross-linked: 11.10 FloatingMenu (canvas selection context), 11.12 ambient strip click-expand (inline-button), 25.1 day-calendar toolbar "Today" button (toolbar), 26 Review queue inline buttons (inline-button).

    Anti-pattern: toolbar buttons that duplicate FloatingMenu actions (11.10); inline buttons that should be context-menu items (selection-bound); context-menu items that should be toolbar actions (global).

    Verification:
    - `test -f Body/M/epi-theia/extensions/contracts/chrome-action-surface-policy.md`
    - `grep -nE "Rule 1|Rule 2|Rule 3|TabBarToolbarContribution|MenuModelRegistry|inline-button" Body/M/epi-theia/extensions/contracts/chrome-action-surface-policy.md` returns each rule + its consumption path
    - per-Mn cross-link test asserts policy document references 11.10, 11.12, 25.1, 26 by tranche id

12. **31.12 — Chrome ledger artifact** *(no-orphan-fill; closes CC-12, CCT-12; feeds Tranche 14 no-orphan audit)*

    Source rows: CC-12 + 11.9 ledger pattern.

    New file `Body/M/epi-theia/extensions/contracts/chrome-contributions-catalog.json` mapping every contribution to `(id, owningExtension, type, scope, declaringTranche)`:

    ```json
    {
        "version": "2026-06-05.31-T12",
        "statusBarEntries": [
            { "id": "pratibimba.state-thread.active-coordinate", "owningExtension": "m-extension-runtime", "type": "status-bar", "scope": "LEFT-state-thread", "priority": 190, "declaringTranche": "31.1" },
            { "id": "pratibimba.state-thread.profile-tick", "owningExtension": "m-extension-runtime", "type": "status-bar", "scope": "LEFT-state-thread", "priority": 180, "declaringTranche": "31.1" },
            { "id": "pratibimba.state-thread.profile-generation", "owningExtension": "m-extension-runtime", "type": "status-bar", "scope": "LEFT-state-thread", "priority": 170, "declaringTranche": "31.1" },
            { "id": "pratibimba.state-thread.day-now", "owningExtension": "m-extension-runtime", "type": "status-bar", "scope": "LEFT-state-thread", "priority": 160, "declaringTranche": "31.1" },
            { "id": "pratibimba.state-thread.session-id", "owningExtension": "m-extension-runtime", "type": "status-bar", "scope": "LEFT-state-thread", "priority": 150, "declaringTranche": "31.1" },
            { "id": "pratibimba.state-thread.gateway-readiness", "owningExtension": "m-extension-runtime", "type": "status-bar", "scope": "LEFT-state-thread", "priority": 140, "declaringTranche": "31.1" },
            { "id": "pratibimba.layout.indicator", "owningExtension": "pratibimba-layouts", "type": "status-bar", "scope": "RIGHT-nav-chip", "priority": 100, "declaringTranche": "11.1-landed" }
        ],
        "commands": [/* ~60+ command-id entries per 31.2 */],
        "keybindings": [/* per-Mn chords per 31.3 */],
        "menuItems": [/* Epi-Logos + Pratibimba menu items per 31.5 */],
        "activityBarModes": [/* 6 daily-0-1 + 2 ide-deep additional per 31.4 */],
        "preferences": [/* cross-cutting + per-Mn preference keys per 31.9 */],
        "breadcrumbProviders": [
            { "id": "epi-logos.coordinate", "owningExtension": "m-extension-runtime", "type": "breadcrumb", "scope": "editor-area-top", "declaringTranche": "31.6" }
        ],
        "intentTargets": [/* ~30 (extensionId, requestedContributionId) pairs per 31.10 */],
        "slotPolicy": {
            "ref": "Body/M/epi-theia/extensions/contracts/shell-slot-policy.json",
            "declaringTranche": "31.7"
        }
    }
    ```

    CI lint asserts every declared contribution has an owner. Closes chrome no-orphan audit (feeds Tranche 14). Generated artifact: each per-Mn frontend-deep tranche (21–26) declares chrome contributions; this ledger is the union manifest.

    Verification:
    - `test -f Body/M/epi-theia/extensions/contracts/chrome-contributions-catalog.json`
    - JSON schema test asserts top-level keys: `version`, `statusBarEntries`, `commands`, `keybindings`, `menuItems`, `activityBarModes`, `preferences`, `breadcrumbProviders`, `intentTargets`, `slotPolicy`
    - `node --test Body/M/epi-theia/extensions/test/validate-chrome-contributions-catalog.test.mjs` (lands in 31.13) asserts every entry has `(id, owningExtension, type, scope, declaringTranche)`
    - ledger-completeness test asserts the union of all extension-side `registerCommand` / `registerMenu` / `registerKeybinding` / `registerStatusBar` calls equals the ledger entries (no orphans, no duplicates)
    - status-bar-discipline test asserts exactly 6 entries with `scope: 'LEFT-state-thread'`
    - cross-link to Tranche 14: `chrome-contributions-catalog.json` referenced from `Body/M/epi-theia/extensions/contracts/no-orphan-audit-ledger.json` (Tranche 14)

13. **31.13 — Validation suite** *(spec-ahead-integration; closes CC-13)*

    Source rows: CC-13 + 11.5 validator pattern.

    Four sibling validators + four sibling test files in `Body/M/epi-theia/extensions/{scripts,test}/`:

    - **`scripts/validate-chrome-contributions-catalog.mjs`** + **`test/validate-chrome-contributions-catalog.test.mjs`** — reads `contracts/chrome-contributions-catalog.json`; scans every extension's `frontend-module.ts` for `registerCommand` / `registerMenus` / `registerKeybindings` / `bind(StatusBarContribution)` / `bind(PreferenceContribution)` / `registerIntentTarget` calls; asserts every ledger entry has a matching source-side registration AND every source-side registration has a matching ledger entry. No orphans, no duplicates.

    - **`scripts/validate-no-modal-discipline.mjs`** + **`test/validate-no-modal-discipline.test.mjs`** — per 31.8, scans for forbidden `MessageBox.show` / `OpenDialog.show` / `ConfirmDialog.show` / `Dialog.show` / `window.alert` / `window.confirm` / `window.prompt` calls in review / evidence / gate-landing code paths (by path or `// @epi-logos:context=` marker).

    - **`scripts/validate-status-bar-discipline.mjs`** + **`test/validate-status-bar-discipline.test.mjs`** — scans every extension for `StatusBarContribution` bindings; asserts exactly 6 entries with `StatusBarAlignment.LEFT` AND id-prefix `pratibimba.state-thread.`; asserts every entry id matches the permitted list in `shell-slot-policy.json` `widget.application-shell-status-bar.stateThreadEntries.permittedIds`.

    - **`scripts/validate-keybinding-chord-uniqueness.mjs`** + **`test/validate-keybinding-chord-uniqueness.test.mjs`** — scans every extension's `KeybindingContribution.registerKeybindings(...)` calls; builds `(chord, when) → [contributors]` map; asserts no `(chord, when)` pair has > 1 contributor; reports collisions with cross-link to declaring tranche.

    Each validator runs in CI alongside the existing `validate-extension-contract-preflight.mjs` + `validate-composition-contract-preflight.mjs`. Combined script `Body/M/epi-theia/extensions/scripts/validate-all-chrome.mjs` runs all four in sequence and exits non-zero on any failure.

    Verification:
    - `test -f Body/M/epi-theia/extensions/scripts/validate-chrome-contributions-catalog.mjs`
    - `test -f Body/M/epi-theia/extensions/scripts/validate-no-modal-discipline.mjs`
    - `test -f Body/M/epi-theia/extensions/scripts/validate-status-bar-discipline.mjs`
    - `test -f Body/M/epi-theia/extensions/scripts/validate-keybinding-chord-uniqueness.mjs`
    - `test -f Body/M/epi-theia/extensions/test/validate-chrome-contributions-catalog.test.mjs`
    - `test -f Body/M/epi-theia/extensions/test/validate-no-modal-discipline.test.mjs`
    - `test -f Body/M/epi-theia/extensions/test/validate-status-bar-discipline.test.mjs`
    - `test -f Body/M/epi-theia/extensions/test/validate-keybinding-chord-uniqueness.test.mjs`
    - `node Body/M/epi-theia/extensions/scripts/validate-chrome-contributions-catalog.mjs` exits 0 against landed catalog
    - `node Body/M/epi-theia/extensions/scripts/validate-no-modal-discipline.mjs` exits 0 against current substrate (no violations)
    - `node Body/M/epi-theia/extensions/scripts/validate-status-bar-discipline.mjs` exits 0 against landed status-bar entries
    - `node Body/M/epi-theia/extensions/scripts/validate-keybinding-chord-uniqueness.mjs` exits 0 against landed keybindings
    - `node --test Body/M/epi-theia/extensions/test/validate-chrome-contributions-catalog.test.mjs`
    - `node --test Body/M/epi-theia/extensions/test/validate-no-modal-discipline.test.mjs`
    - `node --test Body/M/epi-theia/extensions/test/validate-status-bar-discipline.test.mjs`
    - `node --test Body/M/epi-theia/extensions/test/validate-keybinding-chord-uniqueness.test.mjs`
    - injected-fixture tests: synthetic 7th status-bar entry → status-bar validator fails; duplicate `cmd+shift+D` → keybinding validator fails; `MessageBox.show` in `*/review/*` → no-modal validator fails; missing ledger entry vs source-side registration → catalog validator fails

## Cycle 2 Substrate Inheritance

Consume as-is — Theia platform conventions (`AbstractViewContribution`, `CommandContribution`, `KeybindingContribution`, `MenuContribution`, `StatusBarContribution`, `PreferenceContribution`, `BreadcrumbsContribution`, `TabBarToolbarContribution`, `ApplicationShell` slots, `MAIN_MENU_BAR`, `MenuModelRegistry`, `KeybindingRegistry`, `StatusBar`, `StatusBarAlignment`); six per-Mn `frontend-module.ts` files (existing `AbstractViewContribution` + `CommandContribution` patterns); `pratibimba-layouts/src/browser/{layout-commands,layout-status-bar}.ts` (the landed `MenuContribution` + `StatusBarContribution` patterns); `kernel-bridge/src/browser/kernel-bridge-status-bar.ts` (renamed and folded into `gateway-readiness-status-entry.ts` per 31.1); `body-lite-surface/src/browser/deep-link-commands.ts` (the `BodyDeepLinkCommandContribution` pattern); `contracts/07-t0-extension-contract-preflight.{md,json}` + `contracts/08-t0-composition-contract-preflight.{md,json}` + `contracts/surface-extension-contract-ledger.json` (the ledger pattern); `scripts/validate-extension-contract-preflight.mjs` + `scripts/validate-composition-contract-preflight.mjs` (the validator pattern); `test/validate-extension-contract-preflight.test.mjs` (the sibling test pattern).

Audit/verify — `forbiddenDirectImports` lint (11.5) extended by 31.8 with no-modal forbidden-call enforcement; per-extension command/keybinding/preference namespace conformance enforced by 31.13 validators.

Cross-link without duplication — stage-1 wave-C tranches 21–26 declare chrome contributions specific to their per-Mn UX; Track 31 catalogues them into ONE ledger + lints them via 4 sibling validators. Track 11 lands cross-layout intent envelope (T5 promotion); Track 31.10 wires the per-extension consumer side. Track 15 lands UI foundation principles; Track 31 enforces them via lint. Track 19 lands contemplation substrate; Track 31 enforces the contemplation-submit command + observability event in chrome catalog.

## Anti-Greenfield Posture

All work in Track 31 either:

- **Consumes** Theia platform conventions (`CommandContribution`, `KeybindingContribution`, `MenuContribution`, `StatusBarContribution`, `PreferenceContribution`, `BreadcrumbsContribution`, `TabBarToolbarContribution`, `ApplicationShell` slots — every one consumed via standard Theia DI binding patterns)
- **Consumes** Track 15 foundation principles (coordinate as primary nav, profile-tick clock, inline provenance, no modal review surfaces, activity-bar discipline, status-bar discipline, Theia conventions where they fit)
- **Consumes** Track 11 cross-layout intent envelope (T5 promotion lands in Track 11; Track 31.10 wires the per-extension consumer side via `registerIntentTarget`)
- **Consumes** Track 19 contemplation substrate via kernel-bridge projections (the `m0.review.requested` observability event + `s0'.verifier.respond_question` RPC + `contemplate_session_close` gateway method are catalogued in 31.2 as commands but never re-authored)
- **Consumes** stage-1 wave-C tranches 21–26 declared chrome contributions (the cmd-shift-D, cmd-shift-T, dev-mode preferences, mode toggles, layer selectors, recognition-layer intent target — all catalogued here, none re-authored)
- **Extends** landed per-Mn `frontend-module.ts` files (six extensions) with new `registerKeybindings(...)` methods + extended `registerCommands(...)` blocks + new `registerIntentTarget` calls; never rewrites the landed `AbstractViewContribution` shell
- **Extends** landed `pratibimba-layouts/src/browser/layout-commands.ts` with the new `EpiLogosMenuContribution` sibling class; never rewrites the landed `PratibimbaLayoutCommandContribution`
- **Extends** landed `m-extension-runtime` package with six new status-bar entries + one breadcrumb contribution + one preference contribution; the existing `SharedBridgeAdapter` + `MathemeHarmonicProfileBoundary` + `CoordinateContext` types are unchanged
- **First-builds against unowned chrome surfaces** — six state-thread status-bar entries (CC-01); Epi-Logos top-level menu (CC-05); coordinate breadcrumbs (CC-06); shell-slot-policy contract (CC-07); chrome-action-surface-policy contract (CC-11); chrome-contributions-catalog ledger (CC-12); four sibling validators (CC-13). Each first-build either resolves a no-orphan-fill candidate (CC-01, CC-02, CC-04, CC-10, CC-12) or lands an unowned chrome surface named in 15-foundation principles 1, 5, 7, 8.

No greenfield chrome shell. No competing menu bar. No parallel widget shell. No direct kernel/gateway/graph driver imports from chrome contributions. No modal review/evidence/gate-landing surfaces. The Theia chrome catalog becomes the consolidated, lint-enforced surface contract the substrate has been silently honouring (or quietly drifting from) — through Theia conventions, the `SharedBridgeAdapter` boundary, and the per-tranche chrome-contributions ledger as no-orphan closure.
