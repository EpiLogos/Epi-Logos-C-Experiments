# Wave C — Theia Chrome Contributions Catalog Reconciliation Matrix

**Task id:** `wave-c-chrome-contributions-catalog`
**Domain:** Theia chrome contributions catalog across the entire epi-theia substrate — status-bar entries, command-palette catalog, keybinding chord grammar, menu contributions, breadcrumbs, activity-bar mode catalog, application-shell slot policy, preference contributions, cross-layout intent dispatcher registrations, toolbar / context-menu / inline-action policy, and the closing ledger artifact.
**Anti-greenfield posture:** All Theia contribution conventions (`CommandContribution`, `KeybindingContribution`, `MenuContribution`, `StatusBarContribution`, `PreferenceContribution`, `ApplicationShell` slots) are landed platform conventions. All per-extension chrome contributions in stage 1 wave-C tranches 21–26 are already SPEC-AHEAD declarations against landed extensions. This tranche audits + lints them into ONE catalog; it does not re-author any of them. Existing validators in `Body/M/epi-theia/extensions/scripts/` set the lint pattern; this tranche extends that pattern with chrome-contribution-specific validators.

## Source list (corpora actually consulted)

- **Foundation (Track 15)** — `15-ui-design-foundations.md` §15.5 (cmd-period 0/1 toggle), §15.3 (left-sidebar activity-bar system), §15.10 (status bar discipline, six entries), foundation principles 1–9 (esp. 7 activity-bar discipline, 8 Theia conventions, 5 no modals).
- **Shell hosting (Track 11)** — `11-theia-shell-surface-hosting.md` §11.2 (CrossLayoutIntent routing), §11.5 (forbidden-import lint validator pattern), §11.10 (HighlightMark Tiptap port to m4-nara), §11.11 (10-category highlight register), §11.12 (ambient strip + tuning bar).
- **Contemplation surface (Track 19)** — `19-contemplation-surface-integration.md` (consumed for OmniPanel chat flow + Verifier RPC routing references).
- **Per-Mn frontend deep (Stage 1 wave-C)**:
  - `21-m0-anuttara-frontend-deep.md` (20 tranches; layer-selector tabstrip, implicate/explicate toggle, reading/authoring mode toggle, virtue witness panel, symbolic-coordinate question console, archetype routing reader, contemplation prompt footer, lazy node browser, void-structure ring, parity bridge reader, bridged-layer launcher, layer-aware intent target, active-layer state persistence)
  - `22-m1-paramasiva-frontend-deep.md` (vortex matrix family panel, mersenne proof overlay, K² instrument widget, decanic chain breadcrumb, coordinate-tree contribution, developer-mode preference gating)
  - `23-m2-parashakti-frontend-deep.md` (72-fold breadcrumb component, six-axis correspondence tree, vibrational vs psychoid switcher, proof-identity dev-mode toggle, outer-planet pending badge, provenance badge inline)
  - `24-m3-mahamaya-frontend-deep.md` (cosmic clock wheel, decan-tarot addressing breadcrumb, hexagram body-dynamics viewer, third-spanda matheme proof panel, 3-coin cast ribbon, Quintessence indicator)
  - `25-m4-nara-frontend-deep.md` (day calendar `cmd-shift-D`, time-axis switcher `cmd-shift-T`, journal-entries activity-bar mode, personal-coordinate activity-bar mode, oracle composite widget, oracle history, medicine view, transform containers, lens application, logos cycle, pratibimba consent-gated, kairos display, mercurius relay indicator, three-mode time-axis switcher, privacy-class chrome border tints)
  - `26-m5-epii-frontend-deep.md` (recognition-layer composition slot, MobiusPassRibbon, contemplation object viewer, joint composition panel, xor-fold animation, spine reading 789, symbolic coordinate questions, IOD-17 parity readout)
- **Substrate** —
  - `Body/M/epi-theia/extensions/{m0-anuttara..m5-epii}/src/browser/frontend-module.ts` (six per-Mn `AbstractViewContribution` + `CommandContribution` instances with `OPEN_COMMAND_ID`, `READ_ONLY_COMMAND_ID`, `DEPOSIT_ONLY_COMMAND_ID`, `${EXTENSION_ID}.handleRoute`, plus `registerIntentTarget` calls)
  - `Body/M/epi-theia/extensions/pratibimba-layouts/src/browser/layout-commands.ts` (SWITCH_TO_DAILY, SWITCH_TO_IDE_DEEP, TOGGLE_LAYOUT commands + Pratibimba top-level menu with `1_layouts` and `2_intents` submenus)
  - `Body/M/epi-theia/extensions/pratibimba-layouts/src/browser/layout-status-bar.ts` (status-bar entry `pratibimba.layout.indicator`, priority 220, alignment LEFT, command TOGGLE_LAYOUT)
  - `Body/M/epi-theia/extensions/kernel-bridge/src/browser/kernel-bridge-status-bar.ts` (status-bar entry `pratibimba.kernel-bridge.status`, priority 200, alignment LEFT)
  - `Body/M/epi-theia/extensions/body-lite-surface/src/browser/deep-link-commands.ts` (`BodyDeepLinkCommandContribution` registering `OPEN_CONTROL_ROOM`, `OPEN_REVIEW_ITEM`, `OPEN_GRAPH_NODE`, `START_PROTECTED_ENTRY`)
  - `Body/M/epi-theia/extensions/omnipanel-shell/src/browser/omnipanel-contribution.ts` (OmniPanel widget contribution + MenuContribution)
  - `Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.{md,json}` (six-extension command convention `m0.openCoordinate`, `m1.startWalk`, `m2.openMeaningPacket`, `m3.openCodon`, `m4.openArtifact`, `m5.openReview` + `.readOnly` + `.depositOnly` reservations; route scheme `epi-logos://ide/<extension>/<surface>?...`)
  - `Body/M/epi-theia/extensions/pratibimba-layouts/src/common/layout-types.ts` (activity-bar modes: `daily-0-1` left-sidebar = Coordinate Tree + Bimba Graph Viewer + Canon Studio + day-calendar + Journal Entries + Personal Coordinate; `ide-deep` adds Backend Studio + Smart Connections per 15.3)
  - `Body/M/epi-theia/extensions/contracts/surface-extension-contract-ledger.json` (Tranche 11.9 ledger pattern that this tranche extends with chrome-contributions ledger)
- **Validator scripts** — `Body/M/epi-theia/extensions/scripts/validate-extension-contract-preflight.mjs` (the pattern to extend); `Body/M/epi-theia/extensions/test/validate-extension-contract-preflight.test.mjs` (the sibling test pattern).

## Standing invariants honored

- **Status-bar discipline (15.10):** exactly six entries. NO widget owns day-now / session anchor — they consume from the status-bar state thread. Current substrate has TWO entries (`pratibimba.layout.indicator`, `pratibimba.kernel-bridge.status`); 15.10 names the canonical SIX (profile-tick state, day-now anchor, session id, gateway readiness, profile generation, active coordinate). The layout-indicator IS NOT one of the six per 15.10; the six are state-thread entries, not navigation entries. **Resolution per 15.10:** layout-indicator is allowed as a navigation chip (NOT a state-thread entry); the six state-thread entries land per this catalog. Lint validates the six state-thread entries exist; layout-indicator + any kernel-bridge entry is permitted ONLY if it does not duplicate the gateway-readiness state-thread entry.
- **No modal review surfaces (15.2):** Review tab IS the landing surface. No `MessageBox.show`, no `OpenDialog`, no modal `Dialog` substitution for Review / Evidence / Gate-landing flows. Lint validates the absence of these calls in relevant code paths.
- **Cmd-period chord (15.5):** `cmd-period` is the 0/1 cosmic↔personal toggle. The cmd-period chord is RESERVED and CANNOT collide with any other chord across the substrate.
- **Activity-bar discipline (15.3, 15-foundation principle 7):** left-sidebar modes activity-bar-switched, NOT stacked. Daily-0-1 modes: Coordinate Tree, Bimba Graph Viewer, Canon Studio (cosmic-side activity-bar); Day Calendar, Journal Entries, Personal Coordinate (personal-side activity-bar). Ide-deep modes ADD Backend Studio + Smart Connections.
- **Composition over juxtaposition (15-foundation principle 6):** integrated plugins compose three M-extensions into one editor surface. Toolbar / context-menu / inline-action policy honours composition.
- **Theia conventions where they fit (15-foundation principle 8):** every chrome contribution uses `AbstractViewContribution`, `CommandContribution`, `KeybindingContribution`, `MenuContribution`, `PreferenceContribution`, `StatusBar`, `MAIN_MENU_BAR` rather than reinventing them.
- **Application-shell slot policy (15-foundation principle 7):** left sidebar = activity-bar-switched (no stacking); right sidebar = OmniPanel only; bottom pane = per-layout (cosmic-status / readiness ledger / day-now anchor for `daily-0-1`; evidence + review + autoresearch + kernel-bridge-readiness for `ide-deep`). Lint validates that extensions contributing to forbidden slots fail preflight.
- **Forbidden-direct-import lint (11.5):** extends the existing pattern with chrome-contribution forbidden-import rules (e.g. extensions MUST NOT directly import `@theia/core/lib/browser/messages/messages-renderer` or `@theia/core/lib/browser/dialogs/dialog` from review/evidence/gate-landing code paths).
- **Preference namespace convention:** per-extension preferences live in namespace `epi-logos.{extension}.*`; cross-cutting preferences live in `epi-logos.{layout,profile,privacy,kairos,motion}.*`. The Pratibimba top-level menu lives at `MAIN_MENU_BAR + '5_pratibimba'`; the Epi-Logos top-level menu (this tranche introduces) lives at `MAIN_MENU_BAR + '3_epi_logos'` to preserve canonical menu order (File / Edit / Selection / View / Epi-Logos / Pratibimba / Go / …).

## The 4-way matrix

| # | Claim (Stage 1 + 15.10 + 15.5 + 15.3) | Spec authority | Code/substrate evidence | Theia surface delta | Status |
|---|---|---|---|---|---|
| CC-01 | Status bar surfaces exactly SIX state-thread entries: profile-tick state, day-now anchor, session id, gateway readiness, profile generation, active coordinate. No widget owns these; status bar IS the state thread. | 15.10 binding contract. | Current substrate: `pratibimba.layout.indicator` (layout-status-bar.ts, priority 220) + `pratibimba.kernel-bridge.status` (kernel-bridge-status-bar.ts, priority 200) — TWO landed. None of the SIX named state-thread entries is contributed. | Need: six state-thread `StatusBarContribution` instances. `pratibimba.profile-tick`, `pratibimba.day-now`, `pratibimba.session-id`, `pratibimba.gateway-readiness`, `pratibimba.profile-generation`, `pratibimba.active-coordinate`. Each consumes `SharedBridgeAdapter.onProfile / onCoordinateContext / onReadiness`. | **SPEC-AHEAD** — 15.10 names; substrate lacks. Closes via 31.1. |
| CC-02 | Every CommandContribution declaration across stage-1 wave-C tranches catalogued: command id, label, category, owning extension, when-clause. | 07-t0 command convention (`m0.openCoordinate`, `m1.startWalk`, `m2.openMeaningPacket`, `m3.openCodon`, `m4.openArtifact`, `m5.openReview` + `.readOnly` + `.depositOnly`); per-Mn deep widget commands declared in 21–26. | Each `frontend-module.ts` registers OPEN/READ-ONLY/DEPOSIT-ONLY/handleRoute commands. New stage-1 commands: 21 (Layer Selector activate, Mode Toggle, Implicate Toggle, Contemplation Submit, Virtue Witness Refresh, Symbolic Question Submit); 22 (M1 wheel focus, Vortex face-mode toggle, Mersenne proof reveal); 23 (M2 view-switcher, dev-mode proof-identity toggle); 24 (Cosmic Clock cast, Tarot draw, I-Ching cast, Hexagram body lookup); 25 (cmd-shift-D Day Calendar focus, cmd-shift-T time-axis cycle, PASU identity wizard open, oracle cast composite, medicine view focus, transform container open, lens apply, logos stage advance, kairos refresh); 26 (review queue focus, dispatch genealogy open, recognition layer focus, contemplation object viewer). | Need: chrome-contributions ledger consolidating all command ids per extension. Per-extension `frontend-module.ts` extended with the new commands; ledger asserts no orphans, no duplicates. | **SPEC-AHEAD / FRAGMENTED** — every tranche declares commands; no consolidated catalog. Closes via 31.2 + 31.12. |
| CC-03 | Cmd-period (`cmd-period`) chord is the 0/1 toggle (15.5). Honours `.` as nesting operator. Per-Mn deep-widget shortcuts: `cmd-shift-{0..5}` open M0-anuttara reader through M5-epii atelier; tab shortcuts in OmniPanel: `cmd-1` through `cmd-8` for the 8 tabs; cross-layout-intent shortcut: `cmd-shift-L`; canvas highlight chord: `cmd-h-{category-letter}` (e.g. `cmd-h-o` for oracle, `cmd-h-d` for dream, `cmd-h-r` for recognition); status-bar quick-jump: `cmd-shift-comma` for active coordinate; 0/1 face explicit `cmd-shift-period` cycles three explicit faces (cosmic / personal / depth) without the polarity inversion implied by cmd-period. | 15.5 (cmd-period ratified); 15.3 (per-mode activate); per-tranche keystrokes (25.1 cmd-shift-D, 25.16 cmd-shift-T). | NO `KeybindingContribution` currently registered in the substrate. The cmd-period chord is named in 15.5 but unregistered. The cmd-shift-D / cmd-shift-T are named in 25.1 / 25.16 but unregistered. | Need: per-extension `KeybindingContribution`. `cmd-period` registered in `pratibimba-layouts` (closes 15.5). Per-Mn `cmd-shift-{n}` registered in each `mN-*` extension. OmniPanel `cmd-{1..8}` registered in `omnipanel-shell`. Canvas highlight `cmd-h-{letter}` registered in `m4-nara` (per 11.10). | **SPEC-AHEAD** — chords named; none registered. Closes via 31.3. |
| CC-04 | Activity-bar mode contributions: exactly three modes for `daily-0-1` cosmic-side (Coordinate Tree, Bimba Graph Viewer, Canon Studio); exactly three additional modes for `daily-0-1` personal-side (Day Calendar, Journal Entries, Personal Coordinate per 25.1/25.3/25.7); two additional modes for `ide-deep` (Backend Studio, Smart Connections per 15.3). Per-mode icon (cross-link 30.9 via M0 ARCHETYPE_LUT-derived glyph system). Per-mode widget id maps to `ide-shell-m0-m5` chrome widgets (cross-link 28-ide-shell-chrome-deep). | 15.3 binding; 25.1/25.3/25.7 (m4-nara mode owners); 11.4 (smart-connections code-pending marker). | Activity-bar mode registrations are split across `ide-shell-m0-m5` (Coordinate Tree, Bimba Graph Viewer, Canon Studio, Backend Studio, Smart Connections) and `m4-nara` (Day Calendar, Journal Entries, Personal Coordinate per 25.1/25.3/25.7). Stage-1 declares ownership; chrome catalog confirms exhaustiveness. | Need: activity-bar mode ledger entry per mode. Lint: `pratibimba-layouts/src/common/layout-types.ts` `expectedActivityBarModes` array must match ledger 1:1. Each mode has `(modeId, ownerExtension, layoutScope, iconRef, widgetId)`. | **SPEC-AHEAD** — modes named; no consolidated catalog. Closes via 31.4. |
| CC-05 | `Epi-Logos` top-level menu in `MAIN_MENU_BAR` (path `3_epi_logos`) with submenus: `Cosmic` (M0-M3 quick-access), `Personal` (M4-M5 + day calendar), `Compose` (1-2-3 / 4-5-0 plugin entries), `Diagnostics` (gateway + readiness + profile + status-bar quick-jumps). Per-item: command id, keybinding, when-clause. | 15.3 + 25 + 26 (the per-Mn + per-plugin commands the menu groups); 11.2 (CrossLayoutIntent). | Current substrate has `Pratibimba` top-level menu (`MAIN_MENU_BAR + '5_pratibimba'`) with `1_layouts` (SWITCH_TO_DAILY, SWITCH_TO_IDE_DEEP, TOGGLE_LAYOUT) and `2_intents` (open review item / graph node / canon studio file / start journal entry / deposit review evidence). NO Epi-Logos top-level menu. | Need: new MenuContribution in a new dedicated extension `epi-logos-menu-bar/` OR extended onto `pratibimba-layouts` (preferred: extends pratibimba-layouts to avoid greenfield extension). `EPI_LOGOS_MENU = [...MAIN_MENU_BAR, '3_epi_logos']`; four submenus; per-item commandId binding. | **SPEC-AHEAD** — no consolidated menu. Closes via 31.5. |
| CC-06 | Breadcrumbs: active coordinate visible as breadcrumb. Click any segment to navigate. Format: family → archetype → position (e.g. `M4 / Nara / DayContainer`). | 15-foundation principle 1 (coordinate as primary navigation); 23.7 (M2 72-fold breadcrumb pattern as precedent); 24.7 (M3 decan-tarot addressing chain breadcrumb pattern as precedent). | NO BreadcrumbsContribution registered. Theia's `BreadcrumbsContribution` pattern (`@theia/core/lib/browser/breadcrumbs/breadcrumbs-contribution`) is available; per-Mn 72-fold + decan-chain breadcrumbs (23.7, 24.7) operate INSIDE per-widget content, not in the top breadcrumb bar. | Need: shared `EpiLogosCoordinateBreadcrumbsContribution` in `m-extension-runtime` reading `CoordinateContext.selectedCoordinate` and rendering it as a top-bar breadcrumb above the editor area. Per-segment click dispatches `omnipanel.intent.dispatch` with the reduced coordinate. | **SPEC-AHEAD** — pattern named; not contributed. Closes via 31.6. |
| CC-07 | Application-shell slot policy: left sidebar activity-bar-switched (no stacking — 15-foundation principle 7); right sidebar OmniPanel only; bottom per-layout pane policy; editor area composition rules (15.4 composition-over-juxtaposition). Lint: extensions contributing to forbidden slots fail preflight. | 15-foundation principles 5, 6, 7; 11.5 forbidden-import lint pattern. | `pratibimba-layouts/src/common/layout-types.ts` declares `expectedWidgets` per layout; preflight contract `07-t0` declares per-extension widget ids. No formal slot policy contract. | Need: `Body/M/epi-theia/extensions/contracts/shell-slot-policy.json` enumerating per-slot owner constraint. Validator extends `validate-extension-contract-preflight.mjs` to lint every extension's `frontend-module.ts` against the slot policy. | **SPEC-AHEAD** — policy implicit in 15-foundation; not contracted. Closes via 31.7. |
| CC-08 | No-modal discipline (15.2): forbid `MessageBox.show`, `OpenDialog`, modal `Dialog` for review / evidence / gate-landing flows. Review tab IS the landing surface. | 15.2 binding; 15-foundation principle 5 (no modals). | NO current validator scans for these calls. Risk: stage-2 implementers reach for `MessageBox.show` when migrating from epi-tauri / epi-app patterns. | Need: validator `validate-no-modal-discipline.test.mjs` greps every extension `src/**/*.ts` for `MessageBox.show`, `OpenDialog`, modal `Dialog.show`, and asserts NONE appear in code paths tagged review / evidence / gate-landing (via comment marker `// @epi-logos:context=review` OR by file path under `*/review/*`, `*/evidence/*`, `*/gate-landing/*`). | **SPEC-AHEAD** — discipline binding; no lint. Closes via 31.8 + 31.13. |
| CC-09 | Per-extension preference namespace `epi-logos.{extension}.*`. Cross-cutting preferences: `epi-logos.layout.active` (already referenced by 11.2 + 25.3 + tranches gating to `daily-0-1` / `ide-deep`), `epi-logos.profile.tick.visible`, `epi-logos.privacy.default-class`, `epi-logos.kairos.enabled` (per FR-3 stub gate from 19.12), `epi-logos.motion.reduced` (per 30.5 a11y), `epi-logos.ui.developerMode` (per 22.6 + 23 dev-mode toggles). | 22.6 (developerMode preference); 23.4 (`epiLogos.m2Parashakti.devMode` preference); 25.3 (gates `epi-logos.layout.active`); 19.12 (KAIROS_ENABLED env-flag); 30.5 (motion reduced a11y). | Per-extension preference namespaces are SPEC-AHEAD references; no `PreferenceContribution` instances currently registered. | Need: per-extension `PreferenceContribution` (one per extension) declaring the namespace + the cross-cutting preferences declared in a shared `epi-logos-preferences/` module (or extended onto `m-extension-runtime`). Lint: every preference key matches the `epi-logos.{extension}.*` or `epi-logos.{layout,profile,privacy,kairos,motion,ui}.*` pattern. | **SPEC-AHEAD** — preferences referenced; not contributed. Closes via 31.9. |
| CC-10 | Cross-layout intent dispatcher contributions per 11.2 `CrossLayoutIntent` envelope routing — every extension that supports `requestedContributionId` routing registers a handler. Catalog of which contributions accept intent routing. | 11.2; 21.19 (m0-anuttara layer-aware intent); 25 (m4-nara per-widget intent); 26 (m5-epii recognition-layer intent). | Existing `registerIntentTarget` calls in `m5-epii/src/browser/frontend-module.ts` (lines 77, 84) for `review` and `evidence-deposit`. Similar pattern across other Mn extensions (m0 `'graph'` legacy, m4 `'artifact'`). Per 11.2 these are SPEC-AHEAD T5 promotions. | Need: per-extension intent-target ledger. Each extension's `frontend-module.ts` registers intent targets for every `requestedContributionId` it supports. Chrome-contributions ledger asserts the union matches `OMNIPANEL_TABS.availableInLayouts` + `pratibimba.intent.*` command space. | **SPEC-AHEAD** — pattern partially landed; not catalogued. Closes via 31.10. |
| CC-11 | Toolbar / context-menu / inline-action policy: when toolbar (TabBarToolbar) vs context-menu (contextKeys) vs inline-button (within widget body) is allowed. Per-Mn surface examples (canvas right-click vs FloatingMenu per 11.10; ambient strip click-expand per 11.12; OmniPanel tab right-click). | 15-foundation principles 5 (no modals) and 6 (composition over juxtaposition); 11.10 (FloatingMenu canvas spec). | NO formal policy. Risk: stage-2 implementers add toolbar buttons that duplicate FloatingMenu actions, or inline buttons that should be context-menu items. | Need: doc-ahead-landing policy in `Body/M/epi-theia/extensions/contracts/chrome-action-surface-policy.md`. Three-rule grammar: (a) toolbar = persistent global action on the active widget; (b) context-menu = selection-bound action that varies by target; (c) inline-button = artifact-level action embedded in content. Per-Mn examples cross-linked. | **SPEC-AHEAD** — policy implicit; not documented. Closes via 31.11. |
| CC-12 | Chrome ledger artifact: single ledger JSON mapping every contribution (status bar entry, command id, keybinding, menu item, breadcrumb provider, activity-bar mode, preference key, intent target) to (extension package, contribution-type, scope). Closes the chrome no-orphan audit. CI lint asserts every declared contribution has an owner. | 11.9 ledger pattern (surface-extension-contract-ledger.json); 14 no-orphan audit. | NO consolidated chrome ledger. Per-extension ledgers split across `frontend-module.ts`, `layout-types.ts`, contract preflight JSON. Risk: orphan contributions (declared in stage-1 tranche, never landed in `frontend-module.ts`); duplicate contributions (e.g. two extensions registering `m4.openArtifact`); chord conflicts (cmd-shift-3 collision between M3 standalone and M2 alternate). | Need: `Body/M/epi-theia/extensions/contracts/chrome-contributions-catalog.json` with sections `statusBarEntries`, `commands`, `keybindings`, `menuItems`, `activityBarModes`, `preferences`, `breadcrumbProviders`, `intentTargets`. Each entry: `(id, owningExtension, type, scope, declaringTranche)`. Closes chrome no-orphan audit (feeds Tranche 14). | **SPEC-AHEAD** — no consolidated chrome ledger. Closes via 31.12. |
| CC-13 | Validation suite: per-claim validators in `Body/M/epi-theia/extensions/test/`: chrome catalog consistency; no-modal discipline; status-bar discipline (exactly six state-thread entries); keybinding chord uniqueness (no chord conflicts); preference namespace conformance; menu top-level uniqueness; intent-target ledger consistency. | 11.5 lint pattern; existing `validate-extension-contract-preflight.test.mjs` pattern. | Existing validators: `validate-extension-contract-preflight.mjs`, `validate-composition-contract-preflight.mjs`, plus sibling test files. Chrome-side validators absent. | Need: four sibling validator scripts + four sibling test files: `validate-chrome-contributions-catalog.{mjs,test.mjs}`, `validate-no-modal-discipline.test.mjs`, `validate-status-bar-discipline.test.mjs`, `validate-keybinding-chord-uniqueness.test.mjs`. Each runs in CI alongside the extension-contract-preflight validators. | **SPEC-AHEAD** — pattern named; chrome validators absent. Closes via 31.13. |

## Anomalies

### CONTRADICTIONS (decision-register candidates)

- **DR-WC-CC-1** — Status-bar entry count: 15.10 names EXACTLY SIX state-thread entries (profile-tick, day-now, session id, gateway readiness, profile generation, active coordinate). Current substrate has TWO entries that are NEITHER in the six-name list (layout-indicator is a navigation chip; kernel-bridge.status is a connection chip that may collapse into the gateway-readiness state-thread entry). Two readings: (a) status bar holds exactly six state-thread entries + zero navigation chips (strict); (b) status bar holds six state-thread entries + up to two navigation chips (layout-indicator + a dedicated kernel-bridge connection chip). The 15.10 wording "Nothing else" favours (a) but does not explicitly forbid the layout-indicator. **Proposed resolution:** the kernel-bridge.status entry collapses into the gateway-readiness state-thread entry (one-to-one identity, no orphan); the layout-indicator is RETAINED but moved to RIGHT-aligned navigation chip (15.10 names LEFT-aligned state-thread entries by alignment, no claim on right-aligned navigation chips). The lint enforces "exactly six LEFT-aligned state-thread entries" rather than "exactly six entries total". Routes to user final-validation if alternative reading is preferred.
- **DR-WC-CC-2** — Cmd-period collision with `Command Palette` (`cmd-shift-p` is Theia default for command palette; `cmd-period` does NOT collide). `cmd-period` IS a known shortcut for "Quick Fix" in VS Code / Theia default keymap. **Proposed resolution:** override the default Quick Fix binding to `cmd-shift-period` within the Epi-Logos profile; document the override in the keybinding ledger; provide an `epi-logos.keymap.preserveTheiaDefaults` preference (default false) that, when true, downgrades cmd-period to `cmd-shift-zero` for 0/1 toggle. Routes to user final-validation.
- **DR-WC-CC-3** — Epi-Logos top-level menu position. The Pratibimba top-level menu lives at `MAIN_MENU_BAR + '5_pratibimba'` (after Selection / View / Go). The Epi-Logos top-level menu is proposed at `MAIN_MENU_BAR + '3_epi_logos'` (after File / Edit). Alternative: both menus collapse into one Pratibimba menu with EpiLogos submenu. **Proposed resolution:** retain two top-level menus — `Epi-Logos` (philosophical / capability access) and `Pratibimba` (layout / workspace). `Epi-Logos` at position 3 (left of Pratibimba) to honour the dependency direction (Epi-Logos is canonical foundation; Pratibimba is workspace presentation). Routes to user final-validation.

### CODE-PENDING / ORPHAN

- **CC-01** — six state-thread status-bar entries: 15.10 names them; no `StatusBarContribution` instance registered for any of the six.
- **CC-02** — stage-1 commands fragmented across tranches; no consolidated catalog.
- **CC-03** — keybinding chords named (15.5 cmd-period, 25.1 cmd-shift-D, 25.16 cmd-shift-T); NO `KeybindingContribution` currently registered anywhere in the substrate.
- **CC-05** — Epi-Logos top-level menu: named in this catalog; not currently registered. Pratibimba menu is the only top-level epi-logos-side menu.
- **CC-06** — BreadcrumbsContribution: pattern available in Theia; not contributed by any epi-logos extension.
- **CC-08** — no-modal discipline: no lint validator.
- **CC-09** — preference contributions: per-extension namespaces referenced by stage-1 tranches; no `PreferenceContribution` instance registered.
- **CC-12** — chrome contributions ledger: no consolidated artifact.

### NOTE — INHERITED FROM STAGE-1

- The per-extension command, keybinding, intent-target, preference, and activity-bar mode references in stage-1 wave-C tranches 21–26 are SPEC-AHEAD; stage 2 lands the actual `CommandContribution` / `KeybindingContribution` / `MenuContribution` / `PreferenceContribution` / `StatusBarContribution` instances. This tranche catalogues them for cross-cutting consistency BEFORE they land, so the per-Mn implementations register against a known catalog rather than improvising.

## Proposed Cycle-3 Closing Tranches (chrome-contributions domain — id space `31.x`)

> All tranches obey the anti-greenfield rule: every one extends a Theia platform convention OR a landed per-extension `frontend-module.ts`, or adds a sibling contract / validator in `Body/M/epi-theia/extensions/{contracts,scripts,test}/`. None propose re-building landed `Body/M/epi-theia/extensions/*` packages.

### 31.1 — Status bar entries catalog (exactly six state-thread entries)

- **Classification:** `spec-ahead-integration` — closes CC-01, DR-WC-CC-1
- Owners: `kernel-bridge` (gateway readiness collapses kernel-bridge.status); `pratibimba-layouts` (active-coordinate, day-now, session-id, profile-tick, profile-generation entries OR delegated to `m-extension-runtime`)
- Files: `Body/M/epi-theia/extensions/m-extension-runtime/src/browser/status-bar/{profile-tick,day-now,session-id,gateway-readiness,profile-generation,active-coordinate}-status-entry.ts`; binding in each ext's `frontend-module.ts` per 15.10.

### 31.2 — Command palette catalog per extension

- **Classification:** `no-orphan-fill` — closes CC-02
- Audit every CommandContribution declaration across stage-1 wave-C tranches; per-Mn frontend-module.ts extended with the new commands; chrome-contributions ledger asserts no orphans, no duplicates.

### 31.3 — Keybinding chord grammar

- **Classification:** `spec-ahead-integration` — closes CC-03 + 15.5 + DR-WC-CC-2
- New `KeybindingContribution` per extension; cmd-period registered in `pratibimba-layouts`; per-Mn cmd-shift-{0..5}; OmniPanel cmd-{1..8}; canvas highlight cmd-h-{letter}.

### 31.4 — Activity-bar mode contributions

- **Classification:** `no-orphan-fill` — closes CC-04
- Activity-bar mode ledger entry per mode; `pratibimba-layouts/src/common/layout-types.ts` `expectedActivityBarModes` extended; per-mode icon cross-link 30.9.

### 31.5 — Menu contributions: Epi-Logos top-level menu

- **Classification:** `spec-ahead-integration` — closes CC-05 + DR-WC-CC-3
- New top-level menu at `MAIN_MENU_BAR + '3_epi_logos'`; four submenus (Cosmic / Personal / Compose / Diagnostics); per-item commandId binding.

### 31.6 — Breadcrumbs: coordinate path visible

- **Classification:** `spec-ahead-integration` — closes CC-06
- `EpiLogosCoordinateBreadcrumbsContribution` in `m-extension-runtime`; reads `CoordinateContext.selectedCoordinate`; renders family → archetype → position.

### 31.7 — Application-shell slot policy contract

- **Classification:** `doc-ahead-landing` — closes CC-07
- `Body/M/epi-theia/extensions/contracts/shell-slot-policy.json`; validator extends `validate-extension-contract-preflight.mjs`.

### 31.8 — No-modal discipline lint

- **Classification:** `spec-ahead-integration` — closes CC-08
- `validate-no-modal-discipline.test.mjs`; scans extensions for forbidden `MessageBox.show` / `OpenDialog` / modal `Dialog.show` calls in review / evidence / gate-landing code paths.

### 31.9 — Preference contributions per extension

- **Classification:** `spec-ahead-integration` — closes CC-09
- Per-extension `PreferenceContribution` (one per extension) + cross-cutting preferences in shared `m-extension-runtime/src/browser/preferences/epi-logos-preferences.ts`.

### 31.10 — Cross-layout intent dispatcher contributions

- **Classification:** `no-orphan-fill` — closes CC-10
- Per-extension intent-target ledger; `registerIntentTarget` calls catalogued; intent-target ledger consistency lint.

### 31.11 — Toolbar / context-menu / inline-action contribution policy

- **Classification:** `doc-ahead-landing` — closes CC-11
- `Body/M/epi-theia/extensions/contracts/chrome-action-surface-policy.md`; per-Mn surface examples; three-rule grammar.

### 31.12 — Chrome ledger artifact

- **Classification:** `no-orphan-fill` — closes CC-12 + chrome no-orphan audit (feeds Tranche 14)
- `Body/M/epi-theia/extensions/contracts/chrome-contributions-catalog.json`; sections statusBarEntries / commands / keybindings / menuItems / activityBarModes / preferences / breadcrumbProviders / intentTargets.

### 31.13 — Validation suite

- **Classification:** `spec-ahead-integration` — closes CC-13
- Four sibling validators + four sibling test files: `validate-chrome-contributions-catalog.test.mjs`; `validate-no-modal-discipline.test.mjs`; `validate-status-bar-discipline.test.mjs`; `validate-keybinding-chord-uniqueness.test.mjs`.

## Surface → contribution → contract closure

This matrix is the chrome-contributions domain DELTA. Its closing-tranches land:

- Status bar (CC-01 → 31.1) — six state-thread entries; lint asserts exactly six left-aligned state-thread entries.
- Commands (CC-02 → 31.2) — catalogued per extension; ledger asserts no orphans, no duplicates.
- Keybindings (CC-03 → 31.3) — cmd-period + per-Mn cmd-shift-{0..5} + OmniPanel cmd-{1..8} + canvas cmd-h-{letter}; lint asserts no chord conflicts.
- Activity-bar modes (CC-04 → 31.4) — three daily-0-1 cosmic + three daily-0-1 personal + two ide-deep additional; lint asserts mode count matches layout-types.ts expectations.
- Top-level menu (CC-05 → 31.5) — Epi-Logos menu added (alongside existing Pratibimba menu).
- Breadcrumbs (CC-06 → 31.6) — coordinate path visible at top of editor area.
- Slot policy (CC-07 → 31.7) — left activity-bar / right OmniPanel / bottom per-layout / editor area composition.
- No-modal discipline (CC-08 → 31.8) — lint validator.
- Preferences (CC-09 → 31.9) — namespace `epi-logos.*` enforced; cross-cutting preferences declared.
- Intent targets (CC-10 → 31.10) — per-extension registration catalogued; ledger asserts consistency.
- Action surface policy (CC-11 → 31.11) — toolbar / context-menu / inline-action grammar.
- Chrome ledger (CC-12 → 31.12) — single closing ledger artifact (feeds Tranche 14 no-orphan audit).
- Validation suite (CC-13 → 31.13) — four sibling validators ensure CI compliance.
